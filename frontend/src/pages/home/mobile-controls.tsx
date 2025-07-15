import { useRef, useCallback, useState } from 'react';

type Props = {
  onPointer: (arrowKey: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight', isPressed: boolean) => void;
};

type TrackpadProps = {
  onPointer: Props['onPointer'];
};

function MobileControls({ onPointer }: TrackpadProps) {
  const trackpadRef = useRef<HTMLDivElement>(null);
  const virtualTrackpadRef = useRef<HTMLDivElement>(null);
  const activeKeys = useRef<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [trackpadPosition, setTrackpadPosition] = useState({ x: 0, y: 0 });
  const [touchStartPosition, setTouchStartPosition] = useState({ x: 0, y: 0 });
  const [trackballPosition, setTrackballPosition] = useState({ x: 0, y: 0 });

  const calculateDirection = useCallback(
    (clientX: number, clientY: number) => {
      // Use the touch start position as the center instead of screen center
      const centerX = touchStartPosition.x;
      const centerY = touchStartPosition.y;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      // Calculate trackball position (constrained within trackpad bounds)
      const maxRadius = 48; // Max distance from center (trackpad is 128px, so radius is 64, leave some padding)
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

      // Smaller threshold for fixed-size trackpad
      const threshold = 15; // Minimum distance to register movement

      if (distance < threshold) return null;

      const directions: ('ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight')[] = [];

      // Sensitive detection for small trackpad
      const horizontalThreshold = 0.2;
      const verticalThreshold = 0.2;

      // Horizontal movement
      if (Math.abs(deltaX) > Math.abs(deltaY) * horizontalThreshold) {
        if (deltaX > 0) directions.push('ArrowRight');
        else directions.push('ArrowLeft');
      }

      // Vertical movement
      if (Math.abs(deltaY) > Math.abs(deltaX) * verticalThreshold) {
        if (deltaY > 0) directions.push('ArrowDown');
        else directions.push('ArrowUp');
      }

      return directions;
    },
    [touchStartPosition],
  );

  const updateControls = useCallback(
    (clientX: number, clientY: number) => {
      const newDirections = calculateDirection(clientX, clientY) || [];
      const newKeys = new Set(newDirections);

      // Release keys that are no longer active
      activeKeys.current.forEach((key: string) => {
        if (!newKeys.has(key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight')) {
          onPointer(key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight', false);
        }
      });

      // Press keys that are newly active
      newKeys.forEach((key) => {
        if (!activeKeys.current.has(key)) {
          onPointer(key, true);
        }
      });

      activeKeys.current = new Set(newKeys);
    },
    [calculateDirection, onPointer],
  );

  const releaseAllKeys = useCallback(() => {
    activeKeys.current.forEach((key: string) => {
      onPointer(key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight', false);
    });
    activeKeys.current.clear();
  }, [onPointer]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();

      // Show trackpad at touch location
      const rect = trackpadRef.current?.getBoundingClientRect();
      if (rect) {
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        setTouchStartPosition({ x: e.clientX, y: e.clientY });
        setTrackpadPosition({ x: relativeX, y: relativeY });
        setIsVisible(true);
      }

      updateControls(e.clientX, e.clientY);
    },
    [updateControls],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.buttons > 0) {
        // Only if pointer is pressed
        e.preventDefault();
        updateControls(e.clientX, e.clientY);
      }
    },
    [updateControls],
  );

  const handlePointerEnd = useCallback(() => {
    releaseAllKeys();
    setIsVisible(false);
    setTrackballPosition({ x: 0, y: 0 }); // Reset trackball to center
  }, [releaseAllKeys]);

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
            left: trackpadPosition.x - 64, // Center the 128px trackpad on touch point
            top: trackpadPosition.y - 64,
            transform: 'translateZ(0)', // Hardware acceleration
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
