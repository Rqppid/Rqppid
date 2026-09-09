import proj4 from "proj4";

// EPSG:29903 "TM65 / Irish Grid" - the projection DfI's Easting/Northing values
// use for Northern Ireland. Proj4 string verified against epsg.io/29903.
const IRISH_GRID =
  "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +a=6377340.189 +rf=299.3249646 +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs +type=crs";

const converter = proj4(IRISH_GRID, proj4.WGS84);

/** Converts an Irish Grid Easting/Northing pair to [lat, lon] (WGS84). */
export function irishGridToLatLon(easting: number, northing: number): [number, number] {
  const [lon, lat] = converter.forward([easting, northing]);
  return [lat, lon];
}

// Loose bounding box for Northern Ireland (+ a small margin), used to flag
// records with coordinates that don't plausibly belong there.
export const NI_BOUNDS = {
  minLat: 53.9,
  maxLat: 55.4,
  minLon: -8.3,
  maxLon: -5.3,
};

export function isWithinNI(lat: number, lon: number): boolean {
  return (
    lat >= NI_BOUNDS.minLat &&
    lat <= NI_BOUNDS.maxLat &&
    lon >= NI_BOUNDS.minLon &&
    lon <= NI_BOUNDS.maxLon
  );
}
