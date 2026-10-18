/** 千分位数字 */
export function formatNumber(value, digits = 0) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** 金额（元），大额自动换算为「万」 */
export function formatMoney(value) {
  if (!value) return '—'
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`
  return `${formatNumber(value, 0)}元`
}

/** 百分比 */
export function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `${Number(value).toFixed(1)}%`
}

/** 数字补零 */
export function padZero(value, length = 2) {
  return String(value).padStart(length, '0')
}
