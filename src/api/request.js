/**
 * 网络请求封装
 * ------------------------------------------------------------------
 * - 统一 baseURL / 超时 / 拦截器
 * - 开发阶段通过 mockAdapter 返回本地模拟数据；接入真实后端时
 *   将 VITE_USE_MOCK 设为 false 即可自动切换到真实接口。
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { mockAdapter } from '@/mock'

const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

const service = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  ...(useMock ? { adapter: mockAdapter } : {}),
})

// 请求拦截器：统一注入 token / 时间戳
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    if (config.method === 'get') config.params = { ...config.params, _t: Date.now() }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：剥离业务包装，统一错误提示
service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code !== 0) {
        ElMessage.error(res.message || '请求失败')
        return Promise.reject(new Error(res.message || '请求失败'))
      }
      return res.data
    }
    return res
  },
  (error) => {
    if (error.code !== 'ERR_CANCELED') {
      ElMessage.error(error.message || '网络异常，请稍后重试')
    }
    return Promise.reject(error)
  },
)

export default service
