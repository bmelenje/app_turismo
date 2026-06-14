import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { usePOIStore } from '@/entities/poi';
import { useGeofencingStore } from '@/features/geofencing';
import { ENV } from '@/shared/config/env';
import { POI_COLORS } from '@/shared/config/constants';
import { calculateDistance } from '@/shared/lib/distance';
import { DEMO_POIS } from './demoPOIs';
import toast from 'react-hot-toast';
import type { POI, POICategory } from '@/entities/poi';

const CATEGORY_FILTERS: { id: POICategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'interes', label: 'Interés' },
  { id: 'ra', label: 'Realidad AR' },
  { id: 'camara', label: 'Cámaras' },
  { id: 'serv', label: 'Servicios' },
];

const CATEGORY_LABEL: Record<string, string> = {
  interes: 'Sitio de interés',
  ra: 'Realidad Aumentada',
  camara: 'Cámara remota',
  serv: 'Servicio',
  mirador: 'Mirador',
  custom: 'Punto',
};

export function MapWithPOIs() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const mapReady = useRef(false);
  const { setPOIs, selectedPOI, selectPOI, filteredCategory, setFilter } = usePOIStore();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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
      addRouteLayer();
      addPOILayer();
      addUserLocationLayer();
      startGeofencingListener();
      mapReady.current = true;
      // Si ya había un POI seleccionado al montar, céntralo
      const current = usePOIStore.getState().selectedPOI;
      if (current) focusPOI(current);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        mapReady.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPOIs]);

  const addPOILayer = () => {
    if (!map.current) return;

    map.current.addSource('pois-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: DEMO_POIS.map((poi) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [poi.coordinates.lng, poi.coordinates.lat] },
          properties: { id: poi.id, name: poi.name, category: poi.category },
        })),
      },
    });

    const colorExpr: maplibregl.ExpressionSpecification = [
      'match',
      ['get', 'category'],
      'interes', POI_COLORS.interes,
      'ra', POI_COLORS.ra,
      'camara', POI_COLORS.camara,
      'serv', POI_COLORS.serv,
      'mirador', POI_COLORS.mirador,
      POI_COLORS.custom,
    ];

    // Halo del punto seleccionado
    map.current.addLayer({
      id: 'pois-highlight',
      type: 'circle',
      source: 'pois-source',
      filter: ['==', ['get', 'id'], '__none__'],
      paint: {
        'circle-radius': 24,
        'circle-color': colorExpr,
        'circle-opacity': 0.25,
      },
    });

    // Puntos
    map.current.addLayer({
      id: 'pois-layer',
      type: 'circle',
      source: 'pois-source',
      paint: {
        'circle-radius': 13,
        'circle-color': colorExpr,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Etiquetas
    map.current.addLayer({
      id: 'pois-labels',
      type: 'symbol',
      source: 'pois-source',
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 1.6],
        'text-anchor': 'top',
        'text-max-width': 8,
      },
      paint: {
        'text-color': '#26201a',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
      },
    });

    map.current.on('mouseenter', 'pois-layer', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'pois-layer', () => {
      map.current!.getCanvas().style.cursor = '';
    });

    map.current.on('click', 'pois-layer', (e) => {
      const id = e.features?.[0]?.properties?.id;
      const poi = DEMO_POIS.find((p) => p.id === id);
      if (poi) {
        selectPOI(poi);
        focusPOI(poi);
      }
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
      id: 'user-location-circle',
      type: 'circle',
      source: 'user-location-source',
      paint: {
        'circle-radius': 9,
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
    // Borde blanco
    map.current.addLayer({
      id: 'route-casing',
      type: 'line',
      source: 'route-source',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 9, 'line-opacity': 0.95 },
    });
    // Línea principal
    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route-source',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#B53333', 'line-width': 5 },
    });
  };

  const clearRoute = () => {
    const src = map.current?.getSource('route-source') as maplibregl.GeoJSONSource | undefined;
    src?.setData({ type: 'FeatureCollection', features: [] });
  };

  const startGeofencingListener = () => {
    const { start } = useGeofencingStore.getState();
    start(DEMO_POIS, (poi: POI) => {
      toast.success(`📍 ¡Estás cerca de ${poi.name}!`, { icon: '🔔', duration: 3000 });
    });
  };

  // Centra el mapa en un POI, lo resalta y abre la ficha
  const focusPOI = (poi: POI) => {
    if (!map.current) return;
    setSheetOpen(true);
    if (map.current.getLayer('pois-highlight')) {
      map.current.setFilter('pois-highlight', ['==', ['get', 'id'], poi.id]);
    }
    map.current.flyTo({
      center: [poi.coordinates.lng, poi.coordinates.lat],
      zoom: 17,
      duration: 800,
      offset: [0, -120],
    });
  };

  // Reacciona a selección externa (desde Lugares / Descubrir)
  useEffect(() => {
    if (selectedPOI && mapReady.current) focusPOI(selectedPOI);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPOI]);

  // Aplica el filtro por categoría al mapa
  useEffect(() => {
    if (!map.current || !mapReady.current) return;
    const filter: maplibregl.FilterSpecification | null =
      filteredCategory === 'all' ? null : ['==', ['get', 'category'], filteredCategory];
    ['pois-layer', 'pois-labels'].forEach((id) => {
      if (map.current!.getLayer(id)) map.current!.setFilter(id, filter);
    });
  }, [filteredCategory]);

  const getDistance = (poi: POI): number => {
    if (!userLocation) return 0;
    return calculateDistance(userLocation.lat, userLocation.lng, poi.coordinates.lat, poi.coordinates.lng);
  };

  const getCategoryIcon = (category: string): string =>
    ({ interes: '📍', ra: '🎨', camara: '📷', serv: '☕', mirador: '🔭' }[category] || '📌');

  // --- Acciones de la ficha ---
  // Dibuja la ruta a pie dentro del mapa (OSRM, sin API key; fallback a línea directa)
  const handleDirections = async (poi: POI) => {
    if (!userLocation || !map.current) return;
    const src = map.current.getSource('route-source') as maplibregl.GeoJSONSource | undefined;
    if (!src) return;

    const from = `${userLocation.lng},${userLocation.lat}`;
    const to = `${poi.coordinates.lng},${poi.coordinates.lat}`;
    const url = `https://router.project-osrm.org/route/v1/foot/${from};${to}?overview=full&geometries=geojson`;
    const toastId = toast.loading('Calculando ruta…');

    const fitToCoords = (coords: [number, number][]) => {
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0]),
      );
      map.current!.fitBounds(bounds, {
        padding: { top: 110, left: 50, right: 50, bottom: 90 },
        duration: 800,
      });
    };

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('osrm');
      const data = await res.json();
      const route = data.routes?.[0];
      if (!route) throw new Error('sin ruta');

      const coords = route.geometry.coordinates as [number, number][];
      src.setData({ type: 'Feature', geometry: route.geometry, properties: {} });
      setSheetOpen(false);
      fitToCoords(coords);

      const km = (route.distance / 1000).toFixed(2);
      const mins = Math.max(1, Math.round(route.duration / 60));
      toast.success(`🚶 ${km} km · ~${mins} min caminando`, { id: toastId, duration: 4000 });
    } catch {
      // Fallback: línea recta entre el usuario y el POI
      const straight: [number, number][] = [
        [userLocation.lng, userLocation.lat],
        [poi.coordinates.lng, poi.coordinates.lat],
      ];
      src.setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: straight },
        properties: {},
      });
      setSheetOpen(false);
      fitToCoords(straight);
      toast('Ruta directa (servicio de rutas no disponible)', { id: toastId, icon: '➡️' });
    }
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

  const closeSheet = () => {
    setSheetOpen(false);
    audioRef.current?.pause();
    clearRoute();
    if (map.current?.getLayer('pois-highlight')) {
      map.current.setFilter('pois-highlight', ['==', ['get', 'id'], '__none__']);
    }
    // Quita la selección por completo tras la animación de salida
    window.setTimeout(() => selectPOI(null), 280);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Filtros por categoría */}
      <div className="pointer-events-none absolute inset-x-0 top-[4.75rem] z-[999] px-4">
        <div className="no-scrollbar pointer-events-auto mx-auto flex max-w-md gap-2 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map((f) => {
            const active = filteredCategory === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
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
            <div
              className="flex cursor-pointer justify-center py-3"
              onClick={closeSheet}
              title="Cerrar"
            >
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

              {selectedPOI.imageUrl && (
                <img
                  src={selectedPOI.imageUrl}
                  alt={selectedPOI.name}
                  loading="lazy"
                  className="mt-4 h-44 w-full rounded-2xl object-cover"
                />
              )}

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {selectedPOI.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleDirections(selectedPOI)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  🧭 Cómo llegar
                </button>
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
            selectPOI(null);
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
