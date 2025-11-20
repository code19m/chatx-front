<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import ChatLayout from '../components/layout/ChatLayout.vue'
import MessageBubble from '../components/features/chat/MessageBubble.vue'
import MessageInput from '../components/features/chat/MessageInput.vue'
import NewDMDialog from '../components/features/chat/NewDMDialog.vue'
import NewGroupDialog from '../components/features/chat/NewGroupDialog.vue'
import ChatDetailsPanel from '../components/features/chat/ChatDetailsPanel.vue'
import { useChatStore } from '../stores/chat'
import { useMessagesStore } from '../stores/messages'

const chatStore = useChatStore()
const messagesStore = useMessagesStore()

const messagesContainer = ref(null)
const editingMessageId = ref(null)
const editingContent = ref('')
const showNewDMDialog = ref(false)
const showNewGroupDialog = ref(false)

const activeChat = computed(() => chatStore.activeChat)
const messages = computed(() => messagesStore.messages)
const isLoading = computed(() => messagesStore.isLoading)
const hasMore = computed(() => messagesStore.hasMore)
const loadingMore = computed(() => messagesStore.loadingMore)

onMounted(async () => {
  await chatStore.fetchAllChats()
  await chatStore.fetchTotalUnreadCount()

  // Fetch online statuses for all DM participants
  const dmUserIds = chatStore.dms.map(dm => dm.other_user_id)
  if (dmUserIds.length > 0) {
    await chatStore.fetchOnlineStatuses(dmUserIds)
  }
})

// Watch for active chat changes and load messages
watch(activeChat, async (newChat) => {
  if (newChat) {
    editingMessageId.value = null
    editingContent.value = ''
    await messagesStore.fetchMessages(newChat.chat_id)
    scrollToBottom()

    // Mark chat as read if there are messages
    if (messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1]
      await chatStore.markChatAsRead(newChat.chat_id, lastMessage.message_id)
    }
  }
}, { immediate: true })

// Watch for new messages and scroll to bottom
watch(() => messages.value.length, async () => {
  nextTick(() => scrollToBottom())

  // Mark as read when new messages arrive
  if (activeChat.value && messages.value.length > 0) {
    const lastMessage = messages.value[messages.value.length - 1]
    await chatStore.markChatAsRead(activeChat.value.chat_id, lastMessage.message_id)
  }
})

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function handleScroll() {
  if (!messagesContainer.value || !activeChat.value) return

  const container = messagesContainer.value
  const scrollTop = container.scrollTop

  // If scrolled near the top (within 150px) and there are more messages
  if (scrollTop < 150 && hasMore.value && !loadingMore.value) {
    // Get the ID of the first currently visible message
    const firstMessageId = messages.value[0]?.message_id

    await messagesStore.loadMoreMessages(activeChat.value.chat_id)

    // Wait for Vue to update the DOM
    await nextTick()

    // Wait a bit more for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Find the message that was previously first and scroll to it
    if (firstMessageId) {
      const messageElements = container.querySelectorAll('[class*="flex mb-4"]')
      const messageArray = Array.from(messageElements)

      // Find the element by matching message ID from the messages array
      const oldFirstMessageIndex = messages.value.findIndex(m => m.message_id === firstMessageId)
      if (oldFirstMessageIndex >= 0 && messageArray[oldFirstMessageIndex]) {
        messageArray[oldFirstMessageIndex].scrollIntoView({ block: 'start', behavior: 'instant' })
      }
    }
  }
}

async function handleSendMessage(content) {
  if (!activeChat.value) return

  if (editingMessageId.value) {
    // Edit existing message
    await messagesStore.editMessage(editingMessageId.value, content)
    editingMessageId.value = null
    editingContent.value = ''
  } else {
    // Send new message
    await messagesStore.sendMessage(activeChat.value.chat_id, content)
  }
}

function handleEditMessage(messageId) {
  const message = messages.value.find(m => m.message_id === messageId)
  if (message) {
    editingMessageId.value = messageId
    editingContent.value = message.content
  }
}

function handleCancelEdit() {
  editingMessageId.value = null
  editingContent.value = ''
}

async function handleDeleteMessage(messageId) {
  if (confirm('Are you sure you want to delete this message?')) {
    await messagesStore.deleteMessage(messageId)
  }
}

function getChatDisplayName(chat) {
  if (chat.type === 'direct') {
    return chat.name
  }
  return chat.name || 'Group Chat'
}

function openNewDMDialog() {
  showNewDMDialog.value = true
}

function closeNewDMDialog() {
  showNewDMDialog.value = false
}

function openNewGroupDialog() {
  showNewGroupDialog.value = true
}

function closeNewGroupDialog() {
  showNewGroupDialog.value = false
}

async function handleLoadMore() {
  if (!messagesContainer.value || !activeChat.value) return

  const container = messagesContainer.value

  // Get the ID of the first currently visible message
  const firstMessageId = messages.value[0]?.message_id

  await messagesStore.loadMoreMessages(activeChat.value.chat_id)

  // Wait for Vue to update the DOM
  await nextTick()

  // Wait a bit more for rendering to complete
  await new Promise(resolve => setTimeout(resolve, 100))

  // Find the message that was previously first and scroll to it
  if (firstMessageId) {
    const messageElements = container.querySelectorAll('[class*="flex mb-4"]')
    const messageArray = Array.from(messageElements)

    // Find the element by matching message ID from the messages array
    const oldFirstMessageIndex = messages.value.findIndex(m => m.message_id === firstMessageId)
    if (oldFirstMessageIndex >= 0 && messageArray[oldFirstMessageIndex]) {
      messageArray[oldFirstMessageIndex].scrollIntoView({ block: 'start', behavior: 'instant' })
    }
  }
}
</script>

<template>
  <ChatLayout>
    <!-- Chat List Panel -->
    <div class="w-96 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">Chats</h2>
        <div class="flex gap-2">
          <button
            @click="openNewDMDialog"
            class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex items-center justify-center transition shadow-md cursor-pointer"
            title="New Direct Message"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button
            @click="openNewGroupDialog"
            class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex items-center justify-center transition shadow-md cursor-pointer"
            title="New Group Chat"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Chat List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="chatStore.loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p class="mt-2 text-gray-600 text-sm">Loading chats...</p>
        </div>

        <div v-else-if="chatStore.allChats.length === 0" class="p-8 text-center">
          <p class="text-gray-500">No chats yet</p>
          <p class="text-sm text-gray-400 mt-2">Start a conversation!</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="chat in chatStore.allChats"
            :key="chat.chat_id"
            class="p-4 hover:bg-emerald-50 cursor-pointer transition flex items-center gap-3"
            :class="{ 'bg-emerald-50': activeChat?.chat_id === chat.chat_id }"
            @click="chatStore.setActiveChat(chat.chat_id)"
          >
            <!-- Avatar with online status -->
            <div class="relative flex-shrink-0">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                {{ chat.name?.charAt(0).toUpperCase() || '?' }}
              </div>
              <!-- Online indicator (only for DMs) -->
              <div
                v-if="chat.type === 'direct' && chatStore.onlineStatuses[chat.participant_id]?.is_online"
                class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
              ></div>
            </div>

            <!-- Chat Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h3 class="font-semibold text-gray-900 truncate">{{ chat.name }}</h3>
                <span v-if="chat.last_message_sent_at" class="text-xs text-gray-500">
                  {{ new Date(chat.last_message_sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 truncate">{{ chat.last_message_text || 'No messages yet' }}</p>
            </div>

            <!-- Unread Badge -->
            <div v-if="chat.unread_count > 0" class="bg-emerald-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
              {{ chat.unread_count }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div class="flex-1 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 flex flex-col">
      <!-- No chat selected -->
      <div v-if="!activeChat" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
            C
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Welcome to ChatX!</h3>
          <p class="text-gray-600">Select a chat to start messaging</p>
        </div>
      </div>

      <!-- Chat selected -->
      <div v-else class="flex-1 flex flex-col">
        <!-- Chat header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          <div class="relative">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
              {{ getChatDisplayName(activeChat).charAt(0).toUpperCase() }}
            </div>
            <!-- Online indicator for DMs -->
            <div
              v-if="activeChat.type === 'direct' && chatStore.onlineStatuses[activeChat.participant_id]?.is_online"
              class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            ></div>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ getChatDisplayName(activeChat) }}</h3>
            <p class="text-xs text-gray-500">
              <template v-if="activeChat.type === 'direct'">
                <span v-if="chatStore.onlineStatuses[activeChat.participant_id]?.is_online" class="text-green-600 font-medium">
                  Online
                </span>
                <span v-else>
                  Offline
                </span>
              </template>
              <template v-else>
                Group · {{ activeChat.participant_count || 0 }} participant{{ activeChat.participant_count !== 1 ? 's' : '' }}
              </template>
            </p>
          </div>
        </div>

        <!-- Messages area -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-6 py-4"
          @scroll="handleScroll"
        >
          <!-- Loading state -->
          <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p class="ml-3 text-gray-600">Loading messages...</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="messages.length === 0" class="flex items-center justify-center py-12">
            <div class="text-center">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-gray-500">No messages yet</p>
              <p class="text-sm text-gray-400 mt-1">Start the conversation!</p>
            </div>
          </div>

          <!-- Messages list -->
          <div v-else>
            <!-- Load more indicator -->
            <div v-if="hasMore" class="flex justify-center py-4">
              <div v-if="loadingMore" class="flex items-center gap-2 text-gray-600 text-sm">
                <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                <span>Loading more messages...</span>
              </div>
              <button
                v-else
                @click="handleLoadMore"
                class="px-4 py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
              >
                ↑ Load older messages
              </button>
            </div>

            <MessageBubble
              v-for="message in messages"
              :key="message.message_id"
              :message-id="message.message_id"
              :content="message.content"
              :sender-id="message.sender_id"
              :sender-username="message.sender_username"
              :sent-at="message.sent_at"
              :is-edited="message.is_edited"
              :is-group-chat="activeChat.type === 'group'"
              @edit="handleEditMessage"
              @delete="handleDeleteMessage"
            />
          </div>
        </div>

        <!-- Message input -->
        <MessageInput
          :disabled="isLoading"
          :is-editing="!!editingMessageId"
          :edit-content="editingContent"
          @send="handleSendMessage"
          @cancel-edit="handleCancelEdit"
        />
      </div>
    </div>

    <!-- Chat Details Panel (only for groups) -->
    <ChatDetailsPanel
      v-if="activeChat"
      :chat-id="activeChat.chat_id"
      :chat-type="activeChat.type"
    />

    <!-- New DM Dialog -->
    <NewDMDialog
      v-if="showNewDMDialog"
      @close="closeNewDMDialog"
    />

    <!-- New Group Dialog -->
    <NewGroupDialog
      v-if="showNewGroupDialog"
      @close="closeNewGroupDialog"
    />
  </ChatLayout>
</template>
