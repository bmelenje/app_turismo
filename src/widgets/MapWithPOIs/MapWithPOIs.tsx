import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { usePOIStore, useFavoritesStore } from '@/entities/poi';
import { useGeofencingStore } from '@/features/geofencing';
import { ENV } from '@/shared/config/env';
import { POI_COLORS } from '@/shared/config/constants';
import { calculateDistance } from '@/shared/lib/distance';
import { DEMO_POIS } from './demoPOIs';
import toast from 'react-hot-toast';
import { Navigation, Bookmark, Route as RouteIcon, X } from 'lucide-react';
import type { POI } from '@/entities/poi';

// Filtros del mapa (estilo Google Maps). 'all' muestra todos; el resto filtra
// por la lista de POIs asignada en FILTER_POI_IDS.
type MapFilter = 'all' | 'fotospots' | 'restaurantes' | 'hoteles' | 'supermercados';

const MAP_FILTERS: { id: MapFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'fotospots', label: 'Fotospots' },
  { id: 'restaurantes', label: 'Restaurantes' },
  { id: 'hoteles', label: 'Hoteles' },
  { id: 'supermercados', label: 'Supermercados' },
];

const LANDMARK_IDS = [
  'caldas',
  'catedral',
  'torre',
  'humilladero',
  'museo',
  'pueblito',
  'morro',
  'teatro',
  'santodomingo',
  'alcaldia',
  'ermita',
  'lovepopayan',
];
const RESTAURANT_IDS = [
  'rest-laradio',
  'rest-tequilas',
  'rest-italiano',
  'rest-pizzarra',
  'rest-mana',
  'rest-taller',
];
const HOTEL_IDS = [
  'hotel-dann',
  'hotel-real',
  'hotel-royal',
  'hotel-granposada',
  'hotel-gaitana',
  'hotel-krone',
];
const SUPERMARKET_IDS = [
  'super-provitec',
  'super-olimpica',
  'super-d1',
  'super-solarte',
  'super-remesa',
  'super-merkatrueke',
];

// Qué marcadores se muestran al pulsar cada filtro
const FILTER_POI_IDS: Record<Exclude<MapFilter, 'all'>, string[]> = {
  fotospots: ['catedral', 'lovepopayan'],
  restaurantes: RESTAURANT_IDS,
  hoteles: HOTEL_IDS,
  supermercados: SUPERMARKET_IDS,
};

const CATEGORY_LABEL: Record<string, string> = {
  interes: 'Sitio de interés',
  ra: 'Realidad Aumentada',
  camara: 'Cámara remota',
  serv: 'Servicio',
  mirador: 'Mirador',
  custom: 'Punto',
};

const getCategoryIcon = (category: string): string =>
  ({
    interes: '📍',
    ra: '🎨',
    camara: '📷',
    serv: '☕',
    mirador: '🔭',
    restaurante: '🍴',
    hotel: '🏨',
    supermercado: '🛒',
  }[category] || '📌');

// Solo estos puntos se muestran como marcadores en el mapa
const MAP_POI_IDS = [...LANDMARK_IDS, ...RESTAURANT_IDS, ...HOTEL_IDS, ...SUPERMARKET_IDS];
const MAP_POIS = DEMO_POIS.filter((p) => MAP_POI_IDS.includes(p.id));

type RouteInfo = { km: string; mins: number; stops: number };

// Ritmo de caminata medio (~5 km/h) para estimar el tiempo a pie cuando el
// router no da una duración peatonal fiable.
const WALK_METERS_PER_MIN = 5000 / 60;

export function MapWithPOIs() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const mapReady = useRef(false);
  const markersRef = useRef<Record<string, { marker: maplibregl.Marker; el: HTMLElement }>>({});
  const { setPOIs, selectedPOI, selectPOI } = usePOIStore();
  const pendingRoute = usePOIStore((s) => s.pendingRoute);
  const clearPendingRoute = usePOIStore((s) => s.clearPendingRoute);
  const [activeFilter, setActiveFilter] = useState<MapFilter>('all');

  const savedIds = useFavoritesStore((s) => s.ids);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeStops, setRouteStops] = useState<POI[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setPOIs(DEMO_POIS);

    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: ENV.MAP_STYLE,
      center: [ENV.MAP_CENTER_LNG, ENV.MAP_CENTER_LAT],
      zoom: ENV.MAP_ZOOM,
      pitch: 0,
      bearing: 0,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.current.on('load', () => {
      applyGoogleLikePalette();
      addRouteLayer();
      addUserLocationLayer();
      addPOIMarkers();
      startGeofencingListener();
      mapReady.current = true;
      const current = usePOIStore.getState().selectedPOI;
      if (current) focusPOI(current);
    });

    return () => {
      Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
      markersRef.current = {};
      if (map.current) {
        map.current.remove();
        map.current = null;
        mapReady.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPOIs]);

  // Acerca la paleta de streets-v2 a los tonos de Google Maps (agua, parques, fondo).
  // Best-effort: detecta capas por su source-layer (esquema OpenMapTiles) y solo
  // sobreescribe colores; si una capa no existe o no aplica, se ignora sin romper nada.
  const applyGoogleLikePalette = () => {
    if (!map.current) return;
    const layers = map.current.getStyle().layers ?? [];
    layers.forEach((layer) => {
      const sl = (layer as { 'source-layer'?: string })['source-layer'];
      try {
        if (layer.type === 'background') {
          map.current!.setPaintProperty(layer.id, 'background-color', '#eaecef');
        } else if (layer.type === 'fill' && sl === 'water') {
          map.current!.setPaintProperty(layer.id, 'fill-color', '#a9d4f5');
        } else if (layer.type === 'line' && sl === 'waterway') {
          map.current!.setPaintProperty(layer.id, 'line-color', '#a9d4f5');
        } else if (layer.type === 'fill' && (sl === 'park' || /park|garden/.test(layer.id))) {
          map.current!.setPaintProperty(layer.id, 'fill-color', '#c4e6b4');
        } else if (layer.type === 'fill' && sl === 'landcover') {
          map.current!.setPaintProperty(layer.id, 'fill-color', '#d6ead0');
        } else if (layer.type === 'fill' && sl === 'building') {
          map.current!.setPaintProperty(layer.id, 'fill-color', '#ece9e2');
        }
      } catch {
        /* capa sin esa propiedad: ignorar */
      }
    });
  };

  // --- Marcadores pin (HTML) ---
  const addPOIMarkers = () => {
    if (!map.current) return;
    MAP_POIS.forEach((poi) => {
      const el = document.createElement('div');
      el.className = 'popayan-marker';
      if (poi.imageUrl) {
        el.innerHTML = `<div class="marker-photo" style="background-image:url('${poi.imageUrl}')"></div>`;
      } else {
        const color = POI_COLORS[poi.category] || POI_COLORS.custom;
        el.innerHTML = `<div class="marker-icon" style="--pin:${color};background:${color}"><span class="marker-icon-emoji">${getCategoryIcon(poi.category)}</span></div>`;
      }
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectPOI(poi);
        focusPOI(poi);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([poi.coordinates.lng, poi.coordinates.lat])
        .addTo(map.current!);

      markersRef.current[poi.id] = { marker, el };
    });
  };

  const setActiveMarker = (id: string | null) => {
    Object.entries(markersRef.current).forEach(([poiId, { el }]) => {
      el.classList.toggle('marker-active', poiId === id);
    });
  };

  const addUserLocationLayer = () => {
    if (!map.current) return;
    const lat = DEMO_POIS[0].coordinates.lat + 0.0008;
    const lng = DEMO_POIS[0].coordinates.lng - 0.0005;
    setUserLocation({ lat, lng });

    map.current.addSource('user-location-source', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: {} },
    });
    map.current.addLayer({
      id: 'user-location-halo',
      type: 'circle',
      source: 'user-location-source',
      paint: { 'circle-radius': 20, 'circle-color': '#1769C9', 'circle-opacity': 0.18 },
    });
    map.current.addLayer({
      id: 'user-location-circle',
      type: 'circle',
      source: 'user-location-source',
      paint: {
        'circle-radius': 8,
        'circle-color': '#1769C9',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    });
  };

  const addRouteLayer = () => {
    if (!map.current) return;
    map.current.addSource('route-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.current.addLayer({
      id: 'route-casing',
      type: 'line',
      source: 'route-source',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 9, 'line-opacity': 0.95 },
    });
    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route-source',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#1769C9', 'line-width': 5.5 },
    });
  };

  const clearRouteLine = () => {
    const src = map.current?.getSource('route-source') as maplibregl.GeoJSONSource | undefined;
    src?.setData({ type: 'FeatureCollection', features: [] });
  };

  const startGeofencingListener = () => {
    const { start } = useGeofencingStore.getState();
    start(MAP_POIS, (poi: POI) => {
      toast.success(`📍 ¡Estás cerca de ${poi.name}!`, { icon: '🔔', duration: 3000 });
    });
  };

  const focusPOI = (poi: POI) => {
    if (!map.current) return;
    setSheetOpen(true);
    map.current.flyTo({
      center: [poi.coordinates.lng, poi.coordinates.lat],
      zoom: 17,
      duration: 800,
      offset: [0, -120],
    });
  };

  const fitToCoords = (coords: [number, number][]) => {
    if (!map.current || coords.length === 0) return;
    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new maplibregl.LngLatBounds(coords[0], coords[0]),
    );
    map.current.fitBounds(bounds, {
      padding: { top: 150, left: 50, right: 50, bottom: 110 },
      duration: 800,
    });
  };

  // Traza una ruta a pie por una lista de waypoints.
  // 1º OpenRouteService (perfil peatonal real) si hay key; 2º OSRM (geometría, pero
  // tiempo recalculado a ritmo de caminata); 3º línea directa.
  const drawRoute = async (waypoints: [number, number][], stops: number) => {
    if (waypoints.length < 2 || !map.current) return;
    const src = map.current.getSource('route-source') as maplibregl.GeoJSONSource | undefined;
    if (!src) return;

    const toastId = toast.loading('Calculando ruta a pie…');

    const paint = (
      geometry: GeoJSON.Geometry,
      coords: [number, number][],
      km: string,
      mins: number,
    ) => {
      src.setData({ type: 'Feature', geometry, properties: {} });
      setSheetOpen(false);
      fitToCoords(coords);
      setRouteInfo({ km, mins, stops });
      toast.success(`🚶 ${km} km · ~${mins} min a pie`, { id: toastId, duration: 4000 });
    };

    // 1) OpenRouteService — ruta peatonal real (cruza plazas, parques, sin sentidos de vía)
    if (ENV.ORS_API_KEY) {
      try {
        const res = await fetch(
          'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
          {
            method: 'POST',
            headers: { Authorization: ENV.ORS_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ coordinates: waypoints }),
          },
        );
        if (res.ok) {
          const data = await res.json();
          const feat = data.features?.[0];
          if (feat?.geometry) {
            const coords = feat.geometry.coordinates as [number, number][];
            const summary = feat.properties?.summary ?? {};
            const km = ((summary.distance ?? 0) / 1000).toFixed(2);
            const mins = Math.max(1, Math.round((summary.duration ?? 0) / 60));
            paint(feat.geometry, coords, km, mins);
            return;
          }
        }
      } catch {
        /* cae al fallback de OSRM */
      }
    }

    // 2) OSRM público (el perfil a pie enruta como carro): usamos su geometría pero
    //    recalculamos el tiempo a ritmo de caminata (~5 km/h = 83 m/min).
    try {
      const path = waypoints.map((c) => `${c[0]},${c[1]}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/foot/${path}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('osrm');
      const data = await res.json();
      const route = data.routes?.[0];
      if (!route) throw new Error('sin ruta');

      const coords = route.geometry.coordinates as [number, number][];
      const km = (route.distance / 1000).toFixed(2);
      const mins = Math.max(1, Math.round(route.distance / WALK_METERS_PER_MIN));
      paint(route.geometry, coords, km, mins);
    } catch {
      // 3) línea directa
      src.setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: waypoints },
        properties: {},
      });
      setSheetOpen(false);
      fitToCoords(waypoints);
      setRouteInfo(null);
      toast('Ruta directa (servicio de rutas no disponible)', { id: toastId, icon: '➡️' });
    }
  };

  // La Guía IA pidió dibujar una ruta por varios POIs: la trazamos a pie.
  useEffect(() => {
    if (!pendingRoute || pendingRoute.length < 2) return;

    const stops = pendingRoute
      .map((id) => DEMO_POIS.find((p) => p.id === id))
      .filter((p): p is POI => Boolean(p));
    if (stops.length < 2) {
      clearPendingRoute();
      return;
    }

    const run = () => {
      selectPOI(null);
      setSheetOpen(false);
      setRouteStops(stops);
      drawRoute(
        stops.map((p) => [p.coordinates.lng, p.coordinates.lat] as [number, number]),
        stops.length,
      );
      clearPendingRoute();
    };

    if (mapReady.current) {
      run();
      return;
    }
    // El mapa aún no terminó de cargar: esperamos a que esté listo.
    const t = window.setInterval(() => {
      if (mapReady.current) {
        window.clearInterval(t);
        run();
      }
    }, 200);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRoute]);

  // Reacciona a selección externa (desde Lugares / Descubrir) y resalta el marcador
  useEffect(() => {
    if (!mapReady.current) return;
    if (selectedPOI) {
      setActiveMarker(selectedPOI.id);
      focusPOI(selectedPOI);
    } else {
      setActiveMarker(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPOI]);

  // Aplica el filtro mostrando/ocultando marcadores (estilo Google Maps)
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([poiId, { el }]) => {
      const visible = activeFilter === 'all' || FILTER_POI_IDS[activeFilter].includes(poiId);
      el.style.display = visible ? '' : 'none';
    });
  }, [activeFilter]);

  const getDistance = (poi: POI): number => {
    if (!userLocation) return 0;
    return calculateDistance(userLocation.lat, userLocation.lng, poi.coordinates.lat, poi.coordinates.lng);
  };

  // --- Acciones tipo Google Maps ---
  const handleDirections = (poi: POI) => {
    if (!userLocation) return;
    drawRoute(
      [
        [userLocation.lng, userLocation.lat],
        [poi.coordinates.lng, poi.coordinates.lat],
      ],
      1,
    );
  };

  const handleSave = (poi: POI) => {
    const nowSaved = toggleFavorite(poi.id);
    if (nowSaved) toast.success(`🔖 ${poi.name} guardado`);
    else toast(`Quitado de guardados`, { icon: '➖' });
  };

  const handleAddToRoute = (poi: POI) => {
    setRouteStops((stops) => {
      if (stops.some((s) => s.id === poi.id)) {
        toast(`${poi.name} ya está en la ruta`, { icon: 'ℹ️' });
        return stops;
      }
      toast.success(`➕ ${poi.name} añadido a la ruta`);
      return [...stops, poi];
    });
  };

  const removeStop = (id: string) => setRouteStops((s) => s.filter((p) => p.id !== id));

  const traceRoute = () => {
    if (!userLocation || routeStops.length === 0) return;
    const waypoints: [number, number][] = [
      [userLocation.lng, userLocation.lat],
      ...routeStops.map((p) => [p.coordinates.lng, p.coordinates.lat] as [number, number]),
    ];
    drawRoute(waypoints, routeStops.length);
  };

  const clearRoute = () => {
    clearRouteLine();
    setRouteInfo(null);
    setRouteStops([]);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    audioRef.current?.pause();
    setActiveMarker(null);
    window.setTimeout(() => selectPOI(null), 280);
  };

  const handleAudio = (poi: POI) => {
    if (!poi.audioUrl) return;
    try {
      audioRef.current?.pause();
      const audio = new Audio(poi.audioUrl);
      audioRef.current = audio;
      audio.play().then(
        () => toast.success(`🎧 Reproduciendo audioguía de ${poi.name}`),
        () => toast.error('Audioguía no disponible (demo)'),
      );
    } catch {
      toast.error('No se pudo reproducir el audio');
    }
  };

  const selectedSaved = selectedPOI ? savedIds.has(selectedPOI.id) : false;
  const selectedInRoute = selectedPOI ? routeStops.some((s) => s.id === selectedPOI.id) : false;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Filtros por categoría */}
      <div className="pointer-events-none absolute inset-x-0 top-[4.75rem] z-[999] px-4">
        <div className="no-scrollbar pointer-events-auto mx-auto flex max-w-md gap-2 overflow-x-auto pb-1">
          {MAP_FILTERS.map((f) => {
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card/95 text-foreground backdrop-blur-sm hover:bg-card'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Banda superior: resumen de ruta o constructor de ruta (estilo Google Maps) */}
      {(routeInfo || routeStops.length > 0) && (
        <div className="pointer-events-none absolute inset-x-0 top-[7.5rem] z-[1001] px-4">
          <div className="pointer-events-auto mx-auto max-w-md rounded-2xl bg-card/95 p-3 shadow-lg ring-1 ring-border backdrop-blur-sm">
            {routeInfo ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Navigation className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-heading text-sm font-bold text-foreground">
                    {routeInfo.km} km · ~{routeInfo.mins} min a pie
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {routeInfo.stops === 1 ? 'Ruta directa' : `Ruta de ${routeInfo.stops} paradas`}
                  </p>
                </div>
                <button
                  onClick={clearRoute}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Cerrar ruta"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                    <RouteIcon className="h-4 w-4 text-primary" />
                    Tu ruta · {routeStops.length}{' '}
                    {routeStops.length === 1 ? 'parada' : 'paradas'}
                  </p>
                  <button
                    onClick={clearRoute}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Limpiar
                  </button>
                </div>
                <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
                  {routeStops.map((s, i) => (
                    <span
                      key={s.id}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      <span className="text-muted-foreground">{i + 1}.</span>
                      {s.name}
                      <button onClick={() => removeStop(s.id)} aria-label={`Quitar ${s.name}`}>
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={traceRoute}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Navigation className="h-4 w-4" /> Trazar ruta
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badge ciudad */}
      <div className="pointer-events-none absolute bottom-24 left-4 z-[998]">
        <div className="rounded-full bg-card/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-md ring-1 ring-border backdrop-blur-sm">
          {ENV.APP_CITY} · La Ciudad Blanca
        </div>
      </div>

      {selectedPOI && (
        <div
          className={`absolute inset-x-0 bottom-0 z-[1050] transition-transform duration-300 ease-out ${
            sheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="mx-auto max-w-md rounded-t-3xl bg-card shadow-2xl">
            <div className="flex cursor-pointer justify-center py-3" onClick={closeSheet} title="Cerrar">
              <span className="h-1.5 w-10 rounded-full bg-border" />
            </div>

            <div className="max-h-[62dvh] overflow-y-auto px-5 pb-[calc(5rem+env(safe-area-inset-bottom))]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg text-white shadow-sm"
                    style={{ backgroundColor: POI_COLORS[selectedPOI.category] || POI_COLORS.custom }}
                  >
                    {getCategoryIcon(selectedPOI.category)}
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold leading-tight text-foreground">
                      {selectedPOI.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_LABEL[selectedPOI.category] ?? selectedPOI.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeSheet}
                  aria-label="Cerrar"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {userLocation && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span>📏</span>
                  <span>{getDistance(selectedPOI)} m desde tu ubicación</span>
                </div>
              )}

              {/* Acciones principales estilo Google Maps */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleDirections(selectedPOI)}
                  className="flex flex-col items-center gap-1 rounded-2xl bg-primary px-2 py-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Navigation className="h-5 w-5" />
                  Cómo llegar
                </button>
                <button
                  onClick={() => handleSave(selectedPOI)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-xs font-semibold transition-colors ${
                    selectedSaved
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${selectedSaved ? 'fill-primary' : ''}`} />
                  {selectedSaved ? 'Guardado' : 'Guardar'}
                </button>
                <button
                  onClick={() => handleAddToRoute(selectedPOI)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-xs font-semibold transition-colors ${
                    selectedInRoute
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <RouteIcon className="h-5 w-5" />
                  {selectedInRoute ? 'En la ruta' : 'Añadir a ruta'}
                </button>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {selectedPOI.description}
              </p>

              {/* Acciones secundarias según categoría */}
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedPOI.audioUrl && (
                  <button
                    onClick={() => handleAudio(selectedPOI)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    🎧 Audioguía
                  </button>
                )}
                {selectedPOI.category === 'ra' && (
                  <button
                    onClick={() => toast('🎨 Abriendo experiencia AR…', { icon: '🕶️' })}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    🎨 Ver en RA
                  </button>
                )}
                {selectedPOI.category === 'camara' && (
                  <button
                    onClick={() => toast.success(`📷 Solicitando captura a ${selectedPOI.name}…`)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    📷 Capturar foto
                  </button>
                )}
              </div>

              {selectedPOI.metadata && Object.keys(selectedPOI.metadata).length > 0 && (
                <div className="mt-4 grid gap-2 rounded-2xl bg-muted/60 p-3 text-xs">
                  {Object.entries(selectedPOI.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-3">
                      <span className="font-semibold capitalize text-foreground">{key}</span>
                      <span className="text-right text-muted-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controles flotantes */}
      <div className="absolute bottom-24 right-4 z-[998] flex flex-col gap-2">
        <button
          title="Ubicarme"
          onClick={() => {
            if (userLocation) {
              map.current?.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 16, duration: 600 });
            }
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-lg shadow-lg ring-1 ring-border transition-transform hover:scale-105"
        >
          📍
        </button>
        <button
          title="Ver todo"
          onClick={() => {
            closeSheet();
            map.current?.flyTo({ center: [ENV.MAP_CENTER_LNG, ENV.MAP_CENTER_LAT], zoom: ENV.MAP_ZOOM, duration: 600 });
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-lg shadow-lg ring-1 ring-border transition-transform hover:scale-105"
        >
          🔍
        </button>
      </div>
    </div>
  );
}
