<template>
  <Transition name="fade">
    <div v-if="show" :class="['alert', type]">
      <div class="alert-content">
        <span class="material-icons-sharp icon">{{ icon }}</span>
        <span class="message">{{ message }}</span>
      </div>
      <button class="close-btn" @click="$emit('close')">
        <span class="material-icons-sharp">close</span>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  message: String,
  type: {
    type: String,
    default: 'success'
  }
});

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'check_circle';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
});
</script>

<style scoped>
.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-width: 300px;
  max-width: 450px;
  z-index: 1100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.success {
  background-color: rgba(52, 199, 89, 0.95);
  border: 1px solid #34c759;
  color: white;
}

.error {
  background-color: rgba(255, 59, 48, 0.95);
  border: 1px solid #ff3b30;
  color: white;
}

.warning {
  background-color: rgba(255, 149, 0, 0.95);
  border: 1px solid #ff9500;
  color: white;
}

.info {
  background-color: rgba(0, 122, 255, 0.95);
  border: 1px solid #007aff;
  color: white;
}

.icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Dark mode support */
:root.dark-mode .alert {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .alert {
    width: 90%;
    left: 50%;
    transform: translateX(-50%);
    top: 10px;
  }

  .message {
    font-size: 0.9rem;
  }
}
</style> 