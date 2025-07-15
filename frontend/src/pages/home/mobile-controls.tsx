import { ChevronUp, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { ComponentType } from 'react';

import { Button } from '@/components/ui/button';

type Props = {
  onPointer: (arrowKey: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight', isPressed: boolean) => void;
};

type ButtonProps = {
  SVG: ComponentType;
  className: string;
  onPointer: (isPressed: boolean) => void;
};

function MobileControlButton({ SVG, className, onPointer }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`absolute p-2 h-10 w-10 text-cyan-400 border-1 border-cyan-400/50 bg-black/30 hover:bg-cyan-500/20 active:bg-cyan-500/40 ${className}`}
      onPointerDown={() => onPointer(true)}
      onPointerUp={() => onPointer(false)}
      onPointerLeave={() => onPointer(false)}>
      <SVG />
    </Button>
  );
}

function MobileControls({ onPointer }: Props) {
  return (
    <div className="w-32 h-32 relative ml-auto mt-auto z-50 md:hidden">
      <MobileControlButton
        SVG={ChevronUp}
        className="top-0 left-1/2 -translate-x-1/2"
        onPointer={(isPressed) => onPointer('ArrowUp', isPressed)}
      />

      <MobileControlButton
        SVG={ChevronDown}
        className="bottom-0 left-1/2 -translate-x-1/2"
        onPointer={(isPressed) => onPointer('ArrowDown', isPressed)}
      />

      <MobileControlButton
        SVG={ChevronLeft}
        className="top-1/2 left-0 -translate-y-1/2"
        onPointer={(isPressed) => onPointer('ArrowLeft', isPressed)}
      />
      <MobileControlButton
        SVG={ChevronRight}
        className="top-1/2 right-0 -translate-y-1/2"
        onPointer={(isPressed) => onPointer('ArrowRight', isPressed)}
      />
    </div>
  );
}

export { MobileControls };
