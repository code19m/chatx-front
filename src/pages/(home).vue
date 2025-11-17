<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.clearAuth()
  router.push('/login')
}

function goToAdmin() {
  router.push('/admin/users')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-purple-100">
    <!-- Temporary Navigation Bar -->
    <nav class="bg-white/80 backdrop-blur-sm border-b border-purple-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-8">
            <h1 class="text-2xl font-bold text-gray-900">ChatX</h1>
            <div class="flex gap-4">
              <router-link
                to="/"
                class="text-gray-700 hover:text-purple-600 font-medium transition"
              >
                Chats
              </router-link>
              <router-link
                v-if="authStore.isAdmin"
                to="/admin/users"
                class="text-gray-700 hover:text-purple-600 font-medium transition"
              >
                Admin
              </router-link>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ authStore.user?.username || 'User' }}</p>
                <p class="text-xs text-gray-500">{{ authStore.user?.role || 'user' }}</p>
              </div>
            </div>
            <button
              @click="handleLogout"
              class="text-gray-600 hover:text-red-600 font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto p-8">
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-purple-100">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Welcome to ChatX!</h2>
        <p class="text-gray-600 mb-8">Main chat interface will be implemented here</p>

        <div v-if="authStore.isAdmin" class="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Admin Access</h3>
          <p class="text-gray-600 mb-4">You have admin privileges. Manage users from the admin panel.</p>
          <button
            @click="goToAdmin"
            class="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg font-medium transition shadow-lg shadow-purple-500/30"
          >
            Go to Admin Panel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
