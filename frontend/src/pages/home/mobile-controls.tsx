import { RefObject, useRef, useState } from 'react';

const TRACKPAD_CONFIG = {
  MAX_RADIUS: 150,
  DEAD_ZONE: 0,
  IS_LINEAR_INTENSITY: true,
  SENSITIVITY: 0.5,
};

type Props = {
  inputIntensity: RefObject<{ x: number; y: number }>;
};

function MobileControls({ inputIntensity }: Props) {
  const trackpadRef = useRef<HTMLDivElement>(null);
  const virtualTrackpadRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [trackpadPosition, setTrackpadPosition] = useState({ x: 0, y: 0 });
  const [touchStartPosition, setTouchStartPosition] = useState({ x: 0, y: 0 });
  const [trackballPosition, setTrackballPosition] = useState({ x: 0, y: 0 });

  const updateControls = (clientX: number, clientY: number) => {
    const centerX = touchStartPosition.x;
    const centerY = touchStartPosition.y;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    // Calculate trackball position (constrained within trackpad bounds)
    const maxRadius = TRACKPAD_CONFIG.MAX_RADIUS;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    let ballX = 0;
    let ballY = 0;

    if (distance > 0) {
      const constrainedDistance = Math.min(distance, maxRadius);
      const ratio = constrainedDistance / distance;
      ballX = deltaX * ratio;
      ballY = deltaY * ratio;
    }

    // Update trackball position (relative to trackpad center)
    setTrackballPosition({ x: ballX, y: ballY });

    if (distance < TRACKPAD_CONFIG.DEAD_ZONE) {
      inputIntensity.current.x = 0;
      inputIntensity.current.y = 0;
      return;
    }

    let normalizedX = 0;
    let normalizedY = 0;

    if (TRACKPAD_CONFIG.IS_LINEAR_INTENSITY) {
      normalizedX = distance > 0 ? deltaX / distance : 0;
      normalizedY = distance > 0 ? deltaY / distance : 0;
    } else {
      normalizedX = Math.max(-1, Math.min(1, deltaX / maxRadius));
      normalizedY = Math.max(-1, Math.min(1, deltaY / maxRadius));
    }

    inputIntensity.current.x = normalizedX * TRACKPAD_CONFIG.SENSITIVITY;
    inputIntensity.current.y = -normalizedY * TRACKPAD_CONFIG.SENSITIVITY;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();

    const rect = trackpadRef.current?.getBoundingClientRect();

    if (rect) {
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      setTouchStartPosition({ x: e.clientX, y: e.clientY });
      setTrackpadPosition({ x: relativeX, y: relativeY });
      setIsVisible(true);
    }

    updateControls(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons <= 0) return;

    e.preventDefault();
    updateControls(e.clientX, e.clientY);
  };

  const handlePointerEnd = () => {
    inputIntensity.current.x = 0;
    inputIntensity.current.y = 0;

    setIsVisible(false);
    setTrackballPosition({ x: 0, y: 0 });
  };

  return (
    <>
      {/* Invisible touch area covering the entire game field */}
      <div
        ref={trackpadRef}
        className="absolute inset-0 w-full h-full select-none touch-none md:hidden"
        style={{ background: 'transparent' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      />

      {/* Visible trackpad that appears at touch location */}
      {isVisible && (
        <div
          ref={virtualTrackpadRef}
          className="absolute w-32 h-32 rounded-full border-2 border-cyan-400/50 bg-black/30 backdrop-blur-sm pointer-events-none select-none opacity-25"
          style={{
            left: trackpadPosition.x - 64,
            top: trackpadPosition.y - 64,
            transform: 'translateZ(0)',
            transition: 'opacity 0.1s ease-out',
          }}>
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400/30 rounded-full -translate-x-1/2 -translate-y-1/2" />

          {/* Trackball that follows touch movement */}
          <div
            className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-lg transition-transform duration-75 ease-out"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${trackballPosition.x}px), calc(-50% + ${trackballPosition.y}px))`,
              boxShadow: '0 0 8px rgba(0, 188, 212, 0.6), 0 0 16px rgba(0, 188, 212, 0.3)',
            }}
          />

          {/* Trackpad visual indicators */}
          <div className="absolute inset-2 rounded-full border border-cyan-400/20" />
          <div className="absolute inset-4 rounded-full border border-cyan-400/10" />
        </div>
      )}
    </>
  );
}

export { MobileControls };
