<template>
  <div v-if="show" class="confirmation-modal-overlay">
    <div class="confirmation-modal">
      <div class="confirmation-content">
        <span class="material-icons-sharp warning-icon">warning</span>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
      </div>
      <div class="confirmation-actions">
        <button class="btn-cancel" @click="$emit('cancel')">Cancel</button>
        <button class="btn-confirm" @click="$emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  }
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.confirmation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
}

.confirmation-modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.confirmation-content {
  text-align: center;
  margin-bottom: 1.5rem;
}

.warning-icon {
  font-size: 3rem;
  color: #ff9800;
  margin-bottom: 1rem;
}

h3 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}

.btn-confirm {
  background-color: #dc3545;
  color: white;
}

.btn-confirm:hover {
  background-color: #bb2d3b;
}
</style> 