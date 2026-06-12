import type { POI } from '@/entities/poi';

// Datos reales del Parque Caldas, Popayán
// Coordenadas actualizadas y descripciones completas
export const DEMO_POIS: POI[] = [
  {
    id: 'caldas',
    name: 'Monumento a Caldas',
    description: 'Estatua dedicada al sabio Francisco José de Caldas, matemático y naturalista colombiano del siglo XVIII. Corazón geométrico del parque donde convergen los ocho senderos principales.',
    category: 'interes',
    coordinates: { lat: 2.44193, lng: -76.60631 },
    imageUrl: 'https://images.unsplash.com/photo-1518235506717-e1ed3306a326?w=500&h=400&fit=crop',
    proximityRadiusM: 50,
    metadata: {
      horario: 'Acceso 24/7',
      entrada: 'Gratuita',
    },
  },
  {
    id: 'catedral',
    name: 'Catedral Basílica',
    description: 'Catedral Basílica Nuestra Señora de la Asunción, joya arquitectónica construida en el siglo XVI. Su fachada blanca es uno de los símbolos más reconocibles de Popayán, ubicada en el costado occidental del parque.',
    category: 'interes',
    coordinates: { lat: 2.44175, lng: -76.60662 },
    imageUrl: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=500&h=400&fit=crop',
    audioUrl: 'https://example.com/audio/catedral.mp3',
    proximityRadiusM: 50,
    metadata: {
      construida: '1558',
      estilo: 'Arquitectura colonial',
      horario: 'Lunes-Domingo 7am-6pm',
    },
  },
  {
    id: 'torre',
    name: 'Torre del Reloj',
    description: 'Torre de ladrillo rojo de casi 200 años de antigüedad, construida en 1831. Símbolo histórico de Popayán, ubicada en el costado norte del parque. Su reloj marca el tiempo del centro histórico.',
    category: 'interes',
    coordinates: { lat: 2.44155, lng: -76.60648 },
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop',
    proximityRadiusM: 40,
    metadata: {
      construida: '1831',
      altura: '18 metros',
      material: 'Ladrillo',
    },
  },
  {
    id: 'ra_fachada',
    name: 'Fachada Colonial (RA)',
    description: 'Apunta tu cámara hacia la fachada de la Catedral para ver una reconstrucción histórica en 3D de cómo se veía en el siglo XVI. Experiencia de realidad aumentada interactiva.',
    category: 'ra',
    coordinates: { lat: 2.44175, lng: -76.60645 },
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=400&fit=crop',
    arModelUrl: '/assets/models/fachada-colonial.glb',
    proximityRadiusM: 35,
    metadata: {
      tecnologia: 'WebAR',
      formato: '3D',
    },
  },
  {
    id: 'camara_principal',
    name: 'Punto de Foto Remota',
    description: 'Cámara IP de alta resolución estratégicamente ubicada para capturar la mejor vista panorámica del Parque Caldas. Solicita una foto bajo demanda que será procesada con IA para mejorar contraste y eliminar fondos.',
    category: 'camara',
    coordinates: { lat: 2.44220, lng: -76.60630 },
    imageUrl: 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=500&h=400&fit=crop',
    cameraUrl: 'http://192.168.1.50:8080',
    proximityRadiusM: 45,
    metadata: {
      resolucion: '4K',
      frecuencia: 'Tiempo real',
    },
  },
  {
    id: 'cafe',
    name: 'Café del Parque',
    description: 'Zona de descanso y cafetería con servicio de bebidas, snacks y comidas ligeras. Instalaciones disponibles incluyen baños y wifi gratuito. Ideal para pausar el recorrido y disfrutar de la atmósfera del parque.',
    category: 'serv',
    coordinates: { lat: 2.44185, lng: -76.60610 },
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=400&fit=crop',
    proximityRadiusM: 30,
    metadata: {
      horario: '8am - 6pm',
      servicios: 'WiFi, Baños, Comida',
      telefono: '+57 1234567890',
    },
  },
];