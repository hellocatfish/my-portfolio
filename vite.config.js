import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- 1. 引入 Tailwind 插件

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- 2. 启用插件
  ],
  // base: '/my-portfolio/', // 保持您的 github pages 路径不变
  base: '/', // suit for cloudflare
})