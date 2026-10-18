/**
 * 图表配置公共片段
 * ------------------------------------------------------------------
 * 抽取坐标轴、网格、提示框等重复配置，保证各页面图表风格统一。
 */

export const AXIS_LINE_STYLE = { lineStyle: { color: '#e3e8f0' } }
export const AXIS_LABEL_STYLE = { color: '#8a97b1', fontSize: 12 }
export const SPLIT_LINE_STYLE = { lineStyle: { color: '#f1f4fa', type: 'dashed' } }

/** 通用网格 */
export const BASE_GRID = { left: 12, right: 20, top: 46, bottom: 8, containLabel: true }

/** 类目轴 */
export function categoryAxis(extra = {}) {
  return {
    type: 'category',
    axisLine: AXIS_LINE_STYLE,
    axisTick: { show: false },
    axisLabel: AXIS_LABEL_STYLE,
    ...extra,
  }
}

/** 数值轴 */
export function valueAxis(extra = {}) {
  return {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: AXIS_LABEL_STYLE,
    splitLine: SPLIT_LINE_STYLE,
    ...extra,
  }
}

/** 柱状图渐变填充 */
export function barGradient(from, to) {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  }
}

/** 水平渐变（用于横向条形图） */
export function barGradientH(from, to) {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  }
}

/** 环形饼图（用于占比结构展示） */
export function createDonutOption({ data, centerLabel = '', radius = ['46%', '72%'] }) {
  return {
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 人 ({d}%)' },
    legend: {
      orient: 'vertical',
      right: 4,
      top: 'center',
      itemWidth: 8,
      itemHeight: 8,
      icon: 'circle',
      textStyle: { color: '#5c6b8a', fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius,
        center: ['32%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
        label: {
          show: true,
          formatter: '{d}%',
          color: '#4a5878',
          fontSize: 11,
        },
        labelLine: { length: 8, length2: 6 },
        emphasis: {
          scale: true,
          scaleSize: 6,
          label: { show: true, fontSize: 13, fontWeight: 'bold' },
        },
        data,
      },
    ],
    graphic: centerLabel
      ? [
          {
            type: 'text',
            left: '32%',
            top: '50%',
            style: {
              text: centerLabel,
              textAlign: 'center',
              fill: '#1f2d4d',
              fontSize: 13,
              fontWeight: 600,
            },
          },
        ]
      : undefined,
  }
}

/** 横向条形排行（用于排名类数据） */
export function createRankBarOption({ data, color = ['#4f7cff', '#22c1a4'], unit = '人' }) {
  const sorted = [...data].sort((a, b) => a.value - b.value)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: `{b}<br/>{c} ${unit}` },
    grid: { left: 8, right: 44, top: 12, bottom: 8, containLabel: true },
    xAxis: valueAxis({ show: false }),
    yAxis: categoryAxis({
      data: sorted.map((d) => d.name),
      axisLabel: { ...AXIS_LABEL_STYLE, width: 90, overflow: 'truncate' },
    }),
    series: [
      {
        type: 'bar',
        barWidth: 14,
        showBackground: true,
        backgroundStyle: { color: '#f4f6fb', borderRadius: 8 },
        itemStyle: { borderRadius: 8, color: barGradientH(color[0], color[1]) },
        label: { show: true, position: 'right', color: '#5c6b8a', fontSize: 11 },
        data: sorted.map((d) => d.value),
      },
    ],
  }
}
