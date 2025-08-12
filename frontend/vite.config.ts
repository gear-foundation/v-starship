import { viteConfigs } from '@gear-js/frontend-configs';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, mergeConfig } from 'vite';

export default mergeConfig(
  viteConfigs.app, 
  defineConfig({ 
    plugins: [tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: false,
      open: false,
    }
  })
);
