<script setup>
import { ref, onMounted, watch } from 'vue'
import { getAllUsers } from '../../../api/auth'
import { checkDMExists } from '../../../api/chat'
import { useAuthStore } from '../../../stores/auth'
import { useChatStore } from '../../../stores/chat'

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const chatStore = useChatStore()

const users = ref([])
const isLoading = ref(false)
const isCreating = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const dmExistsCache = ref({}) // Cache DM existence checks

let searchTimeout = null

// Watch search query and fetch users from server
watch(searchQuery, (newQuery) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchUsers(newQuery)
  }, 300) // Debounce 300ms
})

onMounted(async () => {
  await fetchUsers()
})

async function fetchUsers(search = '') {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await getAllUsers(0, 100, search)
    // Filter out current user
    users.value = (data.users || []).filter(user => user.user_id !== authStore.user?.user_id)

    // Pre-check DM existence for all users (async, doesn't block UI)
    users.value.forEach(user => {
      checkIfDMExists(user.user_id)
    })
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to load users'
  } finally {
    isLoading.value = false
  }
}

async function checkIfDMExists(userId) {
  // Check cache first
  if (dmExistsCache.value[userId] !== undefined) {
    return dmExistsCache.value[userId]
  }

  try {
    const result = await checkDMExists(userId)
    dmExistsCache.value[userId] = result
    return result
  } catch (error) {
    // If check fails, assume DM doesn't exist
    return { exists: false }
  }
}

function hasDMWithUser(userId) {
  const cached = dmExistsCache.value[userId]
  return cached?.exists || false
}

function getExistingChatId(userId) {
  const cached = dmExistsCache.value[userId]
  return cached?.chat_id || null
}

async function handleCreateDM(userId) {
  isCreating.value = true
  errorMessage.value = ''

  try {
    // Check if DM already exists
    const dmCheck = await checkIfDMExists(userId)

    if (dmCheck.exists && dmCheck.chat_id) {
      // Navigate to existing chat
      chatStore.setActiveChat(dmCheck.chat_id)
      emit('close')
      return
    }

    // Create new DM
    const data = await chatStore.startDM(userId)

    // Set the newly created chat as active
    if (data.chat_id) {
      chatStore.setActiveChat(data.chat_id)
    }
    emit('close')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || error.message || 'Failed to create DM'
  } finally {
    isCreating.value = false
  }
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">New Direct Message</h2>

      <!-- Error message -->
      <div
        v-if="errorMessage"
        class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
      >
        {{ errorMessage }}
      </div>

      <!-- Search input -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search users..."
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
        />
      </div>

      <!-- Users list -->
      <div class="max-h-96 overflow-y-auto">
        <!-- Loading state -->
        <div v-if="isLoading" class="py-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p class="mt-2 text-gray-600 text-sm">Loading users...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="users.length === 0" class="py-8 text-center">
          <p class="text-gray-500">No users found</p>
        </div>

        <!-- Users -->
        <div v-else class="space-y-2">
          <button
            v-for="user in users"
            :key="user.user_id"
            @click="handleCreateDM(user.user_id)"
            :disabled="isCreating"
            class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-left"
          >
            <!-- Avatar -->
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {{ user.username.charAt(0).toUpperCase() }}
            </div>

            <!-- User info -->
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900">{{ user.username }}</div>
              <div class="text-sm text-gray-500 truncate">{{ user.email }}</div>
            </div>

            <!-- Status badge -->
            <span
              v-if="hasDMWithUser(user.user_id)"
              class="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"
            >
              Open chat
            </span>
            <span
              v-else-if="user.role === 'admin'"
              class="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"
            >
              Admin
            </span>
          </button>
        </div>
      </div>

      <!-- Close button -->
      <div class="mt-6 flex justify-end">
        <button
          @click="handleClose"
          :disabled="isCreating"
          class="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
