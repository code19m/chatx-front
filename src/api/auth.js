import apiClient from '../utils/axios'

export async function login(username, password) {
  const response = await apiClient.post('/auth/login', {
    username,
    password
  })
  return response.data
}

export async function logout() {
  const response = await apiClient.post('/auth/logout', {})
  return response.data
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/users/me')
  return response.data
}

export async function changePassword(oldPassword, newPassword) {
  const response = await apiClient.put('/auth/users/me/password', {
    old_password: oldPassword,
    new_password: newPassword
  })
  return response.data
}

export async function updateProfileImage(imagePath) {
  const response = await apiClient.put('/auth/users/me/image', {
    image_path: imagePath
  })
  return response.data
}

// Admin-only user management functions

export async function createUser(email, username, password) {
  const response = await apiClient.post('/auth/users', {
    email,
    username,
    password
  })
  return response.data
}

export async function getAllUsers(page = 0, limit = 20, search = '') {
  const params = { page, limit }
  if (search) {
    params.search = search
  }
  const response = await apiClient.get('/auth/users', { params })
  return response.data
}

export async function getUserById(userId) {
  const response = await apiClient.get(`/auth/users/${userId}`)
  return response.data
}

export async function deleteUser(userId) {
  const response = await apiClient.delete(`/auth/users/${userId}`)
  return response.data
}
