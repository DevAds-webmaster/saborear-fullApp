export type CloudinaryUploadResp = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: 'image';
  created_at: string;
  tags: string[];
  bytes: number;
  type: 'upload';
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  original_filename: string;
};

export async function getCloudinarySignature() {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/media/signature`, {
    method: 'GET',
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
    },
  });
  if (!res.ok) throw new Error('No se pudo obtener firma de Cloudinary');
  return res.json() as Promise<{
    timestamp: number;
    signature: string;
    api_key: string;
    cloud_name: string;
    folder: string;
  }>;
}

export async function uploadSignedToCloudinary(file: File, sig: {
  timestamp: number; signature: string; api_key: string; cloud_name: string; folder: string;
}) {
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.api_key);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`;
  const res = await fetch(endpoint, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Error subiendo imagen');
  return res.json() as Promise<CloudinaryUploadResp>;
}

export function cldOptimizedUrlFromPublicId(publicId: string, width = 800) {
  const cloud = import.meta.env.VITE_CLD_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}

export function cldOptimizedUrlFromSecureUrl(secureUrl: string, width = 800) {
  const parts = secureUrl.split('/upload/');
  return parts.length === 2 ? `${parts[0]}/upload/f_auto,q_auto,w_${width}/${parts[1]}` : secureUrl;
}

// Nueva función para obtener la URL de un SignedImage del plato
import type { SignedImage } from '../types';

export function getDishImageUrl(image: SignedImage | undefined, width = 800) {
  if (!image?.secure_url) return '';
  return cldOptimizedUrlFromSecureUrl(image.secure_url, width);
}


