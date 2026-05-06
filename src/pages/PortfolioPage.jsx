import { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Crown,
  GalleryVerticalEnd,
  Mail,
  Sparkles,
  SwatchBook,
} from 'lucide-react';
import SphereCardCloud from '../components/SphereCardCloud';
import { FEATURED_CHARACTER_NAMES, SITE_COPY, STATES } from '../data/portfolioData';
import {
  buildCharacters,
  buildImageCandidates,
  buildMetrics,
  getStateCharacterCount,
} from '../utils/portfolio';
import { useReveal } from '../utils/useReveal';

const CHARACTERS = buildCharacters(STATES);

/**
 * 球形卡牌云总开关
 * 设为 false 可彻底关闭球形卡牌云，前端不再渲染该组件
 */
const SPHERE_CLOUD_ENABLED = true;

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`.trim()}
      style={{ '--delay': `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function CharacterImage({ code, name, className = '', variant = 'default' }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const imageCandidates = useMemo(
    () => buildImageCandidates(code, name, variant),
    [code, name, variant],
  );

  useEffect(() => {
    setSourceIndex(0);
  }, [code, name, variant]);

  const imageSrc = imageCandidates[sourceIndex] ?? imageCandidates[0];

  const handleError = () => {
    setSourceIndex((current) => {
      const nextIndex = current + 1;
      return nextIndex < imageCandidates.length ? nextIndex : current;
    });
  };

  return (
    <img
      src={imageSrc}
      alt={name}
      loading="lazy"
      onError={handleError}
      onContextMenu={(event) => event.preventDefault()}
      draggable="false"
      onDragStart={(event) => event.preventDefault()}
      className={className}
    />
  );
}

export default function PortfolioPage() {
  const [activeState, setActiveState] = useState('all');

  const featuredCharacters = useMemo(
    () => FEATURED_CHARACTER_NAMES.map((name) => CHARACTERS.find((item) => item.name === name)).filter(Boolean),
    [],
  );

  const metrics = useMemo(() => buildMetrics(STATES, featuredCharacters.length), [featuredCharacters.length]);

  const galleryCharacters = useMemo(() => {
    if (activeState === 'all') {
      return CHARACTERS;
    }

    return CHARACTERS.filter((item) => item.stateKey === activeState);
  }, [activeState]);

  const activeStateMeta = useMemo(
    () => STATES.find((state) => state.key === activeState) ?? STATES[0],
    [activeState],
  );

  const activeCount = useMemo(
    () => getStateCharacterCount(STATES, activeState),
    [activeState],
  );

  return (
    <div className="page-shell">
      <div className="page-noise" aria-hidden="true" />

      <header className="hero">
        <div className="hero-backdrop hero-backdrop-left" aria-hidden="true" />
        <div className="hero-backdrop hero-backdrop-right" aria-hidden="true" />

        <Reveal className="hero-grid">
          <div className="hero-copy card-panel card-panel-strong">
            <div className="eyebrow">
              <SwatchBook size={16} />
              <span>{SITE_COPY.tags[0]}</span>
            </div>
            <div className="hero-title-group">
              <p className="hero-kicker">{SITE_COPY.brand}</p>
              <h1>{SITE_COPY.title}</h1>
              <p className="hero-subtitle">{SITE_COPY.subtitle}</p>
            </div>
            <p className="hero-summary">{SITE_COPY.summary}</p>
            <div className="hero-tags">
              {SITE_COPY.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>

          <div className="hero-meta card-panel">
            <div className="meta-block">
              <div className="eyebrow subtle">
                <Bot size={16} />
                <span>策展说明</span>
              </div>
              {SITE_COPY.curatorNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>

            <div className="meta-block meta-contact">
              <div className="eyebrow subtle">
                <Mail size={16} />
                <span>联系作者</span>
              </div>
              <a href={`mailto:${SITE_COPY.email}`}>{SITE_COPY.email}</a>
            </div>
          </div>
        </Reveal>
      </header>

      <main className="content-shell">
        <section className="metrics-grid">
          {metrics.map((metric, index) => (
            <Reveal key={metric.label} delay={index * 90}>
              <article className="metric-card card-panel">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.note}</p>
              </article>
            </Reveal>
          ))}
        </section>

        <section className="section-block">
          <Reveal className="section-heading" delay={80}>
            <div>
              <div className="eyebrow subtle">
                <Sparkles size={16} />
                <span>精选陈列</span>
              </div>
              <h2>君王、文臣与武将的视觉切片</h2>
            </div>
            <p>
              七国人物节选。
            </p>
          </Reveal>

          <div className="featured-grid">
            {featuredCharacters.map((item, index) => (
              <Reveal key={item.id} delay={index * 80}>
                <article className="featured-card">
                  <CharacterImage
                    code={item.code}
                    name={item.name}
                    className="select-none pointer-events-none"
                  />
                  <div className="featured-overlay" />
                  <div className="featured-copy">
                    <span>{item.stateLabel}</span>
                    <h3>{item.name}</h3>
                    <p>{item.note}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section-block">
          <Reveal className="section-heading" delay={100}>
            <div>
              <div className="eyebrow subtle">
                <GalleryVerticalEnd size={16} />
                <span>角色画廊</span>
              </div>
              <h2>战国七雄人物档案</h2>
            </div>
            <p>{SITE_COPY.galleryDescription}</p>
          </Reveal>

          <Reveal delay={140}>
            <div className="filter-bar card-panel">
              {STATES.map((state) => {
                const count = getStateCharacterCount(STATES, state.key);

                return (
                  <button
                    key={state.key}
                    type="button"
                    className={state.key === activeState ? 'filter-chip active' : 'filter-chip'}
                    onClick={() => setActiveState(state.key)}
                  >
                    <span>{state.label}</span>
                    <strong>{count}</strong>
                  </button>
                );
              })}
            </div>
          </Reveal>

          {SPHERE_CLOUD_ENABLED && (
            <Reveal delay={180}>
              <SphereCardCloud
                activeStateLabel={activeStateMeta.label}
                activeTone={activeStateMeta.tone}
                characters={galleryCharacters}
                renderImage={(item, className) => (
                  <CharacterImage
                    code={item.code}
                    name={item.name}
                    className={className}
                    variant="sphere"
                  />
                )}
              />
            </Reveal>
          )}

          <Reveal delay={220}>
            <div className="gallery-summary card-panel">
              <div>
                <span className="gallery-summary-label">当前视图</span>
                <strong>{activeStateMeta.label === '全部' ? '全阵营总览' : `${activeStateMeta.label}国档案`}</strong>
              </div>
              <p>
                当前阵营关键词为“{activeStateMeta.tone}”。
              </p>
            </div>
          </Reveal>

          <div className="gallery-grid">
            {galleryCharacters.map((item, index) => (
              <Reveal key={`${activeState}-${item.id}`} delay={80 + (index % 12) * 35}>
                <article className="gallery-card">
                  <div className="gallery-image-wrap">
                    <CharacterImage
                      code={item.code}
                      name={item.name}
                      className="select-none pointer-events-none"
                    />
                    <div className="gallery-glow" aria-hidden="true" />
                  </div>
                  <div className="gallery-copy">
                    <div className="gallery-topline">
                      <span>{item.stateLabel}</span>
                      <span>{item.code}</span>
                    </div>
                    <h3>{item.name}</h3>
                    <p>{item.note}</p>
                    <div className="gallery-meta">
                      <span>
                        <Crown size={14} />
                        原创角色
                      </span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer card-panel">
        <div>
          <strong>{SITE_COPY.brand}</strong>
          <p>{SITE_COPY.footerLabel}</p>
        </div>
        <a href={`mailto:${SITE_COPY.email}`}>
          <Mail size={16} />
          {SITE_COPY.email}
        </a>
      </footer>
    </div>
  );
}