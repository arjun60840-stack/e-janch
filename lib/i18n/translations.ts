// ==============================================================================
// E-JAANCH: TRANSLATIONS INDEX
// ==============================================================================

import { en, TranslationKeys } from './en';
import { hi } from './hi';

export type Language = 'en' | 'hi';
export type TranslationDict = TranslationKeys;

export const translations: Record<Language, TranslationDict> = { en, hi };
export { en, hi };
export type { TranslationKeys };
