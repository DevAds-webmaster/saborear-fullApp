/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_URL: string;
  readonly VITE_URL_MENU: string;
  readonly VITE_RED_ADHESION_URL: string;
  readonly VITE_RECLAMOS_WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
