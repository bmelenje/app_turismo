import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { usePOIStore } from '@/entities/poi';
import { useGeofencingStore } from '@/features/geofencing';
import { ENV } from '@/shared/config/env';
import { POI_COLORS } from '@/shared/config/constants';
import { calculateDistance } from '@/shared/lib/distance';
import { DEMO_POIS } from './demoPOIs';
import toast from 'react-hot-toast';
import type { POI } from '@/entities/poi';
import './MapWithPOIs.css';

export function MapWithPOIs() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { setPOIs, selectedPOI, selectPOI } = usePOIStore();
  const { start: startGeofencing } = useGeofencingStore();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      addPOILayer();
      addUserLocationLayer();
      startGeofencingListener();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [setPOIs]);

  const addPOILayer = () => {
    if (!map.current) return;

    map.current.addSource('pois-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: DEMO_POIS.map((poi) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [poi.coordinates.lng, poi.coordinates.lat],
          },
          properties: {
            id: poi.id,
            name: poi.name,
            category: poi.category,
          },
        })),
      },
    });

    map.current.addLayer({
      id: 'pois-layer',
      type: 'circle',
      source: 'pois-source',
      paint: {
        'circle-radius': 14,
        'circle-color': [
          'match',
          ['get', 'category'],
          'interes',
          POI_COLORS.interes,
          'ra',
          POI_COLORS.ra,
          'camara',
          POI_COLORS.camara,
          'serv',
          POI_COLORS.serv,
          'mirador',
          POI_COLORS.mirador,
          POI_COLORS.custom,
        ],
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.85,
      },
    });

    map.current.on('mouseenter', 'pois-layer', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'pois-layer', () => {
      map.current!.getCanvas().style.cursor = '';
    });

    map.current.on('click', 'pois-layer', (e) => {
      const properties = e.features?.[0]?.properties;
      if (!properties) return;

      const poi = DEMO_POIS.find((p) => p.id === properties.id);
      if (!poi) return;

      selectPOI(poi);
      setSheetOpen(true);

      map.current!.flyTo({
        center: [poi.coordinates.lng, poi.coordinates.lat],
        zoom: 17,
        duration: 800,
        pitch: 0,
      });
    });
  };

  const addUserLocationLayer = () => {
    if (!map.current) return;

    const simulatedUserLat = DEMO_POIS[0].coordinates.lat + 0.0008;
    const simulatedUserLng = DEMO_POIS[0].coordinates.lng - 0.0005;
    setUserLocation({ lat: simulatedUserLat, lng: simulatedUserLng });

    map.current.addSource('user-location-source', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [simulatedUserLng, simulatedUserLat],
        },
        properties: {},
      },
    });

    map.current.addLayer({
      id: 'user-location-circle',
      type: 'circle',
      source: 'user-location-source',
      paint: {
        'circle-radius': 10,
        'circle-color': '#1769C9',
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#ffffff',
      },
    });

    map.current.addLayer({
      id: 'user-location-pulse',
      type: 'circle',
      source: 'user-location-source',
      paint: {
        'circle-radius': 20,
        'circle-color': '#1769C9',
        'circle-opacity': 0,
      },
    });
  };

  const startGeofencingListener = () => {
    const { start: startGeofencingStore } = useGeofencingStore.getState();
    startGeofencingStore(DEMO_POIS, (poi: POI) => {
      toast.success(`📍 ¡Estás cerca de ${poi.name}!`, {
        icon: '🔔',
        duration: 3000,
      });
    });
  };

  const getDistance = (poi: POI): number => {
    if (!userLocation) return 0;
    const distanceMeters = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      poi.coordinates.lat,
      poi.coordinates.lng
    );
    return distanceMeters;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      interes: '📍',
      ra: '🎨',
      camara: '📷',
      serv: '☕',
      mirador: '🔭',
    };
    return icons[category] || '📌';
  };

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map-viewport" />

      {selectedPOI && (
        <div className={`poi-sheet ${sheetOpen ? 'open' : 'closed'}`}>
          <div className="sheet-handle" onClick={() => setSheetOpen(!sheetOpen)} title="Arrastra para mover" />

          <div className="sheet-content">
            <div className="sheet-header">
              <div className="poi-title">
                <div
                  className="poi-icon"
                  style={{
                    backgroundColor: POI_COLORS[selectedPOI.category] || POI_COLORS.custom,
                  }}
                >
                  {getCategoryIcon(selectedPOI.category)}
                </div>
                <div>
                  <h2>{selectedPOI.name}</h2>
                  <p className="poi-category">{selectedPOI.category}</p>
                </div>
              </div>
              <button
                className="close-btn"
                onClick={() => setSheetOpen(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {userLocation && (
              <div className="poi-distance">
                <span>📏</span>
                <span>{getDistance(selectedPOI)}m desde aquí</span>
              </div>
            )}

            {selectedPOI.imageUrl && (
              <img
                src={selectedPOI.imageUrl}
                alt={selectedPOI.name}
                className="poi-image"
                loading="lazy"
              />
            )}

            <p className="poi-description">{selectedPOI.description}</p>

            <div className="poi-actions">
              <button className="action-btn primary">
                🧭 Cómo llegar
              </button>
              {selectedPOI.audioUrl && (
                <button className="action-btn secondary">
                  🎧 Audioguía
                </button>
              )}
              {selectedPOI.category === 'ra' && (
                <button className="action-btn secondary">
                  🎨 Ver en RA
                </button>
              )}
              {selectedPOI.category === 'camara' && (
                <button className="action-btn secondary">
                  📷 Capturar foto
                </button>
              )}
            </div>

            {selectedPOI.metadata && Object.keys(selectedPOI.metadata).length > 0 && (
              <div className="poi-metadata">
                {Object.entries(selectedPOI.metadata).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {String(value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="map-controls">
        <button
          className="control-btn"
          title="Ubicarme"
          onClick={() => {
            if (userLocation) {
              map.current?.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: 16,
                duration: 600,
              });
            }
          }}
        >
          📍
        </button>
        <button
          className="control-btn"
          title="Ver todo"
          onClick={() => {
            map.current?.flyTo({
              center: [ENV.MAP_CENTER_LNG, ENV.MAP_CENTER_LAT],
              zoom: ENV.MAP_ZOOM,
              duration: 600,
            });
          }}
        >
          🔍
        </button>
      </div>
    </div>
  );
}