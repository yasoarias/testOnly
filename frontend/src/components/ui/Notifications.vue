<template>
  <div class="notifications-wrapper" @click.stop>
    <div class="notifications-container">
      <div class="notifications-header">
        <h3>Notifications</h3>
        <button @click="closeNotifications" class="close-btn" type="button">
          &times;
        </button>
      </div>
      <div v-if="notifications.length === 0" class="no-notifications">
        No new notifications
      </div>
      <div v-else class="notifications-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
        >
          <span :class="['icon', notification.type]">
            <i :class="getIconClass(notification.type)"></i>
          </span>
          <div class="notification-content">
            <span class="message">{{ notification.message }}</span>
            <span class="time">{{ formatTime(notification.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";

const notifications = ref([]);
const { token } = useAuth();

const emit = defineEmits(["close"]);

const fetchNotifications = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/notifications", {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      notifications.value = data.notifications;
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};

const getIconClass = (type) => {
  switch (type) {
    case "success":
      return "fas fa-check-circle";
    case "warning":
      return "fas fa-exclamation-triangle";
    case "error":
      return "fas fa-times-circle";
    default:
      return "fas fa-bell";
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

const closeNotifications = (event) => {
  event.preventDefault();
  event.stopPropagation();
  emit("close");
};

onMounted(fetchNotifications);
</script>

<style scoped>
.notifications-wrapper {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  width: 300px;
}

.notifications-container {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
}

.notifications-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e6eb;
}

h3 {
  flex: 1;
  margin: 0;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 4px;
}

.notifications-list {
  padding: 8px 0;
}

.notification {
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.notification:hover {
  background-color: #f0f2f5;
}

.icon {
  font-size: 1.2rem;
}

.icon.success {
  color: #4caf50;
}
.icon.warning {
  color: #ff9800;
}
.icon.error {
  color: #f44336;
}

.notification-content {
  flex: 1;
}

.message {
  display: block;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.time {
  display: block;
  font-size: 0.8rem;
  color: #65676b;
}

.no-notifications {
  padding: 16px;
  text-align: center;
  color: #65676b;
}

/* Dark mode styles */
:root.dark-mode .notifications-container {
  background-color: #242526;
  border-color: #3e4042;
}

:root.dark-mode .notifications-header {
  border-color: #3e4042;
}

:root.dark-mode .notification:hover {
  background-color: #3a3b3c;
}

:root.dark-mode .time {
  color: #b0b3b8;
}

:root.dark-mode .no-notifications {
  color: #b0b3b8;
}
</style>
