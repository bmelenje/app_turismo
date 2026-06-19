import { ENV } from '@/shared/config/env';

/** Extrae la API key de MapTiler que ya viene en la URL del estilo del mapa. */
function getMapTilerKey(): string | null {
  try {
    return new URL(ENV.MAP_STYLE).searchParams.get('key');
  } catch {
    return null;
  }
}

/**
 * Geocodifica una dirección a coordenadas usando la API de MapTiler.
 * Sesga la búsqueda a Popayán (Cauca, Colombia). Devuelve null si no encuentra
 * resultado o si falla la petición (el llamador decide el fallback).
 */
export async function geocodeAddress(
  address: string,
): Promise<{ lng: number; lat: number } | null> {
  const key = getMapTilerKey();
  const q = address.trim();
  if (!key || !q) return null;

  const query = encodeURIComponent(`${q}, Popayán, Cauca`);
  const url =
    `https://api.maptiler.com/geocoding/${query}.json` +
    `?key=${key}&proximity=${ENV.MAP_CENTER_LNG},${ENV.MAP_CENTER_LAT}&country=co&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const center = data?.features?.[0]?.center;
    if (Array.isArray(center) && center.length === 2) {
      return { lng: Number(center[0]), lat: Number(center[1]) };
    }
    return null;
  } catch {
    return null;
  }
}
