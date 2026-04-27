import React, { useEffect, useMemo, useRef, useState } from 'react';
import {  Bot,
  Crown,
  GalleryVerticalEnd,
  Mail,  Sparkles,
  SwatchBook,
} from 'lucide-react';
import './App.css';

const BASE_IMG_URL = 'https://cnb.cool/catfishzone/san-guo_agents/-/git/raw/main/task-002-imgs/';
const IMAGE_EXTENSIONS = ['webp', 'png'];
// const STATES = [
//   {
//     key: 'all',
//     label: '全部',
//     tone: '总览',
//     names: [],
//   },
//   {
//     key: 'chu',
//     label: '楚',
//     tone: '瑰丽深红',
//     names: ['楚怀王', '楚顷襄王', '楚考烈王', '楚幽王', '楚哀王', '楚王负刍', '熊启', '昭阳', '景翠', '唐昧', '屈原', '召滑', '昭鱼', '子兰', '靳尚', '陈轸', '庄辛', '景阳', '淖齿', '景鲤', '临武君', '黄歇', '李园', '李嫣', '朱英', '项燕', '项梁', '范增', '汗明', '庄蹻', '宋玉', '景差', '唐勒'],
//   },
//   {
//     key: 'han',
//     label: '韩',
//     tone: '墨金秩序',
//     names: ['韩襄王', '韩釐王', '韩桓惠王', '韩王安', '陈筮', '公仲侈', '韩公叔', '韩公仲', '暴鸢', '韩聂', '韩侈', '韩辰', '张开地', '冯亭', '张平', '靳黈', '韩阳', '韩非', '内史腾', '张良', '史疾', '韩明', '韩博', '韩熙'],
//   },
//   {
//     key: 'qi',
//     label: '齐',
//     tone: '青金理性',
//     names: ['齐湣王', '齐襄王', '齐王建', '君王后', '田婴', '匡章', '齐貌辨', '田文', '冯谖', '触子', '达子', '田骈', '尹文', '吕礼', '王蠋', '太史敫', '田单', '苏厉', '貂勃', '苏秦', '王孙贾', '后胜', '邹克', '田璆', '谭拾子', '淳于越', '鲁仲连', '邹衍'],
//   },
//   {
//     key: 'qin',
//     label: '秦',
//     tone: '鎏金黑曜',
//     names: ['秦昭襄王', '秦孝文王', '秦庄襄王', '秦王政', '芈八子', '司马错', '魏冉', '芈戎', '嬴悝', '嬴芾', '任鄙', '向寿', '李崇', '李瑶', '寿烛', '范雎', '蔡泽', '杜仓', '吕不韦', '甘罗', '姚贾', '顿弱', '司空马', '茅焦', '李斯', '赵高', '阎乐', '赵成', '陈驰', '冯去疾', '冯劫', '蒙毅', '喜', '白起', '司马靳', '尉缭', '王龁', '郑安平', '王陵', '张唐', '胡阳', '王翦', '蒙骜', '蒙武', '桓齮', '樊於期', '杨端和', '王贲', '李信', '辛胜', '羌瘣', '蒙恬', '冯毋择', '章邯', '司马欣', '董翳', '嫪毐', '成蟜'],
//   },
//   {
//     key: 'wei',
//     label: '魏',
//     tone: '琥珀暮色',
//     names: ['魏襄王', '魏昭王', '魏安釐王', '魏景湣王', '魏王假', '公孙衍', '芒卯', '魏齐', '魏无忌', '龙阳君', '晋鄙', '唐雎', '须贾', '范座', '段干崇', '孔斌', '缩高', '新垣衍', '侯嬴', '朱亥', '张耳', '陈余', '毛公', '薛公', '魏牟'],
//   },
//   {
//     key: 'yan',
//     label: '燕',
//     tone: '霜蓝锋芒',
//     names: ['燕昭王', '燕惠王', '燕武成王', '燕孝王', '燕王喜', '太子丹', '张魁', '乐毅', '郭隗', '秦开', '骑劫', '公孙操', '荣蚠', '剧辛', '乐间', '蔡鸟', '栗腹', '卿秦', '将渠', '鞠武', '宋意', '田光', '高渐离', '荆轲', '秦舞阳', '燕市狗屠'],
//   },
//   {
//     key: 'zhao',
//     label: '赵',
//     tone: '玉石银白',
//     names: ['赵武灵王', '赵惠文王', '赵孝成王', '赵悼襄王', '赵幽缪王', '代王嘉', '肥义', '赵章', '田不礼', '李兑', '公子成', '富丁', '赵威后', '触龙', '长安君', '赵奢', '许历', '廉颇', '傅抵', '赵括', '庞煖', '李牧', '赵豹', '赵胜', '缪贤', '蔺相如', '虞卿', '毛遂', '皮相国', '希写', '建信君', '赵敖', '郭开', '唐玖', '韩仓', '楼昌', '郑朱', '苏射', '傅豹', '王容', '李同', '司马尚', '赵葱', '颜聚', '扈辄', '乐乘', '庆舍', '魏加', '李左车'],
//   },
// ];
const STATES = [
  {
    key: 'all',
    label: '全部',
    tone: '总览',
    names: [],
  },
  {
    key: 'chu',
    label: '楚',
    tone: '瑰丽深红',
    names: [
      { code: '001', name: '楚怀王' }, { code: '002', name: '楚顷襄王' }, { code: '003', name: '楚考烈王' },
      { code: '004', name: '楚幽王' }, { code: '005', name: '楚哀王' }, { code: '006', name: '楚王负刍' },
      { code: '009', name: '昭阳' }, { code: '010', name: '景翠' }, { code: '011', name: '唐昧' },
      { code: '012', name: '慎到' }, { code: '013', name: '屈原' }, { code: '014', name: '召滑' },
      { code: '015', name: '昭鱼' }, { code: '016', name: '子兰' }, { code: '017', name: '靳尚' },
      { code: '018', name: '陈轸' }, { code: '019', name: '庄辛' }, { code: '020', name: '景阳' },
      { code: '021', name: '景鲤' }, { code: '022', name: '淖齿' }, { code: '023', name: '临武君' },
      { code: '024', name: '黄歇' }, { code: '025', name: '李园' }, { code: '026', name: '李嫣' },
      { code: '027', name: '朱英' }, { code: '028', name: '项燕' }, { code: '029', name: '项梁' },
      { code: '030', name: '范增' }, { code: '031', name: '汗明' }, { code: '032', name: '庄蹻' },
      { code: '033', name: '宋玉' }, { code: '034', name: '景差' }, { code: '035', name: '唐勒' },
      { code: '036', name: '熊启' },
    ],
  },
  {
    key: 'han',
    label: '韩',
    tone: '墨金秩序',
    names: [
      { code: '038', name: '韩威侯' }, { code: '039', name: '韩襄王' }, { code: '040', name: '韩釐王' },
      { code: '041', name: '韩桓惠王' }, { code: '042', name: '韩王安' }, { code: '044', name: '韩玘' },
      { code: '045', name: '申差' }, { code: '046', name: '尚靳' }, { code: '047', name: '张翠' },
      { code: '048', name: '陈筮' }, { code: '049', name: '公仲侈' }, { code: '050', name: '韩公叔' },
      { code: '051', name: '韩公仲' }, { code: '052', name: '暴鸢' }, { code: '053', name: '韩聂' },
      { code: '054', name: '韩侈' }, { code: '055', name: '韩辰' }, { code: '056', name: '张开地' },
      { code: '057', name: '冯亭' }, { code: '058', name: '张平' }, { code: '059', name: '靳黈' },
      { code: '060', name: '韩阳' }, { code: '061', name: '韩非' }, { code: '062', name: '内史腾' },
      { code: '063', name: '张良' }, { code: '064', name: '史疾' }, { code: '065', name: '韩明' },
      { code: '066', name: '韩博' }, { code: '067', name: '韩熙' },
    ],
  },
  {
    key: 'qi',
    label: '齐',
    tone: '青金理性',
    names: [
      { code: '069', name: '齐宣王' }, { code: '070', name: '齐湣王' }, { code: '071', name: '齐襄王' },
      { code: '072', name: '齐王建' }, { code: '073', name: '君王后' }, { code: '074', name: '田婴' },
      { code: '081', name: '匡章' }, { code: '082', name: '齐貌辨' }, { code: '083', name: '田文' },
      { code: '084', name: '冯谖' }, { code: '085', name: '触子' }, { code: '086', name: '达子' },
      { code: '087', name: '田骈' }, { code: '088', name: '尹文' }, { code: '089', name: '王斗' },
      { code: '090', name: '颜斶' }, { code: '091', name: '吕礼' }, { code: '092', name: '王蠋' },
      { code: '093', name: '太史敫' }, { code: '094', name: '田单' }, { code: '095', name: '苏厉' },
      { code: '096', name: '貂勃' }, { code: '097', name: '苏秦' }, { code: '098', name: '王孙贾' },
      { code: '099', name: '后胜' }, { code: '100', name: '邹克' }, { code: '101', name: '田璆' },
      { code: '102', name: '谭拾子' }, { code: '103', name: '淳于越' }, { code: '104', name: '鲁仲连' },
      { code: '105', name: '邹衍' },
    ],
  },
  {
    key: 'qin',
    label: '秦',
    tone: '鎏金黑曜',
    names: [
      { code: '107', name: '秦惠文王' }, { code: '108', name: '秦武王' }, { code: '109', name: '秦昭襄王' },
      { code: '110', name: '秦孝文王' }, { code: '111', name: '秦庄襄王' }, { code: '112', name: '秦王政' },
      { code: '114', name: '张仪' }, { code: '115', name: '芈八子' }, { code: '116', name: '司马错' },
      { code: '117', name: '樗里疾' }, { code: '118', name: '魏冉' }, { code: '119', name: '芈戎' },
      { code: '120', name: '嬴悝' }, { code: '121', name: '嬴芾' }, { code: '122', name: '甘茂' },
      { code: '123', name: '乌获' }, { code: '124', name: '孟贲' }, { code: '125', name: '任鄙' },
      { code: '126', name: '向寿' }, { code: '127', name: '李崇' }, { code: '128', name: '李瑶' },
      { code: '129', name: '寿烛' }, { code: '130', name: '范雎' }, { code: '131', name: '蔡泽' },
      { code: '132', name: '杜仓' }, { code: '133', name: '吕不韦' }, { code: '134', name: '甘罗' },
      { code: '135', name: '姚贾' }, { code: '136', name: '顿弱' }, { code: '137', name: '司空马' },
      { code: '138', name: '茅焦' }, { code: '139', name: '李斯' }, { code: '140', name: '赵高' },
      { code: '141', name: '阎乐' }, { code: '142', name: '赵成' }, { code: '143', name: '陈驰' },
      { code: '144', name: '冯去疾' }, { code: '145', name: '冯劫' }, { code: '146', name: '蒙毅' },
      { code: '147', name: '喜' }, { code: '148', name: '白起' }, { code: '149', name: '司马靳' },
      { code: '150', name: '尉缭' }, { code: '151', name: '王龁' }, { code: '152', name: '郑安平' },
      { code: '153', name: '王陵' }, { code: '154', name: '张唐' }, { code: '155', name: '胡阳' },
      { code: '156', name: '王翦' }, { code: '157', name: '蒙骜' }, { code: '158', name: '蒙武' },
      { code: '159', name: '桓齮' }, { code: '160', name: '樊於期' }, { code: '161', name: '杨端和' },
      { code: '162', name: '王贲' }, { code: '163', name: '李信' }, { code: '164', name: '辛胜' },
      { code: '165', name: '羌瘣' }, { code: '166', name: '蒙恬' }, { code: '167', name: '冯毋择' },
      { code: '168', name: '章邯' }, { code: '169', name: '司马欣' }, { code: '170', name: '董翳' },
      { code: '171', name: '嫪毐' }, { code: '172', name: '成蟜' },
    ],
  },
  {
    key: 'wei',
    label: '魏',
    tone: '琥珀暮色',
    names: [
      { code: '174', name: '魏襄王' }, { code: '175', name: '魏昭王' }, { code: '176', name: '魏安釐王' },
      { code: '177', name: '魏景湣王' }, { code: '178', name: '魏王假' }, { code: '183', name: '公孙衍' },
      { code: '184', name: '惠施' }, { code: '186', name: '田需' }, { code: '188', name: '芒卯' },
      { code: '189', name: '魏齐' }, { code: '190', name: '魏无忌' }, { code: '191', name: '龙阳君' },
      { code: '192', name: '晋鄙' }, { code: '193', name: '唐雎' }, { code: '194', name: '须贾' },
      { code: '195', name: '范座' }, { code: '196', name: '段干崇' }, { code: '197', name: '孔斌' },
      { code: '198', name: '缩高' }, { code: '199', name: '新垣衍' }, { code: '200', name: '侯嬴' },
      { code: '201', name: '朱亥' }, { code: '202', name: '张耳' }, { code: '203', name: '陈余' },
      { code: '204', name: '毛公' }, { code: '205', name: '薛公' }, { code: '206', name: '魏牟' },
    ],
  },
  {
    key: 'yan',
    label: '燕',
    tone: '霜蓝锋芒',
    names: [
      { code: '207', name: '燕王哙' }, { code: '208', name: '子之' }, { code: '209', name: '燕昭王' },
      { code: '210', name: '燕惠王' }, { code: '211', name: '燕武成王' }, { code: '212', name: '燕孝王' },
      { code: '213', name: '燕王喜' }, { code: '214', name: '太子丹' }, { code: '215', name: '市被' },
      { code: '216', name: '鹿毛寿' }, { code: '217', name: '太子平' }, { code: '218', name: '张魁' },
      { code: '219', name: '乐毅' }, { code: '220', name: '郭隗' }, { code: '221', name: '秦开' },
      { code: '222', name: '骑劫' }, { code: '223', name: '公孙操' }, { code: '224', name: '荣蚠' },
      { code: '225', name: '剧辛' }, { code: '226', name: '乐间' }, { code: '227', name: '蔡鸟' },
      { code: '228', name: '栗腹' }, { code: '229', name: '卿秦' }, { code: '230', name: '将渠' },
      { code: '231', name: '鞠武' }, { code: '232', name: '宋意' }, { code: '233', name: '田光' },
      { code: '234', name: '高渐离' }, { code: '235', name: '荆轲' }, { code: '236', name: '秦舞阳' },
      { code: '237', name: '燕市狗屠' },
    ],
  },
  {
    key: 'zhao',
    label: '赵',
    tone: '玉石银白',
    names: [
      { code: '238', name: '赵武灵王' }, { code: '239', name: '赵惠文王' }, { code: '240', name: '赵孝成王' },
      { code: '241', name: '赵悼襄王' }, { code: '242', name: '赵幽缪王' }, { code: '243', name: '代王嘉' },
      { code: '244', name: '肥义' }, { code: '245', name: '赵章' }, { code: '246', name: '田不礼' },
      { code: '247', name: '李兑' }, { code: '248', name: '公子成' }, { code: '249', name: '富丁' },
      { code: '250', name: '赵威后' }, { code: '251', name: '触龙' }, { code: '252', name: '长安君' },
      { code: '253', name: '赵奢' }, { code: '254', name: '许历' }, { code: '255', name: '廉颇' },
      { code: '256', name: '傅抵' }, { code: '257', name: '赵括' }, { code: '258', name: '庞煖' },
      { code: '259', name: '李牧' }, { code: '260', name: '赵豹' }, { code: '261', name: '赵胜' },
      { code: '262', name: '缪贤' }, { code: '263', name: '蔺相如' }, { code: '264', name: '虞卿' },
      { code: '265', name: '毛遂' }, { code: '266', name: '皮相国' }, { code: '267', name: '希写' },
      { code: '268', name: '建信君' }, { code: '269', name: '赵敖' }, { code: '270', name: '郭开' },
      { code: '271', name: '唐玖' }, { code: '272', name: '韩仓' }, { code: '273', name: '楼昌' },
      { code: '274', name: '郑朱' }, { code: '275', name: '苏射' }, { code: '276', name: '傅豹' },
      { code: '277', name: '王容' }, { code: '278', name: '李同' }, { code: '279', name: '司马尚' },
      { code: '280', name: '赵葱' }, { code: '281', name: '颜聚' }, { code: '282', name: '扈辄' },
      { code: '283', name: '乐乘' }, { code: '284', name: '庆舍' }, { code: '285', name: '魏加' },
      { code: '286', name: '李左车' },
    ],
  },
];


const HIGHLIGHTS = [
  '赵武灵王',
  '屈原',
  '韩非',
  '蒙武',
  '魏无忌',
  '骑劫',
  '芈八子',
  '田单',
];

const INTRO_METRICS = [
  { label: '原创角色', value: '266', note: '涵盖君王、文臣、武将' },
  { label: '设计方式', value: 'AI+', note: 'AI 设计与人工视觉统筹' },];

function buildImageUrl(code, name, extension = 'webp') {
  return `${BASE_IMG_URL}${code}_${encodeURIComponent(name)}.${extension}`;
}

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.16 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
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

function CharacterImage({ code, name, className = '' }) {
  const [extensionIndex, setExtensionIndex] = useState(0);

  useEffect(() => {
    setExtensionIndex(0);
  }, [code, name]);

  const extension = IMAGE_EXTENSIONS[extensionIndex] ?? IMAGE_EXTENSIONS[0];
  const imageSrc = buildImageUrl(code, name, extension);

  const handleError = () => {
    setExtensionIndex((current) => {
      const nextIndex = current + 1;
      return nextIndex < IMAGE_EXTENSIONS.length ? nextIndex : current;
    });
  };

  return (
    <img
      src={imageSrc}
      alt={name}
      loading="lazy"
      onError={handleError}
      onContextMenu={(e) => e.preventDefault()}
      draggable="false"
      onDragStart={(e) => e.preventDefault()}
      className={className}
    />
  );
}

// function buildCharacters() {
//   let index = 0;

//   return STATES.slice(1).flatMap((state) =>
//     state.names.map((name) => {
//       const code = String(index).padStart(3, '0');
//       index += 1;
//       return {
//         id: `${code}_${name}`,
//         code,
//         name,
//         stateKey: state.key,
//         stateLabel: `${state.label}国`,
//         tone: state.tone,
//         image: `${BASE_IMG_URL}${code}_${encodeURIComponent(name)}.png`,
//         note: '原创角色·AI辅助设计',
//       };
//     }),
//   );
// }

function buildCharacters() {
  return STATES.slice(1).flatMap((state) =>
    state.names.map(({ code, name }) => {
      return {
        id: `${code}_${name}`,
        code,
        name,
        stateKey: state.key,
        stateLabel: `${state.label}国`,
        tone: state.tone,
        note: '王道爵士',
      };
    }),
  );
}

const CHARACTERS = buildCharacters();

function App() {
  const [activeState, setActiveState] = useState('all');

  const featuredCharacters = useMemo(
    () => HIGHLIGHTS.map((name) => CHARACTERS.find((item) => item.name === name)).filter(Boolean),
    [],
  );

  const galleryCharacters = useMemo(() => {
    if (activeState === 'all') {
      return CHARACTERS;
    }

    return CHARACTERS.filter((item) => item.stateKey === activeState);
  }, [activeState]);

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
              <span>视觉设计博客</span>
            </div>
            <h1>
            王道爵士 
            </h1>
            <h4>
            core2023@qq.com 
            </h4>
            <p className="hero-summary">
              以简洁优雅的视觉语言，以颜色划分阵营，以道具和动作划分性格与身份，呈现战国后期的七国历史人物群像。
            </p>
            <div className="hero-tags">
              <span>视觉设计</span>
              <span>原创角色·AI辅助设计</span>            </div>
          </div>

          <div className="hero-meta card-panel">
            <div className="meta-block">
              <div className="eyebrow subtle">
                <Bot size={16} />
                <span>原创角色说明</span>
              </div>
              <p>
                展示 AI 设计效果和后续人工视觉统筹，
              </p>
              <p>
                承接光荣三国志的厚涂写实插画风格，
              </p>
              <p>
                参考汉服里的直裾袍(战国袍)、汉甲里的宋制盔甲，进行多样化设计。
              </p>
            </div>
          </div>
        </Reveal>
      </header>

      <main className="content-shell">
        <section className="metrics-grid">
          {INTRO_METRICS.map((metric, index) => (
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
            <p>
              可以按国家筛选查看。
            </p>
          </Reveal>

          <Reveal delay={140}>
            <div className="filter-bar card-panel">
              {STATES.map((state) => (
                <button
                  key={state.key}
                  type="button"
                  className={state.key === activeState ? 'filter-chip active' : 'filter-chip'}
                  onClick={() => setActiveState(state.key)}
                >
                  {state.label}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="gallery-grid">
            {galleryCharacters.map((item, index) => (
              <Reveal key={`${activeState}-${item.id}`} delay={(index % 12) * 35}>
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
                    <p>王道爵士</p>
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
          <strong>王道爵士</strong>
          <p>视觉设计 / 原创角色档案</p>
        </div>
        <a href="mailto:core2023@qq.com">
          <Mail size={16} />
          core2023@qq.com
        </a>
      </footer>
    </div>
  );
}

export default App;
