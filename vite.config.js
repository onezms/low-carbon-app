// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('echarts')) {
              return 'echarts'
            }
            return 'vendor'
          }
        }
      }
    }
  },
  // 复制 CNAME 文件到 dist 目录
  publicDir: 'public',
  // 确保 CNAME 文件被复制
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
