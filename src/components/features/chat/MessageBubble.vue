<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../../stores/auth'

const props = defineProps({
  messageId: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  senderId: {
    type: Number,
    required: true
  },
  senderUsername: {
    type: String,
    default: 'Unknown'
  },
  sentAt: {
    type: String,
    required: true
  },
  isEdited: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete'])

const authStore = useAuthStore()

const isSent = computed(() => {
  return authStore.user?.user_id === props.senderId
})

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleEdit() {
  emit('edit', props.messageId)
}

function handleDelete() {
  emit('delete', props.messageId)
}
</script>

<template>
  <div :class="['flex mb-4', isSent ? 'justify-end' : 'justify-start']">
    <div :class="['max-w-md group relative']">
      <!-- Message Bubble -->
      <div
        :class="[
          'rounded-2xl px-4 py-3 shadow-sm',
          isSent
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-sm'
            : 'bg-white text-gray-900 rounded-bl-sm'
        ]"
      >
        <!-- Sender name (only for received messages) -->
        <div v-if="!isSent" class="text-xs font-semibold text-emerald-600 mb-1">
          {{ senderUsername }}
        </div>

        <!-- Message content -->
        <p class="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {{ content }}
        </p>

        <!-- Timestamp and edited indicator -->
        <div
          :class="[
            'flex items-center gap-2 mt-1 text-xs',
            isSent ? 'text-emerald-100' : 'text-gray-500'
          ]"
        >
          <span>{{ formatTime(sentAt) }}</span>
          <span v-if="isEdited">(edited)</span>
        </div>
      </div>

      <!-- Action buttons (only for sent messages) -->
      <div
        v-if="isSent"
        class="absolute top-1 -left-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2"
      >
        <button
          @click="handleEdit"
          class="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition cursor-pointer"
          title="Edit message"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click="handleDelete"
          class="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition cursor-pointer"
          title="Delete message"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
