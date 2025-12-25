import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.currencyconverter.app',
  appName: 'Currency Converter',
  webDir: 'dist/currency-converter',
  server: {
    androidScheme: 'https'
  }
};

export default config;
