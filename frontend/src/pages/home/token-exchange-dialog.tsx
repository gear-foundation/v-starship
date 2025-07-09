'use client';

import { Account } from '@gear-js/react-hooks';
import { X, Wallet, ArrowRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface TokenExchangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerVARA: number;
  onExchange: (ptsAmount: number, varaCost: number) => void;
  account: Account | undefined;
  balanceValue: string | undefined;
  balanceUnit: string | undefined;
}

export default function TokenExchangeDialog({
  isOpen,
  onClose,
  playerVARA,
  onExchange,
  account,
  balanceValue,
  balanceUnit,
}: TokenExchangeDialogProps) {
  const [ptsAmount, setPtsAmount] = useState<string>('');
  const isWalletConnected = !!account;

  // Exchange rate: 1 VARA = 10 PTS
  const exchangeRate = 10;
  const varaCost = ptsAmount ? Math.ceil(Number.parseInt(ptsAmount) / exchangeRate) : 0;
  const remainingVARA = playerVARA - varaCost;
  const canAfford = varaCost <= playerVARA;
  const isValidAmount = ptsAmount && Number.parseInt(ptsAmount) > 0;

  const handlePtsAmountChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setPtsAmount(numericValue);
  };

  const handleConfirm = () => {
    if (isValidAmount && canAfford && isWalletConnected) {
      onExchange(Number.parseInt(ptsAmount), varaCost);
      setPtsAmount('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen min-w-full p-4">
      {/* Backdrop */}
      {/* eslint-disable-next-line  jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Token Exchange Dialog */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900/95 to-purple-950/95 border-2 border-cyan-400/50 rounded-lg backdrop-blur-md font-['Orbitron',monospace]">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 to-purple-600/10 rounded-lg blur-xl -z-10"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-400/30">
          <h2 className="text-2xl font-bold text-cyan-400 glow-blue">TOKEN EXCHANGE</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-400 border border-gray-600 hover:border-red-400 glow-white hover:glow-red transition-all">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Wallet Status */}
        <div className="p-4 border-b border-cyan-400/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-cyan-400" />
              <span className="text-cyan-400 font-bold glow-blue">Wallet Status</span>
            </div>
            {isWalletConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full glow-green-bg animate-pulse"></div>
                <span className="text-green-400 font-bold glow-green">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full glow-yellow-bg"></div>
                <span className="text-yellow-400 font-bold glow-yellow">Not Connected</span>
              </div>
            )}
          </div>
          {isWalletConnected && (
            <div className="mt-2 text-gray-400 text-sm">
              Available:{' '}
              <span className="text-white font-bold glow-white">
                {balanceValue} {balanceUnit}
              </span>
            </div>
          )}
        </div>

        {/* Exchange Rate Info */}
        <div className="p-4 border-b border-cyan-400/20">
          <div className="text-center text-gray-400 text-sm mb-2">Exchange Rate</div>
          <div className="flex items-center justify-center gap-3">
            <div className="text-gray-300 font-bold glow-white">1 VARA</div>
            <ArrowRight className="h-4 w-4 text-cyan-400" />
            <div className="text-cyan-400 font-bold glow-blue">10 PTS</div>
          </div>
        </div>

        {/* Exchange Form */}
        <div className="p-4 space-y-4">
          {/* PTS Input */}
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="block text-cyan-400 text-sm font-bold mb-2 glow-blue">PTS Amount to Buy</label>
            <input
              type="text"
              value={ptsAmount}
              onChange={(e) => handlePtsAmountChange(e.target.value)}
              placeholder="Enter PTS amount"
              className="w-full bg-gray-900/50 border-2 border-gray-600 rounded-lg px-4 py-3 text-white font-bold text-lg focus:border-cyan-400 focus:outline-none transition-all glow-input"
              disabled={!isWalletConnected}
            />
          </div>

          {/* Exchange Summary */}
          {ptsAmount && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">VARA Cost:</span>
                <span
                  className={`font-bold text-lg ${canAfford ? 'text-yellow-400 glow-yellow' : 'text-red-400 glow-red'}`}>
                  {varaCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">You&apos;ll receive:</span>
                <span className="text-green-400 font-bold text-lg glow-green">
                  {Number.parseInt(ptsAmount).toLocaleString()} PTS
                </span>
              </div>

              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Remaining VARA:</span>
                  <span
                    className={`font-bold text-lg ${remainingVARA >= 0 ? 'text-white glow-white' : 'text-red-400 glow-red'}`}>
                    {remainingVARA.toLocaleString()}
                  </span>
                </div>
              </div>

              {!canAfford && <div className="mt-2 text-red-400 text-sm glow-red">Insufficient VARA balance</div>}
            </div>
          )}

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000].map((amount) => (
              <Button
                key={amount}
                onClick={() => setPtsAmount(amount.toString())}
                variant="outline"
                className="bg-transparent border border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 font-bold py-2 text-sm transition-all"
                disabled={!isWalletConnected}>
                {amount} PTS
              </Button>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="p-4 border-t border-cyan-400/20">
          <Button
            onClick={handleConfirm}
            disabled={!isWalletConnected || !isValidAmount || !canAfford}
            className={`
              w-full font-bold py-4 text-lg transition-all duration-300
              ${
                isWalletConnected && isValidAmount && canAfford
                  ? 'bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-500/10 glow-red-border hover:shadow-lg hover:shadow-red-500/25'
                  : 'bg-gray-800 border-2 border-gray-600 text-gray-500 cursor-not-allowed'
              }
            `}>
            {!isWalletConnected
              ? 'CONNECT WALLET FIRST'
              : !isValidAmount
                ? 'ENTER PTS AMOUNT'
                : !canAfford
                  ? 'INSUFFICIENT VARA'
                  : 'CONFIRM EXCHANGE'}
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

        .glow-yellow {
          text-shadow:
            0 0 10px #fbbf24,
            0 0 20px #fbbf24;
        }

        .glow-green {
          text-shadow:
            0 0 10px #10b981,
            0 0 20px #10b981;
        }

        .glow-red-border {
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
        }

        .glow-yellow-border {
          box-shadow: 0 0 15px rgba(251, 191, 36, 0.5);
        }

        .glow-green-bg {
          box-shadow:
            0 0 10px #10b981,
            0 0 20px #10b981;
        }

        .glow-input:focus {
          box-shadow: 0 0 15px rgba(0, 188, 212, 0.3);
        }
      `}</style>
    </div>
  );
}
