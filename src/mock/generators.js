/**
 * 毕业生就业数据模拟器
 * ------------------------------------------------------------------
 * 通过「可复现的伪随机数」生成一份确定性的毕业生就业样本数据集，
 * 保证每次刷新页面得到的数据一致，便于演示与调试。
 * 真实项目中该文件会由后端接口替代（见 src/api/request.js 的适配器设计）。
 */

/** 确定性伪随机数生成器（mulberry32），保证数据可复现 */
function createRandom(seed) {
  let state = seed >>> 0
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 按权重随机取一项：[{ value, weight }] -> value */
function pickWeighted(random, items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  let cursor = random() * total
  for (const item of items) {
    cursor -= item.weight
    if (cursor <= 0) return item.value
  }
  return items[items.length - 1].value
}

/** 区间随机整数（含边界） */
function randomInt(random, min, max) {
  return Math.floor(random() * (max - min + 1)) + min
}

// ------------------------------------------------------------------
// 维度定义
// ------------------------------------------------------------------

export const YEARS = [2021, 2022, 2023, 2024, 2025]
export const DEGREES = ['本科', '硕士', '博士']
export const DESTINATIONS = ['签约就业', '国内升学', '出国出境', '灵活就业', '自主创业', '待就业']
export const INDUSTRIES = [
  '信息技术/互联网',
  '制造业',
  '金融业',
  '教育',
  '医疗健康',
  '建筑/房地产',
  '文化传媒',
  '政府/公共事业',
  '批发零售',
  '其他',
]
export const COMPANY_TYPES = ['国有企业', '民营企业', '外资/合资企业', '党政机关', '事业单位', '其他']
export const COMPANY_SCALES = ['大型(1000人以上)', '中型(300-999人)', '小型(50-299人)', '微型(50人以下)']

/** 各学院的专业构成、行业偏好与薪资系数 */
const COLLEGE_PROFILES = [
  {
    college: '计算机学院',
    majors: ['计算机科学与技术', '软件工程', '人工智能', '大数据管理与应用', '网络工程'],
    industryWeights: [
      ['信息技术/互联网', 60],
      ['金融业', 9],
      ['制造业', 8],
      ['教育', 5],
      ['政府/公共事业', 5],
      ['文化传媒', 4],
      ['医疗健康', 3],
      ['其他', 6],
    ],
    salaryFactor: 1.3,
  },
  {
    college: '电子信息学院',
    majors: ['电子信息工程', '通信工程', '微电子科学与工程', '物联网工程'],
    industryWeights: [
      ['信息技术/互联网', 38],
      ['制造业', 28],
      ['金融业', 6],
      ['政府/公共事业', 7],
      ['教育', 5],
      ['医疗健康', 5],
      ['其他', 11],
    ],
    salaryFactor: 1.14,
  },
  {
    college: '经济管理学院',
    majors: ['工商管理', '会计学', '金融学', '国际经济与贸易', '市场营销'],
    industryWeights: [
      ['金融业', 30],
      ['批发零售', 16],
      ['信息技术/互联网', 12],
      ['制造业', 12],
      ['教育', 8],
      ['政府/公共事业', 8],
      ['文化传媒', 6],
      ['其他', 8],
    ],
    salaryFactor: 1.05,
  },
  {
    college: '机械工程学院',
    majors: ['机械设计制造及其自动化', '车辆工程', '工业设计', '机器人工程'],
    industryWeights: [
      ['制造业', 55],
      ['信息技术/互联网', 12],
      ['建筑/房地产', 8],
      ['政府/公共事业', 6],
      ['教育', 5],
      ['其他', 14],
    ],
    salaryFactor: 1.0,
  },
  {
    college: '外国语学院',
    majors: ['英语', '日语', '翻译', '商务英语'],
    industryWeights: [
      ['教育', 30],
      ['文化传媒', 18],
      ['批发零售', 14],
      ['信息技术/互联网', 12],
      ['金融业', 8],
      ['政府/公共事业', 6],
      ['其他', 12],
    ],
    salaryFactor: 0.9,
  },
  {
    college: '土木工程学院',
    majors: ['土木工程', '工程管理', '建筑学', '给排水科学与工程'],
    industryWeights: [
      ['建筑/房地产', 52],
      ['制造业', 14],
      ['政府/公共事业', 10],
      ['信息技术/互联网', 6],
      ['教育', 5],
      ['其他', 13],
    ],
    salaryFactor: 0.96,
  },
  {
    college: '艺术设计学院',
    majors: ['视觉传达设计', '环境设计', '产品设计', '数字媒体艺术'],
    industryWeights: [
      ['文化传媒', 40],
      ['信息技术/互联网', 20],
      ['教育', 12],
      ['批发零售', 8],
      ['建筑/房地产', 6],
      ['其他', 14],
    ],
    salaryFactor: 0.92,
  },
]

/** 省份 / 城市流向权重，tier 用于薪资系数 */
const REGION_PROFILES = [
  { province: '广东', cities: [['深圳', 1.35, '一线'], ['广州', 1.25, '一线'], ['东莞', 1.0, '二线'], ['佛山', 0.98, '二线']], weight: 17 },
  { province: '北京', cities: [['北京', 1.4, '一线']], weight: 13 },
  { province: '上海', cities: [['上海', 1.38, '一线']], weight: 12 },
  { province: '江苏', cities: [['南京', 1.15, '新一线'], ['苏州', 1.12, '新一线'], ['无锡', 1.0, '二线']], weight: 10 },
  { province: '浙江', cities: [['杭州', 1.18, '新一线'], ['宁波', 1.02, '二线'], ['温州', 0.9, '二线']], weight: 9 },
  { province: '湖北', cities: [['武汉', 1.05, '新一线'], ['宜昌', 0.85, '其他'], ['襄阳', 0.82, '其他']], weight: 8 },
  { province: '四川', cities: [['成都', 1.06, '新一线'], ['绵阳', 0.85, '其他']], weight: 7 },
  { province: '陕西', cities: [['西安', 0.98, '新一线']], weight: 5 },
  { province: '山东', cities: [['青岛', 1.0, '新一线'], ['济南', 0.95, '二线']], weight: 5 },
  { province: '湖南', cities: [['长沙', 0.95, '新一线']], weight: 4 },
  { province: '重庆', cities: [['重庆', 1.0, '新一线']], weight: 4 },
  { province: '安徽', cities: [['合肥', 0.95, '新一线']], weight: 3 },
  { province: '福建', cities: [['厦门', 1.05, '二线'], ['福州', 0.95, '二线']], weight: 3 },
  { province: '河南', cities: [['郑州', 0.9, '新一线']], weight: 3 },
  { province: '辽宁', cities: [['大连', 0.92, '二线'], ['沈阳', 0.9, '二线']], weight: 2 },
  { province: '其他省份', cities: [['其他城市', 0.8, '其他']], weight: 5 },
]

/** 行业薪资系数 */
const INDUSTRY_SALARY_FACTOR = {
  '信息技术/互联网': 1.45,
  '制造业': 1.0,
  '金融业': 1.35,
  '教育': 0.9,
  '医疗健康': 0.98,
  '建筑/房地产': 0.95,
  '文化传媒': 0.86,
  '政府/公共事业': 0.94,
  '批发零售': 0.85,
  '其他': 0.9,
}

/** 学历基础月薪（元） */
const DEGREE_BASE_SALARY = { 本科: 6200, 硕士: 9800, 博士: 15800 }

/** 不同学历的去向倾向（权重） */
const DESTINATION_BY_DEGREE = {
  本科: [
    ['签约就业', 56],
    ['国内升学', 21],
    ['出国出境', 5],
    ['灵活就业', 9],
    ['自主创业', 3],
    ['待就业', 6],
  ],
  硕士: [
    ['签约就业', 68],
    ['国内升学', 9],
    ['出国出境', 6],
    ['灵活就业', 8],
    ['自主创业', 3],
    ['待就业', 6],
  ],
  博士: [
    ['签约就业', 78],
    ['国内升学', 3],
    ['出国出境', 6],
    ['灵活就业', 5],
    ['自主创业', 2],
    ['待就业', 6],
  ],
}

/** 学历人数占比（同一学院内） */
const DEGREE_WEIGHTS = [
  ['本科', 66],
  ['硕士', 26],
  ['博士', 8],
]

/**
 * 各年度就业景气度 [-0.5, 0.5]
 * 正值提高「签约就业」权重、压低「待就业」权重，负值相反，
 * 用于模拟逐届上升的毕业去向落实率趋势。
 */
const YEAR_EMPLOYMENT_BOOST = { 2021: -0.5, 2022: -0.28, 2023: -0.08, 2024: 0.18, 2025: 0.5 }

/** 年度薪资系数：体现逐年上涨的薪酬水平 */
const YEAR_SALARY_FACTOR = { 2021: 0.9, 2022: 0.94, 2023: 0.97, 2024: 1.0, 2025: 1.05 }

const TOTAL_RECORDS = 4600

let cachedRecords = null

/** 生成单条毕业生记录 */
function buildRecord(random, index, year) {
  const collegeProfile = COLLEGE_PROFILES[randomInt(random, 0, COLLEGE_PROFILES.length - 1)]
  const degree = pickWeighted(
    random,
    DEGREE_WEIGHTS.map(([value, weight]) => ({ value, weight })),
  )
  const major = collegeProfile.majors[randomInt(random, 0, collegeProfile.majors.length - 1)]

  // 按年度景气度调整去向权重：景气度高 -> 更多签约就业、更少待就业
  const boost = YEAR_EMPLOYMENT_BOOST[year] ?? 0
  const destination = pickWeighted(
    random,
    DESTINATION_BY_DEGREE[degree].map(([value, weight]) => {
      if (value === '待就业') return { value, weight: weight * (1 - boost) }
      if (value === '签约就业') return { value, weight: weight * (1 + boost * 0.6) }
      return { value, weight }
    }),
  )

  // 按省份权重选择流向（广东、北京、上海等经济发达地区占比更高）
  const regionProfile = pickWeighted(
    random,
    REGION_PROFILES.map((item) => ({ value: item, weight: item.weight })),
  )
  const cityItem = regionProfile.cities[randomInt(random, 0, regionProfile.cities.length - 1)]
  const [city, tierFactor, tier] = cityItem

  const isEmployed = destination === '签约就业' || destination === '灵活就业'

  let industry = null
  let companyType = null
  let companyScale = null
  let salary = 0

  if (isEmployed) {
    industry = pickWeighted(
      random,
      collegeProfile.industryWeights.map(([value, weight]) => ({ value, weight })),
    )

    if (destination === '签约就业') {
      companyType = pickWeighted(random, [
        { value: '国有企业', weight: 22 },
        { value: '民营企业', weight: 42 },
        { value: '外资/合资企业', weight: 12 },
        { value: '党政机关', weight: 7 },
        { value: '事业单位', weight: 11 },
        { value: '其他', weight: 6 },
      ])
    } else {
      companyType = pickWeighted(random, [
        { value: '民营企业', weight: 55 },
        { value: '其他', weight: 45 },
      ])
    }

    companyScale = pickWeighted(random, [
      { value: '大型(1000人以上)', weight: 30 },
      { value: '中型(300-999人)', weight: 32 },
      { value: '小型(50-299人)', weight: 26 },
      { value: '微型(50人以下)', weight: 12 },
    ])

    const base = DEGREE_BASE_SALARY[degree]
    const industryFactor = INDUSTRY_SALARY_FACTOR[industry] ?? 0.9
    const yearFactor = YEAR_SALARY_FACTOR[year] ?? 1
    const noise = 0.85 + random() * 0.3
    const raw = base * industryFactor * tierFactor * collegeProfile.salaryFactor * yearFactor * noise
    salary = Math.round(raw / 100) * 100
    salary = Math.min(42000, Math.max(3500, salary))
  }

  return {
    id: `${year}-${String(index).padStart(4, '0')}`,
    year,
    college: collegeProfile.college,
    major,
    degree,
    destination,
    industry,
    companyType,
    companyScale,
    province: regionProfile.province,
    city,
    cityTier: tier,
    salary,
  }
}

/** 获取全量毕业生样本（带缓存） */
export function getGraduates() {
  if (cachedRecords) return cachedRecords
  const random = createRandom(20251016)
  const records = []
  const perYear = Math.floor(TOTAL_RECORDS / YEARS.length)

  YEARS.forEach((year) => {
    for (let i = 0; i < perYear; i += 1) {
      records.push(buildRecord(random, records.length, year))
    }
  })

  cachedRecords = records
  return records
}

/** 可选筛选项 */
export function getFilterOptions() {
  return {
    years: [...YEARS].sort((a, b) => b - a),
    colleges: COLLEGE_PROFILES.map((item) => item.college),
    degrees: DEGREES,
    majors: COLLEGE_PROFILES.flatMap((item) => item.majors),
    majorsByCollege: COLLEGE_PROFILES.reduce((acc, item) => {
      acc[item.college] = [...item.majors]
      return acc
    }, {}),
    destinations: DESTINATIONS,
    industries: INDUSTRIES,
    companyTypes: COMPANY_TYPES,
    provinces: REGION_PROFILES.map((item) => item.province),
  }
}
