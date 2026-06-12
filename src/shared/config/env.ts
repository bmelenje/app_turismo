// Variables de entorno tipadas
// Cambia los valores en .env, no aquí

export const ENV = {
  API_URL:        import.meta.env.VITE_API_URL        as string ?? 'http://localhost:4000',
  CAMERA_IP:      import.meta.env.VITE_CAMERA_IP      as string ?? '',
  CAMERA_USER:    import.meta.env.VITE_CAMERA_USER    as string ?? 'admin',
  CAMERA_PASS:    import.meta.env.VITE_CAMERA_PASS    as string ?? 'admin',
  MAP_STYLE:      import.meta.env.VITE_MAP_STYLE      as string ?? 'https://demotiles.maplibre.org/style.json',
  COUCHDB_URL:    import.meta.env.VITE_COUCHDB_URL    as string ?? '',
  MAP_CENTER_LNG: Number(import.meta.env.VITE_MAP_CENTER_LNG ?? -76.6127),
  MAP_CENTER_LAT: Number(import.meta.env.VITE_MAP_CENTER_LAT ?? 2.4428),
  MAP_ZOOM:       Number(import.meta.env.VITE_MAP_ZOOM ?? 15),
  APP_NAME:       import.meta.env.VITE_APP_NAME       as string ?? 'Guía Turística',
  APP_CITY:       import.meta.env.VITE_APP_CITY       as string ?? 'Popayán',
} as const;
