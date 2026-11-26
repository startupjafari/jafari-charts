import { defineConfig } from 'vite';
import { libConfig } from '../../scripts/vite-lib.ts';

export default defineConfig(libConfig(import.meta.dirname));
