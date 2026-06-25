import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_WOMPI_PUBLIC_KEY': JSON.stringify('pub_test_5IPvWCz2MYDLETA0v3Ssh6X7WMM5CvMV'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4b2x0Y2p2dmtpY3J6ZXd0ZGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjMyNDQsImV4cCI6MjA5Nzc5OTI0NH0.ZIR2vgpM-r7-QGJd9Z6w0e-02jJi6l6nPUYXn5unHbo'),
  }
})
