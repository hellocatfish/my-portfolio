import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Crown,
  GalleryVerticalEnd,
  Info,
  Mail,
  Sparkles,
  SwatchBook,
  Image,
  Users,
  Gamepad2,
  Swords,
} from 'lucide-react';
import SphereCardCloud from '../components/SphereCardCloud';
import { buildCharacterResumes, buildPortraitCandidates, getStatKeys } from '../utils/characterResume';
import { loadImagePriorityConfig, useImagePriority } from '../utils/imagePriority';
import { FEATURED_CHARACTER_NAMES, SITE_COPY, STATES } from '../data/portfolioData';
import {
  buildCharacters,
  buildImageCandidates,
  buildMetrics,
  getStateCharacterCount,
  isCharacterLit,
  PLACEHOLDER_IMAGE,
} from '../utils/portfolio';
import { buildResumeRouteMaps, getResumePath, getTabPath, resolveRoute } from '../utils/routes';
import { useReveal } from '../utils/useReveal';

const CHARACTERS = buildCharacters(STATES);
const CHARACTER_RESUMES = buildCharacterResumes();
const STAT_KEYS = getStatKeys();
const RESUME_ROUTE_MAPS = buildResumeRouteMaps(CHARACTER_RESUMES);

const NAV_TABS = [
  { key: 'art', label: '立绘赏析', icon: Image },
  { key: 'resume', label: '角色简历', icon: Users },
  { key: 'arpg', label: 'ARPG', icon: Swords },
  { key: 'slg', label: 'SLG', icon: Gamepad2 },
];

/** 小红书 SVG Icon */
function XiaohongshuIcon() {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M 29,0.33332825 C 13.959937,3.4666748 1.5356731,15.204498 0,31 -1.586103,47.314209 0,64.597672 0,81 v 102 c 0,18.76035 -4.7369685,44.19888 7.3333335,60 C 20.372129,260.06897 44.156731,256 63,256 h 111 35 c 5.78276,0 12.33244,0.84741 18,-0.33333 15.0401,-3.13336 27.46432,-14.87115 29,-30.66667 1.58612,-16.31419 0,-33.59769 0,-50 V 73 C 256,54.239685 260.73697,28.801102 248.66667,13 235.62787,-4.0689697 211.84329,0 193,0 H 82 47 C 41.217228,0 34.667561,-0.84741211 29,0.33332825 M 120,91 l -7,19 h 12 l -10,24 9,1 c -0.98794,2.68155 -2.31718,7.73317 -4.33334,9.83334 C 118.18945,146.3721 115.92654,146 114,146 c -4.35942,0 -13.16798,1.80539 -15.5,-3 -1.069664,-2.20416 0.465553,-4.98451 1.333336,-7 1.813624,-4.21228 4.222554,-8.51549 5.166664,-13 -2.17548,0 -4.92464,0.42967 -7,-0.33333 -7.778526,-2.85974 0.874031,-15.36435 2.66666,-19.66667 1.25875,-3.020981 2.75652,-9.584732 5.5,-11.5 C 110.01874,88.810822 115.88325,90.674988 120,91 m -79,63 c 2.750713,0 6.837379,0.81721 8.5,-2 1.769028,-2.99753 0.5,-9.58963 0.5,-13 V 106 C 50,102.90659 48.438198,93.464493 51.166668,91.5 53.41069,89.884308 62.832935,90.226166 63.833332,93 65.47065,97.539825 64,105.16241 64,110 v 32 c 0,5.48389 0.949112,11.8645 -1.333332,17 -2.177158,4.89861 -12.303417,9.27243 -17.333336,5.5 C 43.120155,162.84012 41.545292,156.59013 41,154 M 193,91 v 5 c 3.72887,0 8.4108,-0.763367 12,0.333328 11.97635,3.659424 11,15.422502 11,25.666672 1.99706,0 4.04419,-0.15562 6,0.33333 11.49335,2.87334 10,14.36401 10,23.66667 0,4.95615 0.93086,10.82184 -2.33333,15 -3.59567,4.60246 -9.48195,4 -14.66667,4 -1.6116,0 -4.26318,0.51051 -5.66667,-0.5 -2.62326,-1.88875 -3.78159,-7.50485 -4.33333,-10.5 3.28711,0 9.2179,1.12517 11.83333,-1.33334 C 219.9164,149.76859 218.65411,138.43454 215,136.5 c -1.93661,-1.02527 -4.88672,-0.5 -7,-0.5 h -15 v 29 h -14 v -29 h -14 v -14 h 14 v -12 h -9 V 96 h 9 v -5 h 14 m -32,5 v 14 h -8 v 42 h 13 v 13 H 120 L 125.33334,152.5 138,152 v -42 h -8 V 96 h 31 m 57,14 c 0,-2.84204 -0.51608,-6.25871 0.33333,-9 3.34434,-10.793121 19.61577,-2.093994 11.5,6.83333 -0.92279,1.01507 -2.54419,1.51106 -3.83333,1.83334 C 223.43948,110.30679 220.61993,110 218,110 M 41,110 36.833332,147 30,159 24,143 27,110 h 14 m 46,0 3,33 -6,15 h -2 c -5.366936,-8.49765 -6.053299,-17.26251 -7,-27 -0.672195,-6.91406 -2,-14.04004 -2,-21 h 14 m 106,0 v 12 h 9 v -12 h -9 m -75,42 -5,13 H 91 L 96.333336,151.5 104,151.66666 Z" />
    </svg>
  );
}

/** 抖音 SVG Icon */
function DouyinIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.45095 19.7926C8.60723 18.4987 9.1379 17.7743 10.1379 17.0317C11.5688 16.0259 13.3561 16.5948 13.3561 16.5948V13.2197C13.7907 13.2085 14.2254 13.2343 14.6551 13.2966V17.6401C14.6551 17.6401 12.8683 17.0712 11.4375 18.0775C10.438 18.8196 9.90623 19.5446 9.7505 20.8385C9.74562 21.5411 9.87747 22.4595 10.4847 23.2536C10.3345 23.1766 10.1815 23.0889 10.0256 22.9905C8.68807 22.0923 8.44444 20.7449 8.45095 19.7926ZM22.0352 6.97898C21.0509 5.90039 20.6786 4.81139 20.5441 4.04639H21.7823C21.7823 4.04639 21.5354 6.05224 23.3347 8.02482L23.3597 8.05134C22.8747 7.7463 22.43 7.38624 22.0352 6.97898ZM28 10.0369V14.293C28 14.293 26.42 14.2312 25.2507 13.9337C23.6179 13.5176 22.5685 12.8795 22.5685 12.8795C22.5685 12.8795 21.8436 12.4245 21.785 12.3928V21.1817C21.785 21.6711 21.651 22.8932 21.2424 23.9125C20.709 25.246 19.8859 26.1212 19.7345 26.3001C19.7345 26.3001 18.7334 27.4832 16.9672 28.28C15.3752 28.9987 13.9774 28.9805 13.5596 28.9987C13.5596 28.9987 11.1434 29.0944 8.96915 27.6814C8.49898 27.3699 8.06011 27.0172 7.6582 26.6277L7.66906 26.6355C9.84383 28.0485 12.2595 27.9528 12.2595 27.9528C12.6779 27.9346 14.0756 27.9528 15.6671 27.2341C17.4317 26.4374 18.4344 25.2543 18.4344 25.2543C18.5842 25.0754 19.4111 24.2001 19.9423 22.8662C20.3498 21.8474 20.4849 20.6247 20.4849 20.1354V11.3475C20.5435 11.3797 21.2679 11.8347 21.2679 11.8347C21.2679 11.8347 22.3179 12.4734 23.9506 12.8889C25.1204 13.1864 26.7 13.2483 26.7 13.2483V9.91314C27.2404 10.0343 27.7011 10.0671 28 10.0369Z" fill="#EE1D52" />
      <path d="M26.7009 9.91314V13.2472C26.7009 13.2472 25.1213 13.1853 23.9515 12.8879C22.3188 12.4718 21.2688 11.8337 21.2688 11.8337C21.2688 11.8337 20.5444 11.3787 20.4858 11.3464V20.1364C20.4858 20.6258 20.3518 21.8484 19.9432 22.8672C19.4098 24.2012 18.5867 25.0764 18.4353 25.2553C18.4353 25.2553 17.4337 26.4384 15.668 27.2352C14.0765 27.9539 12.6788 27.9357 12.2604 27.9539C12.2604 27.9539 9.84473 28.0496 7.66995 26.6366L7.6591 26.6288C7.42949 26.4064 7.21336 26.1717 7.01177 25.9257C6.31777 25.0795 5.89237 24.0789 5.78547 23.7934C5.78529 23.7922 5.78529 23.791 5.78547 23.7898C5.61347 23.2937 5.25209 22.1022 5.30147 20.9482C5.38883 18.9122 6.10507 17.6625 6.29444 17.3494C6.79597 16.4957 7.44828 15.7318 8.22233 15.0919C8.90538 14.5396 9.6796 14.1002 10.5132 13.7917C11.4144 13.4295 12.3794 13.2353 13.3565 13.2197V16.5948C13.3565 16.5948 11.5691 16.028 10.1388 17.0317C9.13879 17.7743 8.60812 18.4987 8.45185 19.7926C8.44534 20.7449 8.68897 22.0923 10.0254 22.991C10.1813 23.0898 10.3343 23.1775 10.4845 23.2541C10.7179 23.5576 11.0021 23.8221 11.3255 24.0368C12.631 24.8632 13.7249 24.9209 15.1238 24.3842C16.0565 24.0254 16.7586 23.2167 17.0842 22.3206C17.2888 21.7611 17.2861 21.1978 17.2861 20.6154V4.04639H20.5417C20.6763 4.81139 21.0485 5.90039 22.0328 6.97898C22.4276 7.38624 22.8724 7.7463 23.3573 8.05134C23.5006 8.19955 24.2331 8.93231 25.1734 9.38216C25.6596 9.61469 26.1722 9.79285 26.7009 9.91314Z" fill="#000000" />
      <path d="M4.48926 22.7568V22.7594L4.57004 22.9784C4.56076 22.9529 4.53074 22.8754 4.48926 22.7568Z" fill="#69C9D0" />
      <path d="M10.5128 13.7916C9.67919 14.1002 8.90498 14.5396 8.22192 15.0918C7.44763 15.7332 6.79548 16.4987 6.29458 17.354C6.10521 17.6661 5.38897 18.9168 5.30161 20.9528C5.25223 22.1068 5.61361 23.2983 5.78561 23.7944C5.78543 23.7956 5.78543 23.7968 5.78561 23.798C5.89413 24.081 6.31791 25.0815 7.01191 25.9303C7.2135 26.1763 7.42963 26.4111 7.65924 26.6334C6.92357 26.1457 6.26746 25.5562 5.71236 24.8839C5.02433 24.0451 4.60001 23.0549 4.48932 22.7626C4.48919 22.7605 4.48919 22.7584 4.48932 22.7564V22.7527C4.31677 22.2571 3.95431 21.0651 4.00477 19.9096C4.09213 17.8736 4.80838 16.6239 4.99775 16.3108C5.4985 15.4553 6.15067 14.6898 6.92509 14.0486C7.608 13.4961 8.38225 13.0567 9.21598 12.7484C9.73602 12.5416 10.2778 12.3891 10.8319 12.2934C11.6669 12.1537 12.5198 12.1415 13.3588 12.2575V13.2196C12.3808 13.2349 11.4148 13.4291 10.5128 13.7916Z" fill="#69C9D0" />
      <path d="M20.5438 4.04635H17.2881V20.6159C17.2881 21.1983 17.2881 21.76 17.0863 22.3211C16.7575 23.2167 16.058 24.0253 15.1258 24.3842C13.7265 24.923 12.6326 24.8632 11.3276 24.0368C11.0036 23.823 10.7187 23.5594 10.4844 23.2567C11.5962 23.8251 12.5913 23.8152 13.8241 23.341C14.7558 22.9821 15.4563 22.1734 15.784 21.2774C15.9891 20.7178 15.9864 20.1546 15.9864 19.5726V3H20.4819C20.4819 3 20.4315 3.41188 20.5438 4.04635ZM26.7002 8.99104V9.9131C26.1725 9.79263 25.6609 9.61447 25.1755 9.38213C24.2352 8.93228 23.5026 8.19952 23.3594 8.0513C23.5256 8.1559 23.6981 8.25106 23.8759 8.33629C25.0192 8.88339 26.1451 9.04669 26.7002 8.99104Z" fill="#69C9D0" />
    </svg>
  );
}

/** B站 SVG Icon */
function BilibiliIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="none" d="M0 0h24v24H0z" />
      <path fill="currentColor" d="M18.223 3.086a1.25 1.25 0 0 1 0 1.768L17.08 5.996h1.17A3.75 3.75 0 0 1 22 9.747v7.5a3.75 3.75 0 0 1-3.75 3.75H5.75A3.75 3.75 0 0 1 2 17.247v-7.5a3.75 3.75 0 0 1 3.75-3.75h1.166L5.775 4.855a1.25 1.25 0 1 1 1.767-1.768l2.652 2.652c.079.079.145.165.198.257h3.213c.053-.092.12-.18.199-.258l2.651-2.652a1.25 1.25 0 0 1 1.768 0zm.027 5.42H5.75a1.25 1.25 0 0 0-1.247 1.157l-.003.094v7.5c0 .659.51 1.199 1.157 1.246l.093.004h12.5a1.25 1.25 0 0 0 1.247-1.157l.003-.093v-7.5c0-.69-.56-1.25-1.25-1.25zm-10 2.5c.69 0 1.25.56 1.25 1.25v1.25a1.25 1.25 0 1 1-2.5 0v-1.25c0-.69.56-1.25 1.25-1.25zm7.5 0c.69 0 1.25.56 1.25 1.25v1.25a1.25 1.25 0 1 1-2.5 0v-1.25c0-.69.56-1.25 1.25-1.25z" />
    </svg>
  );
}

function ThemeToggleIcon({ theme }) {
  const isLight = theme === 'light';

  return (
    <svg viewBox="0 0 56 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect
        x={isLight ? '4' : '30'}
        y="4"
        width="22"
        height="20"
        rx="10"
        fill="currentColor"
        className="theme-toggle-pill"
      />
      <circle
        cx="15"
        cy="14"
        r="4.2"
        className="theme-toggle-sun"
      />
      <g className="theme-toggle-rays" strokeLinecap="round">
        <path d="M15 6.5v2" />
        <path d="M15 19.5v2" />
        <path d="M7.5 14h2" />
        <path d="M20.5 14h2" />
        <path d="M9.7 8.7l1.4 1.4" />
        <path d="M18.9 17.9l1.4 1.4" />
        <path d="M20.3 8.7l-1.4 1.4" />
        <path d="M11.1 17.9l-1.4 1.4" />
      </g>
      <path
        d="M42.7 8.3a6.4 6.4 0 1 0 5.1 10.2 7.4 7.4 0 1 1-5.1-10.2Z"
        className="theme-toggle-moon"
      />
    </svg>
  );
}

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
  const lit = isCharacterLit(name);
  const priority = useImagePriority();
  const [sourceIndex, setSourceIndex] = useState(0);

  // 已点亮：真实立绘候选链（按优先级排列，最终回退到占位图）；未点亮：直接占位图。
  const imageCandidates = useMemo(
    () =>
      lit
        ? buildImageCandidates(code, name, variant, priority)
        : [PLACEHOLDER_IMAGE],
    [code, name, variant, lit, priority],
  );

  useEffect(() => {
    setSourceIndex(0);
  }, [code, name, variant, lit, priority]);

  const imageSrc = imageCandidates[sourceIndex] ?? imageCandidates[0];
  const isPlaceholder = imageSrc === PLACEHOLDER_IMAGE;

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
      className={`${className}${isPlaceholder ? ' is-placeholder' : ''}`.trim()}
    />
  );
}

function RadarChart({ stats, color }) {
  const size = 240;
  const center = 120.5;
  const maxRadius = 85.5;
  const levels = [0.25, 0.5, 0.75, 1];

  const pointFor = (index, value = 100) => {
    const angle = (-90 + index * 72) * (Math.PI / 180);
    const radius = maxRadius * (value / 100);
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  };

  const polygonPoints = stats
    ? STAT_KEYS.map((item, index) => {
        const point = pointFor(index, stats[item.key]);
        return `${point.x},${point.y}`;
      }).join(' ')
    : '';

  return (
    <div className={`radar-card${stats ? '' : ' radar-card-locked'}`}>
      <svg className="radar-chart" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="人物五维雷达图">
        {levels.map((level) => (
          <polygon
            key={level}
            points={STAT_KEYS.map((_, index) => {
              const point = pointFor(index, level * 100);
              return `${point.x},${point.y}`;
            }).join(' ')}
            className="radar-grid"
          />
        ))}
        {STAT_KEYS.map((_, index) => {
          const point = pointFor(index, 100);
          return <line key={index} x1={center} y1={center} x2={point.x} y2={point.y} className="radar-axis" />;
        })}
        {stats && (
          <polygon
            points={polygonPoints}
            className="radar-shape"
            style={{ '--radar-color': color }}
          />
        )}
        {stats &&
          STAT_KEYS.map((item, index) => {
            const point = pointFor(index, stats[item.key]);
            return (
              <circle
                key={`${item.key}-point`}
                cx={point.x}
                cy={point.y}
                r="4"
                className="radar-point"
              />
            );
          })}
        {STAT_KEYS.map((item, index) => {
          const point = pointFor(index, 116);
          return (
            <text key={item.key} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="middle">
              {item.label}
            </text>
          );
        })}
      </svg>
      <div className="radar-values">
        {STAT_KEYS.map((item) => (
          <span key={item.key}>
            {item.label}
            <strong>{stats ? stats[item.key] : '?'}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function PortraitImage({ portrait, alt, loading = 'lazy' }) {
  const priority = useImagePriority();
  const [sourceIndex, setSourceIndex] = useState(0);

  const candidates = useMemo(
    () => buildPortraitCandidates(portrait, priority),
    [portrait, priority],
  );

  useEffect(() => {
    setSourceIndex(0);
  }, [candidates]);

  const imageSrc = candidates[sourceIndex] ?? candidates[0];

  const handleError = () => {
    setSourceIndex((current) => {
      const nextIndex = current + 1;
      return nextIndex < candidates.length ? nextIndex : current;
    });
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading={loading}
      onError={handleError}
      onContextMenu={(event) => event.preventDefault()}
      draggable="false"
      onDragStart={(event) => event.preventDefault()}
    />
  );
}

function CharacterResumeContent({ resume, imageLoading = 'lazy' }) {
  return (
    <>
      <header className="resume-detail-hero card-panel">
        <div className="resume-title-block">
          <span className="gallery-summary-label">{resume.stateLabel} / {resume.code}</span>
          <h1>{resume.name}</h1>
          <p>{resume.title}</p>
        </div>
        <div className="resume-portrait-wrap">
          <PortraitImage
            portrait={resume.portrait}
            alt={resume.name}
            loading={imageLoading}
          />
        </div>
      </header>

      <section className="resume-section card-panel">
        <h2>人物简介</h2>
        <p className="resume-bio">{resume.bio}</p>
      </section>

      <section className="resume-section card-panel">
        <h2>人物能力</h2>
        <div className="resume-ability-grid">
          <RadarChart stats={resume.stats} color={resume.stateColor} />
          <div className="stat-reasons">
            {resume.statsReason ? (
              STAT_KEYS.map((item) => (
                <p key={item.key}>
                  <strong>{item.label}</strong>
                  {resume.statsReason[item.key]}
                </p>
              ))
            ) : (
              <div className="stat-reasons-empty" aria-label="未点亮角色能力说明为空" />
            )}
          </div>
        </div>
      </section>

      <section className="resume-section card-panel">
        <h2>人物履历</h2>
        <ol className="resume-timeline">
          {resume.timeline.map((item, index) => (
            <li key={`${item.year}-${index}`}>
              <span>{item.year}</span>
              <p>{item.event}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function CharacterResumeDetail({ resume, onBack }) {
  return (
    <div className="tab-content resume-detail-view">
      <section className="resume-detail-shell">
        <div className="resume-detail-actions">
          <button type="button" className="detail-back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            返回角色画廊
          </button>
        </div>

        <CharacterResumeContent resume={resume} />
      </section>
    </div>
  );
}

function CharacterResumePrintPage({ resumes, theme, onToggleTheme }) {
  return (
    <div className="tab-content resume-print-view">
      <button
        type="button"
        className="resume-print-theme-toggle"
        onClick={onToggleTheme}
        aria-label={theme === 'dark' ? '切换浅色打印预览' : '切换深色打印预览'}
        title={theme === 'dark' ? '切换浅色打印预览' : '切换深色打印预览'}
      >
        <ThemeToggleIcon theme={theme} />
      </button>
      <section className="resume-print-shell">
        {resumes.map((resume) => (
          <article key={resume.id} className="resume-print-page resume-detail-shell">
            <CharacterResumeContent resume={resume} imageLoading="eager" />
          </article>
        ))}
      </section>
    </div>
  );
}

export default function PortfolioPage() {
  const [routeState, setRouteState] = useState(() =>
    resolveRoute(window.location.pathname, RESUME_ROUTE_MAPS.slugToId),
  );
  const [activeState, setActiveState] = useState('all');
  const [theme, setTheme] = useState('dark');
  const { tab: activeTab, selectedResumeId, printMode } = routeState;
  const mainAreaRef = useRef(null);
  const savedListScrollRef = useRef(0);
  const prevRouteRef = useRef({ tab: activeTab, selectedResumeId, printMode });

  const featuredCharacters = useMemo(
    () => FEATURED_CHARACTER_NAMES.map((name) => CHARACTERS.find((item) => item.name === name)).filter(Boolean),
    [],
  );

  const metrics = useMemo(() => buildMetrics(STATES, featuredCharacters.length), [featuredCharacters.length]);

  const galleryCharacters = useMemo(() => {
    if (activeState === 'all') {
      return CHARACTER_RESUMES;
    }
    return CHARACTER_RESUMES.filter((item) => item.stateKey === activeState);
  }, [activeState]);

  const activeStateMeta = useMemo(
    () => STATES.find((state) => state.key === activeState) ?? STATES[0],
    [activeState],
  );

  const selectedResume = useMemo(
    () => CHARACTER_RESUMES.find((item) => item.id === selectedResumeId) ?? null,
    [selectedResumeId],
  );

  useEffect(() => {
    loadImagePriorityConfig();
  }, []);

  // 切换页面时管理主滚动容器的滚动位置：
  // - 进入角色详情 / 切换 tab / 进入打印页：重置到顶部
  // - 从角色详情返回简历列表：恢复进入详情前保存的滚动位置（存档点）
  useEffect(() => {
    const el = mainAreaRef.current;
    if (!el) return;

    const prev = prevRouteRef.current;
    const isReturnToList =
      prev.selectedResumeId !== null &&
      selectedResumeId === null &&
      activeTab === 'resume' &&
      !printMode;

    const prevBehavior = el.style.scrollBehavior;
    el.style.scrollBehavior = 'auto';

    if (isReturnToList) {
      // 列表内容较多，等待一帧布局完成后再恢复，避免 scrollHeight 不足导致位置被截断
      const target = savedListScrollRef.current;
      requestAnimationFrame(() => {
        const node = mainAreaRef.current;
        if (!node) return;
        const b = node.style.scrollBehavior;
        node.style.scrollBehavior = 'auto';
        node.scrollTop = target;
        node.style.scrollBehavior = b;
      });
    } else {
      el.scrollTop = 0;
    }

    el.style.scrollBehavior = prevBehavior;
    prevRouteRef.current = { tab: activeTab, selectedResumeId, printMode };
  }, [activeTab, selectedResumeId, printMode]);

  useEffect(() => {
    const syncRoute = () => {
      setRouteState(resolveRoute(window.location.pathname, RESUME_ROUTE_MAPS.slugToId));
    };

    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  const navigateTo = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRouteState(resolveRoute(path, RESUME_ROUTE_MAPS.slugToId));
  };

  const openTab = (tabKey) => {
    navigateTo(getTabPath(tabKey));
  };

  const goHome = () => {
    navigateTo(getTabPath('home'));
  };

  const openResume = (resume) => {
    // 进入详情页前，保存列表页当前滚动位置作为存档点，供返回时恢复
    if (mainAreaRef.current) {
      savedListScrollRef.current = mainAreaRef.current.scrollTop;
    }
    navigateTo(getResumePath(resume, RESUME_ROUTE_MAPS.idToSlug));
  };

  const backToResumeList = () => {
    navigateTo(getTabPath('resume'));
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`page-shell theme-${theme} ${printMode ? 'resume-print-mode' : ''}`}>
      <div className="page-noise" aria-hidden="true" />

      {/* ===== Main Content Area (top 4/5) ===== */}
      <div ref={mainAreaRef} className={`main-area ${activeTab !== 'home' ? 'main-area-scroll' : ''}`}>

        {/* Back button (visible in sub-pages) */}
        {activeTab !== 'home' && (
          <button
            type="button"
            className="back-btn"
            onClick={goHome}
            aria-label="返回首页"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* HOME: Sphere Card Cloud */}
        {activeTab === 'home' && (
          <div className="sphere-cloud-home">
            <SphereCardCloud
              characters={CHARACTERS}
              renderImage={(item, className) => (
                <CharacterImage
                  code={item.code}
                  name={item.name}
                  className={className}
                  variant="sphere"
                />
              )}
            />
          </div>
        )}

        {/* ART: 立绘赏析 */}
        {activeTab === 'art' && (
          <div className="tab-content">
            <header className="hero">
              <div className="hero-backdrop hero-backdrop-left" aria-hidden="true" />
              <div className="hero-backdrop hero-backdrop-right" aria-hidden="true" />

              <div className="hero-grid">
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
              </div>
            </header>

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
                  <h2>帝王将相的视觉切片</h2>
                </div>
                <p>七国人物节选。</p>
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
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* RESUME: 角色简历 */}
        {activeTab === 'resume' && printMode && (
          <CharacterResumePrintPage resumes={CHARACTER_RESUMES} theme={theme} onToggleTheme={toggleTheme} />
        )}

        {activeTab === 'resume' && !printMode && selectedResume && (
          <CharacterResumeDetail resume={selectedResume} onBack={backToResumeList} />
        )}

        {activeTab === 'resume' && !printMode && !selectedResume && (
          <div className="tab-content">
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

              <Reveal delay={220}>
                <div className="gallery-summary card-panel">
                  <div>
                    <span className="gallery-summary-label">当前视图</span>
                    <strong>
                      {activeStateMeta.label === '全部' ? '全阵营总览' : `${activeStateMeta.label}国档案`}
                    </strong>
                  </div>
                  <p>
                    当前阵营关键词为"{activeStateMeta.tone}"。
                  </p>
                </div>
              </Reveal>

              <div className="gallery-grid">
                {galleryCharacters.map((item, index) => (
                  <Reveal key={`${activeState}-${item.id}`} delay={80 + (index % 12) * 35}>
                    <article
                      className="gallery-card gallery-card-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => openResume(item)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openResume(item);
                        }
                      }}
                      aria-label={`查看${item.name}角色简历`}
                    >
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
                        <div className="gallery-name-row">
                          <h3>{item.name}</h3>
                          <span className="gallery-original-tag">
                            {item.lit ? <Crown size={14} /> : <Info size={14} />}
                            {item.lit ? '已点亮' : '待点亮'}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ARPG / SLG: Placeholder */}
        {(activeTab === 'arpg' || activeTab === 'slg') && (
          <div className="tab-placeholder">
            <span className="tab-placeholder-icon">
              {activeTab === 'arpg' ? '⚔️' : '🗺️'}
            </span>
            <p>该板块暂未开放，敬请期待</p>
          </div>
        )}
      </div>

      {/* ===== Bottom Bar (bottom 1/4) ===== */}
      <div className="bottom-bar">
        <nav className="nav-row">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isHomeFor = tab.key === activeTab;
            const isActive = activeTab !== 'home' && isHomeFor;

            return (
              <button
                key={tab.key}
                type="button"
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => openTab(tab.key)}
              >
                <Icon size={16} className="nav-btn-icon" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="info-row">
          <div className="info-left">
            <strong>{SITE_COPY.brand}</strong>
            <span>{SITE_COPY.email}</span>
          </div>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '切换浅色主题' : '切换深色主题'}
            title={theme === 'dark' ? '切换浅色主题' : '切换深色主题'}
          >
            <ThemeToggleIcon theme={theme} />
          </button>
          <div className="social-links">
            <a
              className="social-link"
              href="https://www.xiaohongshu.com/user/profile/647831b40000000011002146"
              target="_blank"
              rel="noopener noreferrer"
              title="小红书"
            >
              <XiaohongshuIcon />
            </a>
            <a
              className="social-link"
              href="https://www.douyin.com/user/MS4wLjABAAAAcYeuzZ5Yfirnalaeo6c-VavDD5GR_1WHVNnfz6pvXT4"
              target="_blank"
              rel="noopener noreferrer"
              title="抖音"
            >
              <DouyinIcon />
            </a>
            <a
              className="social-link"
              href="https://space.bilibili.com/3546796550785800"
              target="_blank"
              rel="noopener noreferrer"
              title="B站"
            >
              <BilibiliIcon />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
