<template>
  <div id="app">
    <!-- 顶部导航栏，登录页不显示 -->
    <el-container v-if="$route.path !== '/login'">
      <el-header class="header">
        <div class="logo">低碳生活管家 V1.0</div>
        <el-menu mode="horizontal" :default-active="$route.path" router>
          <el-menu-item index="/index">低碳记账</el-menu-item>
          <el-menu-item index="/stat">数据统计</el-menu-item>
          <el-menu-item index="/point">积分中心</el-menu-item>
          <el-menu-item index="/rank">排行榜</el-menu-item>
          <el-menu-item index="/knowledge">低碳科普</el-menu-item>
          <el-menu-item index="/mine">个人中心</el-menu-item>
        </el-menu>
      </el-header>
    </el-container>
    <!-- 页面容器 -->
    <el-main class="main">
      <router-view />
    </el-main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.header {
  background-color: #16a34a;
  display: flex;
  align-items: center;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
}
.logo {
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-right: 30px;
}
.main {
  margin-top: 60px;
  min-height: calc(100vh - 60px);
  background-color: #f0fdf4;
  padding: 20px;
}
:deep(.el-menu) {
  border-bottom: none;
  background-color: #16a34a;
}
:deep(.el-menu-item) {
  color: white;
}
:deep(.el-menu-item.is-active) {
  background-color: #15803d;
  color: white;
}
</style>