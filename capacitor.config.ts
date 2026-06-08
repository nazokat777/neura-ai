import type { CapacitorConfig } from '@capacitor/cli';

// Do'konga paketlash (§2). Next statik eksporti `out/` ga chiqadi.
const config: CapacitorConfig = {
  appId: 'ai.neura.app',
  appName: 'Neura AI',
  webDir: 'out',
  backgroundColor: '#06080F',
};

export default config;
