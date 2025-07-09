import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const copyToClipboard = (value: string) =>
  navigator.clipboard.writeText(value).then(() => console.log('Copied!'));

/**
 * Возвращает цены на товары магазина в зависимости от уровня корабля.
 * @param level - Текущий уровень корабля (1-10)
 * @returns Объект с ценами для extraGame, booster и shipUpgrade
 *
 * Примеры:
 *   extraGame: от 200 до 650 (шаг 50)
 *   booster: от 100 до 325 (шаг 25)
 *   shipUpgrade: от 10_000 до 32_500 (шаг 2_500)
 */
export function getShopPrices(level: number): {
  extraGame: number;
  booster: number;
  shipUpgrade: number;
} {
  return {
    extraGame: 200 + (level - 1) * 50, // от 200 до 650
    booster: 100 + (level - 1) * 25, // от 100 до 325
    shipUpgrade: 10000 + (level - 1) * 2500, // от 10k до 32.5k
  };
}

export const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));
