import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createUser, getAllUsers, getUserById, deleteUser } from '../api/auth'

export const useAdminStore = defineStore('admin', () => {
  const users = ref([])
  const currentUser = ref(null)
  const totalUsers = ref(0)
  const currentPage = ref(0)
  const usersPerPage = ref(20)
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchUsers(page = 0, limit = 20) {
    isLoading.value = true
    error.value = null

    try {
      const data = await getAllUsers(page, limit)
      users.value = data.users
      totalUsers.value = data.total
      currentPage.value = data.page
      usersPerPage.value = data.limit
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch users'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserDetails(userId) {
    isLoading.value = true
    error.value = null

    try {
      const data = await getUserById(userId)
      currentUser.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch user details'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function addUser(email, username, password) {
    isLoading.value = true
    error.value = null

    try {
      const data = await createUser(email, username, password)
      await fetchUsers(currentPage.value, usersPerPage.value)
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeUser(userId) {
    isLoading.value = true
    error.value = null

    try {
      await deleteUser(userId)
      await fetchUsers(currentPage.value, usersPerPage.value)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    users,
    currentUser,
    totalUsers,
    currentPage,
    usersPerPage,
    isLoading,
    error,
    fetchUsers,
    fetchUserDetails,
    addUser,
    removeUser,
    clearError
  }
})
