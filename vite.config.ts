import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // 读取构建配置
  const buildConfig = (() => {
    console.log('读取构建配置 ::: ', process.env.BUILD_ENV)
    
    try {
      const config = require('./build.config.json')
      if (process.env.BUILD_ENV) {
        return config[process.env.BUILD_ENV || 'development'] || config.development
      } else {
        return { baseUrl: '/' }
      }
    } catch {
      return { baseUrl: '/' }
    }
  })()

  return {
    plugins: [react()],
    base: buildConfig.baseUrl,
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mantine: ['@mantine/core', '@mantine/hooks'],
            router: ['react-router-dom']
          }
        }
      }
    }
  }
})