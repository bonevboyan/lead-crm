import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CITIES, generateGrid, checkWeakWebsite } from '@/lib/cities';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface PlaceResult {
  place_id: string;
  name: string;
  business_status?: string;
  formatted_phone_number?: string;
  website?: string;
  url?: string;
  user_ratings_total?: number;
  types?: string[];
  current_opening_hours?: {
    open_now?: boolean;
  };
}

async function fetchPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,business_status,formatted_phone_number,website,url,user_ratings_total,types,current_opening_hours&key=${GOOGLE_PLACES_API_KEY}`,
      { next: { revalidate: 0 } }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.status !== 'OK') return null;
    
    return data.result || null;
  } catch {
    return null;
  }
}

async function searchNearby(
  lat: number,
  lng: number,
  radius: number,
  type: string
): Promise<PlaceResult[]> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`,
      { next: { revalidate: 0 } }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') return [];
    
    const results: PlaceResult[] = [];
    const placesToProcess = (data.results || []).slice(0, 20);
    
    for (const place of placesToProcess) {
      const details = await fetchPlaceDetails(place.place_id);
      if (details) {
        // Ensure place_id is set from the original place if not in details
        if (!details.place_id) {
          details.place_id = place.place_id;
        }
        results.push(details);
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    
    return results;
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { cityId, category } = await request.json();
    
    if (!cityId || !category) {
      return NextResponse.json(
        { error: 'City and category required' },
        { status: 400 }
      );
    }
    
    const city = CITIES[cityId as keyof typeof CITIES];
    if (!city) {
      return NextResponse.json({ error: 'Invalid city' }, { status: 400 });
    }
    
    const gridPoints = generateGrid(city.lat, city.lng, city.radius, 5000);
    const limitedGridPoints = gridPoints.slice(0, 50);
    
    const allPlaces = new Map<string, PlaceResult>();
    
    for (const point of limitedGridPoints) {
      const places = await searchNearby(point.lat, point.lng, 2500, category);
      
      for (const place of places) {
        if (place.place_id && !allPlaces.has(place.place_id)) {
          allPlaces.set(place.place_id, place);
        }
      }
      
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    
    const placeIds = Array.from(allPlaces.keys()).filter((id): id is string => typeof id === 'string' && id.length > 0);
    let existingBusinesses: Array<{ placeId: string; isRejected: boolean }> = [];
    
    if (placeIds.length > 0) {
      existingBusinesses = await prisma.business.findMany({
        where: {
          placeId: {
            in: placeIds,
          },
        },
        select: {
          placeId: true,
          isRejected: true,
        },
      });
    }
    
    const rejectedPlaceIds = new Set(
      existingBusinesses
        .filter((b: { placeId: string; isRejected: boolean }) => b.isRejected)
        .map((b: { placeId: string; isRejected: boolean }) => b.placeId)
    );
    
    const results = [];
    
    for (const [placeId, place] of Array.from(allPlaces.entries())) {
      if (rejectedPlaceIds.has(placeId)) continue;
      
      const website = place.website || null;
      const { isWeak, flags } = checkWeakWebsite(website);
      
      results.push({
        placeId,
        name: place.name,
        category: category,
        phone: place.formatted_phone_number || null,
        website,
        mapsUrl: place.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
        reviewCount: place.user_ratings_total || 0,
        isWeakWebsite: isWeak,
        weakFlags: flags,
        isOpen: place.current_opening_hours?.open_now ?? null,
      });
    }
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}