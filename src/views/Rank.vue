﻿﻿﻿﻿﻿<template>
  <div class="rank-container">
    <el-row :gutter="20" class="top-three-row">
      <el-col :span="8" v-for="(item,index) in topThree" :key="item.user_id">
        <el-card class="top-card" :class="'top-'+(index+1)">
          <div class="rank-num">{{ index===0?'🥇':index===1?'🥈':'🥉' }}</div>
          <div class="avatar">{{ item.nickname?.charAt(0) || '?' }}</div>
          <div class="name">{{ item.nickname }}</div>
          <div class="score">{{ item.total_point }} 积分</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="list-card">
      <template #header>
        <div style="font-weight:bold">完整排行</div>
      </template>
      <el-table :data="rankList" stripe>
        <el-table-column type="index" label="排名" width="80" align="center">
          <template #default="{$index}">
            <span v-if="$index<3">{{ $index===0?'金牌':$index===1?'银牌':'铜牌' }}</span>
            <span v-else>{{ $index+1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户">
          <template #default="scope">
            <div style="display:flex;align-items:center">
              <div class="table-avatar">{{ scope.row.nickname?.charAt(0) || '?' }}</div>
              <span style="margin-left:10px">{{ scope.row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total_point" label="积分"></el-table-column>
        <el-table-column label="减碳 (kg)">
          <template #default="scope">
            {{ parseFloat(scope.row.total_carbon || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="check_days" label="打卡天数"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import db from '../services/dbService.js'

const topThree = ref([])
const rankList = ref([])

const getRankList = () => {
  db.all("SELECT user_id, nickname, total_point, total_carbon FROM user ORDER BY total_point DESC, total_carbon DESC", [], (err, users) => {
    if (!err && users) {
      const processUsers = async (userList) => {
        const processedUsers = []
        for (const user of userList) {
          // 计算每个用户的打卡天数
          const checkDays = await new Promise((resolve) => {
            db.all(`SELECT * FROM carbon_record WHERE user_id = ? AND record_type = '打卡'`, [user.user_id], (err, rows) => {
              if (err || !rows || rows.length === 0) {
                resolve(0)
              } else {
                const uniqueDates = new Set()
                rows.forEach(row => {
                  const recordDate = new Date(row.create_time).toISOString().split('T')[0]
                  uniqueDates.add(recordDate)
                })
                resolve(uniqueDates.size)
              }
            })
          })
          processedUsers.push({
            ...user,
            check_days: checkDays
          })
        }
        return processedUsers
      }
      
      processUsers(users).then(processedUsers => {
        rankList.value = processedUsers
        topThree.value = processedUsers.slice(0, 3)
      })
    } else {
      rankList.value = []
      topThree.value = []
    }
  })
}

onMounted(() => {
  getRankList()
})
</script>

<style scoped>
.rank-container { padding:20px; }
.top-three-row { margin-bottom:30px; }
.top-card { text-align:center; border:none; }
.top-1 { background: linear-gradient(135deg, #ffd700, #ffed4e); }
.top-2 { background: linear-gradient(135deg, #c0c0c0, #e8e8e8); }
.top-3 { background: linear-gradient(135deg, #cd7f32, #e09856); }
.rank-num { font-size:24px; margin-bottom:10px; }
.avatar { width:80px;height:80px;border-radius:50%;background:#16a34a;color:white;font-size:36px;display:flex;align-items:center;justify-content:center;margin:0 auto 15px; }
.table-avatar { width:40px;height:40px;border-radius:50%;background:#16a34a;color:white;display:flex;align-items:center;justify-content:center; }
</style>