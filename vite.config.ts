/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'public/',
        'scripts/'
      ]
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        // 代码分割优化
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          zustand: ['zustand'],
        },
      },
    },
    // 性能优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 启用源码映射（开发时）
    sourcemap: false,
    // 调整 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    open: false,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'zustand'],
  },
  // 性能优化
  esbuild: {
    drop: ['console', 'debugger'],
  },
})