import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // @pai-forge/mahjong-react-ui が React Native にも対応しているため、
      // Web ビルドでは空のモジュールに置き換える
      'react-native': path.resolve(__dirname, './src/shims/react-native.ts'),
    },
  },
})
