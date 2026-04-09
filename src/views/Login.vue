<template>
  <div class="login-container">
    <div class="login-box">
      <div class="title">低碳生活管家</div>
      <div class="sub-title">个人碳足迹记录与激励系统 V1.0</div>
      <el-tabs v-model="activeTab" class="tabs">
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" label-width="80px">
            <el-form-item label="账号">
              <el-input v-model="loginForm.username" placeholder="请输入账号"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password></el-input>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="submit-btn" @click="handleLogin" block>登录</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="注册" name="register">
          <el-form :model="registerForm" label-width="80px">
            <el-form-item label="账号">
              <el-input v-model="registerForm.username" placeholder="请设置登录账号"></el-input>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="registerForm.nickname" placeholder="请设置昵称"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="registerForm.password" type="password" placeholder="请设置密码" show-password></el-input>
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="registerForm.rePassword" type="password" placeholder="请再次输入密码" show-password></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="success" class="submit-btn" @click="handleRegister" block>注册账号</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import db from '../services/dbService.js'

const router = useRouter()
const activeTab = ref('login')

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 注册表单
const registerForm = reactive({
  username: '',
  nickname: '',
  password: '',
  rePassword: ''
})

// 页面加载时读取记住的密码
onMounted(() => {
  const saveUser = localStorage.getItem('saveUser')
  if (saveUser) {
    const user = JSON.parse(saveUser)
    loginForm.username = user.username
    loginForm.password = user.password
    loginForm.remember = true
  }
})

// 登录逻辑
const handleLogin = () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.error('请输入账号和密码')
    return
  }
  // 查询数据库用户
  db.get(`SELECT * FROM user WHERE username = ?`, [loginForm.username], (err, row) => {
    if (err) {
      ElMessage.error('登录失败')
      return
    }
    if (!row) {
      ElMessage.error('账号不存在')
      return
    }
    if (row.password !== loginForm.password) {
      ElMessage.error('密码错误')
      return
    }
    // 登录成功，保存用户信息
    localStorage.setItem('userId', row.user_id)
    localStorage.setItem('userInfo', JSON.stringify(row))
    // 记住密码
    if (loginForm.remember) {
      localStorage.setItem('saveUser', JSON.stringify({
        username: loginForm.username,
        password: loginForm.password
      }))
    } else {
      localStorage.removeItem('saveUser')
    }
    ElMessage.success('登录成功')
    router.push('/index')
  })
}

// 注册逻辑
const handleRegister = () => {
  if (!registerForm.username || !registerForm.nickname || !registerForm.password) {
    ElMessage.error('请填写完整信息')
    return
  }
  if (registerForm.password !== registerForm.rePassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  // 检查用户名是否已存在
  db.get(`SELECT * FROM user WHERE username = ?`, [registerForm.username], (err, row) => {
    if (err) {
      ElMessage.error('注册失败')
      return
    }
    if (row) {
      ElMessage.error('账号已存在')
      return
    }
    // 插入用户到数据库
    db.run(`INSERT INTO user (username, nickname, password) VALUES (?, ?, ?)`,
      [registerForm.username, registerForm.nickname, registerForm.password],
      function (err) {
        if (err) {
          ElMessage.error('注册失败')
          return
        }
        ElMessage.success('注册成功，请登录')
        activeTab.value = 'login'
        // 清空注册表单
        Object.keys(registerForm).forEach(key => {
          registerForm[key] = ''
        })
      }
    )
  })
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-box {
  width: 450px;
  background-color: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.title {
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  color: #16a34a;
  margin-bottom: 10px;
}
.sub-title {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}
.tabs {
  width: 100%;
}
.submit-btn {
  height: 45px;
  font-size: 16px;
  font-weight: bold;
}
</style>