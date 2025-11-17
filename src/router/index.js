import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/(home).vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('../pages/admin.users.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (requiresAuth && !token) {
    next('/login')
  } else if (!requiresAuth && token && to.path === '/login') {
    next('/')
  } else if (requiresAdmin) {
    // Admin routes need additional check - import authStore dynamically
    import('../stores/auth').then(({ useAuthStore }) => {
      const authStore = useAuthStore()
      if (!authStore.isAdmin) {
        next('/')
      } else {
        next()
      }
    })
  } else {
    next()
  }
})

export default router
