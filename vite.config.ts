/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Куда проксировать /api/v1 в real-режиме при локальном запуске (конфигурация 2).
// По умолчанию — локальный бэк на :8080; переопределяется переменной BACKEND_ORIGIN.
// В mock-режиме прокси не задействуется: MSW перехватывает запросы в браузере.
// На сервере (конфигурации 3–4) проксирует nginx, а не Vite.
const backendOrigin = process.env.BACKEND_ORIGIN ?? 'http://localhost:8080';

const apiProxy = {
  '/api/v1': {
    target: backendOrigin,
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 5173,
    open: true, // автоматически открыть сайт в браузере
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    proxy: apiProxy,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
