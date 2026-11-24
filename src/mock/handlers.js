/**
 * 接口处理器（真实汇总数据版）
 * ------------------------------------------------------------------
 * 本层不再生成任何模拟明细，而是把 src/data/employmentData.js 中的
 * 公开官方统计数据映射为图表可直接消费的结构。
 *
 * 重要：公开数据只到「汇总指标」层级，没有个体毕业生记录，
 * 因此不提供按人/按专业的明细查询。学历是唯一贯穿所有交叉表的维度，
 * 故全局筛选只保留「学历」。
 */
import {
  SOURCES,
  OVERVIEW,
  DEGREES,
  DESTINATIONS,
  DESTINATION_GROUPS,
  COMPANY_TYPES,
  INDUSTRIES,
  REGIONS,
  CITIES,
  INDUSTRY_WAGES,
  REGION_WAGES,
  REGISTRATION_WAGES,
  NATIONAL_WAGES,
  GRADUATE_START_SALARY,
  METRIC_NOTES,
  LIMITATIONS,
} from '@/data/employmentData.js'

const DEGREE_KEYS = { 博士: 'doctor', 硕士: 'master', 本科: 'bachelor', 专科: 'college' }

/** 解析当前学历范围 */
function resolveScope(params = {}) {
  const name = params.degree && params.degree !== 'all' ? String(params.degree) : null
  const row = name ? DEGREES.find((d) => d.name === name) : null
  return {
    key: row ? DEGREE_KEYS[row.name] : 'overall',
    name: row ? row.name : '全部学历',
    row: row || null,
  }
}

/** 取值：overall 时回退到指定字段（如 DESTINATIONS 用 share） */
function pick(item, key, overallKey = 'overall') {
  return key === 'overall' ? item[overallKey] : item[key]
}

const round1 = (value) => Number(Number(value).toFixed(1))

function shareToCount(share, graduates) {
  return Math.round((share / 100) * graduates)
}

// ------------------------------------------------------------------
// 接口处理器
// ------------------------------------------------------------------

/** 筛选项：仅学历维度可贯穿全部真实交叉表 */
function filters() {
  return { degrees: Object.keys(DEGREE_KEYS) }
}

/** 总览：规模、落实率、去向大类、行业 / 单位性质 / 战略地区前三 */
function overview(params) {
  const { key, name, row } = resolveScope(params)
  const graduates = row ? row.graduates : OVERVIEW.graduates
  const fulfilled = row ? row.fulfilled : OVERVIEW.fulfilled
  const fulfillRate = row ? row.rate : OVERVIEW.fulfillRate

  const groups = DESTINATION_GROUPS.map((g) => {
    const share = pick(g, key, 'share')
    return { name: g.name, share: round1(share), count: shareToCount(share, graduates) }
  })
  const shareOf = (groupName) => groups.find((g) => g.name === groupName)?.share || 0

  const industries = INDUSTRIES.map((i) => ({ name: i.name, value: pick(i, key) })).sort(
    (a, b) => b.value - a.value,
  )
  const companies = COMPANY_TYPES.map((c) => ({ name: c.name, value: pick(c, key) })).sort(
    (a, b) => b.value - a.value,
  )
  const regions = REGIONS.map((r) => ({ name: r.name, value: pick(r, key) })).sort(
    (a, b) => b.value - a.value,
  )

  return {
    year: OVERVIEW.year,
    scope: name,
    graduates,
    fulfilled,
    fulfillRate: Number(fulfillRate.toFixed(2)),
    employedRate: shareOf('单位就业'),
    furtherStudyRate: shareOf('升学'),
    waitingRate: shareOf('待就业'),
    degreeRows: DEGREES,
    destination: groups,
    industryTop: industries.slice(0, 8),
    companyTop: companies.slice(0, 6),
    regionTop: regions,
    topIndustry: industries[0]?.name || '—',
    topCompany: companies[0]?.name || '—',
    topRegion: regions[0]?.name || '—',
  }
}

/** 就业去向：去向大类、明细、分学历结构 */
function destination(params) {
  const { key, name, row } = resolveScope(params)
  const graduates = row ? row.graduates : OVERVIEW.graduates

  return {
    scope: name,
    graduates,
    degrees: DEGREES,
    groups: DESTINATION_GROUPS.map((g) => ({
      name: g.name,
      count: g.count,
      share: g.share,
      doctor: g.doctor,
      master: g.master,
      bachelor: g.bachelor,
      college: g.college,
      selected: round1(pick(g, key, 'share')),
    })),
    details: DESTINATIONS.map((d) => ({
      name: d.name,
      group: d.group,
      count: d.count,
      share: d.share,
      doctor: d.doctor,
      master: d.master,
      bachelor: d.bachelor,
      college: d.college,
      selected: round1(pick(d, key, 'share')),
    })),
  }
}

/** 行业分布：排行 + 学历×行业矩阵 + 行业年平均工资参照 */
function industry(params) {
  const { key, name } = resolveScope(params)
  return {
    scope: name,
    industries: INDUSTRIES.map((i) => ({
      name: i.name,
      overall: i.overall,
      doctor: i.doctor,
      master: i.master,
      bachelor: i.bachelor,
      college: i.college,
      selected: round1(pick(i, key)),
    })).sort((a, b) => b.selected - a.selected),
    wages: [...INDUSTRY_WAGES].sort((a, b) => b.nonPrivate - a.nonPrivate),
  }
}

/** 薪资水平：城镇单位工资（全国口径）+ 毕业生起薪参照 */
function salary() {
  return {
    industry: [...INDUSTRY_WAGES].sort((a, b) => b.nonPrivate - a.nonPrivate),
    region: REGION_WAGES,
    registration: REGISTRATION_WAGES,
    national: NATIONAL_WAGES,
    startSalary: GRADUATE_START_SALARY,
  }
}

/** 地域流向：国家战略地区 + 留桂城市 + 区域工资参照 */
function region(params) {
  const { key, name } = resolveScope(params)
  return {
    scope: name,
    regions: REGIONS.map((r) => ({
      name: r.name,
      overall: r.overall,
      doctor: r.doctor,
      master: r.master,
      bachelor: r.bachelor,
      college: r.college,
      selected: round1(pick(r, key)),
    })).sort((a, b) => b.selected - a.selected),
    cities: CITIES,
    wages: REGION_WAGES,
  }
}

/** 单位性质：分布 + 学历×单位性质矩阵 + 登记注册类型工资 */
function company(params) {
  const { key, name } = resolveScope(params)
  return {
    scope: name,
    types: COMPANY_TYPES.map((t) => ({
      name: t.name,
      overall: t.overall,
      doctor: t.doctor,
      master: t.master,
      bachelor: t.bachelor,
      college: t.college,
      selected: round1(pick(t, key)),
    })).sort((a, b) => b.selected - a.selected),
    registration: REGISTRATION_WAGES,
  }
}

/** 数据来源、指标口径与局限 */
function sources() {
  return { sources: SOURCES, notes: METRIC_NOTES, limitations: LIMITATIONS }
}

/** 暴露给适配器的路由表：'METHOD /path' -> handler */
export function createRouterHandlers() {
  return {
    'GET /filters': filters,
    'GET /overview': overview,
    'GET /destination': destination,
    'GET /industry': industry,
    'GET /salary': salary,
    'GET /region': region,
    'GET /company': company,
    'GET /sources': sources,
  }
}
