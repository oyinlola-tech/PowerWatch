/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the PowerWatch API, e.g. https://api-powerwatch.telente.site */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
