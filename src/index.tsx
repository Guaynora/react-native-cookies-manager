import CookiesManagerNative from './NativeCookiesManager';

// Exportar el módulo nativo directamente
export default CookiesManagerNative;

// También exportar funciones individuales si prefieres importar así
export const getCookies = CookiesManagerNative.getCookies;
export const setCookie = CookiesManagerNative.setCookie;
export const removeCookie = CookiesManagerNative.removeCookie;
export const clearCookies = CookiesManagerNative.clearCookies;
export const flush = CookiesManagerNative.flush;

// Exportar tipos para TypeScript
export type { Cookie } from './NativeCookiesManager';
