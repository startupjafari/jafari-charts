import { defineConfig } from 'vite';
import { libConfig } from '../../scripts/vite-lib.ts';

// Every module is a client module in React Server Components environments.
export default defineConfig(libConfig(import.meta.dirname, { banner: '"use client";' }));
