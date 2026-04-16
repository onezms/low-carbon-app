<template>
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

    <el-card class="list-card" title="完整排行">
      <el-table :data="rankList" stripe>
        <el-table-column type="index" label="排名" width="80" align="center">
          <template #default="scope">
            <span v-if="scope.$index<3">{{ scope.$index===0?'🥇':scope.$index===1?'🥈':'🥉' }}</span>
            <span v-else>{{ scope.$index+1 }}</span>
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
        <el-table-column prop="total_carbon" label="减碳(kg)"></el-table-column>
        <el-table-column prop="check_days" label="打卡天数"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import db from '../../db/index.js'

const topThree = ref([])
const rankList = ref([])

const getRankList = () => {
  db.all("SELECT user_id, nickname, total_point, total_carbon, check_days FROM user ORDER BY total_point DESC, total_carbon DESC", [], (err, rows) => {
    if (!err && rows) {
      rankList.value = rows
      topThree.value = rows.slice(0, 3)
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
.avatar { width:80px;height:80px;border-radius:50%;background:#16a34a;color:white;font-size:36px;display:flex;align-items:center;justify-content:center;margin:0 auto 15px; }
.table-avatar { width:40px;height:40px;border-radius:50%;background:#16a34a;color:white;display:flex;align-items:center;justify-content:center; }
</style>