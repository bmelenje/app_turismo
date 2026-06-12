# Guía Turística — Boilerplate

Proyecto base flexible para apps de guía turística con mapa interactivo, geofencing, cámara remota y modo offline.

## Stack
- **React 18 + TypeScript** — UI
- **Capacitor 6** — Build iOS/Android
- **MapLibre GL JS** — Mapas vector tiles
- **Zustand** — Estado global
- **PouchDB** — Sincronización offline
- **Vite** — Build tool

## Estructura (Feature-Sliced Design)
```
src/
├── app/          → Configuración global (router, providers, estilos)
├── pages/        → Vistas completas
├── widgets/      → Bloques de UI complejos
├── features/     → Funcionalidades de negocio
├── entities/     → Modelos del dominio (POI, Route, Photo)
└── shared/       → Código reutilizable sin lógica de negocio
```

## Iniciar desarrollo

```bash
# 1. Clonar e instalar
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales

# 3. Correr en navegador
npm run dev

# 4. Build + sincronizar con Capacitor
npm run cap:sync

# 5. Abrir en Android Studio
npm run cap:android

# 6. Abrir en Xcode
npm run cap:ios
```

## Flujo de trabajo en equipo (Git Flow)

```bash
# Siempre partir de develop actualizado
git checkout develop && git pull

# Crear rama para tu tarea
git checkout -b feature/nombre-de-la-tarea

# Commits frecuentes y descriptivos
git commit -m "feat(poi): add proximity toast notification"
git commit -m "fix(map): prevent duplicate markers"

# Al terminar: push y abrir Pull Request a develop
git push origin feature/nombre-de-la-tarea
```

### Convenciones de commits
- `feat(scope):` nueva funcionalidad
- `fix(scope):` corrección de bug
- `chore(scope):` tareas de mantenimiento
- `refactor(scope):` refactorización sin cambio de comportamiento
- `docs(scope):` documentación

## Adaptar a otro proyecto

1. Cambiar `VITE_APP_NAME`, `VITE_APP_CITY`, coordenadas en `.env`
2. Reemplazar `DEMO_POIS` en `src/widgets/MapWithPOIs/demoPOIs.ts` con datos reales
3. Cambiar `appId` en `capacitor.config.ts`
4. Actualizar colores en `src/app/styles/global.css`

## Módulos del proyecto

| Módulo | Estado | Carpeta |
|---|---|---|
| A — Guía turística (MVP) | ✅ Base lista | `features/geofencing`, `features/guided-route` |
| B — Realidad aumentada | 🔜 Placeholder | `features/ar-viewer` |
| C — Cámara remota | ✅ API lista | `features/remote-camera` |
| D — Edición IA | 🔜 Placeholder | `features/ai-editor` |
| E — Publicidad | 🔜 Fase 2 | — |
