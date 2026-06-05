import type { CapacitorConfig } from '@capacitor/cli';

// Do'konga paketlash (§2). Next statik eksporti `out/` ga chiqadi.
const config: CapacitorConfig = {
  appId: 'ai.neyron.app',
  appName: 'Neyron AI',
  webDir: 'out',
  backgroundColor: '#06080F',
};

export default config;
