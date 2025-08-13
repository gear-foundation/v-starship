import { useRef, useCallback, useState } from 'react';

// Configuration constants
const TRACKPAD_CONFIG = {
  MAX_RADIUS: 150, // Max distance from center (trackpad is 128px, so radius is 64, leave some padding)
  DEAD_ZONE: 0, // Minimum distance to register movement (reduced from 15 for smaller deadzone)
  HORIZONTAL_THRESHOLD: 0, // Sensitivity for horizontal movement detection
  VERTICAL_THRESHOLD: 0, // Sensitivity for vertical movement detection
};

type Props = {
  onPointer: (
    arrowKey: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
    isPressed: boolean,
    intensity?: number,
  ) => void;
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

      // Apply configurable deadzone threshold
      const threshold = TRACKPAD_CONFIG.DEAD_ZONE;

      if (distance < threshold) return null;

      // Calculate intensity based on distance from center
      const intensity = Math.min(distance / maxRadius, 1.0);

      const directions: { direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'; intensity: number }[] = [];

      // Use configurable detection thresholds
      const horizontalThreshold = TRACKPAD_CONFIG.HORIZONTAL_THRESHOLD;
      const verticalThreshold = TRACKPAD_CONFIG.VERTICAL_THRESHOLD;

      // Horizontal movement
      if (Math.abs(deltaX) > Math.abs(deltaY) * horizontalThreshold) {
        const horizontalIntensity = intensity * (Math.abs(deltaX) / distance);
        if (deltaX > 0) directions.push({ direction: 'ArrowRight', intensity: horizontalIntensity });
        else directions.push({ direction: 'ArrowLeft', intensity: horizontalIntensity });
      }

      // Vertical movement
      if (Math.abs(deltaY) > Math.abs(deltaX) * verticalThreshold) {
        const verticalIntensity = intensity * (Math.abs(deltaY) / distance);
        if (deltaY > 0) directions.push({ direction: 'ArrowDown', intensity: verticalIntensity });
        else directions.push({ direction: 'ArrowUp', intensity: verticalIntensity });
      }

      return directions;
    },
    [touchStartPosition],
  );

  const updateControls = useCallback(
    (clientX: number, clientY: number) => {
      const directionData = calculateDirection(clientX, clientY) || [];
      const newKeys = new Set(directionData.map((d) => d.direction));

      // Release keys that are no longer active
      activeKeys.current.forEach((key: string) => {
        if (!newKeys.has(key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight')) {
          onPointer(key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight', false);
        }
      });

      // Press keys that are newly active or update intensity for existing keys
      directionData.forEach(({ direction, intensity }) => {
        if (!activeKeys.current.has(direction)) {
          onPointer(direction, true, intensity);
        } else {
          // Update intensity for already active direction
          onPointer(direction, true, intensity);
        }
      });

      activeKeys.current = new Set(directionData.map((d) => d.direction));
    },
    [calculateDirection, onPointer],
  );

  const releaseAllKeys = useCallback(() => {
    activeKeys.current.forEach((key: string) => {
      onPointer(key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight', false, 0);
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
