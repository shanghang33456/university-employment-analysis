<template>
  <div class="app-shell" :class="{ 'is-collapsed': appStore.collapsed, 'is-mobile': appStore.isMobile }">
    <!-- 移动端遮罩 -->
    <div
      v-if="appStore.isMobile && !appStore.collapsed"
      class="app-mask"
      @click="appStore.setCollapsed(true)"
    ></div>

    <!-- 侧边栏 -->
    <aside class="app-aside">
      <div class="brand">
        <div class="brand__logo">就</div>
        <transition name="fade">
          <div v-if="!appStore.collapsed" class="brand__text">
            <strong>就业去向分析</strong>
            <span>Employment Analytics</span>
          </div>
        </transition>
      </div>

      <el-scrollbar class="app-aside__scroll">
        <el-menu
          :default-active="activePath"
          :collapse="appStore.collapsed && !appStore.isMobile"
          :collapse-transition="false"
          router
          class="app-menu"
        >
          <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>

      <transition name="fade">
        <div v-if="!appStore.collapsed" class="app-aside__footer">
          <span class="dot"></span> 数据更新于 2025 届就业统计
        </div>
      </transition>
    </aside>

    <!-- 主体 -->
    <div class="app-body">
      <header class="app-header">
        <div class="app-header__left">
          <el-button
            class="app-header__toggle"
            :icon="appStore.collapsed ? Expand : Fold"
            text
            circle
            @click="appStore.toggleCollapsed()"
          />
          <div class="app-header__crumb">
            <h1>{{ currentTitle }}</h1>
            <p>{{ currentDesc }}</p>
          </div>
        </div>

        <div class="app-header__right">
          <div v-if="!appStore.isMobile" class="app-header__filters">
            <AppFilterBar />
          </div>
          <el-button
            v-else
            class="app-header__filter-btn"
            :icon="Filter"
            circle
            text
            @click="drawerVisible = true"
          >
            <el-badge
              v-if="filterStore.activeCount"
              :value="filterStore.activeCount"
              class="app-header__badge"
            />
          </el-button>
          <el-tooltip content="刷新数据" placement="bottom">
            <el-button :icon="Refresh" text circle @click="handleRefresh" />
          </el-tooltip>
        </div>
      </header>

      <main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 移动端筛选抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="筛选条件"
      direction="rtl"
      size="82%"
      :append-to-body="true"
    >
      <AppFilterBar stack />
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  DataLine,
  Guide,
  OfficeBuilding,
  Money,
  Location,
  Suitcase,
  Tickets,
  Fold,
  Expand,
  Refresh,
  Filter,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AppFilterBar from '@/components/AppFilterBar.vue'
import { useAppStore } from '@/store/app'
import { useFilterStore } from '@/store/filter'

const appStore = useAppStore()
const filterStore = useFilterStore()
const route = useRoute()

const drawerVisible = ref(false)

const iconMap = {
  DataLine,
  Guide,
  OfficeBuilding,
  Money,
  Location,
  Suitcase,
  Tickets,
}

/** 菜单项：从路由表推导，保持单一数据源 */
const menus = computed(() => {
  const layoutRoute = route.matched.find((r) => r.path === '/')
  const children = layoutRoute?.children ?? []
  return children
    .filter((child) => child.meta?.title && child.meta?.icon)
    .map((child) => ({
      path: `/${child.path}`,
      title: child.meta.title,
      icon: iconMap[child.meta.icon],
    }))
})

const activePath = computed(() => route.path)
const currentTitle = computed(() => route.meta?.title || '数据总览')
const currentDesc = computed(() => route.meta?.desc || '')

function handleRefresh() {
  appStore.triggerRefresh()
  ElMessage.success('数据已刷新')
}

function handleResize() {
  appStore.setMobile(window.innerWidth < 992)
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  filterStore.loadOptions()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: #f4f6fb;
}

/* ---------------- 侧边栏 ---------------- */
.app-aside {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 232px;
  background: linear-gradient(180deg, #16204a 0%, #1b2a5e 55%, #17224c 100%);
  overflow: hidden;
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 64px;
  padding: 0 16px;
  flex: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.brand__logo {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #4f7cff, #22c1a4);
  box-shadow: 0 4px 14px rgba(79, 124, 255, 0.45);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
}

.brand__text strong {
  font-size: 15px;
  color: #fff;
  letter-spacing: 0.5px;
}

.brand__text span {
  font-size: 11px;
  color: #8f9fc9;
  letter-spacing: 0.6px;
}

.app-aside__scroll {
  flex: 1;
  padding: 12px 8px;
}

.app-menu {
  border-right: none;
  background: transparent;
}

.app-menu :deep(.el-menu-item) {
  height: 46px;
  margin-bottom: 6px;
  border-radius: 10px;
  color: #b7c3e2;
}

.app-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
}

.app-menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background: linear-gradient(90deg, rgba(79, 124, 255, 0.95), rgba(34, 193, 164, 0.75));
  box-shadow: 0 6px 16px rgba(79, 124, 255, 0.35);
}

.app-aside__footer {
  flex: none;
  padding: 14px 18px;
  font-size: 12px;
  color: #8f9fc9;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  white-space: nowrap;
}

.app-aside__footer .dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: #22c1a4;
  box-shadow: 0 0 0 3px rgba(34, 193, 164, 0.2);
}

/* ---------------- 主体 ---------------- */
.app-body {
  flex: 1;
  min-width: 0;
  margin-left: 232px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  padding: 10px 22px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #eaeef6;
}

.app-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.app-header__crumb h1 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #1f2d4d;
  white-space: nowrap;
}

.app-header__crumb p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #8a97b1;
  white-space: nowrap;
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.app-header__filter-btn {
  position: relative;
}

.app-header__badge {
  position: absolute;
  top: -4px;
  right: -6px;
}

.app-main {
  flex: 1;
  padding: 20px 22px 32px;
  min-width: 0;
}

/* ---------------- 遮罩 ---------------- */
.app-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(14, 22, 52, 0.45);
}

/* ---------------- 过渡动画 ---------------- */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ---------------- 响应式 ---------------- */
/* 桌面端：折叠时收窄侧边栏 */
@media (min-width: 993px) {
  .is-collapsed .app-aside {
    width: 64px;
  }

  .is-collapsed .app-body {
    margin-left: 64px;
  }
}

/* 移动端：侧边栏改为抽屉，默认滑出屏幕外 */
@media (max-width: 992px) {
  .app-aside {
    width: 232px;
    transform: translateX(-100%);
    box-shadow: 0 0 40px rgba(14, 22, 52, 0.45);
  }

  .is-mobile:not(.is-collapsed) .app-aside {
    transform: translateX(0);
  }

  .app-body,
  .is-collapsed .app-body {
    margin-left: 0;
  }

  .app-header__crumb p {
    display: none;
  }

  .app-main {
    padding: 16px 14px 28px;
  }
}

@media (max-width: 576px) {
  .app-header {
    padding: 10px 12px;
  }

  .app-header__crumb h1 {
    font-size: 15px;
  }
}
</style>
