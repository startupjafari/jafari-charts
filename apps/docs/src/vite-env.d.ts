/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public repository URL. Unset until the repository is published. */
  readonly VITE_REPO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
