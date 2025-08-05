import { X } from 'lucide-react';
import type React from 'react';

import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
}

function Dialog({ onClose, title, children, className = '', contentClassName = '', showCloseButton = true }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-full min-w-full p-4">
      {/* Backdrop */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog Container */}
      <div
        className={`
          relative
          w-full max-w-md max-h-[90%] 
          flex flex-col 
          bg-gradient-to-b from-slate-900/95 to-purple-950/95 
          border-2 border-cyan-400/50 
          rounded-lg 
          backdrop-blur-md 
          font-['Orbitron'] 
          ${className}
        `}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 to-purple-600/10 rounded-lg blur-xl -z-10"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-400/30">
          <h2 className="text-2xl font-bold text-cyan-400 glow-blue">{title}</h2>

          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-400 border border-gray-600 hover:border-red-400 glow-white hover:glow-red transition-all">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 p-2 overflow-y-auto ${contentClassName}`}>{children}</div>
      </div>
    </div>
  );
}

export { Dialog };
