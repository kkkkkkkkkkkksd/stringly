// Единая точка доступа к текстам UI. Импортируй из '@/shared/resources/i18n'.
// ПРАВИЛО: ни одной видимой строки в компонентах — все тексты живут здесь.
// На будущее: при мультиязычном интерфейсе модуль заменяется на i18next без правок в
// компонентах (они уже обращаются к texts.*). См. docs/15.
import { common } from './common';
import { landing } from './landing';
import { auth } from './auth';
import { onboarding } from './onboarding';
import { app } from './app';

export const texts = { common, landing, auth, onboarding, app } as const;
