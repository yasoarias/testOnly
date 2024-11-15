<template>
  <div class="alert-modal" v-if="show">
    <div class="alert-content" :class="type">
      <span class="material-icons-sharp alert-icon">
        {{ getIcon }}
      </span>
      <div class="alert-message">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
      </div>
      <div class="alert-actions">
        <button @click="$emit('confirm')" class="confirm-btn">{{ confirmText }}</button>
        <button v-if="showCancel" @click="$emit('cancel')" class="cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  type: {
    type: String,
    default: 'info' // 'success', 'error', 'warning', 'info'
  },
  title: String,
  message: String,
  confirmText: {
    type: String,
    default: 'OK'
  },
  showCancel: {
    type: Boolean,
    default: false
  }
});

const getIcon = computed(() => {
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
.alert-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2100;
  animation: fadeIn 0.3s ease;
}

.alert-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: slideIn 0.3s ease;
}

.alert-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.alert-message h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.alert-message p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.4;
}

.alert-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.alert-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-btn {
  background: #4CAF50;
  color: white;
}

.cancel-btn {
  background: #f44336;
  color: white;
}

/* Alert types */
.success .alert-icon {
  color: #4CAF50;
}

.error .alert-icon {
  color: #f44336;
}

.warning .alert-icon {
  color: #ff9800;
}

.info .alert-icon {
  color: #2196F3;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 