import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.parquecaldas',   // Cambiar antes de publicar
  appName: 'Parque Caldas',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Geolocation: {
      // PERMISOS DE UBICACIÓN (app móvil)
      // Android: el plugin @capacitor/geolocation ya declara ACCESS_COARSE/FINE_LOCATION
      //   y se fusionan al AndroidManifest al hacer `npx cap sync`. No hay que tocar nada.
      // iOS: tras `npx cap add ios`, agregar en ios/App/App/Info.plist:
      //   <key>NSLocationWhenInUseUsageDescription</key>
      //   <string>Usamos tu ubicación para mostrarte sitios cercanos y rutas en Popayán.</string>
      //   (sin esta clave, iOS rechaza el permiso automáticamente)
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#BA7517',
    },
  },
};

export default config;
