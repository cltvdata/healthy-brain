import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Dynamically find all .html files in the root using process.cwd() for CI/CD compatibility
const root = process.cwd();
const htmlFiles = readdirSync(root)
  .filter(file => file.endsWith('.html'))
  .reduce((acc, file) => {
    const name = file.replace('.html', '');
    acc[name] = resolve(root, file);
    return acc;
  }, {});

export default defineConfig({
  build: {
    rollupOptions: {
      input: htmlFiles,
    },
  },
});
