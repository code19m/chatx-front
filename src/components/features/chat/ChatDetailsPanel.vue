<script setup>
import { ref, watch } from 'vue'
import { useChatStore } from '../../../stores/chat'

const props = defineProps({
  chatId: {
    type: Number,
    required: true
  },
  chatType: {
    type: String,
    required: true
  }
})

const chatStore = useChatStore()

const isExpanded = ref(true)
const chatDetails = ref(null)
const isLoading = ref(false)

watch(() => props.chatId, async (newChatId) => {
  if (newChatId && props.chatType === 'group') {
    await fetchChatDetails()
  }
}, { immediate: true })

async function fetchChatDetails() {
  isLoading.value = true
  try {
    chatDetails.value = await chatStore.fetchChatDetails(props.chatId)
  } catch (error) {
    console.error('Failed to fetch chat details:', error)
  } finally {
    isLoading.value = false
  }
}

function togglePanel() {
  isExpanded.value = !isExpanded.value
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <div
    v-if="chatType === 'group'"
    :class="[
      'bg-white border-l border-gray-200 flex flex-col transition-all duration-300',
      isExpanded ? 'w-80' : 'w-16'
    ]"
  >
    <!-- Toggle button -->
    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
      <h3 v-if="isExpanded" class="font-semibold text-gray-900">Group Details</h3>
      <button
        @click="togglePanel"
        class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
        :title="isExpanded ? 'Collapse panel' : 'Expand panel'"
      >
        <svg
          class="w-5 h-5 text-gray-600 transition-transform"
          :class="{ 'rotate-180': !isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Details content -->
    <div v-if="isExpanded" class="flex-1 overflow-y-auto p-4">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
      </div>

      <!-- Details -->
      <div v-else-if="chatDetails" class="space-y-6">
        <!-- Group info -->
        <div>
          <h4 class="text-sm font-semibold text-gray-500 uppercase mb-2">Group Name</h4>
          <p class="text-gray-900 font-medium">{{ chatDetails.name }}</p>
        </div>

        <!-- Created info -->
        <div>
          <h4 class="text-sm font-semibold text-gray-500 uppercase mb-2">Created</h4>
          <p class="text-sm text-gray-700">{{ formatDate(chatDetails.created_at) }}</p>
        </div>

        <!-- Participants -->
        <div>
          <h4 class="text-sm font-semibold text-gray-500 uppercase mb-3">
            Participants ({{ chatDetails.participants?.length || 0 }})
          </h4>
          <div class="space-y-2">
            <div
              v-for="participant in chatDetails.participants"
              :key="participant.user_id"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
            >
              <!-- Avatar -->
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {{ participant.username.charAt(0).toUpperCase() }}
              </div>

              <!-- Participant info -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">
                  {{ participant.username }}
                  <span
                    v-if="participant.user_id === chatDetails.creator_id"
                    class="ml-1 text-xs text-emerald-600 font-semibold"
                  >
                    (Creator)
                  </span>
                </div>
                <div class="text-xs text-gray-500">
                  Joined {{ formatDate(participant.joined_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
