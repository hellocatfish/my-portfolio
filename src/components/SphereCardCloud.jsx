import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  // Drag rotation state
  const [userAngleY, setUserAngleY] = useState(0);
  const [userAngleX, setUserAngleX] = useState(0);
  const [isUserDragging, setIsUserDragging] = useState(false);
  const isDragging = useRef(false);
  const lastPointerPos = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const currentAngleRef = useRef({ angleY: 0, angleX: 0 });
  const autoRotateRef = useRef(true);
  const lastDragTime = useRef(0);
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

  // Animation loop: handles auto-rotate + inertia + sway
  useEffect(() => {
    let startTime = 0;
    let rafId = 0;

    const loop = (time) => {
      if (!startTime) {
        startTime = time;
      }

      const elapsed = time - startTime;
      const autoAngle = -((elapsed / 34000) * Math.PI * 2);
      orbitRef.current = autoAngle;
      timeRef.current = elapsed / 1000; // seconds

      if (!autoRotateRef.current && !isDragging.current) {
        const decay = 0.955;
        velocityRef.current.x *= decay;
        velocityRef.current.y *= decay;

        if (Math.abs(velocityRef.current.x) > 0.0002 || Math.abs(velocityRef.current.y) > 0.0002) {
          currentAngleRef.current.angleY += velocityRef.current.x;
          currentAngleRef.current.angleX += velocityRef.current.y;

          // Clamp X rotation
          currentAngleRef.current.angleX = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, currentAngleRef.current.angleX),
          );

          setUserAngleY(currentAngleRef.current.angleY);
          setUserAngleX(currentAngleRef.current.angleX);
        } else {
          // Inertia stopped, resume auto-rotate
          autoRotateRef.current = true;
          currentAngleRef.current = { angleY: 0, angleX: 0 };
          setUserAngleY(0);
          setUserAngleX(0);
        }
      }

      // Trigger re-render every frame for smooth sway animation
      forceUpdate((n) => n + 1);
      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handlePointerDown = useCallback((e) => {
    // Skip multi-touch events — allow native pinch-zoom
    if (e.touches && e.touches.length > 1) return;

    e.preventDefault();
    isDragging.current = true;
    setIsUserDragging(true);
    autoRotateRef.current = false;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    lastPointerPos.current = { x: clientX, y: clientY };
    velocityRef.current = { x: 0, y: 0 };
    lastDragTime.current = performance.now();
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;

    // Skip multi-touch events during drag
    if (e.touches && e.touches.length > 1) return;

    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - lastPointerPos.current.x;
    const dy = clientY - lastPointerPos.current.y;

    const now = performance.now();
    const dt = Math.max(now - lastDragTime.current, 1);
    lastDragTime.current = now;

    const sensitivity = 0.006;
    const deltaAngleY = dx * sensitivity;
    const deltaAngleX = -dy * sensitivity;

    // Track velocity for inertia (normalized to ~60fps)
    velocityRef.current = {
      x: deltaAngleY * (16 / dt) * 0.8,
      y: deltaAngleX * (16 / dt) * 0.8,
    };

    currentAngleRef.current.angleY += deltaAngleY;
    currentAngleRef.current.angleX += deltaAngleX;

    // Clamp X rotation to prevent flipping
    currentAngleRef.current.angleX = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, currentAngleRef.current.angleX),
    );

    setUserAngleY(currentAngleRef.current.angleY);
    setUserAngleX(currentAngleRef.current.angleX);

    lastPointerPos.current = { x: clientX, y: clientY };
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    setIsUserDragging(false);
  }, []);

  // Compute rendered characters (runs every render frame)
  const orbitNow = orbitRef.current;
  const timeNow = timeRef.current;
  const totalAngleY = autoRotateRef.current ? orbitNow : userAngleY;
  const totalAngleX = autoRotateRef.current ? 0 : userAngleX;

  // Card orbit radii proportional to the actual sphere core size
  // Ratios from desktop: X=1.46×radius, Y=1.06×radius, Z=1.18×radius
  const coreRadius = getSphereCoreSize() / 2;
  const orbRadX = coreRadius * 1.46;
  const orbRadY = coreRadius * 1.06;
  const orbRadZ = coreRadius * 1.18;

  const renderedCharacters = sphereCharacters
    .map((character, index) => {
      const orbitalVector = rotateY(character.vector, totalAngleY);
      const tiltedVector = rotateZ(rotateX(orbitalVector, -0.24 + totalAngleX), -0.12);

      // Current z-depth after all rotations, normalized to 0-1
      // 1.0 = directly facing viewer, 0.0 = facing away
      const currentDepth = (tiltedVector.z + 1) / 2;

      // Visual properties driven purely by current depth — no double-multiplication
      const scale = 0.50 + currentDepth * 0.50;        // 0.50 (back) → 1.00 (front)
      const opacity = 0.10 + currentDepth * 0.90;       // 0.10 (back) → 1.00 (front)
      const blur = (1 - currentDepth) * 2.4;             // 2.4px (back) → 0px (front)

      // Smooth sway driven by time (not by rotation angle), eliminates jitter
      const floatPhase = timeNow * (0.74 + (index % 7) * 0.06) + index * 0.85;
      const swayX = Math.sin(floatPhase) * 12;
      const swayY = Math.cos(floatPhase * 0.87) * 10 - Math.sin(floatPhase * 0.42) * 5;
      const swayZ = Math.sin(floatPhase * 0.65) * 5;
      const rotateYDeg = Math.sin(timeNow * 0.7 + index * 0.5) * 15;
      const rotateXDeg = Math.cos(timeNow * 0.55 + index * 0.6) * 10;
      const rotateZDeg = Math.sin(timeNow * 0.62 + index * 0.45) * 6;

      // Pre-compute pixel positions to avoid CSS calc() with vmin across breakpoints
      const posX = tiltedVector.x * orbRadX + swayX;
      const posY = tiltedVector.y * orbRadY + swayY;
      const posZ = tiltedVector.z * orbRadZ + swayZ;

      return {
        ...character,
        sortZ: tiltedVector.z,
        style: {
          '--card-pos-x': `${posX.toFixed(2)}px`,
          '--card-pos-y': `${posY.toFixed(2)}px`,
          '--card-pos-z': `${posZ.toFixed(2)}px`,
          '--card-scale': `${scale.toFixed(4)}`,
          '--card-opacity': `${opacity.toFixed(4)}`,
          '--card-rotate-y': `${rotateYDeg.toFixed(2)}deg`,
          '--card-rotate-x': `${rotateXDeg.toFixed(2)}deg`,
          '--card-rotate-z': `${rotateZDeg.toFixed(2)}deg`,
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
          touchAction: 'manipulation',
        }}
        onMouseDown={visible ? handlePointerDown : undefined}
        onMouseMove={visible ? handlePointerMove : undefined}
        onMouseUp={visible ? handlePointerUp : undefined}
        onMouseLeave={visible ? handlePointerUp : undefined}
        onTouchStart={visible ? handlePointerDown : undefined}
        onTouchMove={visible ? handlePointerMove : undefined}
        onTouchEnd={visible ? handlePointerUp : undefined}
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