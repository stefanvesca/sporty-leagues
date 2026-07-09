/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// BASE_PATH lets CI deploy to GitHub Pages under /<repo-name>/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue(), tailwindcss()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.spec.ts'],
  },
})
