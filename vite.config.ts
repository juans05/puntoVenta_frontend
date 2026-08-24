import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: 'discobar.lobytech.test', // Esto permite a Vite usar el subdominio configurado
    host: 'restaurant21.lobytech.test', // Esto permite a Vite usar el subdominio configurado
    port: 3000, // Puedes cambiarlo si prefieres otro puerto
    open: false // Opcional: abre automáticamente el navegador en la URL especificada
},
  build: {
    outDir: 'build' // Cambia 'dist' por 'build'
  },
  resolve: {
    alias: {
      "./runtimeConfig": "./runtimeConfig.browser",
    },
  }
})
