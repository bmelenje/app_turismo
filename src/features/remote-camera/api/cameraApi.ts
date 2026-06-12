import axios from 'axios';
import { ENV } from '@/shared/config/env';

const cameraClient = axios.create({
  timeout: 10_000,
  auth: { username: ENV.CAMERA_USER, password: ENV.CAMERA_PASS },
  responseType: 'blob',
});

// Cámara IP genérica (Hikvision, Reolink, Dahua...)
export const ipCameraApi = {
  snapshot: async (cameraUrl?: string): Promise<Blob> => {
    const url = cameraUrl ?? ENV.CAMERA_IP;
    const response = await cameraClient.get(`${url}/api/snapshot`);
    return response.data as Blob;
  },
};

// Canon EOS WiFi (CCAPI)
export const canonApi = {
  halfPress: async (ip: string) =>
    axios.get(`http://${ip}:8080/ccapi/ver100/shooting/control/shutterbutton/halfpress`),

  capture: async (ip: string) =>
    axios.post(`http://${ip}:8080/ccapi/ver100/shooting/control/shutterbutton/release`),

  getLastPhoto: async (ip: string): Promise<Blob> => {
    const list = await axios.get(`http://${ip}:8080/ccapi/ver100/contents/sd_card/DCIM/`);
    const photos: string[] = list.data.url ?? [];
    if (!photos.length) throw new Error('No photos found on camera');
    const last = photos[photos.length - 1];
    const resp = await cameraClient.get(`http://${ip}:8080${last}`);
    return resp.data as Blob;
  },
};
