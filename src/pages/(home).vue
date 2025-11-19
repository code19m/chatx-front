<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import ChatLayout from '../components/layout/ChatLayout.vue'
import MessageBubble from '../components/features/chat/MessageBubble.vue'
import MessageInput from '../components/features/chat/MessageInput.vue'
import NewDMDialog from '../components/features/chat/NewDMDialog.vue'
import { useChatStore } from '../stores/chat'
import { useMessagesStore } from '../stores/messages'

const chatStore = useChatStore()
const messagesStore = useMessagesStore()

const messagesContainer = ref(null)
const editingMessageId = ref(null)
const editingContent = ref('')
const showNewDMDialog = ref(false)

const activeChat = computed(() => chatStore.activeChat)
const messages = computed(() => messagesStore.messages)
const isLoading = computed(() => messagesStore.isLoading)

onMounted(async () => {
  await chatStore.fetchAllChats()
})

// Watch for active chat changes and load messages
watch(activeChat, async (newChat) => {
  if (newChat) {
    editingMessageId.value = null
    editingContent.value = ''
    await messagesStore.fetchMessages(newChat.chat_id)
    scrollToBottom()
  }
}, { immediate: true })

// Watch for new messages and scroll to bottom
watch(() => messages.value.length, () => {
  nextTick(() => scrollToBottom())
})

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
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
</script>

<template>
  <ChatLayout>
    <!-- Chat List Panel -->
    <div class="w-96 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">Chats</h2>
        <button
          @click="openNewDMDialog"
          class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex items-center justify-center transition shadow-md cursor-pointer"
          title="New Direct Message"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
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
            <!-- Avatar -->
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {{ chat.name?.charAt(0).toUpperCase() || '?' }}
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
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
            {{ getChatDisplayName(activeChat).charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ getChatDisplayName(activeChat) }}</h3>
            <p class="text-xs text-gray-500">{{ activeChat.type === 'direct' ? 'Direct Message' : 'Group' }}</p>
          </div>
        </div>

        <!-- Messages area -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-6 py-4"
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
            <MessageBubble
              v-for="message in messages"
              :key="message.message_id"
              :message-id="message.message_id"
              :content="message.content"
              :sender-id="message.sender_id"
              :sender-username="message.sender_username"
              :sent-at="message.sent_at"
              :is-edited="message.is_edited"
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

    <!-- New DM Dialog -->
    <NewDMDialog
      v-if="showNewDMDialog"
      @close="closeNewDMDialog"
    />
  </ChatLayout>
</template>
