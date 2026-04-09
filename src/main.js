import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as echarts from 'echarts'
// 引入路由
import router from './router'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.config.globalProperties.$echarts = echarts
app.mount('#app')