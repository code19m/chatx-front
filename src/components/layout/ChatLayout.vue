<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

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
  <div class="flex h-screen bg-lavender-50">
    <!-- Left Sidebar (Dark) -->
    <div class="w-20 bg-gray-900 flex flex-col items-center py-6 gap-6">
      <!-- Logo/Home -->
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:scale-105 transition">
        C
      </div>

      <!-- Navigation Icons -->
      <div class="flex-1 flex flex-col gap-4">
        <!-- All Chats -->
        <button
          @click="router.push('/')"
          class="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
          title="All Chats"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        <!-- Admin (only for admins) -->
        <button
          v-if="authStore.isAdmin"
          @click="goToAdmin"
          class="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
          title="Admin Panel"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>

      <!-- User Profile -->
      <div class="flex flex-col gap-4">
        <div
          class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-105 transition"
          :title="authStore.user?.username"
        >
          {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <button
          @click="handleLogout"
          class="w-12 h-12 rounded-xl bg-gray-800 hover:bg-red-600 flex items-center justify-center text-gray-300 hover:text-white transition"
          title="Logout"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content (Chat List + Messages Area) -->
    <div class="flex-1 flex">
      <slot />
    </div>
  </div>
</template>
