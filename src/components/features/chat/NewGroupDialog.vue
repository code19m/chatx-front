<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { getAllUsers } from '../../../api/auth'
import { useAuthStore } from '../../../stores/auth'
import { useChatStore } from '../../../stores/chat'

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const chatStore = useChatStore()

const users = ref([])
const selectedUserIds = ref(new Set())
const groupName = ref('')
const isLoading = ref(false)
const isCreating = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

let searchTimeout = null

const canCreate = computed(() => {
  return groupName.value.trim().length > 0 && selectedUserIds.value.size > 0
})

watch(searchQuery, (newQuery) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchUsers(newQuery)
  }, 300)
})

onMounted(async () => {
  await fetchUsers()
})

async function fetchUsers(search = '') {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await getAllUsers(0, 100, search)
    users.value = (data.users || []).filter(user => user.user_id !== authStore.user?.user_id)
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to load users'
  } finally {
    isLoading.value = false
  }
}

function toggleUserSelection(userId) {
  if (selectedUserIds.value.has(userId)) {
    selectedUserIds.value.delete(userId)
  } else {
    selectedUserIds.value.add(userId)
  }
  selectedUserIds.value = new Set(selectedUserIds.value)
}

function isUserSelected(userId) {
  return selectedUserIds.value.has(userId)
}

async function handleCreateGroup() {
  if (!canCreate.value) {
    return
  }

  isCreating.value = true
  errorMessage.value = ''

  try {
    const participantIds = Array.from(selectedUserIds.value)
    const data = await chatStore.startGroup(groupName.value.trim(), participantIds)

    if (data.chat_id) {
      chatStore.setActiveChat(data.chat_id)
    }
    emit('close')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || error.message || 'Failed to create group'
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
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Create New Group</h2>

      <!-- Error message -->
      <div
        v-if="errorMessage"
        class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
      >
        {{ errorMessage }}
      </div>

      <!-- Group name input -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Group Name
        </label>
        <input
          v-model="groupName"
          type="text"
          placeholder="Enter group name..."
          maxlength="100"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
        />
      </div>

      <!-- Selected count -->
      <div class="mb-2 text-sm text-gray-600">
        {{ selectedUserIds.size }} participant{{ selectedUserIds.size !== 1 ? 's' : '' }} selected
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
      <div class="max-h-80 overflow-y-auto">
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
            @click="toggleUserSelection(user.user_id)"
            :disabled="isCreating"
            :class="[
              'w-full flex items-center gap-3 p-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-left',
              isUserSelected(user.user_id)
                ? 'bg-emerald-50 ring-2 ring-emerald-500'
                : 'hover:bg-gray-50'
            ]"
          >
            <!-- Checkbox -->
            <div
              :class="[
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition',
                isUserSelected(user.user_id)
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-gray-300'
              ]"
            >
              <svg
                v-if="isUserSelected(user.user_id)"
                class="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <!-- Avatar -->
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {{ user.username.charAt(0).toUpperCase() }}
            </div>

            <!-- User info -->
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900">{{ user.username }}</div>
              <div class="text-sm text-gray-500 truncate">{{ user.email }}</div>
            </div>

            <!-- Admin badge -->
            <span
              v-if="user.role === 'admin'"
              class="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"
            >
              Admin
            </span>
          </button>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="mt-6 flex justify-end gap-3">
        <button
          @click="handleClose"
          :disabled="isCreating"
          class="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          @click="handleCreateGroup"
          :disabled="!canCreate || isCreating"
          class="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {{ isCreating ? 'Creating...' : 'Create Group' }}
        </button>
      </div>
    </div>
  </div>
</template>
