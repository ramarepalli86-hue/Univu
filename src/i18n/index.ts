import en from './en.json';
import te from './te.json';
import hi from './hi.json';
import zh from './zh.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';
import it from './it.json';
import pt from './pt.json';
import ru from './ru.json';
import ta from './ta.json';
import kn from './kn.json';
import ml from './ml.json';
import mr from './mr.json';
import gu from './gu.json';
import pa from './pa.json';
import bn from './bn.json';
import or_ from './or.json';
import as_ from './as.json';

export type Locale =
  | 'en' | 'te' | 'hi' | 'zh' | 'es' | 'fr' | 'de'
  | 'it' | 'pt' | 'ru' | 'ta' | 'kn' | 'ml' | 'mr'
  | 'gu' | 'pa' | 'bn' | 'or' | 'as';

export type Translations = Record<string, string>;

const translations: Record<Locale, Translations> = {
  en, te, hi, zh, es, fr, de, it, pt, ru,
  ta, kn, ml, mr, gu, pa, bn,
  or: or_,
  as: as_,
};

export const LANGUAGES: { code: Locale; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'zh', label: 'Mandarin', native: '中文' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'it', label: 'Italian', native: 'Italiano' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
];

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.en;
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('univu-locale') as Locale | null;
  if (stored && translations[stored]) return stored;
  const browserLang = navigator.language.split('-')[0] as Locale;
  if (translations[browserLang]) return browserLang;
  return 'en';
}

export function setLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('univu-locale', locale);
  }
}
