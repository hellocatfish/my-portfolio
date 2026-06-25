import { STATES } from './portfolioData.js';
import { buildCharacterResumes } from '../utils/characterResume.js';

// Generator/tooling source only. Runtime appreciation pages read the edited data from
// characterAppreciations_preview.js so manual calibration is not overwritten by this algorithm.
const LOCAL_APPRECIATION_DIR = `${import.meta.env.BASE_URL}images/appreciations/`;
const CDN_APPRECIATION_DIR = 'https://zhanguo-imgs-1379320306.cos.ap-shanghai.myqcloud.com/zhanguo_heroes_appreciations/';
const DEFAULT_APPRECIATION_BACKGROUND = 'placeholder-general.webp';
const LOCAL_DEFAULT_APPRECIATION = `${import.meta.env.BASE_URL}${DEFAULT_APPRECIATION_BACKGROUND}`;
const CDN_DEFAULT_APPRECIATION = `${CDN_APPRECIATION_DIR}${DEFAULT_APPRECIATION_BACKGROUND}`;

const APPRECIATION_FILE_OVERRIDES = {
  '熊启': '熊启2026-appreciations.webp',
  '匡章': '匡章2026-appreciations.webp',
  '秦昭襄王': '秦昭王2025-appreciations.webp',
  '秦王政': '秦始皇2025-appreciations.webp',
  '张仪': '张仪2026-appreciations.webp',
  '吕不韦': '吕不韦2026-appreciations.webp',
  '白起': '白起2026-appreciations.webp',
  '辛胜': '辛胜2025-crop-appreciations.webp',
  '嫪毐': '嫪毐2025-crop-appreciations.webp',
  '晋鄙': '晋鄙2026-appreciations.webp',
  '市被': '市被2026-appreciations.webp',
  '乐毅': '乐毅2026-appreciations.webp',
  '乐间': '乐间2026-appreciations.webp',
  '田光': '田光2026-appreciations.webp',
  '高渐离': '高渐离2026-appreciations.webp',
  '荆轲': '荆轲2026-appreciations.webp',
  '秦舞阳': '秦舞阳2026-appreciations.webp',
  '燕市狗屠': '燕市狗屠2026-appreciations.webp',
  '赵孝成王': '赵孝成王2026-appreciations.webp',
  '郑朱': '郑朱2026-appreciations.webp',
};

export const APPRECIATION_TAGS = {
  color: '色彩设计',
  background: '背景设计',
  action: '动作设计',
  head: '头像设计',
  prop: '道具设计',
  outfit: '服饰盔甲设计',
};

const STATE_VISUAL_RULES = {
  chu: {
    color: '楚国阵营色为红色，因此在人物主色或局部纹样中加入赤红、绛红、暗金等元素，强化楚地巫风、贵族气质和南方浪漫感。',
    background: '背景适合使用云气、江水、宫阙、山泽或战场烟尘，把楚国人物的南方空间感与历史处境压入画面。',
  },
  han: {
    color: '韩国阵营色为绿色，因此人物视觉中加入青绿、墨绿或冷灰绿元素，表现法术、城垒和夹缝求存的精密感。',
    background: '背景适合使用城墙、朝堂阴影、竹简、军械或关隘，突出韩国在列强之间的紧张秩序。',
  },
  qi: {
    color: '齐国尚紫，因此人物必须加入紫色主题元素，用烟紫、玄紫、紫金等层次区分王室、谋臣与将领的华贵气质。',
    background: '背景适合使用临淄宫室、稷下学宫、海岱风物或田氏王权符号，形成华贵而机敏的齐国识别。',
  },
  qin: {
    color: '秦国阵营色为黑色，因此人物视觉以玄黑、冷铁、深红点缀为主，强调法度、军功和强权推进的压迫感。',
    background: '背景适合使用关中城阙、黑旗军阵、尘土、法令竹简或边塞暗色天空，表现秦制扩张的硬度。',
  },
  wei: {
    color: '魏国阵营色为蓝色，因此人物视觉加入青蓝、深蓝、银灰或冷金细节，表现中原旧霸的理性与贵族余韵。',
    background: '背景适合使用大梁宫室、黄河水气、门客庭院或魏武卒阵列，体现魏国制度和士人传统。',
  },
  yan: {
    color: '燕国阵营色为白色，因此人物视觉以素白、寒灰、霜蓝为主，可用少量暗红制造北地肃杀和刺客叙事。',
    background: '背景适合使用北风、雪原、燕台、边塞或市井暗巷，形成清冷、孤绝的画面气质。',
  },
  zhao: {
    color: '赵国阵营色为黄色，因此人物视觉加入土黄、金黄、皮革和胡服色块，强化骑射改革与边地军风。',
    background: '背景适合使用邯郸宫阙、胡服骑射、长平战场或边塞旷野，表现赵国的机动、刚烈与悲壮。',
  },
};

const ROLE_VISUAL_RULES = {
  王侯: {
    action: '动作以端立、按剑、执圭、回望疆土或居中凝视为主，把君主的权力、迟疑或决断转化为稳定构图。',
    head: '头像设计强调威仪和克制，眼神需要能承载国家命运，眉眼可加入审视、疲惫、强势或忧惧等细节。',
    prop: '道具优先使用冠冕、玉圭、玺印、王旗、案几、剑或诏令，让王侯身份在画面中直接成立。',
    outfit: '服饰盔甲以冕服、宽袍、礼制纹样、肩甲、玉组佩或金属边饰为主，突出王室层级和政治中心地位。',
  },
  文人: {
    action: '动作以持简、进言、拈须、垂目思索、侧身辩论或展开地图为主，把谋略和言辞转化为手势。',
    head: '头像设计重在眼神和嘴角，可表现冷静、锋利、忧思、孤高、游说时的自信或权谋人物的隐忍。',
    prop: '道具优先使用竹简、策书、地图、印绶、酒器、羽扇或门客令牌，暗示其学术、外交或权谋经历。',
    outfit: '服饰盔甲以深衣、直裾、宽袖、冠带和细密纹样为主，减少重甲比例，突出士人阶层与谋臣气质。',
  },
  武人: {
    action: '动作以持戈、按剑、迈步出阵、回身督战、蓄力挥击或半身戒备为主，突出战场行动正在发生。',
    head: '头像设计强调眉眼、颧骨和下颌的硬度，表情可偏严肃、警觉、坚忍或久战后的疲惫。',
    prop: '道具优先使用长戈、剑、盾、战旗、虎符、盔缨或军鼓，把战功、统兵和迎敌状态落到器物上。',
    outfit: '服饰盔甲突出甲片、护肩、护腕、革带、头盔和战损痕迹，让军事履历成为人物外形结构。',
  },
};

const ROLE_NOUNS = {
  王侯: '王侯',
  文人: '文臣谋士',
  武人: '武将',
};

function getAppreciationFileName(name) {
  return APPRECIATION_FILE_OVERRIDES[name] ?? `${name}2025-appreciations.webp`;
}

function buildRoleMap() {
  return new Map(
    STATES.slice(1).flatMap((state) =>
      state.names.map((character) => [
        character.name,
        {
          role: character.role,
          liege: character.liege,
          tone: state.tone,
        },
      ]),
    ),
  );
}

function pickSentence(text) {
  return String(text ?? '').split(/[。！？]/).find(Boolean) ?? '';
}

function buildAppreciationContent(resume, meta) {
  const stateRule = STATE_VISUAL_RULES[resume.stateKey];
  const roleRule = ROLE_VISUAL_RULES[meta.role] ?? ROLE_VISUAL_RULES.文人;
  const roleNoun = ROLE_NOUNS[meta.role] ?? '角色';
  const bioPoint = pickSentence(resume.bio);
  const liegeText = meta.liege ? `，归属${meta.liege}人物谱系` : '';

  return {
    color: `${resume.name}是${resume.stateLabel}${roleNoun}${liegeText}。${stateRule.color}`,
    background: `${bioPoint ? `${resume.name}${bioPoint.replace(resume.name, '')}。` : ''}${stateRule.background}`,
    action: `${roleRule.action}${bioPoint ? `动作气质需要呼应“${bioPoint}”这一人物记忆点。` : ''}`,
    head: `${roleRule.head}${resume.quote ? `神态可以扣住台词${resume.quote}，让表情更接近其历史印象。` : ''}`,
    prop: roleRule.prop,
    outfit: roleRule.outfit,
  };
}

export function buildAppreciationCandidates(fileName, priority = 'local') {
  const defaultCandidates = priority === 'cdn'
    ? [CDN_DEFAULT_APPRECIATION, LOCAL_DEFAULT_APPRECIATION]
    : [LOCAL_DEFAULT_APPRECIATION, CDN_DEFAULT_APPRECIATION];

  if (!fileName || fileName === DEFAULT_APPRECIATION_BACKGROUND) {
    return defaultCandidates;
  }

  const local = `${LOCAL_APPRECIATION_DIR}${encodeURIComponent(fileName)}`;
  const cdn = `${CDN_APPRECIATION_DIR}${encodeURIComponent(fileName)}`;
  return priority === 'cdn'
    ? [cdn, local, ...defaultCandidates]
    : [local, cdn, ...defaultCandidates];
}

function buildCharacterAppreciations() {
  const roleByName = buildRoleMap();

  return buildCharacterResumes().map((resume) => {
    const meta = roleByName.get(resume.name) ?? {};
    const litPortrait = getAppreciationFileName(resume.name);

    return {
      id: resume.id,
      code: resume.code,
      name: resume.name,
      country: resume.country,
      stateKey: resume.stateKey,
      stateLabel: resume.stateLabel,
      title: resume.title,
      role: meta.role ?? '',
      stateColor: resume.stateColor,
      background: DEFAULT_APPRECIATION_BACKGROUND,
      lit_Portrait: litPortrait,
      lit: resume.lit,
      bio: resume.bio,
      quote: resume.quote,
      appreciations_tag: APPRECIATION_TAGS,
      appreciations_content: buildAppreciationContent(resume, meta),
    };
  });
}

export const CHARACTER_APPRECIATIONS = buildCharacterAppreciations();
export const CHARACTER_APPRECIATION_MAP = new Map(CHARACTER_APPRECIATIONS.map((item) => [item.code, item]));

export function getCharacterAppreciationByCode(code) {
  return CHARACTER_APPRECIATION_MAP.get(code) ?? null;
}
