import { Injectable, signal } from '@angular/core';
import { STRINGS } from './strings';

export type Lang = 'en' | 'es';

const STORAGE_KEY = 'siteLanguage';

// Holds the visitor's language (English or Spanish) and looks up page text.
// Templates call i18n.t('key'). Because `lang` is a signal, every page
// re-renders in the new language the moment it changes.
@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly lang = signal<Lang>(this.initialLang());

  constructor() {
    document.documentElement.lang = this.lang();
  }

  /** Text for a key in the current language (falls back to English). */
  t(key: string, params?: Record<string, string | number>): string {
    const lang = this.lang();
    let text = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.split('{' + name + '}').join(String(value));
      }
    }
    return text;
  }

  /** Pick the English or Spanish version of a value. */
  pick<T>(en: T, es: T): T {
    return this.lang() === 'es' ? es : en;
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    document.documentElement.lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* private mode */ }
  }

  toggle(): void {
    this.setLang(this.lang() === 'en' ? 'es' : 'en');
  }

  // A saved choice wins; otherwise use Spanish when the browser is set to Spanish.
  private initialLang(): Lang {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'es') { return saved; }
    } catch { /* private mode */ }

    return (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en';
  }
}
