import apiClient from '../utils/axios'

// Get paginated messages for a specific chat
export async function getMessages(chatId, page = 0, limit = 50) {
  const response = await apiClient.get(`/chat/chats/${chatId}/messages`, {
    params: { page, limit }
  })
  return response.data
}

// Send a new message
export async function sendMessage(chatId, content) {
  const response = await apiClient.post('/chat/messages', {
    chat_id: chatId,
    content
  })
  return response.data
}

// Edit an existing message
export async function editMessage(messageId, content) {
  const response = await apiClient.put(`/chat/messages/${messageId}`, {
    content
  })
  return response.data
}

// Delete a message
export async function deleteMessage(messageId) {
  const response = await apiClient.delete(`/chat/messages/${messageId}`)
  return response.data
}
