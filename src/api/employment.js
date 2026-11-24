/**
 * 就业分析平台接口层
 * ------------------------------------------------------------------
 * 集中管理所有业务接口，便于统一维护与替换数据源。
 */
import request from './request'

/** 获取筛选项（学历） */
export function fetchFilterOptions(params) {
  return request.get('/filters', { params })
}

/** 总览：规模、落实率、去向大类与 TOP 排名 */
export function fetchOverview(params, config) {
  return request.get('/overview', { params, ...config })
}

/** 就业去向分布 */
export function fetchDestination(params, config) {
  return request.get('/destination', { params, ...config })
}

/** 行业分布 */
export function fetchIndustry(params, config) {
  return request.get('/industry', { params, ...config })
}

/** 城镇单位工资与毕业生起薪 */
export function fetchSalary(params, config) {
  return request.get('/salary', { params, ...config })
}

/** 地域流向 */
export function fetchRegion(params, config) {
  return request.get('/region', { params, ...config })
}

/** 单位性质 */
export function fetchCompany(params, config) {
  return request.get('/company', { params, ...config })
}

/** 数据来源、指标口径与已知局限 */
export function fetchSources(params, config) {
  return request.get('/sources', { params, ...config })
}
