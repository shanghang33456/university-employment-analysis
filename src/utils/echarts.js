/**
 * ECharts 按需引入
 * ------------------------------------------------------------------
 * 只注册项目用到的图表与组件，显著减小打包体积（性能优化）。
 * 如需新增图表类型，在此处补充对应的 chart / component 即可。
 */
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, HeatmapChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  GraphicComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  GraphicComponent,
  CanvasRenderer,
])

/** 统一图表配色（可视化主题） */
export const CHART_COLORS = [
  '#4f7cff',
  '#22c1a4',
  '#ffb020',
  '#ff6b81',
  '#9b5de5',
  '#00bbf9',
  '#f15bb5',
  '#5f7161',
  '#2ec4b6',
  '#f4a261',
]

/** 注册全局主题，保证各页面视觉一致 */
echarts.registerTheme('employment', {
  color: CHART_COLORS,
  textStyle: {
    fontFamily:
      "'HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  legend: {
    textStyle: { color: '#5c6b8a' },
  },
  tooltip: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderColor: '#e3e8f0',
    borderWidth: 1,
    textStyle: { color: '#2b3a55', fontSize: 12 },
    extraCssText: 'box-shadow: 0 6px 20px rgba(31,56,110,0.12); border-radius: 8px;',
  },
})

export default echarts
