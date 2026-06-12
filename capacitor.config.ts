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
      // iOS requiere descripción del uso de ubicación
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#BA7517',
    },
  },
};

export default config;
