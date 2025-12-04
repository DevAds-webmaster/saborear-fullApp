// Tipos de respuesta de ImageKit
export type ImageKitUploadResp = {
  fileId: string;
  name: string;
  size: number;
  versionInfo?: { id: string; name: string };
  filePath: string;
  url: string;
  thumbnailUrl?: string;
  height?: number;
  width?: number;
  fileType?: string; // "image"
};

export async function getImageKitAuth() {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/media/ik-auth`, {
    method: 'GET',
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
    },
  });
  if (!res.ok) throw new Error('No se pudo obtener auth de ImageKit');
  return res.json() as Promise<{
    token: string;
    expire: number;
    signature: string;
    publicKey: string;
    urlEndpoint: string;
    folder: string;
  }>;
}

export async function uploadToImageKit(file: File, auth: {
  token: string; expire: number; signature: string; publicKey: string; folder?: string;
}) {
  const form = new FormData();
  form.append('file', file);
  form.append('fileName', file.name);
  form.append('token', auth.token);
  form.append('expire', String(auth.expire));
  form.append('signature', auth.signature);
  form.append('publicKey', auth.publicKey);
  if (auth.folder) form.append('folder', auth.folder);

  const endpoint = `https://upload.imagekit.io/api/v1/files/upload`;
  const res = await fetch(endpoint, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Error subiendo imagen a ImageKit');
  return res.json() as Promise<ImageKitUploadResp>;
}

// Helper para aplicar transformaciones de ImageKit insertando /tr:... en la URL base
export function ikOptimizedUrlFromUrl(url: string, width = 800) {
  try {
    const u = new URL(url);
    if (!u.pathname.includes('/tr:')) {
      u.pathname = `/tr:w-${width},q-80,fo-auto${u.pathname}`;
    }
    return u.toString();
  } catch {
    return url;
  }
}

// Nueva función para obtener la URL de un SignedImage del plato
import type { SignedImage } from '../types';

export function getDishImageUrl(image: SignedImage | undefined, width = 800) {
  if (!image?.secure_url) return '';
  return ikOptimizedUrlFromUrl(image.secure_url, width);
}


