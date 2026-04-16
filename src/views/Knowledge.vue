<template>
  <div class="knowledge-container">
    <div style="margin-bottom:20px" v-if="isAdmin">
      <el-button type="primary" @click="showAddDialog=true">+ 新增文章</el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="item in articleList" :key="item.article_id">
        <el-card class="article-card" shadow="hover" @click="viewDetail(item)">
          <div class="article-cover" style="height:200px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-size:48px">🌱</div>
          <div class="article-content">
            <h3 class="title">
              <a v-if="item.link" :href="item.link" target="_blank" style="text-decoration:none;color:inherit">{{ item.title }}</a>
              <span v-else>{{ item.title }}</span>
            </h3>
            <p class="desc">{{ item.content?.substring(0,80) }}...</p>
            <div class="time">{{ formatTime(item.create_time) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showDetail" title="文章详情" width="70%">
      <h2>
        <a v-if="currentArticle.link" :href="currentArticle.link" target="_blank" style="text-decoration:none;color:inherit">{{ currentArticle.title }}</a>
        <span v-else>{{ currentArticle.title }}</span>
      </h2>
      <p style="color:#666">{{ formatTime(currentArticle.create_time) }}</p>
      <div style="line-height:1.8">{{ currentArticle.content }}</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import db from '../services/dbService.js'

// 格式化时间为北京时间
const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  // 直接使用toLocaleString并指定时区为北京时间
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const isAdmin = ref(localStorage.getItem('username') === 'admin')
const articleList = ref([])
const currentArticle = ref({})
const showDetail = ref(false)

const mockArticles = [
  {article_id:1,title:'什么是碳足迹？',content:'碳足迹是个人或活动引起的温室气体排放集合...',create_time:'2026-04-01',link:'https://www.mee.gov.cn/ywdt/szyw/202507/t20250731_1124681.shtml'},
  {article_id:2,title:'减碳小技巧',content:'1.绿色出行 2.节约用电 3.垃圾分类...',create_time:'2026-04-03',link:'https://sthjt.ah.gov.cn/'}
]

const getArticleList = () => {
  articleList.value = mockArticles
}

const viewDetail = (item) => {
  currentArticle.value = item
  showDetail.value = true
}

onMounted(() => {
  getArticleList()
})
</script>

<style scoped>
.knowledge-container { padding:20px; }
.article-card { margin-bottom:20px; }
.title { font-size:18px; font-weight:bold; color:#16a34a; }
</style>