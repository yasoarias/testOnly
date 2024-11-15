<template>
  <Transition name="fade">
    <div v-if="show" :class="['alert', type]">
      <div class="alert-content">
        <span class="alert-icon">
          <i v-if="type === 'error'" class="fas fa-exclamation-circle"></i>
          <i v-else-if="type === 'success'" class="fas fa-check-circle"></i>
          <i v-else class="fas fa-info-circle"></i>
        </span>
        <span class="alert-message">{{ message }}</span>
      </div>
      <button @click="$emit('close')" class="alert-close">&times;</button>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  message: String,
  type: {
    type: String,
    default: 'info'
  }
});

defineEmits(['close']);
</script>

<style scoped>
.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  max-width: 500px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  font-weight: 500;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-icon {
  font-size: 24px;
}

.alert-message {
  font-size: 15px;
  line-height: 1.5;
  font-weight: 500;
}

.alert-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0 0 0 20px;
  color: inherit;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}

.error {
  background-color: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
}

.success {
  background-color: #10B981;
  color: #FFFFFF;
  border: 1px solid #059669;
}

.info {
  background-color: #3B82F6;
  color: #FFFFFF;
  border: 1px solid #2563EB;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Add hover effect */
.alert:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

/* Make alerts more visible on light backgrounds */
.success {
  background-color: #10B981;
  color: #FFFFFF;
  border: 1px solid #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.error {
  background-color: #EF4444;
  color: #FFFFFF;
  border: 1px solid #DC2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.info {
  background-color: #3B82F6;
  color: #FFFFFF;
  border: 1px solid #2563EB;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* Add a subtle text shadow for better readability */
.alert-message {
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

/* Make close button more visible */
.alert-close {
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
}

.alert-close:hover {
  color: #FFFFFF;
}
</style> 