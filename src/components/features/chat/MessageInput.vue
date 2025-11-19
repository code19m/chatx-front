<script setup>
import { ref } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Type a message...'
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  editContent: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['send', 'cancel-edit'])

const messageContent = ref(props.editContent || '')

function handleSend() {
  if (!messageContent.value.trim() || props.disabled) return

  emit('send', messageContent.value.trim())
  messageContent.value = ''
}

function handleKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleCancelEdit() {
  messageContent.value = ''
  emit('cancel-edit')
}

// Watch for edit content changes
import { watch } from 'vue'
watch(() => props.editContent, (newValue) => {
  if (newValue) {
    messageContent.value = newValue
  }
})
</script>

<template>
  <div class="border-t border-gray-200 bg-white p-4">
    <!-- Editing indicator -->
    <div
      v-if="isEditing"
      class="mb-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm"
    >
      <span class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Editing message
      </span>
      <button
        @click="handleCancelEdit"
        class="text-emerald-700 hover:text-emerald-900 font-medium cursor-pointer"
      >
        Cancel
      </button>
    </div>

    <!-- Input area -->
    <div class="flex gap-3 items-end">
      <!-- Textarea -->
      <div class="flex-1">
        <textarea
          v-model="messageContent"
          :disabled="disabled"
          :placeholder="placeholder"
          @keypress="handleKeyPress"
          rows="1"
          class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
          style="max-height: 150px; min-height: 48px;"
        />
      </div>

      <!-- Send button -->
      <button
        @click="handleSend"
        :disabled="!messageContent.trim() || disabled"
        class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 cursor-pointer flex-shrink-0"
        title="Send message"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>

    <!-- Hint text -->
    <p class="mt-2 text-xs text-gray-500">
      Press Enter to send, Shift+Enter for new line
    </p>
  </div>
</template>
