import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupStore } from './store'
import './styles/index.css'

const app = createApp(App)

// 全局状态（Pinia）
setupStore(app)
// 路由
app.use(router)

app.mount('#app')
