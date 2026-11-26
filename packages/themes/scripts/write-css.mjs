// Writes dist/styles.css from the built token module so CSS and JS share one source of truth.
import { writeFileSync } from 'node:fs';
import { stylesheet } from '../dist/index.js';

writeFileSync(new URL('../dist/styles.css', import.meta.url), `${stylesheet}\n`);
console.log(`styles.css written (${stylesheet.length} bytes)`);
