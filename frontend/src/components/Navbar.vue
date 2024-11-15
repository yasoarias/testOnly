<template>
  <header :class="{ 'dark-mode': isDarkMode }">
    <div class="content-container header-content">
      <div class="left-section">
        <!-- Logo -->
        <div :class="['logo-container', { 'logged-in': user }]">
          <router-link :to="logoDestination">
            <img src="@/assets/logo2.png" alt="logo" class="logo" />
          </router-link>
        </div>
      </div>

      <nav>
        <router-link
          to="/"
          :class="{ active: isActive('/') }"
          v-if="!user && !isAdmin"
          >Home</router-link
        >
        <router-link to="/gallery" :class="{ active: isActive('/gallery') }"
          >Gallery</router-link
        >
        <router-link
          to="/contact"
          :class="{ active: isActive('/contact') }"
          v-if="!user && !isAdmin"
          >Contact</router-link
        >
        <router-link
          v-if="isAdmin"
          to="/admin"
          :class="{ active: isActive('/admin') }"
          >Admin Dashboard</router-link
        >
        <div class="dropdown" v-if="user && !isAdmin">
          <button class="dropbtn" @click="togglePackagesDropdown">
            Packages
            <i class="fas fa-caret-down"></i>
          </button>
          <div class="dropdown-content" v-show="isPackagesDropdownOpen">
            <router-link
              to="/packages/wedding"
              :class="{ active: isActive('/packages/wedding') }"
              >Wedding</router-link
            >
            <router-link
              to="/packages/debut"
              :class="{ active: isActive('/packages/debut') }"
              >Debut</router-link
            >
            <router-link
              to="/packages/kiddie-party"
              :class="{ active: isActive('/packages/kiddie-party') }"
              >Kiddie Party</router-link
            >
            <router-link
              to="/packages/christening"
              :class="{ active: isActive('/packages/christening') }"
              >Christening</router-link
            >
          </div>
        </div>
        <router-link
          v-if="user && !isAdmin"
          to="/booked-history"
          :class="{ active: isActive('/booked-history') }"
          >Booked History</router-link
        >
      </nav>

      <!-- User actions (dropdown, etc.) -->
      <div class="user-actions">
        <!-- Show notifications icon only for admin and logged-in users -->
        <div
          v-if="user || isAdmin"
          class="notifications-icon"
          @click.stop="toggleNotifications"
        >
          <i class="fas fa-bell"></i>
          <span v-show="unreadCount > 0" class="notification-count">
            {{ unreadCount }}
          </span>
          <span style="display: none">Debug count: {{ unreadCount }}</span>

          <AdminNotifications
            v-if="isAdmin && showNotifications"
            @close="closeNotifications"
            @click.stop
          />
          <Notifications
            v-else-if="showNotifications"
            @close="closeNotifications"
            @click.stop
          />
        </div>
        <div class="user-dropdown" @click="toggleUserDropdown">
          <template v-if="user">
            <img
              :src="userProfileImage"
              alt="User Profile"
              class="profile-image"
              @error="handleImageError"
            />
            <span class="user-name-display">{{ user.fullName }}</span>
            <i class="fas fa-caret-down"></i>
          </template>
          <template v-else>
            <i class="fas fa-user user-icon"></i>
          </template>
          <div class="user-dropdown-content" v-show="isUserDropdownOpen">
            <span class="user-name">{{ user ? user.fullName : "Guest" }}</span>
            <template v-if="user">
              <button @click="openSettingsModal" class="dropdown-item">
                Settings
              </button>
              <div class="dropdown-item" @click="toggleDarkMode">
                Dark Mode
                <i class="fas" :class="isDarkMode ? 'fa-sun' : 'fa-moon'"></i>
              </div>
              <button @click="handleLogout" class="dropdown-item">
                Logout
              </button>
            </template>
            <template v-else>
              <button @click="openLoginModal" class="dropdown-item">
                Login
              </button>
              <button @click="openRegisterModal" class="dropdown-item">
                Register
              </button>
              <div class="dropdown-item" @click="toggleDarkMode">
                Dark Mode
                <i class="fas" :class="isDarkMode ? 'fa-sun' : 'fa-moon'"></i>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>

  <SettingsModal
    v-if="showSettingsModal"
    @close="closeSettingsModal"
    :user="user"
    :token="token"
    @update-user="handleUserUpdate"
  />

  <AlertModal
    v-if="showProfileUpdateAlert"
    show="true"
    type="success"
    title="Profile Updated"
    :message="profileUpdateMessage"
    confirmText="OK"
    @confirm="showProfileUpdateAlert = false"
  />
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import logoImage from "@/assets/logo2.png";
import defaultProfileImage from "@/assets/default-profile.png";
import { useRoute, useRouter } from "vue-router";
import SettingsModal from "./modals/SettingsModal.vue";
import Notifications from "./ui/Notifications.vue";
import AdminNotifications from "./admin/AdminNotifications.vue";
import { useAuth } from "@/composables/useAuth";
import AlertModal from "./modals/AlertModal.vue";

const logoPath = ref(logoImage);
const isDarkMode = ref(false);
const isDropdownOpen = ref(false);
const isUserDropdownOpen = ref(false);
const isPackagesDropdownOpen = ref(false);
const user = ref(null);
const showSettingsModal = ref(false);
const token = ref(localStorage.getItem("token"));
const showNotifications = ref(false);
const unreadCount = ref(0);
const notifications = ref([]);

// Compute whether the user is an admin
const isAdmin = computed(() => user.value && user.value.role === "admin");

// Watch for changes in the user object
watch(
  user,
  (newUser) => {
    if (newUser) {
      console.log("Current user role:", newUser.role);
    } else {
      console.log("No user logged in");
    }
  },
  { immediate: true }
);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.body.classList.toggle("dark-mode", isDarkMode.value);
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (event) => {
  if (!event.target.closest(".dropdown")) {
    isDropdownOpen.value = false;
  }
};

const toggleUserDropdown = () => {
  if (isUserDropdownOpen.value) {
    forceCloseUserDropdown();
  } else {
    isUserDropdownOpen.value = true;
  }
};

const closeUserDropdown = (event) => {
  if (!event.target.closest(".user-dropdown")) {
    isUserDropdownOpen.value = false;
  }
};

const openLoginModal = () => {
  emit("openLoginModal");
  isUserDropdownOpen.value = false;
};

const openRegisterModal = () => {
  emit("openRegisterModal");
  isUserDropdownOpen.value = false;
};

const handleLogout = () => {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");

  // Clear reactive state
  token.value = null;
  user.value = null;

  // Redirect to home
  router.push("/");
};

const openSettingsModal = () => {
  showSettingsModal.value = true;
  forceCloseUserDropdown();
};

const closeSettingsModal = () => {
  showSettingsModal.value = false;
};

const updateUser = async (updatedUser) => {
  try {
    console.log("Updating user with:", updatedUser);

    // Update the local user state
    user.value = {
      ...user.value,
      ...updatedUser,
      profilePicture: updatedUser.profilePicture || user.value.profilePicture,
    };

    // Update localStorage
    localStorage.setItem("user", JSON.stringify(user.value));

    // Show success alert
    showProfileUpdateAlert.value = true;
    profileUpdateMessage.value = "Profile updated successfully!";

    // Fetch fresh user data
    await fetchUserInfo();

    // Hide alert after delay
    setTimeout(() => {
      showProfileUpdateAlert.value = false;
    }, 2000);
  } catch (error) {
    console.error("Error updating user:", error);
    showProfileUpdateAlert.value = true;
    profileUpdateMessage.value = "Failed to update profile";
    setTimeout(() => {
      showProfileUpdateAlert.value = false;
    }, 2000);
  }
};

const router = useRouter();

const fetchUserInfo = async () => {
  try {
    if (!token.value) {
      console.error("No token found");
      return;
    }

    const response = await fetch("http://localhost:3000/api/user/profile", {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const userData = await response.json();
    if (userData.success) {
      user.value = {
        ...userData.user,
        profilePicture: userData.user.profilePicture || defaultProfileImage,
      };
      localStorage.setItem("user", JSON.stringify(user.value));
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
};

const initializeUserData = () => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (storedToken && storedUser) {
    token.value = storedToken;
    user.value = JSON.parse(storedUser);
    fetchUserInfo(); // Fetch fresh user data
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
  document.addEventListener("click", closeUserDropdown);
  document.addEventListener("click", closePackagesDropdown);
  initializeUserData();

  // Initial check for notifications
  checkUnreadNotifications();

  // Set up interval for checking notifications
  const notificationInterval = setInterval(checkUnreadNotifications, 30000); // Check every 30 seconds

  // Clean up interval on component unmount
  onUnmounted(() => {
    clearInterval(notificationInterval);
  });
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
  document.removeEventListener("click", closeUserDropdown);
  document.removeEventListener("click", closePackagesDropdown);
});

// Define emits
const emit = defineEmits(["openLoginModal", "openRegisterModal", "logout"]);

const route = useRoute();

const isActive = (path) => {
  return route.path === path;
};

const isPackageActive = () => {
  return route.path.startsWith("/packages");
};

const userProfileImage = computed(() => {
  console.log("User value:", user.value);
  console.log("Default profile image:", defaultProfileImage);

  if (user.value && user.value.profilePicture) {
    const profilePicture = user.value.profilePicture.startsWith("http")
      ? user.value.profilePicture
      : `http://localhost:3000${user.value.profilePicture}`;
    console.log("Returning profile picture:", profilePicture);
    return profilePicture;
  }
  console.log("Returning default profile image");
  return defaultProfileImage;
});

const props = defineProps(["user", "token"]);

const handleImageError = (e) => {
  console.error("Error loading image:", e);
  e.target.src = defaultProfileImage;
};

const forceCloseUserDropdown = () => {
  isUserDropdownOpen.value = false;
};

const togglePackagesDropdown = () => {
  isPackagesDropdownOpen.value = !isPackagesDropdownOpen.value;
};

// Close packages dropdown when clicking outside
const closePackagesDropdown = (event) => {
  if (!event.target.closest(".dropdown")) {
    isPackagesDropdownOpen.value = false;
  }
};

const toggleNotifications = (event) => {
  event.stopPropagation();
  showNotifications.value = !showNotifications.value;
};

const fetchAdminNotifications = async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/admin/notifications",
      {
        headers: {
          Authorization: token.value,
        },
      }
    );
    if (response.ok) {
      // Handle admin notifications if needed
    }
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
  }
};

const fetchNotifications = async () => {
  try {
    console.log("Fetching notifications with token:", token.value);
    const response = await fetch("http://localhost:3000/api/notifications", {
      headers: {
        Authorization: token.value,
      },
    });
    console.log("Response status:", response.status);
    if (response.ok) {
      notifications.value = await response.json();
      console.log("Fetched notifications:", notifications.value);
    } else {
      const errorText = await response.text();
      console.error("Error response:", errorText);
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};
const closeNotifications = () => {
  showNotifications.value = false;
  // Mark notifications as read when closing
  if (token.value) {
    const endpoint = isAdmin.value
      ? "/api/admin/notifications/mark-read"
      : "/api/notifications/mark-read";

    fetch(`http://localhost:3000${endpoint}`, {
      method: "PUT",
      headers: {
        Authorization: token.value,
      },
    })
      .then(() => {
        unreadCount.value = 0;
      })
      .catch((error) => {
        console.error("Error marking notifications as read:", error);
      });
  }
};

const logoDestination = computed(() => {
  if (user.value && user.value.role === "admin") {
    return "/gallery";
  }
  return user.value ? "/gallery" : "/";
});

const hasUnreadNotifications = computed(() => {
  if (isAdmin.value) {
    return notifications.value.length > 0;
  } else {
    return notifications.value.some((notification) => !notification.read);
  }
});

// Update the checkUnreadNotifications function
const checkUnreadNotifications = async () => {
  try {
    if (!token.value) {
      console.log("No token found, skipping notification check");
      return;
    }

    const endpoint = isAdmin.value
      ? "/api/admin/notifications/unread"
      : "/api/notifications/unread";

    console.log("Checking notifications with endpoint:", endpoint);

    const response = await fetch(`http://localhost:3000${endpoint}`, {
      headers: {
        Authorization: token.value,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Notification response data:", data);
      unreadCount.value = data.unreadCount;
      console.log("Updated unreadCount:", unreadCount.value);
    } else {
      console.error("Error response:", response.status);
    }
  } catch (error) {
    console.error("Error checking unread notifications:", error);
  }
};

// Watch unreadCount for changes
watch(unreadCount, (newCount) => {
  console.log("unreadCount changed to:", newCount);
});

// Add showSidebar ref
const showSidebar = ref(false);

// Add computed property to determine if sidebar should be shown
const shouldShowSidebar = computed(() => {
  return user.value && !isAdmin.value; // Show sidebar only for logged-in non-admin users
});

// Add method to toggle sidebar
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

// Add these refs
const showProfileUpdateAlert = ref(false);
const profileUpdateMessage = ref("");

// Add this method to handle user updates
const handleUserUpdate = async (updatedUser) => {
  try {
    // Update local user state
    user.value = updatedUser;

    // Update localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Fetch fresh user data
    await fetchUserInfo();
  } catch (error) {
    console.error("Error handling user update:", error);
  }
};
</script>
<style lang="scss" scoped>
/* Header styles */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  padding-left: 50px; // Add some padding to account for the sidebar toggle
}

.left-section {
  display: flex;
  align-items: center;
}

.sidebar-toggle {
  position: fixed;
  top: 10px;
  left: 10px;
  background: none;
  border: none;
  color: #333;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  z-index: 1001; // Ensure it's above other elements
}

.dark-mode {
  .sidebar-toggle {
    color: white;
  }
}

.logo-container {
  display: flex;
  align-items: center;
  height: 100%;

  &.logged-in {
    margin-left: 10px; /* Adjust as needed for spacing */
  }
}

.logo {
  height: 100px; /* Adjust as needed */
  object-fit: contain;
  width: 250px;
}

nav {
  display: flex;
  gap: 5rem;
  margin: 0 auto;
  transform: translateX(
    25%
  ); /* Increase this value to move items more to the right */
}

nav a,
.dropdown .dropbtn {
  color: var(--color-dark);
  text-decoration: none;
  padding: 10px 15px;
  margin: 0 5px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

nav a:hover,
.dropdown:hover .dropbtn {
  background-color: var(--color-light);
  border-radius: 5px;
}

nav a.active {
  font-weight: bold;
  color: var(--color-primary);
}

.dark-mode nav a {
  color: #fff;

  &:hover,
  &.active {
    background-color: #444;
    color: var(--color-primary);
  }
}

.user-actions {
  display: flex;
  align-items: center;
}

.user-icon {
  font-size: 1.5rem; /* Adjust the size as needed */
  color: #333; /* Adjust the color as needed */
}

.dark-mode {
  .user-icon {
    color: white;
  }
}

.user-dropdown-content {
  position: absolute;
  left: 0;
  top: 100%;
  background-color: white;
  min-width: 200px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  z-index: 1000;
  padding: 8px 0;
}

.dropdown-item {
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: black; /* Change hover color to black */
    color: white; /* Ensure text is visible */
  }
}

.mode-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 12px 16px;
  transition: background-color 0.3s, color 0.3s;
}

.mode-toggle i {
  margin-left: 8px;
}

.mode-toggle:hover {
  background-color: #555;
  color: white;
}

.user-name {
  padding: 12px 16px;
  display: block;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #444;
}

.dark-mode {
  span {
    color: white;
  }

  .user-icon {
    filter: brightness(0) invert(1);
  }

  .user-dropdown-content {
    background-color: #333;
    color: white;
  }

  .dropdown-item {
    color: white;

    &:hover {
      background-color: #444;
      border-radius: 12px;
    }
  }

  .user-name,
  .dark-mode-toggle {
    border-color: #555;
  }
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-name-display {
  font-size: 0.9rem;
  font-weight: bold;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

/* Dropdown styles */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropbtn {
  background-color: transparent;
  color: #333;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.dark-mode {
  .dropbtn {
    color: white;
  }

  .dropdown-content {
    background-color: #333;

    a {
      color: white;

      &:hover {
        background-color: #444;
      }
    }
  }
}

/* Media query for mobile responsiveness */
@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    padding: 10px;
    padding-left: 40px; // Adjust padding for mobile
  }

  .left-section {
    width: 100%;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .logo-container {
    flex-grow: 1;
    text-align: center;
  }

  .logo {
    height: 60px; /* Smaller logo for mobile */
    width: auto;
  }

  .sidebar-toggle {
    top: 5px;
    left: 5px;
    font-size: 20px;
    padding: 5px;
  }

  nav {
    margin-left: 0; /* Reset the margin for mobile screens */
    width: 100%;
    justify-content: center;
  }

  .dropdown-content {
    position: static;
    display: none;
    width: 100%;
    box-shadow: none;
    margin-top: 5px;

    &.show {
      display: block;
    }
  }

  .user-actions {
    width: 100%;
    justify-content: center;
  }

  .user-dropdown {
    width: 100%;
    text-align: center;
  }

  .user-dropdown-content {
    width: 100%;
    position: static;
    box-shadow: none;
  }

  .profile-image {
    width: 30px;
    height: 30px;
  }

  .user-name-display {
    font-size: 14px;
  }
}

.user-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-name-display {
  font-size: 0.9rem;
  font-weight: bold;
  margin-right: 5px;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.user-dropdown-content {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
  min-width: 200px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  z-index: 1000;
  padding: 8px 0;
}

.dropdown-item {
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: black; /* Change hover color to black */
    color: white; /* Ensure text is visible */
  }
}

.mode-toggle {
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.user-name {
  padding: 12px 16px;
  display: block;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #eee;
}

.dark-mode {
  .user-dropdown-content {
    background-color: #333;
    color: white;
  }

  .dropdown-item {
    color: white;

    &:hover {
      background-color: #444;
    }
  }

  .user-name,
  .mode-toggle {
    border-color: #444;
  }
}

.mode-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
}

.mode-toggle .fas {
  margin-left: 0.5rem;
}

.notifications-icon {
  position: relative;
  cursor: pointer;
  padding: 8px;
  margin-right: 20px;

  /* Add specific styling for the bell icon */
  .fas.fa-bell {
    font-size: 1.2rem;
    color: #333; /* or your desired color */
  }
}

.notification-count {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff4b4b; /* bright red color */
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.7rem;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  font-weight: bold;
  transform: translate(25%, -25%); /* Adjust position to overlap the bell */
}

/* Dark mode styles */
.dark-mode {
  .notifications-icon {
    .fas.fa-bell {
      color: white;
    }
  }

  .notification-count {
    border-color: #333;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.notifications-dropdown {
  position: absolute;
  top: 100%; /* Position it right below the navbar */
  right: 20px; /* Align it with the notifications icon */
  z-index: 1000; /* Ensure it's above other elements */
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.dark-mode {
  .notifications-dropdown {
    background-color: #333;
    color: white;
  }
}
</style>
