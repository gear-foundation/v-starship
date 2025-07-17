import { useState, useEffect, useRef } from 'react';

import { GAME_CONFIG } from './game-config';

const MAIN_SCREEN_BG_CONFIG = {
  ...GAME_CONFIG.GAME_BG_CONFIG,
  starCount: { min: 18, max: 32 },
  planetCount: { min: 1, max: 3 },
  planetSize: { min: 40, max: 90 },
  planetOpacity: { min: 0.25, max: 0.6 },
  nebulaCount: { min: 1, max: 3 },
  nebulaSize: { min: 120, max: 220 },
  nebulaOpacity: { min: 0.1, max: 0.25 },
};

function generateBackground(cfg = GAME_CONFIG.GAME_BG_CONFIG) {
  const starCount = Math.floor(cfg.starCount.min + Math.random() * (cfg.starCount.max - cfg.starCount.min + 1));

  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: cfg.starSize.min + Math.random() * (cfg.starSize.max - cfg.starSize.min),
    color: cfg.starColors[Math.floor(Math.random() * cfg.starColors.length)],
    twinkle: cfg.starTwinkle.min + Math.random() * (cfg.starTwinkle.max - cfg.starTwinkle.min),
    phase: Math.random() * Math.PI * 2,
  }));

  const planetCount = Math.floor(cfg.planetCount.min + Math.random() * (cfg.planetCount.max - cfg.planetCount.min + 1));

  const planets = Array.from({ length: planetCount }, () => {
    const colorPair = cfg.planetColors[Math.floor(Math.random() * cfg.planetColors.length)];

    return {
      x: Math.random(),
      y: Math.random(),
      size: cfg.planetSize.min + Math.random() * (cfg.planetSize.max - cfg.planetSize.min),
      colorFrom: colorPair[0],
      colorTo: colorPair[1],
      opacity: cfg.planetOpacity.min + Math.random() * (cfg.planetOpacity.max - cfg.planetOpacity.min),
      blur: 8 + Math.random() * 12,
    };
  });

  const nebulaCount = Math.floor(cfg.nebulaCount.min + Math.random() * (cfg.nebulaCount.max - cfg.nebulaCount.min + 1));

  const nebulas = Array.from({ length: nebulaCount }, () => {
    const colorPair = cfg.nebulaColors[Math.floor(Math.random() * cfg.nebulaColors.length)];

    return {
      x: Math.random(),
      y: Math.random(),
      size: cfg.nebulaSize.min + Math.random() * (cfg.nebulaSize.max - cfg.nebulaSize.min),
      colorFrom: colorPair[0],
      colorTo: colorPair[1],
      opacity: cfg.nebulaOpacity.min + Math.random() * (cfg.nebulaOpacity.max - cfg.nebulaOpacity.min),
      blur: 32 + Math.random() * 32,
    };
  });

  const fieldColor = cfg.fieldColors[Math.floor(Math.random() * cfg.fieldColors.length)];

  return { stars, planets, nebulas, fieldColor };
}

type Props = {
  variant?: 'default' | 'game';
};

function SpaceBackground({ variant = 'default' }: Props) {
  const background = useRef(generateBackground(variant === 'default' ? MAIN_SCREEN_BG_CONFIG : undefined));

  const [timeMs, setTimeMs] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let requestId: number;
    let lastTime = Date.now();

    function animate() {
      const currentTime = Date.now();

      setTimeMs(currentTime);

      if (variant === 'game') {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        setOffset((prev) => (prev + GAME_CONFIG.BACKGROUND_SCROLL_SPEED * deltaTime * 100) % 100);
      }

      requestId = requestAnimationFrame(animate);
    }

    requestId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [variant]);

  const getYPosition = (value: number) => (value * 100 + offset) % 100;

  const renderStars = () => {
    return background.current.stars.map((star, i) => {
      const pulse = 0.7 + star.twinkle * Math.sin(timeMs / 600 + star.phase);

      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${star.x * 100}%`,
            top: `${getYPosition(star.y)}%`,
            width: `${star.size * pulse}px`,
            height: `${star.size * pulse}px`,
            background: star.color,
            borderRadius: '50%',
            opacity: 0.7 + 0.3 * Math.sin(timeMs / 800 + star.phase),
            filter: 'blur(0.5px)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      );
    });
  };

  const renderNebulas = () =>
    background.current.nebulas.map((nebula, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${nebula.x * 100}%`,
          top: `${getYPosition(nebula.y)}%`,
          width: `${nebula.size}px`,
          height: `${nebula.size}px`,
          background: `radial-gradient(circle, ${nebula.colorFrom} 0%, ${nebula.colorTo} 100%)`,
          borderRadius: '50%',
          opacity: nebula.opacity,
          filter: `blur(${nebula.blur}px)`,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    ));

  const renderPlanets = () =>
    background.current.planets.map((planet, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${planet.x * 100}%`,
          top: `${getYPosition(planet.y)}%`,
          width: `${planet.size}px`,
          height: `${planet.size}px`,
          background: `linear-gradient(135deg, ${planet.colorFrom}, ${planet.colorTo})`,
          borderRadius: '50%',
          opacity: planet.opacity,
          filter: `blur(${planet.blur}px)`,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    ));

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
      style={{ background: background.current.fieldColor, borderRadius: 24, zIndex: 0 }}>
      {renderStars()}
      {renderPlanets()}
      {renderNebulas()}
    </div>
  );
}
export { SpaceBackground };
