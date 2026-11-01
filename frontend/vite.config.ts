import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Escuta na rede local também, não só em localhost: permite abrir o site do notebook pelo celular no mesmo Wi-Fi
  server: { host: true },
});
