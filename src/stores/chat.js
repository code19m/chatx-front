import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDMs,
  getGroups,
  getChatDetails,
  createDM,
  createGroup,
  markAsRead,
  getTotalUnreadCount,
  getUsersOnlineStatus
} from '../api/chat'

export const useChatStore = defineStore('chat', () => {
  const dms = ref([])
  const groups = ref([])
  const activeChat = ref(null)
  const activeChatDetails = ref(null)
  const totalUnreadCount = ref(0)
  const onlineStatuses = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Combine DMs and groups into a single list sorted by last message time
  const allChats = computed(() => {
    const dmChats = dms.value.map(dm => ({
      ...dm,
      type: 'direct',
      name: dm.other_username,
      avatar: dm.other_user_image,
      participant_id: dm.other_user_id
    }))

    const groupChats = groups.value.map(group => ({
      ...group,
      type: 'group',
      name: group.name,
      avatar: null
    }))

    const combined = [...dmChats, ...groupChats]

    // Sort by last message time (most recent first)
    return combined.sort((a, b) => {
      const timeA = a.last_message_sent_at ? new Date(a.last_message_sent_at) : new Date(0)
      const timeB = b.last_message_sent_at ? new Date(b.last_message_sent_at) : new Date(0)
      return timeB - timeA
    })
  })

  async function fetchDMs(page = 0, limit = 20) {
    loading.value = true
    error.value = null
    try {
      const data = await getDMs(page, limit)
      dms.value = data.dms || []
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch DMs'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchGroups(page = 0, limit = 20) {
    loading.value = true
    error.value = null
    try {
      const data = await getGroups(page, limit)
      groups.value = data.groups || []
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch groups'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAllChats() {
    await Promise.all([fetchDMs(), fetchGroups()])
  }

  async function fetchChatDetails(chatId) {
    loading.value = true
    error.value = null
    try {
      const data = await getChatDetails(chatId)
      activeChatDetails.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch chat details'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function startDM(otherUserId) {
    loading.value = true
    error.value = null
    try {
      const data = await createDM(otherUserId)
      await fetchDMs()
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create DM'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function startGroup(name, participantIds) {
    loading.value = true
    error.value = null
    try {
      const data = await createGroup(name, participantIds)
      await fetchGroups()
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create group'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function markChatAsRead(chatId, messageId) {
    try {
      await markAsRead(chatId, messageId)
      await fetchAllChats()
      await fetchTotalUnreadCount()
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to mark as read'
      throw err
    }
  }

  async function fetchTotalUnreadCount() {
    try {
      const data = await getTotalUnreadCount()
      totalUnreadCount.value = data.total_unread_count || 0
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch unread count'
      throw err
    }
  }

  async function fetchOnlineStatuses(userIds) {
    if (!userIds || userIds.length === 0) return

    try {
      const data = await getUsersOnlineStatus(userIds)
      const statusMap = {}
      data.statuses?.forEach(status => {
        statusMap[status.user_id] = status
      })
      onlineStatuses.value = statusMap
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch online statuses'
      throw err
    }
  }

  function setActiveChat(chatId) {
    const chat = allChats.value.find(c => c.chat_id === chatId)
    activeChat.value = chat || null
  }

  function clearError() {
    error.value = null
  }

  return {
    dms,
    groups,
    allChats,
    activeChat,
    activeChatDetails,
    totalUnreadCount,
    onlineStatuses,
    loading,
    error,
    fetchDMs,
    fetchGroups,
    fetchAllChats,
    fetchChatDetails,
    startDM,
    startGroup,
    markChatAsRead,
    fetchTotalUnreadCount,
    fetchOnlineStatuses,
    setActiveChat,
    clearError
  }
})
