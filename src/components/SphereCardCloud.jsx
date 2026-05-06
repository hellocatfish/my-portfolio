import { useEffect, useMemo, useRef, useState } from 'react';
import { buildSmallImageUrl } from '../utils/portfolio';
import { STATES } from '../data/portfolioData';

function sampleCharacters(characters, maxItems) {
  if (characters.length <= maxItems) {
    return characters;
  }

  const step = characters.length / maxItems;

  return Array.from({ length: maxItems }, (_, index) => {
    const targetIndex = Math.floor(index * step);
    return characters[targetIndex];
  });
}

function buildSphereLayout(characters) {
  const sampledCharacters = sampleCharacters(characters, 28);
  const total = sampledCharacters.length;

  return sampledCharacters.map((character, index) => {
    const normalizedIndex = index + 0.5;
    const phi = Math.acos(1 - (2 * normalizedIndex) / total);
    const theta = Math.PI * (1 + Math.sqrt(5)) * normalizedIndex;

    const x = Math.cos(theta) * Math.sin(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(phi);

    return {
      ...character,
      vector: { x, y, z },
      // Uniform base — all visual depth variation comes from per-frame depth
      baseScale: 1,
      baseOpacity: 1,
    };
  });
}

function rotateY(vector, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: vector.x * cos + vector.z * sin,
    y: vector.y,
    z: -vector.x * sin + vector.z * cos,
  };
}

function rotateX(vector, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: vector.x,
    y: vector.y * cos - vector.z * sin,
    z: vector.y * sin + vector.z * cos,
  };
}

function rotateZ(vector, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
    z: vector.z,
  };
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = url;
  });
}

// Prevent right-click globally on the sphere cloud
function preventContextMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

/**
 * Returns the sphere core diameter (px) that matches the CSS breakpoints.
 * Core is always a circle, so diameter === CSS width/height.
 */
function getSphereCoreSize() {
  const w = window.innerWidth;
  if (w <= 560) return 210;
  if (w <= 860) return 250;
  return 340;
}

export default function SphereCardCloud({ activeStateLabel, activeTone, characters, renderImage }) {
  const [activeState, setActiveState] = useState('all');
  const containerRef = useRef(null);

  // Get filtered characters based on sphere's own active state
  const sphereFilteredCharacters = useMemo(() => {
    if (activeState === 'all') {
      return characters;
    }
    return characters.filter((item) => item.stateKey === activeState);
  }, [characters, activeState]);

  const sphereCharacters = useMemo(() => buildSphereLayout(sphereFilteredCharacters), [sphereFilteredCharacters]);
  const [imagesReady, setImagesReady] = useState(false);
  const [visible, setVisible] = useState(true);

  // Rotation state
  const orbitRef = useRef(0);
  const timeRef = useRef(0);
  const [, forceUpdate] = useState(0);
  const stageRef = useRef(null);

  // Block right-click on the entire component via useEffect + document event
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContextMenu = (e) => {
      if (container.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  useEffect(() => {
    setImagesReady(false);
    const urls = sphereCharacters.map((c) => buildSmallImageUrl(c.code, c.name));
    Promise.all(urls.map(preloadImage)).then(() => setImagesReady(true));
  }, [sphereCharacters]);

  // Animation loop: auto-rotation + sway time
  useEffect(() => {
    let startTime = 0;
    let rafId = 0;

    const loop = (time) => {
      if (!startTime) {
        startTime = time;
      }

      const elapsed = time - startTime;
      orbitRef.current = -((elapsed / 34000) * Math.PI * 2);
      timeRef.current = elapsed / 1000;

      forceUpdate((n) => n + 1);
      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Compute rendered characters (runs every render frame)
  const orbitNow = orbitRef.current;
  const timeNow = timeRef.current;

  // Card width = image height × (4/5.4), where image height = core size / 3
  const coreSize = getSphereCoreSize();
  const cardWidth = Math.round(coreSize / 3 * (4 / 5.4));
  const cardHeight = Math.round(cardWidth * 5.4 / 4);

  // Card orbit radii proportional to the actual sphere core size
  const coreRadius = coreSize / 2;
  const orbRadX = coreRadius * 1.46;
  const orbRadY = coreRadius * 1.06;

  const renderedCharacters = sphereCharacters
    .map((character, index) => {
      const orbitalVector = rotateY(character.vector, orbitNow);
      const tiltedVector = rotateZ(rotateX(orbitalVector, -0.24), -0.12);

      // Current z-depth after all rotations, normalized to 0-1
      const currentDepth = (tiltedVector.z + 1) / 2;

      // Visual depth conveyed through opacity + blur — card size is invariant
      const opacity = 0.10 + currentDepth * 0.90;       // 0.10 (back) → 1.00 (front)
      const blur = (1 - currentDepth) * 2.4;             // 2.4px (back) → 0px (front)

      // Smooth 2D sway
      const floatPhase = timeNow * (0.74 + (index % 7) * 0.06) + index * 0.85;
      const swayX = Math.sin(floatPhase) * 12;
      const swayY = Math.cos(floatPhase * 0.87) * 10 - Math.sin(floatPhase * 0.42) * 5;

      // 2D pixel positions (no z-axis — avoids Safari 3D distortion)
      const posX = tiltedVector.x * orbRadX + swayX;
      const posY = tiltedVector.y * orbRadY + swayY;

      // Offsets so that card center lands at (scene_center + posX/Y)
      const dx = posX - cardWidth / 2;
      const dy = posY - cardHeight / 2;

      return {
        ...character,
        sortZ: tiltedVector.z,
        style: {
          width: `${cardWidth}px`,
          '--card-dx': `${dx.toFixed(2)}px`,
          '--card-dy': `${dy.toFixed(2)}px`,
          '--card-opacity': `${opacity.toFixed(4)}`,
          '--card-blur': `${blur.toFixed(2)}px`,
        },
      };
    })
    // z-order: back cards first in DOM → rendered behind front cards
    .sort((a, b) => a.sortZ - b.sortZ);

  return (
    <div className="sphere-cloud card-panel" ref={containerRef} onContextMenu={preventContextMenu}>
      {/* Faction filter bar for sphere cloud */}
      <div className="sphere-cloud-filter-bar">
        {STATES.map((state) => (
          <button
            key={state.key}
            type="button"
            className={`sphere-cloud-chip ${state.key === activeState ? 'active' : ''}`}
            onClick={() => setActiveState(state.key)}
          >
            <span>{state.label}</span>
          </button>
        ))}
      </div>

      <div
        ref={stageRef}
        className="sphere-cloud-stage"
        style={{
          maxHeight: visible ? undefined : '0',
          minHeight: visible ? undefined : '0',
          padding: visible ? undefined : '0',
          opacity: visible ? 1 : 0,
          transition: 'max-height 0.5s ease, min-height 0.5s ease, padding 0.5s ease, opacity 0.4s ease',
          overflow: 'hidden',
        }}
        onContextMenu={preventContextMenu}
      >
        <div className="sphere-cloud-halo sphere-cloud-halo-left" aria-hidden="true" />
        <div className="sphere-cloud-halo sphere-cloud-halo-right" aria-hidden="true" />
        <div className="sphere-cloud-core" aria-hidden="true" />

        <div
          className="sphere-cloud-scene"
          style={{
            opacity: imagesReady ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          {renderedCharacters.map((character) => (
            <article
              key={`sphere-${character.id}`}
              className="sphere-cloud-card"
              style={character.style}
              onContextMenu={preventContextMenu}
            >
              <div className="sphere-cloud-card-shell">
                <div className="sphere-cloud-thumb">
                  {renderImage(character, 'sphere-cloud-image select-none pointer-events-none')}
                </div>
                <div className="sphere-cloud-meta">
                  <span>{character.stateLabel}</span>
                  <strong>{character.name}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="sphere-cloud-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? '关闭球形卡牌云' : '开启球形卡牌云'}
      >
        <span className="sphere-cloud-toggle-icon">{visible ? '✕' : '◎'}</span>
        <span>{visible ? '关闭' : '开启'}</span>
      </button>
    </div>
  );
}