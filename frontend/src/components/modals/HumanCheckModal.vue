<template>
  <div class="human-check-modal" v-if="show">
    <div class="modal-content">
      <h3>Wait! Are you human?</h3>
      <p>Please confirm you're not a robot.</p>
      
      <div class="checkbox-container" @click="handleCheckbox">
        <input type="checkbox" id="humanCheck" v-model="isChecked">
        <label for="humanCheck">I am human</label>
        <span class="material-icons-sharp captcha-icon">security</span>
      </div>

      <div class="privacy-terms">
        <small>Privacy - Terms</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['verified']);
const isChecked = ref(false);

const handleCheckbox = () => {
  isChecked.value = true;
  setTimeout(() => {
    emit('verified');
  }, 500);
};
</script>

<style scoped>
.human-check-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 320px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

h3 {
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.2rem;
}

p {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.checkbox-container:hover {
  background: #f0f0f0;
  border-color: #d0d0d0;
}

.checkbox-container input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4CAF50;
}

.checkbox-container label {
  flex: 1;
  cursor: pointer;
  color: #333;
  font-size: 0.95rem;
  text-align: left;
}

.captcha-icon {
  color: #7380ec;
  font-size: 24px;
}

.privacy-terms {
  color: #666;
  font-size: 0.8rem;
  margin-top: 1rem;
}

.privacy-terms small {
  cursor: pointer;
  color: #7380ec;
}

.privacy-terms small:hover {
  text-decoration: underline;
}

.checkbox-container.checked {
  background: #e8f5e8;
  border-color: #4CAF50;
}

.checkbox-container.checked .captcha-icon {
  color: #4CAF50;
  animation: checkmark 0.5s ease-in-out;
}

@keyframes checkmark {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style> 