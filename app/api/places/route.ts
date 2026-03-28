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
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  current_opening_hours?: {
    open_now?: boolean;
  };
}

interface SearchFilters {
  minReviews?: number;
  maxReviews?: number;
  minRating?: number;
  maxRating?: number;
}

async function fetchPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,business_status,formatted_phone_number,website,url,rating,user_ratings_total,types,current_opening_hours&key=${GOOGLE_PLACES_API_KEY}`,
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const category = searchParams.get('category');

  if (!city || !category) {
    // Return all search history
    const logs = await prisma.searchLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return Response.json({ history: logs });
  }

  const log = await prisma.searchLog.findUnique({
    where: { city_category: { city, category } },
  });

  if (!log) {
    return Response.json({ searched: false });
  }

  return Response.json({
    searched: true,
    results: log.results,
    date: log.createdAt,
  });
}

export async function POST(request: Request) {
  const { cityId, category, filters } = await request.json() as {
    cityId: string;
    category: string;
    filters?: SearchFilters;
  };

  if (!GOOGLE_PLACES_API_KEY) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }
  if (!cityId || !category) {
    return Response.json({ error: 'City and category required' }, { status: 400 });
  }
  const city = CITIES[cityId as keyof typeof CITIES];
  if (!city) {
    return Response.json({ error: 'Invalid city' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const gridPoints = generateGrid(city.lat, city.lng, city.radius, 5000);
        const limitedGridPoints = gridPoints.slice(0, 50);
        const total = limitedGridPoints.length;

        const allPlaces = new Map<string, PlaceResult>();

        send({ type: 'progress', current: 0, total, found: 0 });

        for (let i = 0; i < limitedGridPoints.length; i++) {
          const point = limitedGridPoints[i];
          const places = await searchNearby(point.lat, point.lng, 2500, category);

          for (const place of places) {
            if (place.place_id && !allPlaces.has(place.place_id)) {
              allPlaces.set(place.place_id, place);
            }
          }

          send({ type: 'progress', current: i + 1, total, found: allPlaces.size });

          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Save to DB
        const placeIds = Array.from(allPlaces.keys()).filter(
          (id): id is string => typeof id === 'string' && id.length > 0
        );

        const existingPlaceIds = new Set(
          placeIds.length > 0
            ? (await prisma.business.findMany({
                where: { placeId: { in: placeIds } },
                select: { placeId: true },
              })).map((b) => b.placeId)
            : []
        );

        const toCreate = [];

        for (const [placeId, place] of Array.from(allPlaces.entries())) {
          if (existingPlaceIds.has(placeId)) continue;

          const reviews = place.user_ratings_total || 0;
          const rating = place.rating || null;

          // Apply filters
          if (filters) {
            if (filters.minReviews && reviews < filters.minReviews) continue;
            if (filters.maxReviews && reviews > filters.maxReviews) continue;
            if (filters.minRating && (!rating || rating < filters.minRating)) continue;
            if (filters.maxRating && rating && rating > filters.maxRating) continue;
          }

          const website = place.website || null;
          const { isWeak } = checkWeakWebsite(website);

          toCreate.push({
            placeId,
            name: place.name,
            city: city.name,
            category,
            phone: place.formatted_phone_number || null,
            website,
            mapsUrl: place.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
            reviewCount: reviews,
            rating,
            isWeakWebsite: isWeak,
            isRejected: false,
            inQueue: true,
          });
        }

        if (toCreate.length > 0) {
          await prisma.business.createMany({ data: toCreate, skipDuplicates: true });
        }

        // Log this search
        await prisma.searchLog.upsert({
          where: { city_category: { city: cityId, category } },
          update: { results: toCreate.length, createdAt: new Date() },
          create: { city: cityId, category, results: toCreate.length },
        });

        send({ type: 'done', queued: toCreate.length });
      } catch (error) {
        console.error('Search error:', error);
        send({ type: 'error', error: 'Search failed' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
