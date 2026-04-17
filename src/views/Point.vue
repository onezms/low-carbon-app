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
    <el-card class="level-card" title="等级进度" style="margin-top:20px;">
      <div class="level-progress">
        <div class="level-info">
          <span class="current-level">{{ currentLevel.name }}</span>
          <span class="current-point">{{ userInfo.total_point || 0 }} 积分</span>
        </div>
        <el-progress 
          :percentage="levelProgress" 
          :color="levelColor"
          :stroke-width="15"
          :format="formatProgress"
        />
        <div class="next-level-info">
          距离 {{ nextLevel.name }} 还差 {{ nextLevel.neededPoints }} 积分
        </div>
      </div>
      <div class="level-list" style="margin-top:20px;">
        <div 
          v-for="level in allLevels" 
          :key="level.id"
          class="level-item"
          :class="{ 'level-active': level.id <= currentLevel.id, 'level-locked': level.id > currentLevel.id }"
        >
          <div class="level-icon">{{ level.icon }}</div>
          <div class="level-details">
            <div class="level-name">{{ level.name }}</div>
            <div class="level-requirement">{{ level.minPoints }} 积分</div>
          </div>
          <div class="level-status" v-if="level.id <= currentLevel.id">✓ 已获得</div>
          <div class="level-status level-status-locked" v-else>🔒 未获得</div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import db from '../services/dbService.js'

const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
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
const medals = ref([])

// 所有等级信息
const allLevels = [
  {id:0, name:'环保小白', icon:'🌼', minPoints:0},
  {id:1, name:'低碳新手', icon:'🌱', minPoints:10},
  {id:2, name:'绿色达人', icon:'🌿', minPoints:200},
  {id:3, name:'环保先锋', icon:'🌳', minPoints:500},
  {id:4, name:'地球卫士', icon:'🌍', minPoints:1000}
]

// 当前等级和下一级
const currentLevel = ref({id:0, name:'环保小白', icon:'🌼', minPoints:0})
const nextLevel = ref({id:1, name:'低碳新手', icon:'🌱', minPoints:10, neededPoints:10})
const levelProgress = ref(0)
const levelColor = ref('#16a34a')

// 计算用户勋章
const calculateMedals = () => {
  const point = userInfo.total_point || 0
  const userMedals = []
  
  // 勋章等级
  if (point >= 1000) {
    userMedals.push({id:4,name:'地球卫士',icon:'🌍'})
  } else if (point >= 500) {
    userMedals.push({id:3,name:'环保先锋',icon:'🌳'})
  } else if (point >= 200) {
    userMedals.push({id:2,name:'绿色达人',icon:'🌿'})
  } else if (point >= 10) {
    userMedals.push({id:1,name:'低碳新手',icon:'🌱'})
  } else {
    userMedals.push({id:0,name:'环保小白',icon:'🌼'})
  }
  
  medals.value = userMedals
}

// 计算等级进度
const calculateLevelProgress = () => {
  const point = userInfo.total_point || 0
  
  // 确定当前等级
  let current = allLevels[0]
  let next = allLevels[1]
  
  for (let i = allLevels.length - 1; i >= 0; i--) {
    if (point >= allLevels[i].minPoints) {
      current = allLevels[i]
      next = allLevels[i + 1] || current
      break
    }
  }
  
  currentLevel.value = current
  
  if (next === current) {
    nextLevel.value = { ...current, neededPoints: 0 }
    levelProgress.value = 100
    levelColor.value = '#16a34a'
  } else {
    nextLevel.value = {
      ...next,
      neededPoints: next.minPoints - point
    }
    
    // 计算进度百分比
    const progress = ((point - current.minPoints) / (next.minPoints - current.minPoints)) * 100
    levelProgress.value = Math.min(Math.max(progress, 0), 100)
    
    // 根据进度设置颜色
    if (levelProgress.value < 30) {
      levelColor.value = '#ef4444'
    } else if (levelProgress.value < 70) {
      levelColor.value = '#f59e0b'
    } else {
      levelColor.value = '#16a34a'
    }
  }
}

// 进度条格式化
const formatProgress = (percentage) => {
  return `${Math.round(percentage)}%`
}

const router = useRouter()
const route = useRoute()

const updateUserId = () => {
  userId.value = localStorage.getItem('userId') || 1
  getUserInfo()
  getPointList()
  calculateCheckDays()
}

const handleRouteChange = () => {
  updateUserId()
}

const calculateCheckDays = (callback) => {
  const today = new Date().toISOString().split('T')[0]
  db.all(`SELECT * FROM carbon_record WHERE user_id = ? AND record_type = '打卡'`, [userId.value], (err, rows) => {
    if (err || !rows || rows.length === 0) {
      db.run(`UPDATE user SET check_days = 0 WHERE user_id = ?`, [userId.value])
      userInfo.check_days = 0
      if (callback) callback(0)
      return
    }
    
    const uniqueDates = new Set()
    rows.forEach(row => {
      const recordDate = new Date(row.create_time).toISOString().split('T')[0]
      uniqueDates.add(recordDate)
    })
    
    const checkDays = uniqueDates.size
    
    db.run(`UPDATE user SET check_days = ? WHERE user_id = ?`, [checkDays, userId.value], (err) => {
      if (!err) {
        userInfo.check_days = checkDays
      }
      if (callback) callback(checkDays)
    })
  })
}
const getUserInfo = () => {
  try {
    // 从carbon_record表重新计算累计积分和减碳量
    db.all(`SELECT SUM(point) as total_point, SUM(carbon_reduce) as total_carbon FROM carbon_record WHERE user_id = ?`, [userId.value], (err, rows) => {
      if (!err && rows && rows[0]) {
        const totalPoint = parseFloat(rows[0].total_point) || 0
        const totalCarbon = parseFloat(rows[0].total_carbon) || 0
        
        // 更新用户信息
        userInfo.total_point = totalPoint
        userInfo.total_carbon = totalCarbon
        
        // 同时更新user表
        db.run(`UPDATE user SET total_point = ?, total_carbon = ? WHERE user_id = ?`, [totalPoint, totalCarbon, userId.value])
        
        calculateMedals()
        calculateLevelProgress()
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
  const today = new Date().toISOString().split('T')[0]
  db.all(`SELECT * FROM carbon_record WHERE user_id = ? AND record_type = '打卡'`, [userId.value], (err, rows) => {
    if (err) { ElMessage.error('查询失败'); return }
    
    const todayRecord = rows ? rows.find(r => {
      const recordDate = new Date(r.create_time).toISOString().split('T')[0]
      return recordDate === today
    }) : null
    
    if (todayRecord) {
      ElMessage.info('今天已经打卡过了')
      return
    }
    
    db.run(`INSERT INTO carbon_record (user_id, record_type, sub_type, point, carbon_output, carbon_reduce) VALUES (?, ?, ?, ?, ?, ?)`, [userId.value, '打卡', '每日打卡', 2, 0, 0], (err) => {
      if (err) { ElMessage.error('打卡失败'); return }
      db.run(`UPDATE user SET total_point = total_point + 2 WHERE user_id = ?`, [userId.value], (err) => {
        if (err) { ElMessage.error('更新积分失败'); return }
        ElMessage.success('打卡成功！获得 2 积分')
        calculateCheckDays(() => {
          getUserInfo()
          getPointList()
          setTimeout(() => {
            getUserInfo()
            getPointList()
          }, 100)
        })
      })
    })
  })
}
let routeListener = null

onMounted(() => {
  updateUserId()
  routeListener = router.afterEach(handleRouteChange)
})

onUnmounted(() => {
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

/* 等级进度样式 */
.level-progress {
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
}

.level-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.current-level {
  font-size: 18px;
  font-weight: bold;
  color: #16a34a;
}

.current-point {
  font-size: 16px;
  color: #64748b;
}

.next-level-info {
  margin-top: 15px;
  font-size: 14px;
  color: #64748b;
  text-align: center;
}

/* 等级列表样式 */
.level-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.level-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.level-item.level-active {
  background: #f0fdf4;
  border-color: #d1fae5;
}

.level-item.level-locked {
  background: #f8fafc;
  opacity: 0.7;
}

.level-icon {
  font-size: 32px;
  margin-right: 15px;
  flex-shrink: 0;
}

.level-details {
  flex: 1;
}

.level-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.level-requirement {
  font-size: 14px;
  color: #64748b;
}

.level-status {
  font-size: 14px;
  font-weight: bold;
  color: #16a34a;
}

.level-status-locked {
  color: #94a3b8;
}
</style>