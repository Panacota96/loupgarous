import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.panacota96.loupgarous',
  appName: 'loupgarous',
  // Capacitor copies built web assets from dist/ into android/app/src/main/assets/public.
  webDir: 'dist'
};

export default config;
