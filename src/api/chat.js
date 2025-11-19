import apiClient from '../utils/axios'

// Get list of DM conversations
export async function getDMs(page = 0, limit = 20) {
  const response = await apiClient.get('/chat/chats/dms', {
    params: { page, limit }
  })
  return response.data
}

// Get list of group conversations
export async function getGroups(page = 0, limit = 20) {
  const response = await apiClient.get('/chat/chats/groups', {
    params: { page, limit }
  })
  return response.data
}

// Get detailed information about a specific chat
export async function getChatDetails(chatId) {
  const response = await apiClient.get(`/chat/chats/${chatId}`)
  return response.data
}

// Check if DM exists with a user
export async function checkDMExists(otherUserId) {
  const response = await apiClient.get('/chat/chats/dms/check', {
    params: { other_user_id: otherUserId }
  })
  return response.data
}

// Create a new DM conversation
export async function createDM(otherUserId) {
  const response = await apiClient.post('/chat/chats/dms', {
    other_user_id: otherUserId
  })
  return response.data
}

// Create a new group chat
export async function createGroup(name, participantIds) {
  const response = await apiClient.post('/chat/chats/groups', {
    name,
    participant_ids: participantIds
  })
  return response.data
}

// Mark messages as read
export async function markAsRead(chatId, messageId) {
  const response = await apiClient.post('/chat/chats/read', {
    chat_id: chatId,
    message_id: messageId
  })
  return response.data
}

// Get unread message count for a specific chat
export async function getChatUnreadCount(chatId) {
  const response = await apiClient.get(`/chat/chats/${chatId}/unread`)
  return response.data
}

// Get total unread message count
export async function getTotalUnreadCount() {
  const response = await apiClient.get('/chat/notifications/unread')
  return response.data
}

// Get online status for multiple users
export async function getUsersOnlineStatus(userIds) {
  const response = await apiClient.post('/chat/users/online-status', {
    user_ids: userIds
  })
  return response.data
}
