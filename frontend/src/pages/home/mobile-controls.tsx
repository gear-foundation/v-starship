import { RefObject, useRef, PointerEvent } from 'react';

const MOVEMENT_CONFIG = {
  SENSITIVITY: 0.1,
  DEAD_ZONE: 1,
  SMOOTHING: 0,
} as const;

type Props = {
  inputIntensity: RefObject<{ x: number; y: number }>;
};

function MobileControls({ inputIntensity }: Props) {
  const touchAreaRef = useRef<HTMLDivElement>(null);
  const lastPointerPosition = useRef({ x: 0, y: 0 });

  const applySmoothInput = (targetX: number, targetY: number) => {
    if (MOVEMENT_CONFIG.SMOOTHING <= 0) {
      inputIntensity.current.x = Math.max(-1, Math.min(1, targetX));
      inputIntensity.current.y = Math.max(-1, Math.min(1, targetY));
    } else {
      const smoothingFactor = 1 - MOVEMENT_CONFIG.SMOOTHING;

      const newX = inputIntensity.current.x + (targetX - inputIntensity.current.x) * smoothingFactor;
      const newY = inputIntensity.current.y + (targetY - inputIntensity.current.y) * smoothingFactor;

      inputIntensity.current.x = Math.max(-1, Math.min(1, newX));
      inputIntensity.current.y = Math.max(-1, Math.min(1, newY));
    }
  };

  const updateControls = (clientX: number, clientY: number) => {
    const deltaX = clientX - lastPointerPosition.current.x;
    const deltaY = clientY - lastPointerPosition.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    lastPointerPosition.current = { x: clientX, y: clientY };

    if (distance < MOVEMENT_CONFIG.DEAD_ZONE) {
      applySmoothInput(0, 0);
      return;
    }

    const velocityX = deltaX * MOVEMENT_CONFIG.SENSITIVITY;
    const velocityY = -deltaY * MOVEMENT_CONFIG.SENSITIVITY;

    applySmoothInput(velocityX, velocityY);
  };

  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault();

    lastPointerPosition.current = { x: e.clientX, y: e.clientY };
    applySmoothInput(0, 0);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (e.buttons <= 0) return;

    e.preventDefault();
    updateControls(e.clientX, e.clientY);
  };

  const handlePointerEnd = () => {
    applySmoothInput(0, 0);
  };

  return (
    <div
      ref={touchAreaRef}
      className="absolute inset-0 w-full h-full select-none touch-none md:hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    />
  );
}

export { MobileControls };
