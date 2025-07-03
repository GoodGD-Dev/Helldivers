import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente baseado no modo
  const env = loadEnv(mode, process.cwd(), '')

  // Extrair o host e porta da URL da API
  const apiUrl = env.VITE_API_BASE_URL || 'http://localhost:3000'
  const showLogs = env.VITE_SHOW_LOGS === 'true'

  console.log('🔧 Vite Config:', {
    mode,
    apiUrl,
    showLogs,
    env: {
      VITE_API_BASE_URL: env.VITE_API_BASE_URL,
      VITE_SHOW_LOGS: env.VITE_SHOW_LOGS
    }
  })

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy para API requests
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            if (showLogs) {
              proxy.on('error', (err, req, res) => {
                console.log('❌ Proxy error:', err)
              })
              proxy.on('proxyReq', (proxyReq, req, res) => {
                console.log('🔄 Proxying request:', req.method, req.url)
              })
              proxy.on('proxyRes', (proxyRes, req, res) => {
                console.log('✅ Proxy response:', proxyRes.statusCode, req.url)
              })
            }
          }
        },
        // Proxy para imagens e uploads
        '/uploads': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            if (showLogs) {
              proxy.on('error', (err, req, res) => {
                console.log('❌ Image proxy error:', err)
              })
              proxy.on('proxyReq', (proxyReq, req, res) => {
                console.log('🖼️ Proxying image:', req.method, req.url)
              })
              proxy.on('proxyRes', (proxyRes, req, res) => {
                console.log(
                  '📸 Image proxy response:',
                  proxyRes.statusCode,
                  req.url
                )
              })
            }
          }
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})
