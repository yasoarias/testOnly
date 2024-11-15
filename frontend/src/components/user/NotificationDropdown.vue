<template>
  <div class="notification-dropdown" v-if="show">
    <div class="notification-header">
      <h3>Notifications</h3>
      <button class="close-btn" @click="$emit('close')">&times;</button>
    </div>
    <div class="notification-list">
      <div v-if="notifications.length === 0" class="no-notifications">
        No notifications
      </div>
      <router-link 
        v-for="notification in notifications" 
        :key="notification.id"
        :to="'/booked-history'"
        class="notification-item"
        :class="{ 'unread': !notification.read }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-icon">
          <span class="material-icons-sharp" :class="getIconClass(notification.type)">
            {{ getIcon(notification.type) }}
          </span>
        </div>
        <div class="notification-content">
          <p class="notification-message">{{ notification.message }}</p>
          <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);
const router = useRouter();
const notifications = ref([]);

const getIcon = (type) => {
  switch (type) {
    case 'booking_accepted':
      return 'check_circle';
    case 'booking_declined':
      return 'cancel';
    case 'booking_pending':
      return 'schedule';
    default:
      return 'notifications';
  }
};

const getIconClass = (type) => {
  switch (type) {
    case 'booking_accepted':
      return 'success';
    case 'booking_declined':
      return 'error';
    case 'booking_pending':
      return 'pending';
    default:
      return '';
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const handleNotificationClick = async (notification) => {
  try {
    // Mark notification as read
    await fetch(`http://localhost:3000/api/notifications/${notification.id}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Close dropdown
    emit('close');
    
    // Navigate to booked history
    router.push('/booked-history');
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const fetchNotifications = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/notifications', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      notifications.value = data;
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.notification-dropdown {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 320px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f4ff;
}

.notification-icon {
  margin-right: 15px;
}

.notification-icon .material-icons-sharp {
  font-size: 24px;
}

.notification-icon .success {
  color: #4CAF50;
}

.notification-icon .error {
  color: #f44336;
}

.notification-icon .pending {
  color: #ff9800;
}

.notification-content {
  flex: 1;
}

.notification-message {
  margin: 0 0 5px 0;
  font-size: 0.9rem;
  color: #333;
}

.notification-time {
  font-size: 0.8rem;
  color: #666;
}

.no-notifications {
  padding: 20px;
  text-align: center;
  color: #666;
}

/* Add smooth scrollbar */
.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.notification-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style> 