/**
 * 就业分析平台接口层
 * ------------------------------------------------------------------
 * 集中管理所有业务接口，便于统一维护与替换数据源。
 */
import request from './request'

/** 获取筛选项（年份/学院/学历/行业等） */
export function fetchFilterOptions(params) {
  return request.get('/filters', { params })
}

/** 总览：KPI + 趋势 */
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

/** 薪资水平 */
export function fetchSalary(params, config) {
  return request.get('/salary', { params, ...config })
}

/** 地域流向 */
export function fetchRegion(params, config) {
  return request.get('/region', { params, ...config })
}

/** 企业类型 */
export function fetchCompany(params, config) {
  return request.get('/company', { params, ...config })
}

/** 毕业生明细（分页） */
export function fetchRecords(params, config) {
  return request.get('/records', { params, ...config })
}
