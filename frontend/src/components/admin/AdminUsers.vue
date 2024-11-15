<template>
  <div class="admin-dashboard">
    <AdminSidebar />
    <main>
      <div class="insights">
        <div class="sales">
          <span class="material-icons-sharp">group</span>
          <div class="middle">
            <div class="left">
              <h3>Total Users</h3>
              <h1>{{ userCount }}</h1>
            </div>
            <div class="progress">
              <svg>
                <circle cx="38" cy="38" r="36"></circle>
              </svg>
              <div class="number">
                <p>{{ Math.round((userCount / 100) * 100) }}%</p>
              </div>
            </div>
          </div>
          <small class="text-muted">Total registered users</small>
        </div>
      </div>
      <div class="recent-orders">
        <h2>All Users</h2>
        <div class="search-bar">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Search users by name or email"
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Profile</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <img
                  :src="user.profileImage || defaultProfileImage"
                  alt="Profile Image"
                  class="profile-image"
                />
              </td>
              <td>{{ user.fullName }}</td>
              <td>{{ user.email }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import AdminSidebar from "./AdminSidebar.vue";

const userCount = ref(0);
const users = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 5; // Number of users per page
const searchQuery = ref("");
import defaultProfileImage from "@/assets/default-profile.png"; // Import the default image

const fetchUsers = async (page = 1) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:3000/api/users?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    const data = await response.json();
    if (data.users && Array.isArray(data.users)) {
      userCount.value = data.total;
      totalPages.value = data.totalPages;
      currentPage.value = data.page;
      users.value = data.users.map((user) => ({
        ...user,
        profileImage: user.profilePicture
          ? `http://localhost:3000${user.profilePicture}`
          : defaultProfileImage,
      }));
    } else {
      throw new Error("Unexpected data format from API");
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A"; // Fallback for empty date
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date"; // Check for invalid date

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Use 24-hour format
  };
  return date.toLocaleString("en-US", options);
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchUsers(currentPage.value);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchUsers(currentPage.value);
  }
};

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
  );
});

const handleSearch = () => {
  currentPage.value = 1; // Reset to first page when searching
  fetchUsers(1); // Fetch first page of results
};

onMounted(() => {
  fetchUsers();
});

// Listen for the userRegistered event
const emit = defineEmits(["userRegistered"]);

emit("userRegistered", () => {
  fetchUsers(); // Fetch updated user list when a new user registers
});
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
  background-color: #f0f2f5;
}

main {
  flex-grow: 1;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.insights {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.insights > div {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.recent-orders {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}

th,
td {
  padding: 12px;
  text-align: left;
  background-color: #ffffff;
}

tr {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

th:first-child,
td:first-child {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

th:last-child,
td:last-child {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.primary {
  color: #1a73e8;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-size: 14px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.search-bar input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-indicator.active {
  background-color: #4caf50;
}

.status-indicator.inactive {
  background-color: #f44336;
}

@media (max-width: 768px) {
  .recent-orders {
    overflow-x: auto;
  }

  table {
    min-width: 800px;
  }

  .search-bar input {
    font-size: 0.9rem;
    padding: 0.5rem;
  }

  .insights > div {
    padding: 1rem;
  }

  .profile-image {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  main {
    padding: 1rem;
  }

  .insights > div {
    padding: 0.75rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  .search-bar {
    margin-bottom: 1rem;
  }
}
</style>
