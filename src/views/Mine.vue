<template>
  <div class="mine-container">
    <el-card class="user-card">
      <div class="user-info">
        <div class="avatar">{{ userInfo.nickname?.charAt(0) || '用' }}</div>
        <div class="info">
          <h2>{{ userInfo.nickname }}</h2>
          <p>账号：{{ userInfo.username }}</p>
          <p>注册时间：{{ userInfo.create_time }}</p>
        </div>
      </div>
      <div class="stats">
        <div class="stat-item">
          <div class="num">{{ userInfo.total_point || 0 }}</div>
          <div class="label">总积分</div>
        </div>
        <div class="stat-item">
          <div class="num">{{ (userInfo.total_carbon || 0).toFixed(2) }}</div>
          <div class="label">累计减碳</div>
        </div>
        <div class="stat-item">
          <div class="num">{{ userInfo.check_days || 0 }}</div>
          <div class="label">打卡天数</div>
        </div>
      </div>
    </el-card>

    <el-card style="margin-top:20px">
      <el-menu @select="handleMenuSelect">
        <el-menu-item index="profile">编辑资料</el-menu-item>
        <el-menu-item index="password">修改密码</el-menu-item>
        <el-menu-item index="settings">设置</el-menu-item>
        <el-menu-item index="admin" v-if="isAdmin">后台管理</el-menu-item>
        <el-menu-item index="logout" style="color:red">退出登录</el-menu-item>
      </el-menu>
    </el-card>

    <!-- 设置对话框 -->
    <el-dialog v-model="showSettings" title="设置" width="600px">
      <el-form :model="settingsForm" label-width="120px">
        <el-form-item label="数据存储路径">
          <el-input v-model="settingsForm.dataPath" placeholder="请输入数据存储路径" readonly></el-input>
          <el-button type="primary" style="margin-top:10px" @click="selectDataPath">选择路径</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSettings = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import db, { getDataPath, setDataPath } from '../services/dbService.js'

const router = useRouter()
const userInfo = reactive({ nickname:'用户', username:'', total_point:0, total_carbon:0, check_days:0 })
const isAdmin = ref(localStorage.getItem('username') === 'admin')
const showSettings = ref(false)
const settingsForm = reactive({
  dataPath: ''
})

onMounted(() => {
  try {
    const u = JSON.parse(localStorage.getItem('userInfo'))
    if(u) Object.assign(userInfo, u)
    // 获取当前数据存储路径
    settingsForm.dataPath = getDataPath()
  } catch (e) {}
})

const handleMenuSelect = (index) => {
  if(index === 'logout'){
    ElMessageBox.confirm('确定退出？').then(() => {
      localStorage.clear()
      router.push('/login')
    })
  } else if(index === 'settings') {
    showSettings.value = true
  }
}

const selectDataPath = () => {
  // 在 Electron 环境中，使用原生文件选择器
  if (typeof window !== 'undefined' && window.electron) {
    window.electron.selectDirectory().then((path) => {
      if (path) {
        settingsForm.dataPath = path
      }
    })
  } else {
    ElMessage.info('请在桌面端应用中选择路径')
  }
}

const saveSettings = () => {
  const success = setDataPath(settingsForm.dataPath)
  if (success) {
    ElMessage.success('保存成功')
    showSettings.value = false
  } else {
    ElMessage.error('保存失败，请在桌面端应用中设置路径')
  }
}
</script>

<style scoped>
.mine-container { padding:20px; }
.user-card { background:linear-gradient(135deg,#16a34a,#22c55e); color:white; }
.user-info { display:flex; align-items:center; }
.avatar { width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.3); display:flex; align-items:center; justify-content:center; font-size:48px; margin-right:20px; }
.stats { display:flex; justify-content:space-around; padding-top:20px; border-top:1px solid rgba(255,255,255,0.3); }
.stat-item { text-align:center; }
.num { font-size:32px; font-weight:bold; }
.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>