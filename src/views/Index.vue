<template>
  <div class="index-container">
    <!-- 顶部今日减碳卡片 -->
    <el-row :gutter="20" class="top-card-row">
      <el-col :span="24">
        <el-card class="top-card">
          <div class="top-title">今日累计减碳量</div>
          <div class="top-num">{{ todayCarbon }} kgCO₂</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 记账场景切换 -->
    <el-tabs v-model="activeTab" class="record-tabs" type="card">
      <el-tab-pane label="出行记录" name="traffic">
        <el-card>
          <el-form :model="trafficForm" label-width="100px" :inline="true">
            <el-form-item label="出行方式">
              <el-select v-model="trafficForm.type" placeholder="请选择出行方式">
                <el-option v-for="option in trafficOptions" :key="option.value" :label="option.label" :value="option.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="出行里程(公里)">
              <el-input-number v-model="trafficForm.mileage" :min="0" :step="0.1" placeholder="请输入里程"></el-input-number>
            </el-form-item>
          </el-form>

          <!-- 出行方式选择显示 -->
          <div class="traffic-type-info" v-if="trafficForm.type">
            <el-alert
              :title="`当前选择: ${currentTrafficType}`"
              type="info"
              :closable="false"
              show-icon
            />
          </div>

          <!-- 计算结果展示 -->
          <div class="result-box" v-if="trafficForm.mileage > 0">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="本次碳排放">{{ carbonOutput }} kgCO₂</el-descriptions-item>
              <el-descriptions-item label="本次减碳量">{{ carbonReduce }} kgCO₂</el-descriptions-item>
              <el-descriptions-item label="可获得积分">{{ addPoint }} 分</el-descriptions-item>
            </el-descriptions>
          </div>

          <el-button type="primary" class="submit-btn" @click="submitTraffic" :disabled="!trafficForm.mileage" size="large">提交出行记录</el-button>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="居家能耗" name="home">
        <el-card>
          <el-form :model="homeForm" label-width="100px" :inline="true">
            <el-form-item label="今日用电量(度)">
              <el-input-number v-model="homeForm.electric" :min="0" :step="0.1" placeholder="请输入用电量"></el-input-number>
            </el-form-item>
            <el-form-item label="今日用水量(吨)">
              <el-input-number v-model="homeForm.water" :min="0" :step="0.1" placeholder="请输入用水量"></el-input-number>
            </el-form-item>
          </el-form>
          <el-button type="primary" class="submit-btn" @click="submitHome" :disabled="!homeForm.electric && !homeForm.water" size="large">提交能耗记录</el-button>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="垃圾分类" name="garbage">
        <el-card>
          <div class="garbage-tip">完成垃圾分类勾选，即可获得积分与减碳量</div>
          <el-checkbox-group v-model="garbageChecked">
            <el-checkbox label="可回收物"></el-checkbox>
            <el-checkbox label="厨余垃圾"></el-checkbox>
            <el-checkbox label="有害垃圾"></el-checkbox>
            <el-checkbox label="其他垃圾"></el-checkbox>
          </el-checkbox-group>
          <el-button type="primary" class="submit-btn" @click="submitGarbage" :disabled="garbageChecked.length === 0" size="large">提交分类记录</el-button>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 今日记录列表 -->
    <el-card class="record-list-card" title="今日记录">
      <el-table :data="todayRecord" stripe style="width: 100%">
        <el-table-column prop="record_type" label="记录类型" width="100" align="center"></el-table-column>
        <el-table-column prop="sub_type" label="详情" width="120" align="center"></el-table-column>
        <el-table-column prop="carbon_output" label="碳排放(kg)" width="100" align="center"></el-table-column>
        <el-table-column prop="carbon_reduce" label="减碳量(kg)" width="100" align="center"></el-table-column>
        <el-table-column prop="point" label="获得积分" width="80" align="center"></el-table-column>
        <el-table-column label="记录时间" width="150" align="center">
          <template #default="scope">
            {{ formatTime(scope.row.create_time) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
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

// 固定碳排放系数&积分规则
const CARBON_CONFIG = {
  carBase: 0.18, // 私家车基准碳排放，用于计算减碳量
  electricCoeff: 0.785, // 用电碳排放系数
  waterCoeff: 0.91, // 用水碳排放系数
  garbage: { point: 4, carbonReduce: 0.5 } // 垃圾分类规则
}

// 出行方式映射表
const TRAFFIC_TYPE_MAP = {
  walk: { name: '步行/自行车', coefficient: 0, point: 5 },
  bus: { name: '公交/地铁', coefficient: 0.04, point: 3 },
  electric: { name: '电动车', coefficient: 0.02, point: 2 },
  car: { name: '燃油私家车', coefficient: 0.18, point: 0 }
}

const activeTab = ref('traffic')
const userId = ref(localStorage.getItem('userId'))
const todayCarbon = ref(0)
const todayRecord = ref([])

// 出行表单
const trafficForm = reactive({
  type: 'walk',
  mileage: 0
})

// 居家能耗表单
const homeForm = reactive({
  electric: 0,
  water: 0
})

// 垃圾分类
const garbageChecked = ref([])

// 出行方式配置
const trafficOptions = [
  { label: '步行/自行车', value: 'walk', coefficient: 0, point: 5 },
  { label: '公交/地铁', value: 'bus', coefficient: 0.04, point: 3 },
  { label: '电动车', value: 'electric', coefficient: 0.02, point: 2 },
  { label: '燃油私家车', value: 'car', coefficient: 0.18, point: 0 }
]

// 计算出行碳排放、减碳量、积分
const carbonOutput = computed(() => {
  if (!trafficForm.mileage) return 0
  const option = trafficOptions.find(opt => opt.value === trafficForm.type)
  const coefficient = option ? option.coefficient : 0
  return (trafficForm.mileage * coefficient).toFixed(3)
})

const carbonReduce = computed(() => {
  return (trafficForm.mileage * CARBON_CONFIG.carBase - parseFloat(carbonOutput.value)).toFixed(3)
})

const addPoint = computed(() => {
  if (!trafficForm.mileage) return 0
  const option = trafficOptions.find(opt => opt.value === trafficForm.type)
  return option ? option.point : 0
})

// 获取当前选择的出行方式名称
const currentTrafficType = computed(() => {
  const option = trafficOptions.find(opt => opt.value === trafficForm.type)
  return option ? option.label : ''
})

// 提交出行记录
const submitTraffic = () => {
  if (!userId.value) {
    ElMessage.error('请先登录')
    return
  }
  
  const option = trafficOptions.find(opt => opt.value === trafficForm.type)
  const subType = option ? option.label : ''
  const point = parseInt(addPoint.value)
  const carbonReduceNum = parseFloat(carbonReduce.value)
  const carbonOutputNum = parseFloat(carbonOutput.value)

  // 1. 插入记录到数据库
  db.run(`INSERT INTO carbon_record (user_id, record_type, sub_type, value, carbon_output, carbon_reduce, point) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId.value, '出行', subType, trafficForm.mileage, carbonOutputNum, carbonReduceNum, point],
    function (err) {
      if (err) {
        console.error('插入记录失败:', err)
        ElMessage.error('提交失败')
        return
      }
      // 2. 更新用户总积分和总减碳量
      db.run(`UPDATE user SET total_point = total_point + ?, total_carbon = total_carbon + ? WHERE user_id = ?`,
        [point, carbonReduceNum, userId.value],
        (err) => {
          if (err) {
            console.error('更新用户数据失败:', err)
            ElMessage.error('更新用户数据失败')
            return
          }
          ElMessage.success('记录提交成功')
          // 重置表单
          trafficForm.mileage = 0
          // 刷新数据
          getTodayCarbon()
          getTodayRecord()
          // 强制刷新用户数据
          setTimeout(() => {
            getTodayCarbon()
            getTodayRecord()
          }, 100)
        }
      )
    }
  )
}

// 提交居家能耗记录
const submitHome = () => {
  if (!userId.value) {
    ElMessage.error('请先登录')
    return
  }
  
  let totalCarbonOutput = 0
  if (homeForm.electric) {
    totalCarbonOutput += homeForm.electric * CARBON_CONFIG.electricCoeff
  }
  if (homeForm.water) {
    totalCarbonOutput += homeForm.water * CARBON_CONFIG.waterCoeff
  }
  totalCarbonOutput = totalCarbonOutput.toFixed(3)

  // 插入记录
  db.run(`INSERT INTO carbon_record (user_id, record_type, sub_type, value, carbon_output, carbon_reduce, point) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId.value, '居家能耗', '用电用水', homeForm.electric + '度/' + homeForm.water + '吨', totalCarbonOutput, 0, 0],
    function (err) {
      if (err) {
        console.error('插入记录失败:', err)
        ElMessage.error('提交失败')
        return
      }
      ElMessage.success('记录提交成功')
      // 重置表单
      homeForm.electric = 0
      homeForm.water = 0
      // 刷新数据
      getTodayRecord()
    }
  )
}

// 提交垃圾分类记录
const submitGarbage = () => {
  if (!userId.value) {
    ElMessage.error('请先登录')
    return
  }
  
  const { point, carbonReduce } = CARBON_CONFIG.garbage
  // 插入记录
  db.run(`INSERT INTO carbon_record (user_id, record_type, sub_type, carbon_output, carbon_reduce, point) VALUES (?, ?, ?, ?, ?, ?)`,
    [userId.value, '垃圾分类', garbageChecked.value.join('、'), 0, carbonReduce, point],
    function (err) {
      if (err) {
        console.error('插入记录失败:', err)
        ElMessage.error('提交失败')
        return
      }
      // 更新用户数据
      db.run(`UPDATE user SET total_point = total_point + ?, total_carbon = total_carbon + ? WHERE user_id = ?`,
        [point, carbonReduce, userId.value],
        (err) => {
          if (err) {
            console.error('更新用户数据失败:', err)
            ElMessage.error('更新用户数据失败')
            return
          }
          ElMessage.success('分类提交成功')
          // 重置
          garbageChecked.value = []
          // 刷新
          getTodayCarbon()
          getTodayRecord()
        }
      )
    }
  )
}

// 获取今日累计减碳量
const getTodayCarbon = () => {
  const today = new Date().toISOString().split('T')[0]
  db.all(`SELECT SUM(carbon_reduce) as total FROM carbon_record WHERE user_id = ? AND date(create_time) = ?`,
    [userId.value, today],
    (err, rows) => {
      if (!err && rows[0].total) {
        todayCarbon.value = rows[0].total.toFixed(3)
      }
    }
  )
}

// 获取今日记录列表
const getTodayRecord = () => {
  const today = new Date().toISOString().split('T')[0]
  db.all(`SELECT * FROM carbon_record WHERE user_id = ? AND date(create_time) = ? ORDER BY create_time DESC`,
    [userId.value, today],
    (err, rows) => {
      if (!err) {
        todayRecord.value = rows
      }
    }
  )
}

onMounted(() => {
  getTodayCarbon()
  getTodayRecord()
})
</script>

<style scoped>
.index-container {
  max-width: 1200px;
  margin: 0 auto;
}
.top-card-row {
  margin-bottom: 20px;
}
.top-card {
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  text-align: center;
  border: none;
}
.top-title {
  font-size: 18px;
  opacity: 0.9;
}
.top-num {
  font-size: 48px;
  font-weight: bold;
  margin-top: 10px;
}
.record-tabs {
  margin-bottom: 20px;
}
.traffic-type-info {
  margin: 10px 0;
}
.result-box {
  margin: 20px 0;
}
.submit-btn {
  width: 100%;
  margin-top: 20px;
}
.garbage-tip {
  margin-bottom: 20px;
  color: #666;
}
.record-list-card {
  margin-top: 20px;
}

/* 强制表头文字居中 */
:deep(.el-table th.el-table__cell > .cell) {
  text-align: center !important;
}
</style>