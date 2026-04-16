<template>
  <div class="stat-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="chart-card" title="月度减碳趋势">
          <div ref="lineChart" style="width:100%;height:400px;"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top:20px;">
      <el-col :span="12">
        <el-card class="chart-card" title="碳排放分类占比">
          <div ref="pieChart" style="width:100%;height:350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" title="每日减碳对比">
          <div ref="barChart" style="width:100%;height:350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import db from '../services/dbService.js'

const userId = ref(localStorage.getItem('userId') || 1)
const lineChart = ref(null)
const pieChart = ref(null)
const barChart = ref(null)

const chartData = ref({
  line: { months: [], data: [] },
  pie: [],
  bar: { days: [], data: [] }
})

// 获取月度减碳数据
const getMonthlyCarbonData = () => {
  return new Promise((resolve) => {
    const now = new Date()
    const months = []
    const data = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const monthStr = month + '月'
      months.push(monthStr)
      
      const startDate = year + '-' + String(month).padStart(2, '0') + '-01'
      const endMonth = month + 1
      const endDate = year + '-' + String(endMonth).padStart(2, '0') + '-01'
      
      db.all('SELECT SUM(carbon_reduce) as total FROM carbon_record WHERE user_id = ? AND create_time >= ? AND create_time < ?',
        [userId.value, startDate, endDate],
        (err, rows) => {
          const total = rows[0] && rows[0].total ? parseFloat(rows[0].total) : 0
          data.push(total)
          
          if (data.length === 6) {
            resolve({ months, data })
          }
        }
      )
    }
  })
}

// 获取碳排放分类数据
const getCarbonCategoryData = () => {
  return new Promise((resolve) => {
    db.all('SELECT record_type, SUM(carbon_output) as total_output FROM carbon_record WHERE user_id = ? GROUP BY record_type',
      [userId.value],
      (err, rows) => {
        if (rows && rows.length > 0) {
          const pieData = rows.map(row => ({
            value: row.total_output || 0,
            name: row.record_type
          }))
          resolve(pieData)
        } else {
          resolve([
            {value: 0, name: '出行'},
            {value: 0, name: '居家能耗'},
            {value: 0, name: '餐饮'},
            {value: 0, name: '其他'}
          ])
        }
      }
    )
  })
}

// 获取每日减碳数据（最近 7 天）
const getDailyCarbonData = () => {
  return new Promise((resolve) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const dayLabels = []
    const data = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      dayLabels.push(days[date.getDay()])
      
      const dateStr = date.toISOString().split('T')[0]
      
      db.all('SELECT SUM(carbon_reduce) as total FROM carbon_record WHERE user_id = ? AND date(create_time) = ?',
        [userId.value, dateStr],
        (err, rows) => {
          const total = rows[0] && rows[0].total ? parseFloat(rows[0].total) : 0
          data.push(total)
          
          if (data.length === 7) {
            resolve({ days: dayLabels, data })
          }
        }
      )
    }
  })
}

const initLineChart = () => {
  if(!lineChart.value) return
  const myChart = echarts.init(lineChart.value)
  myChart.setOption({
    title: { text: '月度减碳量（kgCO?）' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: chartData.value.line.months },
    yAxis: { type: 'value' },
    series: [{ 
      data: chartData.value.line.data, 
      type: 'line', 
      smooth: true, 
      areaStyle: { opacity: 0.3 },
      itemStyle: { color: '#16a34a' }
    }]
  })
}

const initPieChart = () => {
  if(!pieChart.value) return
  const myChart = echarts.init(pieChart.value)
  myChart.setOption({
    title: { text: '碳排放来源', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{ 
      type: 'pie', 
      radius: '50%', 
      data: chartData.value.pie,
      itemStyle: {
        color: (params) => {
          const colors = ['#16a34a', '#22c55e', '#059669', '#10b981']
          return colors[params.dataIndex % colors.length]
        }
      }
    }]
  })
}

const initBarChart = () => {
  if(!barChart.value) return
  const myChart = echarts.init(barChart.value)
  myChart.setOption({
    title: { text: '每日减碳对比' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: chartData.value.bar.days },
    yAxis: { type: 'value' },
    series: [{ 
      data: chartData.value.bar.data, 
      type: 'bar', 
      itemStyle: { color: '#16a34a' } 
    }]
  })
}

const loadAllData = async () => {
  const [lineData, pieData, barData] = await Promise.all([
    getMonthlyCarbonData(),
    getCarbonCategoryData(),
    getDailyCarbonData()
  ])
  
  chartData.value.line = lineData
  chartData.value.pie = pieData
  chartData.value.bar = barData
  
  setTimeout(() => {
    initLineChart()
    initPieChart()
    initBarChart()
  }, 100)
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.stat-container { padding: 20px; }
.chart-card { margin-bottom: 20px; }
</style>
