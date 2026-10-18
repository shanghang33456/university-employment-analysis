import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

/**
 * 路由表
 * meta.title 用于菜单与面包屑；meta.icon 为 Element Plus 图标组件名。
 */
const routes = [
  {
    path: '/',
    component: BasicLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '数据总览', icon: 'DataLine', desc: '毕业生就业核心指标一览' },
      },
      {
        path: 'destination',
        name: 'Destination',
        component: () => import('@/views/DestinationView.vue'),
        meta: { title: '就业去向', icon: 'Guide', desc: '毕业去向结构与年度变化' },
      },
      {
        path: 'industry',
        name: 'Industry',
        component: () => import('@/views/IndustryView.vue'),
        meta: { title: '行业分布', icon: 'OfficeBuilding', desc: '就业行业流向与学院差异' },
      },
      {
        path: 'salary',
        name: 'Salary',
        component: () => import('@/views/SalaryView.vue'),
        meta: { title: '薪资水平', icon: 'Money', desc: '薪资分布与多维对比' },
      },
      {
        path: 'region',
        name: 'Region',
        component: () => import('@/views/RegionView.vue'),
        meta: { title: '地域流向', icon: 'Location', desc: '就业省份与城市分布' },
      },
      {
        path: 'company',
        name: 'Company',
        component: () => import('@/views/CompanyView.vue'),
        meta: { title: '企业类型', icon: 'Suitcase', desc: '单位性质与规模结构' },
      },
      {
        path: 'records',
        name: 'Records',
        component: () => import('@/views/RecordsView.vue'),
        meta: { title: '数据明细', icon: 'Tickets', desc: '毕业生就业明细查询' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const base = '高校学生就业信息与去向分析平台'
  document.title = to.meta?.title ? `${to.meta.title} · ${base}` : base
})

export default router
