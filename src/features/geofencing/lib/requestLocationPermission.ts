import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export type LocationPermissionStatus =
  | 'granted' // el usuario concedió la ubicación
  | 'denied' // la rechazó (en nativo puede requerir habilitarla en Ajustes)
  | 'unavailable'; // el dispositivo/navegador no soporta geolocalización

/**
 * Flujo de permiso de ubicación pensado para móvil (Android/iOS) con fallback web.
 *
 * Nativo: primero consulta el estado (checkPermissions). Solo lanza el diálogo
 * del sistema (requestPermissions) si todavía está en "prompt"; si ya fue
 * denegado antes, devuelve 'denied' para que la UI invite a habilitarlo en Ajustes.
 *
 * Web: no existe un diálogo de solo-permiso, así que pedir una posición
 * dispara el prompt del navegador.
 */
export async function ensureLocationPermission(): Promise<LocationPermissionStatus> {
  if (Capacitor.isNativePlatform()) {
    try {
      let perm = await Geolocation.checkPermissions();

      // Aún no se ha preguntado → mostrar el diálogo nativo del sistema.
      if (perm.location === 'prompt' || perm.location === 'prompt-with-rationale') {
        perm = await Geolocation.requestPermissions();
      }

      return perm.location === 'granted' || perm.coarseLocation === 'granted'
        ? 'granted'
        : 'denied';
    } catch {
      return 'unavailable';
    }
  }

  // Web: getCurrentPosition desencadena el prompt del navegador.
  try {
    await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 10000 });
    return 'granted';
  } catch (err) {
    const code = (err as GeolocationPositionError | undefined)?.code;
    // code 1 = PERMISSION_DENIED; el resto suele ser posición no disponible/timeout.
    return code === 1 ? 'denied' : 'unavailable';
  }
}

/** Conveniencia booleana para quien solo necesita saber si quedó concedido. */
export async function requestLocationPermission(): Promise<boolean> {
  return (await ensureLocationPermission()) === 'granted';
}
