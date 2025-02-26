/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IOT_TOPIC: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
