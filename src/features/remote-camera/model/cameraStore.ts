import { create } from 'zustand';
import { ipCameraApi } from '../api/cameraApi';

type CameraStatus = 'idle' | 'capturing' | 'success' | 'error';

interface CameraStore {
  status: CameraStatus;
  lastPhotoBlob: Blob | null;
  error: string | null;
  capture: (cameraUrl?: string) => Promise<void>;
  reset: () => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  status: 'idle',
  lastPhotoBlob: null,
  error: null,

  capture: async (cameraUrl) => {
    set({ status: 'capturing', error: null });
    try {
      const blob = await ipCameraApi.snapshot(cameraUrl);
      set({ status: 'success', lastPhotoBlob: blob });
    } catch (e) {
      set({ status: 'error', error: (e as Error).message });
    }
  },

  reset: () => set({ status: 'idle', lastPhotoBlob: null, error: null }),
}));
