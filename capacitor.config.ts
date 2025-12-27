import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.currency',
  appName: 'CurrencyConverter',
  webDir: 'dist/currency-converter',
  bundledWebRuntime: false,
  server: {
    url: 'https://currencyconverternithin.netlify.app',
    cleartext: false
  }
};

export default config;
