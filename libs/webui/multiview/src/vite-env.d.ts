/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MULTIVIEW_EGRESS_DOMAIN: string;
  readonly VITE_MULTIVIEW_CHANNEL_GROUP: string;
  readonly VITE_MULTIVIEW_ENDPOINT_NAME: string;
  readonly VITE_MULTIVIEW_MANIFEST_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
