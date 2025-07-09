import { X, Gamepad2, Zap, Rocket, Plus } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { getShopPrices } from '@/utils';

import { GAME_CONFIG } from './game-config';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
}

interface ShopDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerPTS: number;
  onGetPTS: () => void;
  shipLevel: number;
  onUpgradeShip: () => void;
  onBuyExtraGame: () => void;
  onBuyBooster: () => void;
}

export default function ShopDialog({
  isOpen,
  onClose,
  playerPTS,
  onGetPTS,
  shipLevel,
  onUpgradeShip,
  onBuyExtraGame,
  onBuyBooster,
}: ShopDialogProps) {
  const [selectedItem, setSelectedItem] = useState<string>('extra-game');
  const [gamesAvailable] = useState<number>(1);

  // Получаем актуальные цены для текущего уровня корабля
  const prices = getShopPrices(shipLevel);

  // Формируем массив товаров магазина с динамическими ценами
  const shopItems: ShopItem[] = [
    {
      id: 'extra-game',
      name: 'Extra Game',
      description: 'Add one more game to your daily limit',
      cost: prices.extraGame,
      icon: <Gamepad2 className="h-6 w-6" />,
    },
    {
      id: 'booster',
      name: 'Booster',
      description: 'Double fire rate for next game',
      cost: prices.booster,
      icon: <Zap className="h-6 w-6" />,
    },
    {
      id: 'ship-upgrade',
      name: 'Ship Upgrade',
      description: 'Upgrade your ship to the next level',
      cost: prices.shipUpgrade,
      icon: <Rocket className="h-6 w-6" />,
    },
  ];

  const selectedItemData = shopItems.find((item) => item.id === selectedItem);
  const canAfford = selectedItemData ? playerPTS >= selectedItemData.cost : false;
  const canUpgrade = shipLevel < 10 && playerPTS >= 10000;

  // Универсальная функция для проигрывания звуков
  function playSound(src: string, volume = 0.7) {
    try {
      const audio = new Audio(src);
      audio.volume = volume;
      void audio.play();
    } catch (e) {
      console.warn('Ошибка воспроизведения звука', src, e);
    }
  }

  const handlePurchase = () => {
    if (selectedItem === 'extra-game' && selectedItemData && playerPTS >= selectedItemData.cost && gamesAvailable < 3) {
      playSound(GAME_CONFIG.SOUND_GAME_PURCHASE, GAME_CONFIG.VOLUME_GAME_PURCHASE);
      onBuyExtraGame();
      onClose();
      return;
    }
    if (selectedItem === 'ship-upgrade' && canUpgrade && selectedItemData && playerPTS >= selectedItemData.cost) {
      playSound(GAME_CONFIG.SOUND_SHIP_LEVEL_UP, GAME_CONFIG.VOLUME_SHIP_LEVEL_UP);
      onUpgradeShip();
      onClose();
      return;
    }
    if (selectedItem === 'booster' && selectedItemData && playerPTS >= selectedItemData.cost) {
      playSound(GAME_CONFIG.BOOSTER_CONFIG.soundActivate, GAME_CONFIG.VOLUME_BOOSTER_ACTIVATE);
      onBuyBooster();
      onClose();
      return;
    }
    if (canAfford && selectedItemData) {
      // Purchase logic would go here
      console.log(`Purchasing ${selectedItemData.name} for ${selectedItemData.cost} PTS`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen min-w-full p-4">
      {/* Backdrop */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Shop Dialog */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900/95 to-purple-950/95 border-2 border-cyan-400/50 rounded-lg backdrop-blur-md font-['Orbitron',monospace]">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 to-purple-600/10 rounded-lg blur-xl -z-10"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-400/30">
          <h2 className="text-2xl font-bold text-cyan-400 glow-blue">SHOP</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-400 border border-gray-600 hover:border-red-400 glow-white hover:glow-red transition-all">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Current PTS Display */}
        <div className="px-4 py-2 border-b border-cyan-400/20">
          <div className="flex items-center justify-between">
            <div className="text-center text-cyan-400 font-bold glow-blue">
              Available PTS: {playerPTS.toLocaleString()}
            </div>
            <Button
              onClick={onGetPTS}
              className="bg-transparent border border-green-500 text-green-400 hover:bg-green-500/10 font-bold px-3 py-1 text-sm glow-green-border transition-all duration-300 flex items-center gap-1">
              <Plus className="h-3 w-3" />
              GET PTS
            </Button>
          </div>
        </div>

        {/* Shop Items */}
        <div className="p-4 space-y-3">
          {shopItems.map((item) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              key={item.id}
              onClick={() => setSelectedItem(item.id)}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                ${
                  selectedItem === item.id
                    ? 'border-cyan-400 bg-cyan-400/10 glow-blue-border'
                    : 'border-gray-600 hover:border-gray-400 bg-gray-900/30'
                }
                ${item.id === 'ship-upgrade' && shipLevel === 10 ? 'opacity-50 pointer-events-none' : ''}
              `}>
              <div className="flex items-start gap-3">
                <div
                  className={`
                  p-2 rounded-lg
                  ${selectedItem === item.id ? 'text-cyan-400 glow-blue' : 'text-gray-400'}
                `}>
                  {item.icon}
                </div>

                <div className="flex-1">
                  <div
                    className={`
                    font-bold text-lg
                    ${selectedItem === item.id ? 'text-cyan-400 glow-blue' : 'text-white glow-white'}
                  `}>
                    {item.name}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">{item.description}</div>
                  <div
                    className={`
                    font-bold text-lg mt-2
                    ${playerPTS >= item.cost ? 'text-green-400 glow-green' : 'text-red-400 glow-red'}
                  `}>
                    {item.cost.toLocaleString()} PTS
                  </div>
                  {item.id === 'ship-upgrade' && (
                    <div className="mt-2 text-sm text-yellow-400 font-bold">Current Level: {shipLevel} / 10</div>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              {selectedItem === item.id && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 rounded-full glow-blue-bg animate-pulse"></div>
              )}
            </div>
          ))}
        </div>

        {/* Purchase Button */}
        <div className="p-4 border-t border-cyan-400/20">
          <Button
            onClick={handlePurchase}
            disabled={
              (selectedItem === 'extra-game' &&
                (!selectedItemData || playerPTS < selectedItemData.cost || gamesAvailable >= 3)) ||
              (selectedItem === 'ship-upgrade'
                ? !canUpgrade || !selectedItemData || playerPTS < selectedItemData.cost
                : !canAfford)
            }
            className={`
              w-full font-bold py-3 text-lg transition-all duration-300
              ${
                (selectedItem === 'ship-upgrade' ? canUpgrade : canAfford)
                  ? 'bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-500/10 glow-red-border hover:shadow-lg hover:shadow-red-500/25'
                  : 'bg-gray-800 border-2 border-gray-600 text-gray-500 cursor-not-allowed'
              }
            `}>
            {selectedItem === 'ship-upgrade'
              ? shipLevel === 10
                ? 'MAX LEVEL'
                : canUpgrade
                  ? 'UPGRADE'
                  : 'INSUFFICIENT PTS'
              : canAfford
                ? 'PURCHASE'
                : 'INSUFFICIENT PTS'}
          </Button>
        </div>
      </div>

      <style>{`
        .glow-blue {
          text-shadow:
            0 0 10px #00bcd4,
            0 0 20px #00bcd4;
        }

        .glow-white {
          text-shadow:
            0 0 10px #ffffff,
            0 0 20px #ffffff;
        }

        .glow-red {
          text-shadow:
            0 0 10px #ef4444,
            0 0 20px #ef4444;
        }

        .glow-green {
          text-shadow:
            0 0 10px #10b981,
            0 0 20px #10b981;
        }

        .glow-blue-border {
          box-shadow: 0 0 15px rgba(0, 188, 212, 0.5);
        }

        .glow-red-border {
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
        }

        .glow-green-border {
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
        }

        .glow-blue-bg {
          box-shadow:
            0 0 10px #00bcd4,
            0 0 20px #00bcd4;
        }
      `}</style>
    </div>
  );
}
