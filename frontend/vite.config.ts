import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import obfuscator from 'rollup-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    obfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      numbersToExpressions: true,
      simplify: true,
      stringArray: true,
      stringArrayThreshold: 0.75,
      splitStrings: true,
      splitStringsChunkLength: 10,
      unicodeEscapeSequence: false
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['front-im9w.onrender.com', '.onrender.com']
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    allowedHosts: ['front-im9w.onrender.com', '.onrender.com']
  }
})
