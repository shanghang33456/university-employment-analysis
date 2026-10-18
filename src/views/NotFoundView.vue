<template>
  <div class="not-found">
    <div class="not-found__code">404</div>
    <h2>页面不存在</h2>
    <p class="text-muted">您访问的页面已被移除或从未存在，请返回数据总览。</p>
    <el-button type="primary" :icon="HomeFilled" @click="router.push('/dashboard')">
      返回数据总览
    </el-button>
  </div>
</template>

<script setup>
import { HomeFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 70vh;
  text-align: center;
}

.not-found__code {
  font-size: 84px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #4f7cff, #22c1a4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.not-found h2 {
  font-size: 20px;
  color: #1f2d4d;
}
</style>
