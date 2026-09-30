// ==============================================================================
// E-JAANCH: INDIA STATE BOUNDING BOXES
// Maps GPS coordinates to Indian state names using approximate lat/lng bounding
// boxes. Handles overlapping polygons via centroid priority for border areas.
// ==============================================================================

export interface StateBoundingBox {
  name: string;
  code: string;          // 2-letter ISO 3166-2:IN code
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
  centerLat: number;
  centerLng: number;
}

export const INDIA_STATE_BBOXES: StateBoundingBox[] = [
  { name: 'Andaman and Nicobar Islands', code: 'AN', latMin: 6.75,  latMax: 13.68, lngMin: 92.20, lngMax: 93.92, centerLat: 10.0,  centerLng: 92.8  },
  { name: 'Andhra Pradesh',              code: 'AP', latMin: 12.62, latMax: 19.92, lngMin: 76.76, lngMax: 84.76, centerLat: 15.91, centerLng: 79.74 },
  { name: 'Arunachal Pradesh',           code: 'AR', latMin: 26.65, latMax: 29.47, lngMin: 91.53, lngMax: 97.40, centerLat: 28.22, centerLng: 94.73 },
  { name: 'Assam',                       code: 'AS', latMin: 24.10, latMax: 27.98, lngMin: 89.64, lngMax: 96.02, centerLat: 26.15, centerLng: 92.54 },
  { name: 'Bihar',                       code: 'BR', latMin: 24.28, latMax: 27.52, lngMin: 83.33, lngMax: 88.17, centerLat: 25.78, centerLng: 85.82 },
  { name: 'Chandigarh',                  code: 'CH', latMin: 30.64, latMax: 30.82, lngMin: 76.68, lngMax: 76.90, centerLat: 30.74, centerLng: 76.79 },
  { name: 'Chhattisgarh',               code: 'CG', latMin: 17.78, latMax: 24.09, lngMin: 80.24, lngMax: 84.40, centerLat: 21.28, centerLng: 81.87 },
  { name: 'Dadra and Nagar Haveli',      code: 'DN', latMin: 20.07, latMax: 20.64, lngMin: 72.89, lngMax: 73.38, centerLat: 20.27, centerLng: 73.02 },
  { name: 'Daman and Diu',              code: 'DD', latMin: 20.26, latMax: 20.74, lngMin: 70.78, lngMax: 73.04, centerLat: 20.40, centerLng: 72.83 },
  { name: 'Delhi',                       code: 'DL', latMin: 28.40, latMax: 28.88, lngMin: 76.84, lngMax: 77.35, centerLat: 28.61, centerLng: 77.21 },
  { name: 'Goa',                         code: 'GA', latMin: 14.89, latMax: 15.80, lngMin: 73.66, lngMax: 74.33, centerLat: 15.30, centerLng: 74.12 },
  { name: 'Gujarat',                     code: 'GJ', latMin: 20.07, latMax: 24.72, lngMin: 68.16, lngMax: 74.47, centerLat: 22.26, centerLng: 71.20 },
  { name: 'Haryana',                     code: 'HR', latMin: 27.65, latMax: 30.90, lngMin: 74.44, lngMax: 77.56, centerLat: 29.06, centerLng: 76.09 },
  { name: 'Himachal Pradesh',            code: 'HP', latMin: 30.38, latMax: 33.27, lngMin: 75.57, lngMax: 79.02, centerLat: 31.10, centerLng: 77.17 },
  { name: 'Jammu and Kashmir',           code: 'JK', latMin: 32.24, latMax: 36.70, lngMin: 73.58, lngMax: 80.36, centerLat: 33.73, centerLng: 76.93 },
  { name: 'Jharkhand',                   code: 'JH', latMin: 21.97, latMax: 25.33, lngMin: 83.32, lngMax: 87.98, centerLat: 23.61, centerLng: 85.28 },
  { name: 'Karnataka',                   code: 'KA', latMin: 11.59, latMax: 18.46, lngMin: 74.03, lngMax: 78.56, centerLat: 15.32, centerLng: 75.71 },
  { name: 'Kerala',                      code: 'KL', latMin: 8.17,  latMax: 12.79, lngMin: 74.86, lngMax: 77.42, centerLat: 10.85, centerLng: 76.27 },
  { name: 'Ladakh',                      code: 'LA', latMin: 32.00, latMax: 36.06, lngMin: 75.54, lngMax: 79.98, centerLat: 34.23, centerLng: 77.58 },
  { name: 'Lakshadweep',                 code: 'LD', latMin: 8.00,  latMax: 12.00, lngMin: 71.00, lngMax: 73.80, centerLat: 10.57, centerLng: 72.63 },
  { name: 'Madhya Pradesh',             code: 'MP', latMin: 21.07, latMax: 26.87, lngMin: 74.01, lngMax: 82.81, centerLat: 23.47, centerLng: 77.95 },
  { name: 'Maharashtra',                 code: 'MH', latMin: 15.60, latMax: 22.02, lngMin: 72.60, lngMax: 80.90, centerLat: 19.60, centerLng: 75.72 },
  { name: 'Manipur',                     code: 'MN', latMin: 23.83, latMax: 25.69, lngMin: 93.03, lngMax: 94.78, centerLat: 24.65, centerLng: 93.91 },
  { name: 'Meghalaya',                   code: 'ML', latMin: 25.02, latMax: 26.11, lngMin: 89.82, lngMax: 92.79, centerLat: 25.47, centerLng: 91.37 },
  { name: 'Mizoram',                     code: 'MZ', latMin: 21.94, latMax: 24.52, lngMin: 92.26, lngMax: 93.44, centerLat: 23.16, centerLng: 92.93 },
  { name: 'Nagaland',                    code: 'NL', latMin: 25.17, latMax: 27.04, lngMin: 93.30, lngMax: 95.26, centerLat: 26.16, centerLng: 94.56 },
  { name: 'Odisha',                      code: 'OD', latMin: 17.78, latMax: 22.55, lngMin: 81.37, lngMax: 87.49, centerLat: 20.22, centerLng: 84.25 },
  { name: 'Puducherry',                  code: 'PY', latMin: 10.49, latMax: 12.52, lngMin: 76.24, lngMax: 79.95, centerLat: 11.94, centerLng: 79.83 },
  { name: 'Punjab',                      code: 'PB', latMin: 29.54, latMax: 32.52, lngMin: 73.88, lngMax: 76.92, centerLat: 31.14, centerLng: 75.34 },
  { name: 'Rajasthan',                   code: 'RJ', latMin: 23.04, latMax: 30.18, lngMin: 69.47, lngMax: 78.26, centerLat: 27.02, centerLng: 74.22 },
  { name: 'Sikkim',                      code: 'SK', latMin: 27.07, latMax: 28.13, lngMin: 88.00, lngMax: 88.94, centerLat: 27.53, centerLng: 88.51 },
  { name: 'Tamil Nadu',                  code: 'TN', latMin: 8.08,  latMax: 13.57, lngMin: 76.23, lngMax: 80.35, centerLat: 10.99, centerLng: 78.96 },
  { name: 'Telangana',                   code: 'TS', latMin: 15.81, latMax: 19.92, lngMin: 77.21, lngMax: 81.35, centerLat: 17.99, centerLng: 79.53 },
  { name: 'Tripura',                     code: 'TR', latMin: 22.94, latMax: 24.53, lngMin: 91.16, lngMax: 92.34, centerLat: 23.74, centerLng: 91.75 },
  { name: 'Uttar Pradesh',              code: 'UP', latMin: 23.87, latMax: 30.41, lngMin: 77.08, lngMax: 84.66, centerLat: 26.85, centerLng: 80.91 },
  { name: 'Uttarakhand',                code: 'UK', latMin: 28.72, latMax: 31.46, lngMin: 77.57, lngMax: 81.04, centerLat: 30.07, centerLng: 79.24 },
  { name: 'West Bengal',               code: 'WB', latMin: 21.63, latMax: 27.22, lngMin: 85.83, lngMax: 89.87, centerLat: 22.99, centerLng: 87.85 },
];

/**
 * Infers the Indian state name from GPS coordinates.
 * Uses bounding boxes with centroid distance tiebreaking for border areas.
 * Returns 'Unknown' if no state matches.
 */
export function getStateFromCoords(lat: number, lng: number): string {
  const candidates = INDIA_STATE_BBOXES.filter(
    s => lat >= s.latMin && lat <= s.latMax && lng >= s.lngMin && lng <= s.lngMax
  );

  if (candidates.length === 0) return 'Unknown';
  if (candidates.length === 1) return candidates[0].name;

  // For border overlaps, return closest by centroid distance
  let bestState = candidates[0];
  let bestDist = Math.hypot(lat - candidates[0].centerLat, lng - candidates[0].centerLng);

  for (let i = 1; i < candidates.length; i++) {
    const d = Math.hypot(lat - candidates[i].centerLat, lng - candidates[i].centerLng);
    if (d < bestDist) {
      bestDist = d;
      bestState = candidates[i];
    }
  }

  return bestState.name;
}

/** Returns all unique state names for use in filter dropdowns */
export const ALL_STATE_NAMES = INDIA_STATE_BBOXES.map(s => s.name).sort();
