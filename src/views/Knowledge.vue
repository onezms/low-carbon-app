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
            <h3 class="title">{{ item.title }}</h3>
            <p class="desc">{{ item.content?.substring(0,80) }}...</p>
            <div class="time">{{ item.create_time }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showDetail" title="文章详情" width="70%">
      <h2>{{ currentArticle.title }}</h2>
      <p style="color:#666">{{ currentArticle.create_time }}</p>
      <div style="line-height:1.8">{{ currentArticle.content }}</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import db from '../services/dbService.js'

const isAdmin = ref(localStorage.getItem('username') === 'admin')
const articleList = ref([])
const currentArticle = ref({})
const showDetail = ref(false)

const mockArticles = [
  {article_id:1,title:'什么是碳足迹？',content:'碳足迹是个人或活动引起的温室气体排放集合...',create_time:'2026-04-01'},
  {article_id:2,title:'减碳小技巧',content:'1.绿色出行 2.节约用电 3.垃圾分类...',create_time:'2026-04-03'}
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