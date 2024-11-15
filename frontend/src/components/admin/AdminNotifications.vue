<template>
  <div class="notifications-wrapper" @click.stop>
    <div class="notifications-container">
      <div class="notifications-header">
        <h3>Admin Notifications</h3>
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
          :class="{ unread: !notification.read }"
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

const fetchAdminNotifications = async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/admin/notifications",
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      notifications.value = data.notifications;
    }
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
  }
};

const getIconClass = (type) => {
  switch (type) {
    case "booking":
      return "fas fa-calendar-check";
    case "user":
      return "fas fa-user";
    case "system":
      return "fas fa-cog";
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

onMounted(fetchAdminNotifications);
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
  transition: background-color 0.2s;
}

.notification:hover {
  background-color: #f0f2f5;
}

.notification.unread {
  background-color: #e7f3ff;
}

.notification.unread:hover {
  background-color: #dbeeff;
}

.icon {
  font-size: 1.2rem;
}

.icon.booking {
  color: #2196f3;
}
.icon.user {
  color: #4caf50;
}
</style>
