// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Assuming you use React
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add the Tailwind Vite plugin
  ],
});