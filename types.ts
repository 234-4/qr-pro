
export type QRFormat = 'URL' | 'TEXT' | 'WHATSAPP' | 'EMAIL' | 'WIFI';

export interface QRConfig {
  value: string;
  size: number;
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  logo?: string;
  logoWidth?: number;
  logoHeight?: number;
  format: QRFormat;
}

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt';

export interface Translations {
  title: string;
  subtitle: string;
  url: string;
  text: string;
  whatsapp: string;
  email: string;
  wifi: string;
  generate: string;
  downloadPng: string;
  downloadSvg: string;
  copy: string;
  size: string;
  color: string;
  background: string;
  margin: string;
  logo: string;
  bulk: string;
  bulkDesc: string;
  csvUpload: string;
  privacyNote: string;
  copied: string;
  error: string;
  backToApp: string;
  privacyPolicy: string;
  termsOfService: string;
}
