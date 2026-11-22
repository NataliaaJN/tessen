import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// No aliases on purpose: everything must resolve through the installed tarballs.
export default defineConfig({ plugins: [vue()] });
