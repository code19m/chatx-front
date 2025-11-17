<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAdminStore } from '../stores/admin'

const router = useRouter()
const authStore = useAuthStore()
const adminStore = useAdminStore()

const showNewUserModal = ref(false)
const userToDelete = ref(null)
const showDeleteConfirm = ref(false)

// New user form
const newUserForm = ref({
  email: '',
  username: '',
  password: ''
})
const formErrors = ref({})
const isSubmitting = ref(false)

// Redirect non-admin users
onMounted(async () => {
  if (!authStore.isAdmin) {
    router.push('/')
    return
  }

  await adminStore.fetchUsers()
})

const totalPages = computed(() => {
  return Math.ceil(adminStore.totalUsers / adminStore.usersPerPage)
})

async function handlePageChange(page) {
  await adminStore.fetchUsers(page, adminStore.usersPerPage)
}

function openNewUserModal() {
  showNewUserModal.value = true
}

function closeNewUserModal() {
  showNewUserModal.value = false
  newUserForm.value = { email: '', username: '', password: '' }
  formErrors.value = {}
}

function validateForm() {
  const errors = {}

  if (!newUserForm.value.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserForm.value.email)) {
    errors.email = 'Invalid email format'
  }

  if (!newUserForm.value.username) {
    errors.username = 'Username is required'
  } else if (newUserForm.value.username.length < 3) {
    errors.username = 'Username must be at least 3 characters'
  } else if (newUserForm.value.username.length > 30) {
    errors.username = 'Username must be less than 30 characters'
  } else if (!/^[a-zA-Z0-9_]+$/.test(newUserForm.value.username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores'
  }

  if (!newUserForm.value.password) {
    errors.password = 'Password is required'
  } else if (newUserForm.value.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  formErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleCreateUser() {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    await adminStore.addUser(
      newUserForm.value.email,
      newUserForm.value.username,
      newUserForm.value.password
    )
    closeNewUserModal()
  } catch (error) {
    if (error.response?.data?.fields) {
      formErrors.value = error.response.data.fields
    }
  } finally {
    isSubmitting.value = false
  }
}

function confirmDelete(user) {
  userToDelete.value = user
  showDeleteConfirm.value = true
}

function cancelDelete() {
  userToDelete.value = null
  showDeleteConfirm.value = false
}

async function handleDelete() {
  if (!userToDelete.value) return

  try {
    await adminStore.removeUser(userToDelete.value.user_id)
    cancelDelete()
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-purple-100 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
          <p class="text-gray-600">Manage all users in the system</p>
        </div>
        <button
          @click="openNewUserModal"
          class="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg shadow-purple-500/30"
        >
          + New User
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="adminStore.error"
        class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between"
      >
        <span>{{ adminStore.error }}</span>
        <button @click="adminStore.clearError" class="text-red-700 hover:text-red-900">
          ✕
        </button>
      </div>

      <!-- Users Table -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-purple-100">
        <!-- Loading State -->
        <div v-if="adminStore.isLoading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p class="mt-4 text-gray-600">Loading users...</p>
        </div>

        <!-- Users List -->
        <div v-else-if="adminStore.users.length > 0">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="user in adminStore.users"
                :key="user.user_id"
                class="hover:bg-purple-50/50 transition"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-medium text-gray-900">{{ user.username }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ user.email }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(user.created_at) }}</td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click="confirmDelete(user)"
                    :disabled="user.user_id === authStore.user?.user_id"
                    class="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p class="text-sm text-gray-600">
              Showing {{ adminStore.users.length }} of {{ adminStore.totalUsers }} users
            </p>
            <div class="flex gap-2">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="handlePageChange(page - 1)"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition',
                  page - 1 === adminStore.currentPage
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'bg-white text-gray-700 hover:bg-purple-50'
                ]"
              >
                {{ page }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="p-12 text-center">
          <p class="text-gray-500 text-lg">No users found</p>
          <button
            @click="openNewUserModal"
            class="mt-4 text-purple-600 hover:text-purple-800 font-medium"
          >
            Create your first user
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="cancelDelete"
    >
      <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete user <strong>{{ userToDelete?.username }}</strong>? This action cannot be undone.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="cancelDelete"
            class="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>

    <!-- New User Modal -->
    <div
      v-if="showNewUserModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeNewUserModal"
    >
      <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Create New User</h2>

        <form @submit.prevent="handleCreateUser" class="space-y-5">
          <!-- Email Field -->
          <div>
            <label for="new-email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="new-email"
              v-model="newUserForm.email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              :class="{ 'border-red-500': formErrors.email }"
              placeholder="user@example.com"
            />
            <p v-if="formErrors.email" class="mt-1 text-sm text-red-600">
              {{ formErrors.email }}
            </p>
          </div>

          <!-- Username Field -->
          <div>
            <label for="new-username" class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="new-username"
              v-model="newUserForm.username"
              type="text"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              :class="{ 'border-red-500': formErrors.username }"
              placeholder="johndoe"
            />
            <p v-if="formErrors.username" class="mt-1 text-sm text-red-600">
              {{ formErrors.username }}
            </p>
            <p v-else class="mt-1 text-xs text-gray-500">
              3-30 characters, letters, numbers, and underscores only
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="new-password"
              v-model="newUserForm.password"
              type="password"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              :class="{ 'border-red-500': formErrors.password }"
              placeholder="••••••••"
            />
            <p v-if="formErrors.password" class="mt-1 text-sm text-red-600">
              {{ formErrors.password }}
            </p>
            <p v-else class="mt-1 text-xs text-gray-500">
              Minimum 8 characters
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 justify-end pt-4">
            <button
              type="button"
              @click="closeNewUserModal"
              :disabled="isSubmitting"
              class="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition disabled:opacity-50 shadow-lg shadow-purple-500/30"
            >
              <span v-if="!isSubmitting">Create User</span>
              <span v-else>Creating...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
