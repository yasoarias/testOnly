<template>
  <!-- Add this where your notification icon is -->
  <div class="notification-wrapper">
    <button class="notification-btn" @click="toggleNotifications">
      <span class="material-icons-sharp">notifications</span>
      <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
    </button>
    <NotificationDropdown 
      v-if="showNotifications" 
      @close="showNotifications = false"
      :show="showNotifications"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import NotificationDropdown from './NotificationDropdown.vue';

const showNotifications = ref(false);
const unreadCount = ref(0);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};
</script>

<style scoped>
.notification-wrapper {
  position: relative;
}

.notification-btn {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.7rem;
  min-width: 18px;
  text-align: center;
}
</style> 