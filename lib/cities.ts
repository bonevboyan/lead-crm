// Bulgaria city coordinates with bounding boxes for grid search
export const CITIES = {
  'sofia': {
    name: 'Sofia',
    lat: 42.6977,
    lng: 23.3219,
    radius: 15000, // 15km radius
  },
  'plovdiv': {
    name: 'Plovdiv',
    lat: 42.1354,
    lng: 24.7453,
    radius: 10000,
  },
  'varna': {
    name: 'Varna',
    lat: 43.2141,
    lng: 27.9147,
    radius: 12000,
  },
  'burgas': {
    name: 'Burgas',
    lat: 42.5048,
    lng: 27.4626,
    radius: 10000,
  },
  'ruse': {
    name: 'Ruse',
    lat: 43.8356,
    lng: 25.9657,
    radius: 8000,
  },
  'stara-zagora': {
    name: 'Stara Zagora',
    lat: 42.4258,
    lng: 25.6345,
    radius: 8000,
  },
  'pleven': {
    name: 'Pleven',
    lat: 43.4170,
    lng: 24.6067,
    radius: 7000,
  },
  'sliven': {
    name: 'Sliven',
    lat: 42.6817,
    lng: 26.3229,
    radius: 7000,
  },
  'dobrich': {
    name: 'Dobrich',
    lat: 43.5726,
    lng: 27.8273,
    radius: 7000,
  },
  'shumen': {
    name: 'Shumen',
    lat: 43.2712,
    lng: 26.9361,
    radius: 6000,
  },
  'pernik': {
    name: 'Pernik',
    lat: 42.6052,
    lng: 23.0378,
    radius: 6000,
  },
  'haskovo': {
    name: 'Haskovo',
    lat: 41.9340,
    lng: 25.5560,
    radius: 6000,
  },
  'yambol': {
    name: 'Yambol',
    lat: 42.4842,
    lng: 26.5035,
    radius: 6000,
  },
  'pazardzhik': {
    name: 'Pazardzhik',
    lat: 42.1928,
    lng: 24.3336,
    radius: 6000,
  },
  'blagoevgrad': {
    name: 'Blagoevgrad',
    lat: 42.0209,
    lng: 23.0943,
    radius: 7000,
  },
  'veliko-tarnovo': {
    name: 'Veliko Tarnovo',
    lat: 43.0757,
    lng: 25.6172,
    radius: 7000,
  },
  'vratsa': {
    name: 'Vratsa',
    lat: 43.2100,
    lng: 23.5528,
    radius: 6000,
  },
  'gabrovo': {
    name: 'Gabrovo',
    lat: 42.8742,
    lng: 25.3187,
    radius: 6000,
  },
  'asenovgrad': {
    name: 'Asenovgrad',
    lat: 42.0167,
    lng: 24.8667,
    radius: 5000,
  },
  'vidin': {
    name: 'Vidin',
    lat: 43.9961,
    lng: 22.8679,
    radius: 6000,
  },
  'kazanlak': {
    name: 'Kazanlak',
    lat: 42.6194,
    lng: 25.3930,
    radius: 5000,
  },
  'kyustendil': {
    name: 'Kyustendil',
    lat: 42.2869,
    lng: 22.6922,
    radius: 6000,
  },
  'kardzhali': {
    name: 'Kardzhali',
    lat: 41.6500,
    lng: 25.3667,
    radius: 6000,
  },
  'montana': {
    name: 'Montana',
    lat: 43.4085,
    lng: 23.2257,
    radius: 6000,
  },
  'dimitrovgrad': {
    name: 'Dimitrovgrad',
    lat: 42.0500,
    lng: 25.6000,
    radius: 5000,
  },
  'targovishte': {
    name: 'Targovishte',
    lat: 43.2512,
    lng: 26.5723,
    radius: 5000,
  },
  'lovech': {
    name: 'Lovech',
    lat: 43.1370,
    lng: 24.7142,
    radius: 6000,
  },
  'silistra': {
    name: 'Silistra',
    lat: 44.1171,
    lng: 27.2606,
    radius: 5000,
  },
  'razgrad': {
    name: 'Razgrad',
    lat: 43.5333,
    lng: 26.5167,
    radius: 5000,
  },
};

export const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'beauty_salon', label: 'Beauty Salons' },
  { value: 'hair_care', label: 'Hair Care' },
  { value: 'car_repair', label: 'Auto Repair' },
  { value: 'car_dealer', label: 'Car Dealers' },
  { value: 'driving_school', label: 'Driving Schools' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'bar', label: 'Bars' },
  { value: 'cafe', label: 'Cafes' },
  { value: 'dentist', label: 'Dentists' },
  { value: 'doctor', label: 'Doctors' },
  { value: 'gym', label: 'Gyms' },
  { value: 'spa', label: 'Spas' },
  { value: 'real_estate_agency', label: 'Real Estate' },
  { value: 'lawyer', label: 'Lawyers' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'insurance_agency', label: 'Insurance' },
  { value: 'pet_store', label: 'Pet Stores' },
  { value: 'veterinary_care', label: 'Veterinary' },
  { value: 'pharmacy', label: 'Pharmacies' },
  { value: 'bakery', label: 'Bakeries' },
  { value: 'florist', label: 'Florists' },
  { value: 'electronics_store', label: 'Electronics' },
  { value: 'furniture_store', label: 'Furniture' },
  { value: 'clothing_store', label: 'Clothing Stores' },
  { value: 'shopping_mall', label: 'Shopping Malls' },
  { value: 'car_wash', label: 'Car Wash' },
  { value: 'gas_station', label: 'Gas Stations' },
  { value: 'taxi_stand', label: 'Taxi Services' },
  { value: 'travel_agency', label: 'Travel Agencies' },
  { value: 'moving_company', label: 'Moving Companies' },
  { value: 'plumber', label: 'Plumbers' },
  { value: 'electrician', label: 'Electricians' },
  { value: 'locksmith', label: 'Locksmiths' },
  { value: 'painter', label: 'Painters' },
  { value: 'roofing_contractor', label: 'Roofing' },
  { value: 'general_contractor', label: 'General Contractors' },
  { value: 'storage', label: 'Storage' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'dry_cleaning', label: 'Dry Cleaning' },
];

// Generate grid of coordinates for exhaustive search
export function generateGrid(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  cellSizeMeters: number = 2000
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  const earthRadius = 6371000; // meters
  
  // Calculate degrees per meter
  const latDegreesPerMeter = 180 / (Math.PI * earthRadius);
  const lngDegreesPerMeter =
    180 / (Math.PI * earthRadius * Math.cos((centerLat * Math.PI) / 180));
  
  // Convert radius to degrees
  const radiusLat = radiusMeters * latDegreesPerMeter;
  const radiusLng = radiusMeters * lngDegreesPerMeter;
  
  // Calculate grid bounds
  const minLat = centerLat - radiusLat;
  const maxLat = centerLat + radiusLat;
  const minLng = centerLng - radiusLng;
  const maxLng = centerLng + radiusLng;
  
  // Calculate cell size in degrees
  const cellLat = cellSizeMeters * latDegreesPerMeter;
  const cellLng = cellSizeMeters * lngDegreesPerMeter;
  
  // Generate grid points
  for (let lat = minLat; lat <= maxLat; lat += cellLat) {
    for (let lng = minLng; lng <= maxLng; lng += cellLng) {
      // Check if point is within radius circle
      const distance = Math.sqrt(
        Math.pow((lat - centerLat) / latDegreesPerMeter, 2) +
          Math.pow(
            ((lng - centerLng) / lngDegreesPerMeter) *
              Math.cos((centerLat * Math.PI) / 180),
            2
          )
      );
      
      if (distance <= radiusMeters) {
        points.push({ lat, lng });
      }
    }
  }
  
  return points;
}

// Check if URL indicates a weak/poor website
export function checkWeakWebsite(url: string | null): {
  isWeak: boolean;
  flags: string[];
} {
  if (!url) return { isWeak: false, flags: [] };

  const flags: string[] = [];
  const lowerUrl = url.toLowerCase();

  // Check for Instagram
  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
    flags.push('Instagram');
  }

  // Check for Facebook
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com') || lowerUrl.includes('fb.me')) {
    flags.push('Facebook');
  }

  // Check for Google Sites
  if (lowerUrl.includes('sites.google.com') || lowerUrl.includes('business.site')) {
    flags.push('Google Site');
  }

  // Check for Wix
  if (lowerUrl.includes('.wixsite.com') || lowerUrl.includes('wix.com')) {
    flags.push('Wix Site');
  }

  // Check for other free builders
  if (lowerUrl.includes('weebly.com')) {
    flags.push('Weebly Site');
  }

  if (lowerUrl.includes('wordpress.com') && !lowerUrl.includes('.org')) {
    flags.push('WordPress.com');
  }

  if (lowerUrl.includes('squarespace.com')) {
    flags.push('Squarespace');
  }

  if (lowerUrl.includes('godaddysites.com')) {
    flags.push('GoDaddy Site');
  }

  // Check for linktree and similar
  if (lowerUrl.includes('linktr.ee')) {
    flags.push('Linktree');
  }

  return {
    isWeak: flags.length > 0,
    flags,
  };
}