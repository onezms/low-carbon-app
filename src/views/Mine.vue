<template>
  <div class="mine-container">
    <el-card class="user-card">
      <div class="user-info">
        <div class="avatar">{{ userInfo.nickname?.charAt(0) || '用' }}</div>
        <div class="info">
          <h2>{{ userInfo.nickname }}</h2>
          <p>账号：{{ userInfo.username }}</p>
          <p>注册时间：{{ formatTime(userInfo.create_time) }}</p>
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

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="showProfile" title="编辑资料" width="500px">
      <el-form :model="profileForm" label-width="100px">
        <el-form-item label="昵称">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showProfile = false">取消</el-button>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPassword" title="修改密码" width="500px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="旧密码">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPassword = false">取消</el-button>
          <el-button type="primary" @click="savePassword">保存</el-button>
        </span>
      </template>
    </el-dialog>

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

const router = useRouter()
const userInfo = reactive({ nickname:'用户', username:'', total_point:0, total_carbon:0, check_days:0 })
const isAdmin = ref(localStorage.getItem('username') === 'admin')
const showSettings = ref(false)
const showProfile = ref(false)
const showPassword = ref(false)
const settingsForm = reactive({
  dataPath: ''
})
const profileForm = reactive({
  nickname: ''
})
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 获取用户信息和统计数据
const getUserInfo = () => {
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) return
    
    // 从数据库获取用户基本信息
    db.get(`SELECT * FROM user WHERE user_id = ?`, [userId], (err, user) => {
      if (!err && user) {
        userInfo.nickname = user.nickname
        userInfo.username = user.username
        userInfo.create_time = user.create_time
        userInfo.user_id = user.user_id
        
        // 重新计算总积分和减碳量
        db.all(`SELECT point, carbon_reduce FROM carbon_record WHERE user_id = ?`, [userId], (err, rows) => {
          if (!err && rows) {
            const totalPoint = rows.reduce((acc, row) => acc + (parseFloat(row.point) || 0), 0)
            const totalCarbon = rows.reduce((acc, row) => acc + (parseFloat(row.carbon_reduce) || 0), 0)
            userInfo.total_point = totalPoint
            userInfo.total_carbon = totalCarbon
            
            // 计算打卡天数
            db.all(`SELECT * FROM carbon_record WHERE user_id = ? AND record_type = '打卡'`, [userId], (err, checkRows) => {
              if (!err && checkRows) {
                const uniqueDates = new Set()
                checkRows.forEach(row => {
                  const recordDate = new Date(row.create_time).toISOString().split('T')[0]
                  uniqueDates.add(recordDate)
                })
                userInfo.check_days = uniqueDates.size
              } else {
                userInfo.check_days = 0
              }
              
              // 更新localStorage
              localStorage.setItem('userInfo', JSON.stringify(userInfo))
            })
          }
        })
      }
    })
  } catch (e) {
    console.error('获取用户信息失败:', e)
  }
}

onMounted(() => {
  try {
    const u = JSON.parse(localStorage.getItem('userInfo'))
    if(u) Object.assign(userInfo, u)
    // 获取当前数据存储路径
    settingsForm.dataPath = getDataPath()
    // 从数据库实时获取最新数据
    getUserInfo()
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
  } else if(index === 'profile') {
    // 填充当前昵称
    profileForm.nickname = userInfo.nickname
    showProfile.value = true
  } else if(index === 'password') {
    // 重置密码表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    showPassword.value = true
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

const saveProfile = () => {
  if (!profileForm.nickname) {
    ElMessage.error('请输入昵称')
    return
  }
  
  // 更新用户信息
  userInfo.nickname = profileForm.nickname
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
  
  // 更新数据库中的用户信息
  db.run(`UPDATE user SET nickname = ? WHERE user_id = ?`, [profileForm.nickname, userInfo.user_id], (err) => {
    if (err) {
      ElMessage.error('保存失败')
    } else {
      ElMessage.success('保存成功')
      showProfile.value = false
    }
  })
}

const savePassword = () => {
  if (!passwordForm.oldPassword) {
    ElMessage.error('请输入旧密码')
    return
  }
  if (!passwordForm.newPassword) {
    ElMessage.error('请输入新密码')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  
  // 检查旧密码是否正确
  db.get(`SELECT password FROM user WHERE user_id = ?`, [userInfo.user_id], (err, row) => {
    if (err || !row) {
      ElMessage.error('获取用户信息失败')
      return
    }
    
    if (row.password !== passwordForm.oldPassword) {
      ElMessage.error('旧密码错误')
      return
    }
    
    // 更新密码
    db.run(`UPDATE user SET password = ? WHERE user_id = ?`, [passwordForm.newPassword, userInfo.user_id], (err) => {
      if (err) {
        ElMessage.error('保存失败')
      } else {
        ElMessage.success('保存成功')
        showPassword.value = false
      }
    })
  })
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