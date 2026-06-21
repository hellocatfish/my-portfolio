import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- 1. 引入 Tailwind 插件
import { existsSync, mkdirSync, cpSync, statSync, createReadStream } from 'node:fs'
import { resolve, join, normalize } from 'node:path'

// 本地图片目录映射：URL 前缀 -> 文件系统路径（相对于项目根目录）
const IMAGE_DIR_MAP = [
  { urlPrefix: '/images/heroes/', fsDir: 'assets_heroes/images' },
  { urlPrefix: '/images/portraits/', fsDir: 'assets/images' },
]

/**
 * 本地静态图片插件：
 * - dev 模式下通过中间件把 /images/heroes/* 和 /images/portraits/* 映射到本地目录
 * - build 模式下把这两个目录复制到 dist/images/ 下，随前端包发布
 */
function localStaticImages() {
  let outDir = 'dist'

  return {
    name: 'local-static-images',
    configResolved(config) {
      outDir = config.build.outDir
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]
        for (const { urlPrefix, fsDir } of IMAGE_DIR_MAP) {
          if (url.startsWith(urlPrefix)) {
            const fileName = decodeURIComponent(url.slice(urlPrefix.length))
            const absDir = resolve(process.cwd(), fsDir)
            // 防止路径穿越
            const filePath = normalize(join(absDir, fileName))
            if (filePath.startsWith(absDir) && existsSync(filePath) && statSync(filePath).isFile()) {
              if (fileName.endsWith('.webp')) {
                res.setHeader('Content-Type', 'image/webp')
              } else if (fileName.endsWith('.png')) {
                res.setHeader('Content-Type', 'image/png')
              }
              res.setHeader('Cache-Control', 'public, max-age=86400')
              createReadStream(filePath).pipe(res)
              return
            }
            // 本地文件不存在，交给后续处理（浏览器 img onError 会走 CDN 兜底）
            next()
            return
          }
        }
        next()
      })
    },
    closeBundle() {
      const absOutDir = resolve(process.cwd(), outDir)
      for (const { urlPrefix, fsDir } of IMAGE_DIR_MAP) {
        const absFsDir = resolve(process.cwd(), fsDir)
        const targetDir = join(absOutDir, urlPrefix)
        if (existsSync(absFsDir)) {
          mkdirSync(targetDir, { recursive: true })
          cpSync(absFsDir, targetDir, { recursive: true })
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- 2. 启用插件
    localStaticImages(),
  ],
  //   // 保持您的 github pages 路径不变
  base: '/', // suit for cloudflare
  server: {
    host: '0.0.0.0', // 监听所有网络接口，允许公网访问
    port: 5173,
    // allowedHosts: ['*.cnb.run'],
    allowedHosts: true,
  },
})
