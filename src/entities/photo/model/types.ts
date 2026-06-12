export type PhotoSource = 'device' | 'remote_camera' | 'ar';

export interface Photo {
  id: string;
  poiId?: string;
  source: PhotoSource;
  base64?: string;
  url?: string;
  createdAt: number;
  edited: boolean;
}
