import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  secure?: boolean;
  httpOnly?: boolean;
}

export interface Spec extends TurboModule {
  // get cookies for specific domain
  getCookies(url: string): Promise<Cookie[]>;

  // set a cookie
  setCookie(
    url: string,
    name: string,
    value: string,
    domain?: string,
    path?: string,
    expires?: number,
    secure?: boolean,
    httpOnly?: boolean
  ): Promise<boolean>;

  // remove a cookie
  removeCookie(url: string, name: string): Promise<boolean>;
  // clear all cookies
  clearCookies(): Promise<boolean>;

  // sync cookies with device
  flush(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('CookiesManager');
