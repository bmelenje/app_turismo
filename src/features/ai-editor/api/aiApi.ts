import { httpClient } from '@/shared/api/httpClient';

// Módulo D: edición IA de fotos
// Conecta al backend Node.js donde vive el modelo de IA
export const aiApi = {
  removeBackground: async (base64: string): Promise<string> => {
    const { data } = await httpClient.post<{ result: string }>('/ai/remove-background', { image: base64 });
    return data.result;
  },

  enhance: async (base64: string): Promise<string> => {
    const { data } = await httpClient.post<{ result: string }>('/ai/enhance', { image: base64 });
    return data.result;
  },
};
