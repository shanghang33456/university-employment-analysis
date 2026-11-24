<template>
  <div class="page">
    <div class="page__hint">
      <el-icon><InfoFilled /></el-icon>
      <span>
        本平台全部数值来自以下公开官方发布，均为<strong>汇总统计</strong>，不含个体毕业生记录；
        所有图表页均标注对应来源编号，可在此追溯原文。
      </span>
    </div>

    <div class="source-grid">
      <article v-for="item in sources" :key="item.id" class="source-card">
        <header class="source-card__head">
          <span class="source-card__id">{{ item.id }}</span>
          <div class="source-card__title">
            <h3>{{ item.title }}</h3>
            <p>{{ item.org }} · {{ item.publishedAt }}</p>
          </div>
        </header>
        <p class="source-card__scope">{{ item.scope }}</p>
        <div class="source-card__tags">
          <el-tag v-for="tag in item.provides" :key="tag" size="small" effect="plain" round>
            {{ tag }}
          </el-tag>
        </div>
        <a class="source-card__link" :href="item.url" target="_blank" rel="noopener noreferrer">
          查看原始发布
          <el-icon><TopRight /></el-icon>
        </a>
      </article>
    </div>

    <ChartPanel title="指标口径说明" hint="同一名词在不同发布中口径可能不同，下表为平台实际采用的口径" :loading="loading">
      <el-table :data="notes" stripe style="width: 100%">
        <el-table-column prop="metric" label="指标" min-width="150" />
        <el-table-column prop="definition" label="口径定义" min-width="360" />
        <el-table-column prop="source" label="来源" width="110" align="center" />
        <el-table-column prop="caveat" label="注意事项" min-width="240" />
      </el-table>
    </ChartPanel>

    <ChartPanel title="已知局限" hint="公开数据的边界，引用结论时请一并考虑" :loading="loading">
      <ul class="limits">
        <li v-for="(item, index) in limitations" :key="index">
          <span class="limits__index">{{ index + 1 }}</span>
          <span>{{ item }}</span>
        </li>
      </ul>
    </ChartPanel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { InfoFilled, TopRight } from '@element-plus/icons-vue'
import ChartPanel from '@/components/ChartPanel.vue'
import { fetchSources } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'

const { data, loading } = useAnalysisData(fetchSources, {
  sources: [],
  notes: [],
  limitations: [],
})

const sources = computed(() => data.value?.sources || [])
const notes = computed(() => data.value?.notes || [])
const limitations = computed(() => data.value?.limitations || [])
</script>

<style scoped>
.source-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.source-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  background: #fff;
  border: 1px solid #eef1f7;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(31, 56, 110, 0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.source-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(31, 56, 110, 0.1);
}

.source-card__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.source-card__id {
  flex: none;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f7cff, #22c1a4);
}

.source-card__title {
  min-width: 0;
}

.source-card__title h3 {
  margin: 0;
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.45;
  color: #1f2d4d;
}

.source-card__title p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #8a97b1;
}

.source-card__scope {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: #6b7a99;
}

.source-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.source-card__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
  padding-top: 6px;
  font-size: 12.5px;
  color: var(--brand-primary);
  text-decoration: none;
}

.source-card__link:hover {
  text-decoration: underline;
}

.limits {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.limits li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  font-size: 13.5px;
  line-height: 1.7;
  color: #4a5878;
  background: #f8faff;
  border-radius: 10px;
}

.limits__index {
  flex: none;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f7cff, #22c1a4);
}
</style>
