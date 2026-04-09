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

const chartData = {
  line: { months: ['1月','2月','3月','4月','5月','6月'], data: [12, 19, 3, 5, 2, 30] },
  pie: [
    {value: 1048, name: '出行'},
    {value: 735, name: '居家能耗'},
    {value: 580, name: '餐饮'},
    {value: 484, name: '其他'}
  ],
  bar: { days: ['周一','周二','周三','周四','周五','周六','周日'], data: [5, 20, 36, 10, 10, 20, 30] }
}

const initLineChart = () => {
  if(!lineChart.value) return
  const myChart = echarts.init(lineChart.value)
  myChart.setOption({
    title: { text: '月度减碳量（kgCO₂）' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: chartData.line.months },
    yAxis: { type: 'value' },
    series: [{ data: chartData.line.data, type: 'line', smooth: true, areaStyle: { opacity: 0.3 } }]
  })
}

const initPieChart = () => {
  if(!pieChart.value) return
  const myChart = echarts.init(pieChart.value)
  myChart.setOption({
    title: { text: '碳排放来源', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: '50%', data: chartData.pie }]
  })
}

const initBarChart = () => {
  if(!barChart.value) return
  const myChart = echarts.init(barChart.value)
  myChart.setOption({
    title: { text: '每日减碳对比' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: chartData.bar.days },
    yAxis: { type: 'value' },
    series: [{ data: chartData.bar.data, type: 'bar', itemStyle: { color: '#16a34a' } }]
  })
}

onMounted(() => {
  setTimeout(() => {
    initLineChart()
    initPieChart()
    initBarChart()
  }, 100)
})
</script>

<style scoped>
.stat-container { padding: 20px; }
.chart-card { margin-bottom: 20px; }
</style>