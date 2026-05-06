import { useEffect, useMemo, useState } from 'react';

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

    const depth = (z + 1) / 2;
    const scale = 0.62 + depth * 0.48;
    const opacity = 0.34 + depth * 0.62;

    return {
      ...character,
      vector: { x, y, z },
      baseScale: scale,
      baseOpacity: opacity,
      floatDelay: `${(index % 7) * 0.55}s`,
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

export default function SphereCardCloud({ activeStateLabel, activeTone, characters, renderImage }) {
  const sphereCharacters = useMemo(() => buildSphereLayout(characters), [characters]);
  const [orbitAngle, setOrbitAngle] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let startTime = 0;

    const loop = (time) => {
      if (!startTime) {
        startTime = time;
      }

      const elapsed = time - startTime;
      const angle = -((elapsed / 34000) * Math.PI * 2);
      setOrbitAngle(angle);
      frameId = window.requestAnimationFrame(loop);
    };

    frameId = window.requestAnimationFrame(loop);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const renderedCharacters = useMemo(() => {
    return sphereCharacters.map((character, index) => {
      const orbitalVector = rotateY(character.vector, orbitAngle);
      const tiltedVector = rotateZ(rotateX(orbitalVector, -0.24), -0.12);
      const depth = (tiltedVector.z + 1) / 2;
      const scale = character.baseScale * (0.9 + depth * 0.22);
      const opacity = Math.max(0.28, character.baseOpacity * (0.82 + depth * 0.2));
      const swayX = Math.sin(orbitAngle * 1.3 + index * 0.7) * 12;
      const swayY = Math.cos(orbitAngle * 1.15 + index * 0.55) * 10;
      const swayZ = Math.sin(orbitAngle * 0.9 + index * 0.42) * 5;
      const rotateYDeg = Math.sin(orbitAngle * 1.1 + index * 0.5) * 15;
      const rotateXDeg = Math.cos(orbitAngle * 0.85 + index * 0.6) * 10;
      const rotateZDeg = Math.sin(orbitAngle * 0.95 + index * 0.45) * 6;
      const blur = (1 - depth) * 1.6;

      return {
        ...character,
        style: {
          '--float-delay': character.floatDelay,
          '--card-x': `${tiltedVector.x.toFixed(4)}`,
          '--card-y': `${tiltedVector.y.toFixed(4)}`,
          '--card-z': `${tiltedVector.z.toFixed(4)}`,
          '--card-scale': `${scale.toFixed(4)}`,
          '--card-opacity': `${opacity.toFixed(4)}`,
          '--card-sway-x': `${swayX.toFixed(2)}px`,
          '--card-sway-y': `${swayY.toFixed(2)}px`,
          '--card-sway-z': `${swayZ.toFixed(2)}px`,
          '--card-rotate-y': `${rotateYDeg.toFixed(2)}deg`,
          '--card-rotate-x': `${rotateXDeg.toFixed(2)}deg`,
          '--card-rotate-z': `${rotateZDeg.toFixed(2)}deg`,
          '--card-blur': `${blur.toFixed(2)}px`,
        },
      };
    });
  }, [orbitAngle, sphereCharacters]);

  return (
    <div className="sphere-cloud card-panel">
      <div className="sphere-cloud-copy">
        <div>
          <span className="sphere-cloud-label">速览</span>
          <h3>{activeStateLabel === '全部' ? '七国' : `${activeStateLabel}国`}</h3>
        </div>
        {/* <p align='left'>
          当前阵营：“{activeTone}”。
        </p> */}
      </div>

      <div className="sphere-cloud-stage">
        <div className="sphere-cloud-halo sphere-cloud-halo-left" aria-hidden="true" />
        <div className="sphere-cloud-halo sphere-cloud-halo-right" aria-hidden="true" />
        <div className="sphere-cloud-core" aria-hidden="true" />

        <div className="sphere-cloud-scene">
          {renderedCharacters.map((character) => (
            <article
              key={`sphere-${character.id}`}
              className="sphere-cloud-card"
              style={character.style}
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
    </div>
  );
}
