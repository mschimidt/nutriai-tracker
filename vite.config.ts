import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use '.' as default path to avoid "Property 'cwd' does not exist on type 'Process'" error
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    base: "/nutriai-tracker/",
    // base: './', // Ensures relative paths for GitHub Pages
    define: {
      // Maps VITE_GEMINI_API_KEY from GitHub Secrets to process.env.API_KEY for the SDK
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    }
  };
});