/**
 * Mock 接口处理器
 * ------------------------------------------------------------------
 * 每个 handler 对应一个 RESTful 接口，接收筛选参数并返回聚合后的统计结果。
 * 这一层承担「数据映射」职责：把原始明细数据加工成图表可直接消费的结构。
 */
import { getGraduates, getFilterOptions } from './generators.js'

/** 就业：签约就业 + 灵活就业 */
const EMPLOYED = ['签约就业', '灵活就业']
/** 去向落实：除「待就业」外全部计入 */
const FULFILLED = ['签约就业', '国内升学', '出国出境', '灵活就业', '自主创业']

/** 通用筛选 */
function applyFilters(records, params = {}) {
  const {
    year = 'all',
    college = 'all',
    degree = 'all',
    major = 'all',
    province = 'all',
    industry = 'all',
    companyType = 'all',
    destination = 'all',
    keyword = '',
  } = params

  return records.filter((r) => {
    if (year !== 'all' && r.year !== Number(year)) return false
    if (college !== 'all' && r.college !== college) return false
    if (degree !== 'all' && r.degree !== degree) return false
    if (major !== 'all' && r.major !== major) return false
    if (province !== 'all' && r.province !== province) return false
    if (industry !== 'all' && r.industry !== industry) return false
    if (companyType !== 'all' && r.companyType !== companyType) return false
    if (destination !== 'all' && r.destination !== destination) return false
    if (keyword) {
      const kw = String(keyword).trim().toLowerCase()
      if (kw && !`${r.college}${r.major}${r.city}`.toLowerCase().includes(kw)) return false
    }
    return true
  })
}

/** 求平均（忽略 0 / null） */
function average(list) {
  const valid = list.filter((v) => Number.isFinite(v) && v > 0)
  if (!valid.length) return 0
  return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length)
}

/** 按字段分组计数，返回按数量倒序的数组 */
function groupCount(records, key) {
  const map = new Map()
  records.forEach((r) => {
    const value = r[key]
    if (value == null) return
    map.set(value, (map.get(value) || 0) + 1)
  })
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

/** 按字段分组求薪资平均 */
function groupAvgSalary(records, key, filterFn = (r) => r.salary > 0) {
  const map = new Map()
  records.forEach((r) => {
    const value = r[key]
    if (value == null || !filterFn(r)) return
    const bucket = map.get(value) || []
    bucket.push(r.salary)
    map.set(value, bucket)
  })
  return [...map.entries()]
    .map(([name, salaries]) => ({ name, value: average(salaries), count: salaries.length }))
    .sort((a, b) => b.value - a.value)
}

/** 按学历维度拆分为 { 学历: { 类别: 数量 } } */
function crossCount(records, outerKey, innerKey) {
  const result = {}
  records.forEach((r) => {
    const outer = r[outerKey]
    const inner = r[innerKey]
    if (outer == null || inner == null) return
    result[outer] ||= {}
    result[outer][inner] = (result[outer][inner] || 0) + 1
  })
  return result
}

const EMPLOYED_DESTINATION_SET = new Set(EMPLOYED)

// ------------------------------------------------------------------
// 接口处理器
// ------------------------------------------------------------------

/** 总览 KPI + 趋势 */
function overview(records, params) {
  const filtered = applyFilters(records, params)
  const total = filtered.length
  const employedRecords = filtered.filter((r) => EMPLOYED_DESTINATION_SET.has(r.destination))
  const fulfilled = filtered.filter((r) => FULFILLED.includes(r.destination))
  const furtherStudy = filtered.filter((r) => ['国内升学', '出国出境'].includes(r.destination))

  const industryRank = groupCount(employedRecords, 'industry')
  const provinceRank = groupCount(employedRecords, 'province')
  const companyRank = groupCount(employedRecords, 'companyType')

  // 趋势：忽略年份筛选，保留其它维度，展示完整年份变化
  const trendBase = applyFilters(records, { ...params, year: 'all' })
  const years = [...new Set(records.map((r) => r.year))].sort((a, b) => a - b)
  const trend = years.map((year) => {
    const yearRecords = trendBase.filter((r) => r.year === year)
    const yearEmployed = yearRecords.filter((r) => EMPLOYED_DESTINATION_SET.has(r.destination))
    return {
      year,
      graduates: yearRecords.length,
      fulfillRate: yearRecords.length
        ? Number(((yearRecords.filter((r) => FULFILLED.includes(r.destination)).length / yearRecords.length) * 100).toFixed(1))
        : 0,
      avgSalary: average(yearEmployed.map((r) => r.salary)),
    }
  })

  return {
    total,
    employed: employedRecords.length,
    fulfillRate: total ? Number(((fulfilled.length / total) * 100).toFixed(1)) : 0,
    furtherStudyRate: total ? Number(((furtherStudy.length / total) * 100).toFixed(1)) : 0,
    avgSalary: average(employedRecords.map((r) => r.salary)),
    topIndustry: industryRank[0]?.name || '—',
    topProvince: provinceRank[0]?.name || '—',
    topCompanyType: companyRank[0]?.name || '—',
    trend,
    destination: groupCount(filtered, 'destination'),
    industryTop: industryRank.slice(0, 6),
    companyTop: companyRank,
  }
}

/** 就业去向 */
function destination(records, params) {
  const filtered = applyFilters(records, params)

  const trendBase = applyFilters(records, { ...params, year: 'all' })
  const years = [...new Set(records.map((r) => r.year))].sort((a, b) => a - b)
  const trend = years.map((year) => {
    const yearRecords = trendBase.filter((r) => r.year === year)
    const row = { year }
    FULFILLED.concat('待就业').forEach((name) => {
      row[name] = yearRecords.filter((r) => r.destination === name).length
    })
    return row
  })

  return {
    distribution: groupCount(filtered, 'destination'),
    byDegree: crossCount(filtered, 'degree', 'destination'),
    byCollege: crossCount(filtered, 'college', 'destination'),
    trend,
  }
}

/** 行业分布 */
function industryStats(records, params) {
  const filtered = applyFilters(records, params)
  const employed = filtered.filter((r) => EMPLOYED_DESTINATION_SET.has(r.destination))

  const industryDistribution = groupCount(employed, 'industry')
  const industrySalary = groupAvgSalary(employed, 'industry')

  // 学院 × 行业，取 Top 行业做成矩阵（用于热力图）
  const topIndustries = industryDistribution.slice(0, 7).map((i) => i.name)
  const colleges = [...new Set(employed.map((r) => r.college))]
  const matrix = colleges.map((college) => {
    const row = employed.filter((r) => r.college === college)
    return topIndustries.map((ind) => row.filter((r) => r.industry === ind).length)
  })

  return {
    distribution: industryDistribution,
    salary: industrySalary,
    matrix: { industries: topIndustries, colleges, data: matrix },
    byDegree: crossCount(employed, 'degree', 'industry'),
    topIndustry: industryDistribution[0]?.name || '—',
  }
}

/** 薪资水平 */
function salaryStats(records, params) {
  const filtered = applyFilters(records, params).filter((r) => r.salary > 0)

  const ranges = [
    { name: '4K 以下', min: 0, max: 4000 },
    { name: '4K-6K', min: 4000, max: 6000 },
    { name: '6K-8K', min: 6000, max: 8000 },
    { name: '8K-10K', min: 8000, max: 10000 },
    { name: '10K-15K', min: 10000, max: 15000 },
    { name: '15K-20K', min: 15000, max: 20000 },
    { name: '20K 以上', min: 20000, max: Infinity },
  ]
  const distribution = ranges.map((range) => ({
    name: range.name,
    value: filtered.filter((r) => r.salary >= range.min && r.salary < range.max).length,
  }))

  const byMajor = groupAvgSalary(filtered, 'major').filter((m) => m.count >= 8)

  return {
    distribution,
    byDegree: groupAvgSalary(filtered, 'degree'),
    byIndustry: groupAvgSalary(filtered, 'industry').slice(0, 8),
    byCityTier: groupAvgSalary(filtered, 'cityTier'),
    majorTop: byMajor.slice(0, 8),
    majorBottom: [...byMajor].reverse().slice(0, 8),
    avg: average(filtered.map((r) => r.salary)),
    median: (() => {
      if (!filtered.length) return 0
      const sorted = filtered.map((r) => r.salary).sort((a, b) => a - b)
      return sorted[Math.floor(sorted.length / 2)]
    })(),
    max: filtered.length ? Math.max(...filtered.map((r) => r.salary)) : 0,
    sampleSize: filtered.length,
  }
}

/** 地域流向 */
function regionStats(records, params) {
  const filtered = applyFilters(records, params)
  const employed = filtered.filter((r) => EMPLOYED_DESTINATION_SET.has(r.destination))

  const provinceRank = groupCount(employed, 'province')
  const cityRank = groupCount(employed, 'city').slice(0, 12)
  const cityTier = groupCount(employed, 'cityTier')
  const provinceSalary = groupAvgSalary(employed, 'province').slice(0, 10)

  const byProvinceTopCity = provinceRank.slice(0, 8).map((item) => {
    const provinceEmployed = employed.filter((r) => r.province === item.name)
    const cityCounts = groupCount(provinceEmployed, 'city')
    return { name: item.name, value: item.value, topCity: cityCounts[0]?.name || '—' }
  })

  return {
    provinceRank,
    cityRank,
    cityTier,
    provinceSalary,
    byProvinceTopCity,
    topProvince: provinceRank[0]?.name || '—',
    topCity: cityRank[0]?.name || '—',
  }
}

/** 企业类型 */
function companyStats(records, params) {
  const filtered = applyFilters(records, params)
  const employed = filtered.filter((r) => EMPLOYED_DESTINATION_SET.has(r.destination))

  const typeDistribution = groupCount(employed, 'companyType')
  const scaleDistribution = groupCount(employed, 'companyScale')

  const topTypes = typeDistribution.slice(0, 5).map((t) => t.name)
  const colleges = [...new Set(employed.map((r) => r.college))]
  const matrix = colleges.map((college) => {
    const row = employed.filter((r) => r.college === college)
    return topTypes.map((type) => row.filter((r) => r.companyType === type).length)
  })

  return {
    typeDistribution,
    scaleDistribution,
    typeSalary: groupAvgSalary(employed, 'companyType'),
    scaleSalary: groupAvgSalary(employed, 'companyScale'),
    matrix: { types: topTypes, colleges, data: matrix },
    topType: typeDistribution[0]?.name || '—',
  }
}

/** 明细数据（分页 + 排序） */
function recordsList(records, params) {
  const filtered = applyFilters(records, params)
  const { page = 1, pageSize = 10, sortField = '', sortOrder = '' } = params

  let sorted = filtered
  if (sortField) {
    sorted = [...filtered].sort((a, b) => {
      const av = a[sortField]
      const bv = b[sortField]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortOrder === 'ascending' ? av - bv : bv - av
      }
      return sortOrder === 'ascending'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }

  const start = (Number(page) - 1) * Number(pageSize)
  return {
    list: sorted.slice(start, start + Number(pageSize)),
    total: filtered.length,
    page: Number(page),
    pageSize: Number(pageSize),
  }
}

/** 暴露给适配器的路由表：'METHOD /path' -> handler */
export function createRouterHandlers() {
  const graduates = getGraduates()
  return {
    'GET /filters': () => getFilterOptions(),
    'GET /overview': (params) => overview(graduates, params),
    'GET /destination': (params) => destination(graduates, params),
    'GET /industry': (params) => industryStats(graduates, params),
    'GET /salary': (params) => salaryStats(graduates, params),
    'GET /region': (params) => regionStats(graduates, params),
    'GET /company': (params) => companyStats(graduates, params),
    'GET /records': (params) => recordsList(graduates, params),
  }
}
