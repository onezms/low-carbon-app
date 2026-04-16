﻿<template>
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
          <div class="card-title">打卡天数</div>
          <div class="card-num">{{ userInfo.check_days || 0 }} 天</div>
        </el-card>
      </el-col>
    </el-row>
    <div style="text-align:center;margin:20px 0;">
      <el-button type="primary" size="large" @click="doCheckIn" style="width:200px;height:50px;font-size:18px;">📍 打卡签到</el-button>
    </div>
    <el-card class="list-card" title="积分明细" style="margin-top:20px;">
      <el-table :data="pointList" stripe>
        <el-table-column label="时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.create_time) }}
          </template>
        </el-table-column>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
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
const userId = ref(localStorage.getItem('userId') || 1)
const userInfo = reactive({ total_point:0, total_carbon:0, check_days:0 })      
const pointList = ref([])
const medals = ref([{id:1,name:'低碳新手',icon:'🌱'},{id:2,name:'绿色达人',icon:'🌿'},{id:3,name:'环保先锋',icon:'🌳'},{id:4,name:'地球卫士',icon:'🌍'}])

const router = useRouter()
const route = useRoute()

// 监听userId变化，确保使用最新的用户ID
const updateUserId = () => {
  userId.value = localStorage.getItem('userId') || 1
  getUserInfo()
  getPointList()
  calculateCheckDays()
}

// 路由变化时更新用户数据
const handleRouteChange = () => {
  updateUserId()
}

const calculateCheckDays = (callback) => {
  // 使用ISO格式的日期，确保与数据库中的格式一致
  const today = new Date().toISOString().split('T')[0]
  db.all(`SELECT date(create_time) as date FROM carbon_record WHERE user_id = ? GROUP BY date(create_time) ORDER BY date DESC`, [userId.value], (err, rows) => {
    if (rows && rows.length > 0) {
      let consecutiveDays = 0
      let currentDate = new Date(today)
      for (let i = 0; i < rows.length; i++) {
        const recordDate = new Date(rows[i].date)
        const expectedDate = new Date(currentDate)
        expectedDate.setDate(expectedDate.getDate() - i)
        if (recordDate.toDateString() === expectedDate.toDateString()) { consecutiveDays++ }
        else if (i === 0 && recordDate.toDateString() === currentDate.toDateString()) { consecutiveDays = 1 }
        else { break }
      }
      db.run(`UPDATE user SET check_days = ? WHERE user_id = ?`, [consecutiveDays, userId.value], (err) => {
        if (!err && callback) callback(consecutiveDays)
      })
    } else {
      db.run(`UPDATE user SET check_days = 0 WHERE user_id = ?`, [userId.value])
      if (callback) callback(0)
    }
  })
}
const getUserInfo = () => {
  try {
    db.get(`SELECT * FROM user WHERE user_id = ?`, [userId.value], (err, row) => {
      if(row) {
        Object.assign(userInfo, row)
        // 强制更新响应式数据
        userInfo.total_point = parseFloat(row.total_point) || 0
        userInfo.total_carbon = parseFloat(row.total_carbon) || 0
        userInfo.check_days = parseInt(row.check_days) || 0
      }
    })
  } catch (e) {}
}
const getPointList = () => {
  try {
    db.all(`SELECT * FROM carbon_record WHERE user_id = ? AND point > 0 ORDER BY create_time DESC LIMIT 50`, [userId.value], (err, rows) => {
      if(rows) pointList.value = rows
    })
  } catch (e) {}
}
const doCheckIn = () => {
  // 使用ISO格式的日期，确保与数据库中的格式一致
  const today = new Date().toISOString().split('T')[0]
  db.get(`SELECT * FROM carbon_record WHERE user_id = ? AND record_type = '打卡' AND date(create_time) = ?`, [userId.value, today], (err, row) => {
    if (row) { ElMessage.info('今天已经打卡过了'); return }
    db.run(`INSERT INTO carbon_record (user_id, record_type, sub_type, point, carbon_output, carbon_reduce) VALUES (?, ?, ?, ?, ?, ?)`, [userId.value, '打卡', '每日打卡', 2, 0, 0], (err) => {
      if (err) { ElMessage.error('打卡失败'); return }
      db.run(`UPDATE user SET total_point = total_point + 2 WHERE user_id = ?`, [userId.value], (err) => {
        if (err) { ElMessage.error('更新积分失败'); return }
        ElMessage.success('打卡成功！获得 2 积分')
        calculateCheckDays(() => {
          getUserInfo()
          getPointList()
          // 强制刷新页面数据
          setTimeout(() => {
            getUserInfo()
            getPointList()
          }, 100)
        })
      })
    })
  })
}
// 保存路由监听的引用
let routeListener = null

onMounted(() => {
  updateUserId()
  // 监听路由变化
  routeListener = router.afterEach(handleRouteChange)
})

onUnmounted(() => {
  // 移除路由监听
  if (routeListener) {
    routeListener()
  }
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
