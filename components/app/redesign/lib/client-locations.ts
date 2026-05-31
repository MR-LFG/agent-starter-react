// Static client geography for the v1 globe centerpiece.
//
// Source: memory/reference_qc_client_base.md — ~70 clients across 6 countries.
// Cities chosen as anchor points for each country (not actual client addresses).
// Used only for visual pin placement on the wireframe globe.

export interface ClientLocation {
  id: string;
  country: string;
  city: string;
  lat: number;
  long: number;
}

export const CLIENT_LOCATIONS: ClientLocation[] = [
  { id: 'au', country: 'Australia', city: 'Perth', lat: -31.95, long: 115.86 },
  { id: 'sc', country: 'Scotland', city: 'Glasgow', lat: 55.86, long: -4.25 },
  { id: 'cy', country: 'Cyprus', city: 'Nicosia', lat: 35.18, long: 33.38 },
  { id: 'ca', country: 'Canada', city: 'Toronto', lat: 43.65, long: -79.38 },
  { id: 'en', country: 'England', city: 'London', lat: 51.51, long: -0.13 },
  { id: 'th', country: 'Thailand', city: 'Bangkok', lat: 13.76, long: 100.5 },
];

// Convert lat/long (degrees) to a unit-sphere 3D position.
// Standard equirectangular → spherical. radius = 1 by default; caller scales.
export function latLongToVec3(lat: number, long: number, radius = 1): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (long + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}
