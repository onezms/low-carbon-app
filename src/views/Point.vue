<template>
  <div class="point-container">

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="top-card" style="background: linear-gradient(135deg, #16a34a, #22c55e); color: white;">
          <div class="card-title">当前总积分</div>
          <div class="card-num">{{ userInfo.total_point || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="top-card" style="background: linear-gradient(135deg, #059669, #10b981); color: white;">
          <div class="card-title">累计减碳</div>
          <div class="card-num">{{ (userInfo.total_carbon || 0).toFixed(2) }} kg</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="top-card" style="background: linear-gradient(135deg, #047857, #059669); color: white;">
          <div class="card-title">连续打卡</div>
          <div class="card-num">{{ userInfo.check_days || 0 }} 天</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="list-card" title="积分明细" style="margin-top:20px;">    
      <el-table :data="pointList" stripe>
        <el-table-column prop="create_time" label="时间" width="180"></el-table-column>
        <el-table-column prop="sub_type" label="来源"></el-table-column>      
        <el-table-column prop="point" label="积分变化" width="120">
          <template #default="scope">
            <span :style="{color: scope.row.point>0?'#16a34a':'#ef4444'}">      
              {{ scope.row.point>0 ? '+' : '' }}{{ scope.row.point }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="medal-card" title="我的勋章" style="margin-top:20px;">  
      <el-row :gutter="20">
        <el-col :span="6" v-for="medal in medals" :key="medal.id">
          <div class="medal-item">
            <div class="medal-icon">{{ medal.icon }}</div>
            <div class="medal-name">{{ medal.name }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import db from '../services/dbService.js'

const userId = ref(localStorage.getItem('userId') || 1)
const userInfo = reactive({ total_point:0, total_carbon:0, check_days:0 })      
const pointList = ref([])

const medals = ref([
  {id:1,name:'低碳新手',icon:'??'},
  {id:2,name:'绿色达人',icon:'??'},
  {id:3,name:'环保先锋',icon:'??'},
  {id:4,name:'地球卫士',icon:'??'}
])

const getUserInfo = () => {
  db.get('SELECT * FROM user WHERE user_id = ?', [userId.value], (err, row) => {
    if(row) {
      userInfo.total_point = row.total_point || 0
      userInfo.total_carbon = row.total_carbon || 0
      userInfo.check_days = row.check_days || 0
    }
  })
}

const getPointList = () => {
  db.all('SELECT * FROM carbon_record WHERE user_id=? AND point > 0 ORDER BY create_time DESC LIMIT 50', [userId.value], (err, rows) => {
    if(rows) {
      pointList.value = rows
    }
  })
}

onMounted(() => {
  getUserInfo()
  getPointList()
})
</script>

<style scoped>
.point-container { padding: 20px; }
.top-card { text-align:center; border:none; }
.card-title { font-size:16px; opacity:0.9; }
.card-num { font-size:36px; font-weight:bold; margin-top:10px; }
.medal-item { text-align:center; padding:20px; border:1px solid #d1fae5; border-radius:10px; background:#f0fdf4; }
.medal-icon { font-size:48px; margin-bottom:10px; }
.medal-name { font-size:16px; font-weight:bold; color:#16a34a; }
</style>
