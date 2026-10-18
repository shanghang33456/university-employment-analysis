# 高校学生就业信息与去向分析平台

面向「初级前端工程师（可视化方向）」岗位能力训练的综合项目：基于 **Vue 3 + Vite + ECharts + Element Plus** 构建的毕业生就业数据可视化分析平台，覆盖 **就业去向、行业分布、薪资水平、地域流向、企业类型** 五大分析主题，并提供数据明细查询与导出能力。

---

## 一、功能概览

| 模块 | 路径 | 核心内容 |
| --- | --- | --- |
| 数据总览 | `/dashboard` | 5 项核心 KPI（毕业生总数、去向落实率、平均月薪、升学率、热门行业）、近五年趋势双轴图、去向结构环形图、行业 TOP6、单位性质分布、自动生成的数据洞察 |
| 就业去向 | `/destination` | 去向分布环形图、各学院去向百分比堆叠、不同学历去向结构、去向年度趋势 |
| 行业分布 | `/industry` | 行业人数排名、各行业平均月薪、学院 × 行业热力图、不同学历行业流向 |
| 薪资水平 | `/salary` | 月薪区间分布直方图、学历薪资对比、行业薪资、城市等级薪资、高薪 / 低薪专业 TOP8 |
| 地域流向 | `/region` | 省份流向排名、城市流向 TOP12、城市等级分布、各省平均月薪、重点省份明细表 |
| 企业类型 | `/company` | 单位性质分布、企业规模分布、不同类型 / 规模单位薪资、学院 × 单位性质热力图 |
| 数据明细 | `/records` | 明细表格（分页 + 排序 + 关键词搜索）、一键导出 CSV |

**全局能力**

- **全局筛选联动**：年份 / 学院 / 学历 / 专业 / 就业省份 5 个筛选项由 Pinia 统一管理，任一页面修改，全站图表自动重新请求并更新。
- **响应式适配**：≥1200px 三栏栅格、992–1200px 两栏、≤992px 侧边栏收起为抽屉 + 单列、≤640px 移动端单列布局。
- **交互反馈**：KPI 数字滚动动画、图表 loading 遮罩、页面切换过渡、筛选条件徽标计数、刷新按钮。

---

## 二、技术栈

| 分类 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Vue 3.5 | 全部使用 `<script setup>` 组合式 API |
| 构建 | Vite 8 | 极速冷启动、原生 ESM、产物按依赖分包 |
| 可视化 | ECharts 6 | **按需引入**（仅注册用到的图表与组件），自注册统一主题 |
| 组件库 | Element Plus 2 | 通过 `unplugin-vue-components` **按需自动注册** |
| 状态管理 | Pinia 4 | `filter`（全局筛选）/ `app`（UI 状态）两个 store |
| 路由 | Vue Router 5 | 懒加载路由 + 路由元信息驱动菜单与面包屑 |
| 网络请求 | Axios | 统一实例、请求/响应拦截器、自定义 mock adapter |

---

## 三、项目结构

```
src/
├── api/
│   ├── request.js          # axios 实例 + 拦截器（统一错误提示、token 注入）
│   └── employment.js       # 业务接口集中管理
├── mock/
│   ├── generators.js       # 确定性毕业生样本数据生成器（4600 条）
│   ├── handlers.js         # 各接口的聚合计算逻辑（数据映射层）
│   └── index.js            # axios mock adapter（模拟网络延迟 / 404 / 取消）
├── router/index.js         # 路由表（meta 驱动菜单与页面标题）
├── store/
│   ├── index.js            # Pinia 注册
│   ├── filter.js           # 全局筛选条件与筛选项缓存
│   └── app.js              # 侧边栏折叠、移动端模式、全局刷新信号
├── layouts/BasicLayout.vue # 侧边栏 + 顶栏 + 内容区响应式布局
├── components/
│   ├── BaseChart.vue       # 图表基础组件（自动初始化 / 缩放 / 销毁）
│   ├── ChartPanel.vue      # 图表卡片容器（标题 / 提示 / loading）
│   ├── StatCard.vue        # KPI 指标卡（数字滚动动画）
│   └── AppFilterBar.vue    # 全局筛选条（桌面内联 / 移动端抽屉复用）
├── composables/
│   ├── useChart.js         # ECharts 生命周期 + ResizeObserver 响应式
│   └── useAnalysisData.js  # 分析页数据获取（筛选联动 / 竞态保护 / loading）
├── utils/
│   ├── echarts.js          # ECharts 按需注册 + 全局主题
│   ├── chartOptions.js     # 图表配置公共片段（坐标轴 / 渐变 / 环形图 / 排行条）
│   └── format.js           # 数字、金额、百分比格式化
├── views/                  # 7 个业务页面 + NotFound
└── styles/index.css        # 全局样式变量 + 响应式栅格系统
```

---

## 四、快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 生产构建（产物输出到 dist/）
npm run build

# 本地预览构建产物（默认 http://localhost:4173）
npm run preview
```

> 环境要求：Node.js ≥ 18。

### 数据来源切换

当前所有数据来自本地 Mock（`src/mock/`），无需后端即可完整运行。请求层已按可替换方式设计：

```js
// src/api/request.js
const useMock = import.meta.env.VITE_USE_MOCK !== 'false'
```

接入真实后端时，新建 `.env.production` 并写入：

```
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-api.example.com/api
```

业务代码与页面均无需改动 —— 这正是把「数据来源」与「请求层」解耦的目的。

---

## 五、关键技术实现

### 1. Mock 与请求层解耦
通过 **axios 自定义 adapter** 接管请求：命中 `src/mock/handlers.js` 的路由表则返回聚合结果，未命中返回 404，并模拟 120–340ms 网络延迟以便观察 loading 状态。移除 adapter 配置即可无缝切换真实接口。

### 2. 全局筛选联动 + 竞态保护
`useAnalysisData` 把全局筛选序列化为依赖键，筛选变化时自动重新请求；使用自增序号丢弃过期响应，避免快速切换筛选时旧数据覆盖新数据。

### 3. 图表响应式
`useChart` 在容器上挂载 `ResizeObserver`，侧边栏折叠、窗口缩放、路由切换时图表自动 `resize()`；组件卸载时 `dispose()` 防止内存泄漏。

### 4. 性能优化
- Element Plus 组件与样式按需引入（非全量注册）。
- ECharts 仅注册实际使用的 4 种图表 + 6 个组件。
- 路由级代码分割，7 个业务页面均为懒加载。
- 依赖分包（`echarts` / `element-plus` / `vendor`），利用浏览器缓存。

构建产物（`npm run build`）：

| 产物 | 体积 | gzip |
| --- | --- | --- |
| echarts | 624.06 kB | 210.81 kB |
| element-plus (js) | 394.90 kB | 135.68 kB |
| element-plus (css) | 105.04 kB | 14.66 kB |
| vendor | 79.38 kB | 29.97 kB |
| index (含布局与首页) | 25.21 kB | 9.88 kB |
| 各业务页面（懒加载） | 0.7 – 5.4 kB / 页 | 约 2 kB / 页 |

### 5. 响应式栅格
`src/styles/index.css` 定义 `.grid--kpi / .grid--2 / .grid--3 / .grid--2-1` 等类，配合 1200px、992px、640px 三档媒体查询；布局侧边栏在 ≤992px 时通过 `translate(-100%)` 收起为抽屉，配合遮罩与头部筛选按钮。

---

## 六、代码规范约定

- 统一 2 空格缩进、LF 换行、文件末尾换行（见 `.editorconfig`）。
- 组件文件使用 `PascalCase`，`composables` 以 `use` 前缀命名，工具函数使用 `camelCase`。
- Vue 组件一律使用 `<script setup>`，样式使用 `<style scoped>`。
- 接口统一在 `src/api/` 中声明，页面不直接引用 axios 实例。
- 图表配置统一复用 `utils/chartOptions.js` 中的公共片段，保证视觉一致。

---

## 七、部署

```bash
npm run build      # 生成 dist/
```

将 `dist/` 目录部署到任意静态服务器（Nginx / 对象存储 / 静态托管平台）。由于使用 HTML5 History 路由，需配置**回退到 `index.html`**，例如 Nginx：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```
