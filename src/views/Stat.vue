<template>
  <div class="stat-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="chart-card" title="�¶ȼ�̼����">
          <div ref="lineChart" style="width:100%;height:400px;"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top:20px;">
      <el-col :span="12">
        <el-card class="chart-card" title="̼�ŷŷ���ռ��">
          <div ref="pieChart" style="width:100%;height:350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" title="ÿ�ռ�̼�Ա�">
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

// 获取月度数据
const getMonthlyData = (callback) => {
  db.all(`SELECT date(create_time) as date, SUM(carbon_reduce) as total FROM carbon_record WHERE user_id = ? GROUP BY strftime('%Y-%m', create_time) ORDER BY create_time DESC LIMIT 6`, [userId.value], (err, rows) => {
    if (err || !rows) {
      callback({ months: ['1月','2月','3月','4月','5月','6月'], data: [0, 0, 0, 0, 0, 0] })
      return
    }
    
    // 处理数据
    const months = []
    const data = []
    rows.reverse().forEach(row => {
      const date = new Date(row.date)
      const monthName = (date.getMonth() + 1) + '月'
      months.push(monthName)
      data.push(parseFloat(row.total) || 0)
    })
    
    callback({ months, data })
  })
}

// 获取分类数据
const getCategoryData = (callback) => {
  db.all(`SELECT record_type, SUM(carbon_reduce) as total FROM carbon_record WHERE user_id = ? GROUP BY record_type`, [userId.value], (err, rows) => {
    if (err || !rows) {
      callback([{value: 1, name: '无数据'}])
      return
    }
    
    // 处理数据
    const pieData = rows.map(row => ({
      value: parseFloat(row.total) || 0,
      name: row.record_type
    }))
    
    callback(pieData)
  })
}

// 获取每日数据
const getDailyData = (callback) => {
  db.all(`SELECT date(create_time) as date, SUM(carbon_reduce) as total FROM carbon_record WHERE user_id = ? GROUP BY date(create_time) ORDER BY create_time DESC LIMIT 7`, [userId.value], (err, rows) => {
    if (err || !rows) {
      callback({ days: ['周一','周二','周三','周四','周五','周六','周日'], data: [0, 0, 0, 0, 0, 0, 0] })
      return
    }
    
    // 处理数据
    const days = []
    const data = []
    rows.reverse().forEach(row => {
      const date = new Date(row.date)
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const dayName = dayNames[date.getDay()]
      days.push(dayName)
      data.push(parseFloat(row.total) || 0)
    })
    
    callback({ days, data })
  })
}

const initLineChart = (data) => {
  if(!lineChart.value) return
  const myChart = echarts.init(lineChart.value)
  myChart.setOption({
    title: { text: '月度减碳量(kgCO₂)' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.months },
    yAxis: { type: 'value' },
    series: [{ data: data.data, type: 'line', smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#16a34a' } }]
  })
}

const initPieChart = (data) => {
  if(!pieChart.value) return
  const myChart = echarts.init(pieChart.value)
  myChart.setOption({
    title: { text: '碳排放来源', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{ 
      type: 'pie', 
      radius: '50%', 
      data: data,
      itemStyle: {
        color: (params) => {
          const colors = ['#16a34a', '#22c55e', '#059669', '#10b981']
          return colors[params.dataIndex % colors.length]
        }
      }
    }]
  })
}

const initBarChart = (data) => {
  if(!barChart.value) return
  const myChart = echarts.init(barChart.value)
  myChart.setOption({
    title: { text: '每日减碳对比' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: data.days },
    yAxis: { type: 'value' },
    series: [{ data: data.data, type: 'bar', itemStyle: { color: '#16a34a' } }]
  })
}

onMounted(() => {
  // 等待DOM完全渲染
  setTimeout(() => {
    // 先初始化图表实例
    const initCharts = () => {
      // 初始化月度数据图表
      getMonthlyData(monthlyData => {
        if (lineChart.value) {
          try {
            initLineChart(monthlyData)
          } catch (e) {
            console.error('Error initializing line chart:', e)
          }
        }
      })
      
      // 初始化分类数据图表
      getCategoryData(categoryData => {
        if (pieChart.value) {
          try {
            initPieChart(categoryData)
          } catch (e) {
            console.error('Error initializing pie chart:', e)
          }
        }
      })
      
      // 初始化每日数据图表
      getDailyData(dailyData => {
        if (barChart.value) {
          try {
            initBarChart(dailyData)
          } catch (e) {
            console.error('Error initializing bar chart:', e)
          }
        }
      })
    }
    
    // 再次延迟确保DOM完全就绪
    setTimeout(initCharts, 100)
  }, 50)
})
</script>

<style scoped>
.stat-container { padding: 20px; }
.chart-card { margin-bottom: 20px; }
</style>
