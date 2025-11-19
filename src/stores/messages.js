import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage
} from '../api/messages'

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref([])
  const currentPage = ref(0)
  const totalMessages = ref(0)
  const messagesPerPage = ref(50)
  const loading = ref(false)
  const sending = ref(false)
  const error = ref(null)

  const isLoading = computed(() => loading.value || sending.value)

  async function fetchMessages(chatId, page = 0, limit = 50) {
    loading.value = true
    error.value = null
    try {
      const data = await getMessages(chatId, page, limit)
      messages.value = data.messages || []
      totalMessages.value = data.total || 0
      currentPage.value = data.page || 0
      messagesPerPage.value = data.limit || 50
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch messages'
      messages.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function send(chatId, content) {
    sending.value = true
    error.value = null
    try {
      const data = await sendMessage(chatId, content)
      // Refresh messages after sending
      await fetchMessages(chatId, currentPage.value, messagesPerPage.value)
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to send message'
      throw err
    } finally {
      sending.value = false
    }
  }

  async function edit(messageId, content, chatId) {
    loading.value = true
    error.value = null
    try {
      await editMessage(messageId, content)
      // Refresh messages after editing
      await fetchMessages(chatId, currentPage.value, messagesPerPage.value)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to edit message'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(messageId, chatId) {
    loading.value = true
    error.value = null
    try {
      await deleteMessage(messageId)
      // Refresh messages after deleting
      await fetchMessages(chatId, currentPage.value, messagesPerPage.value)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete message'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearMessages() {
    messages.value = []
    currentPage.value = 0
    totalMessages.value = 0
  }

  function clearError() {
    error.value = null
  }

  return {
    messages,
    currentPage,
    totalMessages,
    messagesPerPage,
    loading,
    sending,
    isLoading,
    error,
    fetchMessages,
    send,
    edit,
    remove,
    // Aliases for compatibility
    sendMessage: send,
    editMessage: edit,
    deleteMessage: remove,
    clearMessages,
    clearError
  }
})
