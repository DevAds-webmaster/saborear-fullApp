/** Mismo fallback que el resto de media (cliente upload + purga). */
export const IMAGEKIT_UPLOAD_FOLDER_DEFAULT = "saborear_app";

/** Nombre de carpeta sin slashes (para folder en ik-auth y para construir path de listado). */
export function imageKitUploadFolderName(): string {
  const raw = process.env.IMAGEKIT_UPLOAD_FOLDER || IMAGEKIT_UPLOAD_FOLDER_DEFAULT;
  return raw.replace(/^\/+|\/+$/g, "");
}

/** Path para listFiles de ImageKit, p. ej. `/saborear/`. */
export function imageKitUploadListPath(): string {
  const n = imageKitUploadFolderName();
  return `/${n}/`;
}
