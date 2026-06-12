import { RouterProvider } from 'react-router-dom';
import { Providers }      from '@/app/providers';
import { router }         from '@/app/router';
import '@/app/styles/global.css';
import 'maplibre-gl/dist/maplibre-gl.css';

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
