/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRACKIT_TV_LIVE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 