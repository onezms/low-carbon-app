import { createRouter, createWebHistory } from 'vue-router'

// 引入页面
const routes = [
  {
    path: '/',
    redirect: '/index',
    meta: { requireAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('../views/Index.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/point',
    name: 'Point',
    component: () => import('../views/Point.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/rank',
    name: 'Rank',
    component: () => import('../views/Rank.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('../views/Knowledge.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/stat',
    name: 'Stat',
    component: () => import('../views/Stat.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('../views/Mine.vue'),
    meta: { requireAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 登录拦截，未登录跳转到登录页
router.beforeEach((to, from, next) => {
  const isLogin = localStorage.getItem('userId')
  if (to.meta.requireAuth && !isLogin) {
    next('/login')
  } else {
    next()
  }
})

export default router