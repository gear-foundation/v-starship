import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const copyToClipboard = (value: string) =>
  navigator.clipboard.writeText(value).then(() => console.log('Copied!'));

export const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export const isUndefined = (value: unknown): value is undefined => value === undefined;
export const isNull = (value: unknown): value is null => value === null;
export const isNullOrUndefined = (value: unknown): value is null | undefined => isNull(value) || isUndefined(value);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function disableTelegramMiniAppVerticalSwipes() {
  if (
    !('Telegram' in window) ||
    !isObject(window.Telegram) ||
    !isObject(window.Telegram.WebApp) ||
    typeof window.Telegram.WebApp.disableVerticalSwipes !== 'function'
  )
    return;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  window.Telegram.WebApp.disableVerticalSwipes();
}

export function enableTelegramMiniAppVerticalSwipes() {
  if (
    !('Telegram' in window) ||
    !isObject(window.Telegram) ||
    !isObject(window.Telegram.WebApp) ||
    typeof window.Telegram.WebApp.enableVerticalSwipes !== 'function'
  )
    return;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  window.Telegram.WebApp.enableVerticalSwipes();
}
