const backendUrl = import.meta.env.VITE_BACKEND_URL;
const backendKey = import.meta.env.VITE_BACKEND_KEY;

export type ImageKitOrphanFile = {
  fileId: string;
  filePath: string;
  name?: string;
  size?: number;
};

export type DetectOrphanImagesResponse = {
  orphans: ImageKitOrphanFile[];
  scanned: number;
  kept: number;
  referencedCount: number;
  referencedFileNameCount: number;
  path: string;
};

export type PurgeOrphanImagesResponse = {
  deleted: { fileId: string; filePath: string }[];
  errors: { fileId: string; message: string }[];
  scanned: number;
  kept: number;
  referencedCount: number;
  referencedFileNameCount: number;
  path: string;
};

function authHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${backendKey}`,
  };
}

async function parseError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
  };
  return data?.message || data?.error || `Error ${response.status}`;
}

export const orphanImagesService = {
  async detectOrphanImages(): Promise<DetectOrphanImagesResponse> {
    if (!backendUrl || !backendKey) {
      throw new Error("Faltan VITE_BACKEND_URL o VITE_BACKEND_KEY");
    }
    const response = await fetch(`${backendUrl}/media/detect-orphan-images`, {
      method: "GET",
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    const data = (await response.json()) as DetectOrphanImagesResponse;
    return {
      ...data,
      orphans: Array.isArray(data.orphans) ? data.orphans : [],
    };
  },

  async purgeOrphanImages(): Promise<PurgeOrphanImagesResponse> {
    if (!backendUrl || !backendKey) {
      throw new Error("Faltan VITE_BACKEND_URL o VITE_BACKEND_KEY");
    }
    const response = await fetch(`${backendUrl}/media/purge-orphan-images`, {
      method: "GET",
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    const data = (await response.json()) as PurgeOrphanImagesResponse;
    return {
      ...data,
      deleted: Array.isArray(data.deleted) ? data.deleted : [],
      errors: Array.isArray(data.errors) ? data.errors : [],
    };
  },
};
