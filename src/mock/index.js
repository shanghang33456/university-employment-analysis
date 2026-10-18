/**
 * Mock 适配器
 * ------------------------------------------------------------------
 * 以 axios 自定义 adapter 的方式接管请求：命中本地路由表则返回模拟数据，
 * 未命中则抛出 404。这样「请求层」与「数据来源」解耦，
 * 后续接入真实后端时只需移除 adapter 配置，业务代码零改动。
 */
import { createRouterHandlers } from './handlers.js'

const handlers = createRouterHandlers()

/** 统一响应体 */
function createResponse(config, data, status = 200, statusText = 'OK') {
  return {
    data,
    status,
    statusText,
    headers: {},
    config,
    request: { adapter: 'mock' },
  }
}

export function mockAdapter(config) {
  return new Promise((resolve, reject) => {
    const method = (config.method || 'get').toUpperCase()
    const url = String(config.url || '')
      .replace(/^\/api/, '')
      .split('?')[0]
    const key = `${method} ${url}`
    const handler = handlers[key]

    // 模拟网络延迟，便于观察 loading 状态与骨架屏
    const delay = 120 + Math.floor(Math.random() * 220)

    const timer = setTimeout(() => {
      if (config.signal?.aborted) {
        reject(Object.assign(new Error('请求已取消'), { code: 'ERR_CANCELED' }))
        return
      }
      if (!handler) {
        resolve(createResponse(config, { code: 404, message: `Mock 接口不存在: ${key}`, data: null }, 404, 'Not Found'))
        return
      }
      try {
        const result = handler({ ...(config.params || {}) })
        resolve(createResponse(config, { code: 0, message: 'ok', data: result }))
      } catch (error) {
        resolve(createResponse(config, { code: 500, message: error.message, data: null }, 500, 'Internal Error'))
      }
    }, delay)

    config.signal?.addEventListener?.('abort', () => {
      clearTimeout(timer)
      reject(Object.assign(new Error('请求已取消'), { code: 'ERR_CANCELED' }))
    })
  })
}
