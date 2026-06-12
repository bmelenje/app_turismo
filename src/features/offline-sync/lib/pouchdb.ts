import PouchDB from 'pouchdb';
import { ENV } from '@/shared/config/env';

// Base de datos local (siempre disponible, incluso sin internet)
export const localDB = new PouchDB('parque-caldas');

// Sincronización con CouchDB remoto (solo si está configurado)
export function startSync() {
  if (!ENV.COUCHDB_URL) return;

  const remoteDB = new PouchDB(ENV.COUCHDB_URL);

  localDB
    .sync(remoteDB, { live: true, retry: true })
    .on('change', () => console.log('[Sync] Cambios sincronizados'))
    .on('error', (err) => console.error('[Sync] Error:', err));
}
