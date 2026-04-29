import imagekit from "./imagekit.js";
import Resto from "../models/Resto.js";
import { imageKitUploadListPath } from "./imageKitUploadFolder.js";

/** Metadatos útiles de un archivo en ImageKit (list API). */
export type ImageKitListedFile = {
  fileId: string;
  filePath: string;
  name?: string;
  url?: string;
  thumbnail?: string;
  createdAt?: string;
  fileType?: string;
  width?: number;
  height?: number;
  size?: number;
};

type IkListRow = {
  type?: string;
  fileId?: string;
  filePath?: string;
  name?: string;
  url?: string;
  thumbnail?: string;
  createdAt?: string;
  fileType?: string;
  width?: number;
  height?: number;
  size?: number;
};

/**
 * De una URL ImageKit (p. ej. https://ik.imagekit.io/xxx/saborear_app/logo_ABC.png)
 * obtiene el nombre de archivo final (p. ej. logo_ABC.png).
 */
export function parseImageKitFileNameFromSecureUrl(raw: string | undefined | null): string | null {
  if (raw == null || typeof raw !== "string") return null;
  const u = raw.trim();
  if (!u) return null;
  try {
    const parsed = new URL(u);
    const segs = parsed.pathname.split("/").filter(Boolean);
    if (segs.length === 0) return null;
    const last = segs[segs.length - 1];
    const decoded = decodeURIComponent(last).trim();
    return decoded || null;
  } catch {
    const noQuery = u.split("?")[0]?.trim() ?? "";
    const idx = noQuery.lastIndexOf("/");
    const last = (idx >= 0 ? noQuery.slice(idx + 1) : noQuery).trim();
    if (!last) return null;
    try {
      return decodeURIComponent(last).trim() || null;
    } catch {
      return last || null;
    }
  }
}

/** Nombre para comparar con Mongo: `name` de ImageKit o último segmento de `filePath`. */
function listedFileComparableName(f: ImageKitListedFile): string | null {
  const n = f.name?.trim();
  if (n) return n;
  const fp = f.filePath?.trim();
  if (!fp) return null;
  const segs = fp.split("/").filter(Boolean);
  if (segs.length === 0) return null;
  try {
    return decodeURIComponent(segs[segs.length - 1]).trim() || null;
  } catch {
    return segs[segs.length - 1].trim() || null;
  }
}

function mapListRowToFile(row: IkListRow): ImageKitListedFile | null {
  if (row.type !== "file" || !row.fileId) return null;
  return {
    fileId: row.fileId,
    filePath: row.filePath || "",
    name: row.name,
    url: row.url,
    thumbnail: row.thumbnail,
    createdAt: row.createdAt,
    fileType: row.fileType,
    width: row.width,
    height: row.height,
    size: row.size,
  };
}

export type ReferencedImageKitFromRestos = {
  /** fileId / public_id en ImageKit */
  fileIds: Set<string>;
  /** Nombres de archivo extraídos de secure_url (último segmento del path). */
  fileNames: Set<string>;
};

/**
 * Referencias en restos: por `public_id` (fileId) y por nombre de archivo parseado desde `secure_url`.
 */
export async function collectReferencedImageKitFromRestos(): Promise<ReferencedImageKitFromRestos> {
  const fileIds = new Set<string>();
  const fileNames = new Set<string>();
  const restos = await Resto.find().lean();

  for (const r of restos) {
    // Se busca en elemento config del resto 
    const cfg = r.config as
      | {
          srcImgBackground?: { public_id?: string; secure_url?: string };
          srcImgLogo?: { public_id?: string; secure_url?: string };
          srcImgLogoDashboard?: { public_id?: string; secure_url?: string };
        }
      | undefined;
    if (cfg) {
      for (const key of ["srcImgBackground", "srcImgLogo", "srcImgLogoDashboard"] as const) {
        const slot = cfg[key];
        const id = slot?.public_id;
        if (typeof id === "string" && id.trim()) fileIds.add(id.trim());
        const parsedName = parseImageKitFileNameFromSecureUrl(slot?.secure_url);
        if (parsedName) fileNames.add(parsedName);
      }
    }
    // Se busca en elemento menu del resto en los campos categories.dishes.image.
    const cats = r.menu?.categories;
    if (Array.isArray(cats)) {
      for (const cat of cats) {
        const dishes = cat?.dishes;
        if (!Array.isArray(dishes)) continue;
        for (const d of dishes) {
          const img = d?.image;
          const id = img?.public_id;
          if (typeof id === "string" && id.trim()) fileIds.add(id.trim());
          const parsedName = parseImageKitFileNameFromSecureUrl(img?.secure_url);
          if (parsedName) fileNames.add(parsedName);
        }
      }
    }
  }

  return { fileIds, fileNames };
}

/** Lista paginada de archivos (no carpetas) bajo la carpeta de upload de ImageKit. */
export async function listImageKitFilesInUploadFolder(): Promise<{
  path: string;
  files: ImageKitListedFile[];
}> {
  const listPath = imageKitUploadListPath();
  const files: ImageKitListedFile[] = [];
  const limit = 1000;
  let skip = 0;

  for (;;) {
    const batch = (await imagekit.listFiles({ path: listPath, skip, limit })) as IkListRow[];
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const item of batch) {
      const mapped = mapListRowToFile(item);
      if (mapped) files.push(mapped);
    }
    if (batch.length < limit) break;
    skip += limit;
  }

  return { path: listPath, files };
}

export type DetectImageKitOrphansResult = {
  path: string;
  /** Cantidad de public_id distintos en restos. */
  referencedCount: number;
  /** Cantidad de nombres de archivo distintos extraídos de secure_url. */
  referencedFileNameCount: number;
  scanned: number;
  kept: number;
  orphans: ImageKitListedFile[];
};

/**
 * Archivos en la carpeta de upload no referenciados: ni por public_id/fileId ni por nombre
 * (campo `name` en ImageKit frente al basename de secure_url en Mongo).
 */
export async function detectImageKitOrphanFiles(): Promise<DetectImageKitOrphansResult> {
  const { fileIds, fileNames } = await collectReferencedImageKitFromRestos();
  const { path, files } = await listImageKitFilesInUploadFolder();
  const orphans: ImageKitListedFile[] = [];
  let kept = 0;
  // Se compara el fileId y el nombre de archivo con los fileIds y fileNames de los restos.
  // Si el fileId o el nombre de archivo no esta en los fileIds o fileNames de los restos, se agrega a la lista de huéfanos
  for (const f of files) {
    const byId = fileIds.has(f.fileId);
    const cmp = listedFileComparableName(f);
    const byName = cmp ? fileNames.has(cmp) : false;
    if (byId || byName) kept++;
    else orphans.push(f);
  }
  return {
    path,
    referencedCount: fileIds.size,
    referencedFileNameCount: fileNames.size,
    scanned: files.length,
    kept,
    orphans,
  };
}
