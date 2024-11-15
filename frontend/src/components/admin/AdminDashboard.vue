<template>
  <div class="admin-dashboard">
    <AdminSidebar :class="{ 'show-menu': showMenu }" />
    <main>
      <button @click="toggleMenu" class="menu-btn">
        <span class="material-icons-sharp">menu</span>
      </button>
      <p>Dashboard</p>
      <div class="insights">
        <div class="users">
          <span class="material-icons-sharp">group</span>
          <div class="middle">
            <div class="left">
              <h3>Total Users</h3>
              <h1>{{ userCount }}</h1>
            </div>
            <div class="status-breakdown">
              <small class="admin">Admin: {{ adminUsers }}</small>
              <small class="regular">Regular: {{ regularUsers }}</small>
              <small class="active">Active: {{ activeUsers }}</small>
              <small class="inactive">Inactive: {{ inactiveUsers }}</small>
            </div>
          </div>
          <small class="text-muted">Total registered users</small>
        </div>
        <div class="requests">
          <span class="material-icons-sharp">bar_chart</span>
          <div class="middle">
            <div class="left">
              <h3>Total Requests</h3>
              <h1>{{ totalRequests }}</h1>
            </div>
            <div class="status-breakdown">
              <small class="accepted">Accepted: {{ acceptedRequests }}</small>
              <small class="declined">Declined: {{ declinedRequests }}</small>
            </div>
          </div>
          <small class="text-muted">Processed requests</small>
        </div>
        <div class="reservations">
          <span class="material-icons-sharp">trending_up</span>
          <div class="middle">
            <div class="left">
              <h3>Pending Reservation</h3>
              <h1>{{ pendingReservations }}</h1>
            </div>
            <div class="trends">
              <div class="trend-item">
                <small class="daily">Daily: {{ dailyPending }}</small>
                <small class="weekly">Weekly: {{ weeklyPending }}</small>
                <small class="monthly">Monthly: {{ monthlyPending }}</small>
              </div>
              <div class="percentage">
                <p>{{ trendPercentage }}%</p>
              </div>
            </div>
          </div>
          <small class="text-muted">Awaiting Response</small>
        </div>
        <div class="packages">
          <span class="material-icons-sharp">inventory</span>
          <div class="middle">
            <div class="left">
              <h3>Total Packages</h3>
              <h1>{{ totalPackages }}</h1>
            </div>
            <div class="status-breakdown">
              <small>Wedding: {{ weddingPackages }}</small>
              <small>Christening: {{ christeningPackages }}</small>
              <small>Debut: {{ debutPackages }}</small>
              <small>Kiddie Party: {{ kiddiePartyPackages }}</small>
            </div>
          </div>
          <small class="text-muted">All available packages</small>
        </div>
      </div>
      <div class="dashboard-flex-container">
        <div class="calendar-section">
          <h2>Calendar Overview</h2>
          <div class="calendar-container">
            <div v-if="isLoading" class="loading">Loading calendar...</div>
            <div v-else>
              <div class="calendar-header">
                <button @click="prevMonth" class="nav-btn">
                  <span class="material-icons-sharp">chevron_left</span>
                </button>
                <h3>{{ currentMonthYear }}</h3>
                <button @click="nextMonth" class="nav-btn">
                  <span class="material-icons-sharp">chevron_right</span>
                </button>
              </div>
              <div class="calendar">
                <div class="weekdays">
                  <div v-for="day in weekDays" :key="day">{{ day }}</div>
                </div>
                <div class="days">
                  <div
                    v-for="day in calendarDays"
                    :key="day.date"
                    class="day"
                    :class="{
                      'other-month': !day.isCurrentMonth,
                      'has-events': day.events.length > 0,
                    }"
                    @click="handleDayClick(day)"
                  >
                    <span class="date">{{ new Date(day.date).getDate() }}</span>
                    <div class="day-events">
                      <div
                        v-for="event in day.events"
                        :key="event.id"
                        class="event-item"
                        :title="`${event.event_type} - ${event.full_name}`"
                      >
                        <div class="event-dot"></div>
                        <span class="event-time">
                          {{ formatEventTime(event.event_date) }}
                        </span>
                        <span class="event-title">{{ event.event_type }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="gallery-actions">
          <h2>Gallery Management</h2>
          <div class="action-buttons">
            <button class="post-gallery" @click="openPostModal">
              <span class="material-icons-sharp">photo_library</span>
              <span>Post on Gallery</span>
            </button>
            <button class="update-gallery">
              <span class="material-icons-sharp">update</span>
              <span>Update Gallery</span>
            </button>
          </div>
        </div>
      </div>
    </main>
    <div class="right">
      <div class="top">
        <button id="menu-btn">
          <span class="material-icons-sharp">menu</span>
        </button>
        <div class="theme-toggler">
          <span class="material-icons-sharp active">light_mode</span>
          <span class="material-icons-sharp">dark_mode</span>
        </div>
        <div class="profile">
          <div class="profile-photo">
            <img src="@/assets/profile-1.jpg" alt="Profile" />
          </div>
        </div>
      </div>
      <div class="recent-updates">
        <h2>Users Updates</h2>
        <div class="updates">
          <div class="update" v-for="update in recentUpdates" :key="update.id">
            <div class="profile-photo">
              <img
                :src="update.image"
                :alt="update.name"
                @error="update.image = defaultProfileImage"
              />
            </div>
            <div class="message">
              <p>
                <strong>{{ update.name }}</strong> {{ update.message }}
              </p>
              <small class="text-muted">{{ update.time }}</small>
            </div>
          </div>
        </div>
        <div class="pagination">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="pagination-button"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="pagination-button"
          >
            Next
          </button>
        </div>
      </div>
      <div class="sales-analytics">
        <h2>Activities</h2>
        <div class="item online">
          <div class="icon">
            <span class="material-icons-sharp">shopping_cart</span>
          </div>
          <div class="right">
            <div class="info">
              <h3>Recent Added Packages</h3>
              <small class="text-muted">Last 24 hours</small>
            </div>
            <h5 class="success">+39%</h5>
            <h3>3849</h3>
          </div>
        </div>
        <div class="item offline">
          <div class="icon">
            <span class="material-icons-sharp">local_mall</span>
          </div>
          <div class="right">
            <div class="info">
              <h3>OFFLINE ORDERS</h3>
              <small class="text-muted">Last 24 hours</small>
            </div>
            <h5 class="danger">-17%</h5>
            <h3>1100</h3>
          </div>
        </div>
        <div class="item customers">
          <div class="icon">
            <span class="material-icons-sharp">person</span>
          </div>
          <div class="right">
            <div class="info">
              <h3>NEW CUSTOMERS</h3>
              <small class="text-muted">Last 24 hours</small>
            </div>
            <h5 class="success">+25%</h5>
            <h3>849</h3>
          </div>
        </div>
        <div class="item add-product" @click="openAddProductModal">
          <div>
            <span class="material-icons-sharp">add</span>
            <h3>Add Product</h3>
          </div>
        </div>
      </div>
    </div>
    <!-- Add this line to include the modal -->
    <AddProductModal
      :isOpen="isAddProductModalOpen"
      @close="closeAddProductModal"
    />
    <!-- Add this line to include the Post modal -->
    <PostModal v-if="isPostModalOpen" @close="closePostModal" />
    <!-- Add this at the bottom of your template before closing main tag -->
    <PackageDetailsModalAdminEvents
      v-if="isModalOpen"
      :isOpen="isModalOpen"
      :packageData="selectedPackage"
      :eventData="selectedEvent"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import AdminSidebar from "./AdminSidebar.vue";
import AddProductModal from "./AddProductModal.vue";
import PostModal from "../modals/PostModal.vue";
import defaultProfileImage from "@/assets/default-profile.png";
import { useAuth } from "@/composables/useAuth";
import PackageDetailsModalAdminEvents from "@/components/modals/PackageDetailsModalAdminEvents.vue";

const router = useRouter();
const { token } = useAuth();

// Basic refs
const userCount = ref(0);
const recentUpdates = ref([]);
const isAddProductModalOpen = ref(false);
const currentPage = ref(1);
const usersPerPage = 3;
const totalPages = ref(1);
const showMenu = ref(false);

// Calendar refs
const isLoading = ref(true);
const currentDate = ref(new Date());
const events = ref([]);
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Add these refs
const selectedEvent = ref(null);
const isModalOpen = ref(false);
const selectedPackage = ref(null);

// Add these refs after the existing refs
const totalRequests = ref(0);
const acceptedRequests = ref(0);
const declinedRequests = ref(0);
const pendingReservations = ref(0);

// Add these refs for package counts
const weddingPackages = ref(0);
const christeningPackages = ref(0);
const debutPackages = ref(0);
const kiddiePartyPackages = ref(0);
const totalPackages = ref(0);

// Add these new refs
const adminUsers = ref(0);
const regularUsers = ref(0);
const activeUsers = ref(0);
const inactiveUsers = ref(0);

// Add these new refs for pending trends
const dailyPending = ref(0);
const weeklyPending = ref(0);
const monthlyPending = ref(0);
const trendPercentage = ref(0);

// Calendar computed properties
const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startPadding = firstDay.getDay();

  const days = [];

  // Previous month padding
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, daysInPrevMonth - i);
    days.push({
      date: date.toISOString(),
      isCurrentMonth: false,
      events: getEventsForDate(date),
    });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date: date.toISOString(),
      isCurrentMonth: true,
      events: getEventsForDate(date),
    });
  }

  // Next month padding
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date: date.toISOString(),
      isCurrentMonth: false,
      events: getEventsForDate(date),
    });
  }

  return days;
});

// Calendar methods
const getEventsForDate = (date) => {
  return events.value.filter((event) => {
    const eventDate = new Date(event.event_date);
    return eventDate.toDateString() === date.toDateString();
  });
};

const fetchEvents = async () => {
  try {
    isLoading.value = true;
    const response = await fetch("http://localhost:3000/api/bookings", {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch events");

    const data = await response.json();
    events.value = data
      .filter((event) => event.status === "Accepted")
      .map((event) => ({
        id: event.id,
        event_type: event.event_type,
        event_date: event.event_date,
        full_name: event.full_name,
        expected_guests: event.expected_guests,
        package_name: event.package_name,
        package_id: event.package_id,
        status: event.status,
      }));
  } catch (error) {
    console.error("Error fetching events:", error);
  } finally {
    isLoading.value = false;
  }
};

const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchUsers(),
    fetchEvents(),
    fetchRequestStatistics(),
    fetchPackageCounts(),
  ]);

  // Set up auto-refresh interval
  const statsInterval = setInterval(() => {
    fetchUsers();
    fetchEvents();
    fetchRequestStatistics();
    fetchPackageCounts();
  }, 60000); // Refresh every minute

  // Clean up interval on component unmount
  onUnmounted(() => {
    clearInterval(statsInterval);
  });
});

const fetchUsers = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/users", {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch users");

    const data = await response.json();

    // Update user counts
    userCount.value = data.total || data.length;

    // Calculate user breakdowns
    if (Array.isArray(data.users || data)) {
      const users = data.users || data;
      adminUsers.value = users.filter((user) => user.role === "admin").length;
      regularUsers.value = users.filter((user) => user.role === "user").length;
      activeUsers.value = users.filter(
        (user) => user.status === "active"
      ).length;
      inactiveUsers.value = users.filter(
        (user) => user.status === "inactive"
      ).length;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    // Reset counters on error
    userCount.value = 0;
    adminUsers.value = 0;
    regularUsers.value = 0;
    activeUsers.value = 0;
    inactiveUsers.value = 0;
  }
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

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

// Add this function before the component setup
const formatEventTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// ... rest of your script

const handleDayClick = async (day) => {
  if (day.events.length > 0) {
    const event = day.events[0];
    try {
      if (!event.package_id) {
        console.error("No package ID found for event:", event);
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/products/${event.package_id}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch package details");

      const packageData = await response.json();
      if (packageData.image_path) {
        packageData.image = `http://localhost:3000${packageData.image_path}`;
      }

      selectedPackage.value = packageData;
      selectedEvent.value = event;
      isModalOpen.value = true;
    } catch (error) {
      console.error("Error fetching package details:", error);
    }
  }
};

// Add this method to close the modal
const closeModal = () => {
  isModalOpen.value = false;
  selectedPackage.value = null;
  selectedEvent.value = null;
};

// Add this new function to fetch request statistics
const fetchRequestStatistics = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/bookings", {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch bookings");

    const data = await response.json();

    // Get current date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );

    // Filter pending bookings by time periods
    const pendingBookings = data.filter(
      (booking) => booking.status === "Pending"
    );

    dailyPending.value = pendingBookings.filter((booking) => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate >= today;
    }).length;

    weeklyPending.value = pendingBookings.filter((booking) => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate >= weekAgo;
    }).length;

    monthlyPending.value = pendingBookings.filter((booking) => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate >= monthAgo;
    }).length;

    // Calculate trend percentage (comparing to previous period)
    const previousMonthPending = pendingBookings.filter((booking) => {
      const bookingDate = new Date(booking.created_at);
      const twoMonthsAgo = new Date(
        today.getFullYear(),
        today.getMonth() - 2,
        today.getDate()
      );
      return bookingDate >= twoMonthsAgo && bookingDate < monthAgo;
    }).length;

    if (previousMonthPending > 0) {
      trendPercentage.value = Math.round(
        ((monthlyPending.value - previousMonthPending) / previousMonthPending) *
          100
      );
    }

    // Update total pending count
    pendingReservations.value = pendingBookings.length;
  } catch (error) {
    console.error("Error fetching request statistics:", error);
    resetStatistics();
  }
};

const resetStatistics = () => {
  pendingReservations.value = 0;
  dailyPending.value = 0;
  weeklyPending.value = 0;
  monthlyPending.value = 0;
  trendPercentage.value = 0;
};

// Add this watch effect
watch([acceptedRequests, declinedRequests], () => {
  totalRequests.value = acceptedRequests.value + declinedRequests.value;
});

// Add this function to fetch package counts
const fetchPackageCounts = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/products", {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.ok) {
      const products = await response.json();

      // Update the category filtering to handle case variations
      weddingPackages.value = products.filter(
        (p) => p.category.toLowerCase() === "wedding"
      ).length;
      christeningPackages.value = products.filter(
        (p) => p.category.toLowerCase() === "christening"
      ).length;
      debutPackages.value = products.filter(
        (p) => p.category.toLowerCase() === "debut"
      ).length;
      // Fix the kiddie party category comparison
      kiddiePartyPackages.value = products.filter(
        (p) =>
          p.category.toLowerCase() === "kiddieparty" ||
          p.category.toLowerCase() === "kiddie party" ||
          p.category.toLowerCase() === "kiddie-party"
      ).length;

      // Calculate total
      totalPackages.value = products.length;

      // Log for debugging
      console.log("Package counts:", {
        wedding: weddingPackages.value,
        christening: christeningPackages.value,
        debut: debutPackages.value,
        kiddieParty: kiddiePartyPackages.value,
        total: totalPackages.value,
        products: products.map((p) => ({ id: p.id, category: p.category })),
      });
    }
  } catch (error) {
    console.error("Error fetching package counts:", error);
  }
};
</script>

<style scoped>
/* Calendar Section Styling */
.dashboard-flex-container {
  display: flex;
  gap: 2rem;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.calendar-section {
  flex: 2;
  background: var(--color-white);
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
  width: 100%;
}

.calendar-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: var(--color-dark);
}

.calendar-container {
  width: 100%;
  min-height: 600px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-dark);
}

.nav-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--color-primary);
}

.calendar {
  width: 100%;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  background: var(--color-primary);
  color: var(--color-white);
  padding: 0.75rem 0;
  border-radius: 0.5rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  padding: 0.25rem;
}

.day {
  aspect-ratio: 1;
  height: 90px;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--color-white);
  display: flex;
  flex-direction: column;
}

.day:hover {
  background-color: var(--color-light);
}

.date {
  font-weight: 500;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
  color: var(--color-dark);
  padding: 0.15rem 0.3rem;
}

.day-events {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  font-size: 0.75rem;
}

.day-events::-webkit-scrollbar {
  width: 4px;
}

.day-events::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.day-events::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 4px;
}

.event-item {
  background: var(--color-primary);
  color: white;
  padding: 0.35rem;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
  font-size: 0.7rem;
}

.event-time {
  font-size: 0.65rem;
  opacity: 0.9;
  margin-bottom: 0.15rem;
  display: block;
}

.event-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.other-month {
  opacity: 0.5;
}

.has-events {
  border: 2px solid var(--color-primary);
  background-color: var(--color-light);
}

/* Calendar responsive styles */
@media screen and (max-width: 1400px) {
  .day {
    height: 85px;
    padding: 0.4rem;
  }
}

@media screen and (max-width: 1200px) {
  .day {
    height: 80px;
  }

  .weekdays {
    font-size: 0.8rem;
  }
}

@media screen and (max-width: 768px) {
  .day {
    height: 70px;
    padding: 0.35rem;
  }

  .date {
    font-size: 0.8rem;
  }

  .event-item {
    font-size: 0.65rem;
    padding: 0.25rem;
  }
}

.expenses .progress {
  position: relative;
  width: 92px;
}

.expenses .status-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
}

.expenses .status-breakdown small {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  text-align: right;
}

.expenses .status-breakdown small:first-child {
  background-color: rgba(41, 204, 57, 0.1);
  color: #29cc39;
}

.expenses .status-breakdown small:last-child {
  background-color: rgba(255, 119, 130, 0.1);
  color: #ff7782;
}

.insights {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.6rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.insights > div {
  background: var(--color-white);
  padding: 1.8rem;
  border-radius: 1rem;
  margin-top: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 300ms ease;
}

.insights > div:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.insights > div span {
  padding: 0.5rem;
  border-radius: 50%;
  color: var(--color-white);
  font-size: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.insights > div.users span {
  background: #7380ec;
}

.insights > div.requests span {
  background: #ff7782;
}

.insights > div.reservations span {
  background: #41f1b6;
}

.insights > div.packages span {
  background: #7380ec;
}

.insights .middle {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 1rem 0;
}

.insights h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
}

.insights h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.insights .percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
}

.insights .status-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.insights .status-breakdown small {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.insights .status-breakdown small.accepted {
  background-color: rgba(41, 204, 57, 0.1);
  color: #29cc39;
}

.insights .status-breakdown small.declined {
  background-color: rgba(255, 119, 130, 0.1);
  color: #ff7782;
}

.insights small.text-muted {
  display: block;
  margin-top: 1rem;
  font-size: 0.75rem;
  color: #666;
}

/* Add these styles for the package breakdown */
.insights .status-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.insights .status-breakdown small {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: rgba(115, 128, 236, 0.1);
  color: #7380ec;
}

.insights .packages {
  background: white;
  padding: 1.8rem;
  border-radius: 1rem;
  margin-top: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 300ms ease;
}

.insights .packages:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.insights .packages span {
  background: #7380ec;
  padding: 0.5rem;
  border-radius: 50%;
  color: white;
  font-size: 2rem;
}

.insights .users .status-breakdown small {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.insights .users .status-breakdown small.admin {
  background-color: rgba(115, 128, 236, 0.1);
  color: #7380ec;
}

.insights .users .status-breakdown small.regular {
  background-color: rgba(65, 241, 182, 0.1);
  color: #41f1b6;
}

.insights .users .status-breakdown small.active {
  background-color: rgba(41, 204, 57, 0.1);
  color: #29cc39;
}

.insights .users .status-breakdown small.inactive {
  background-color: rgba(255, 119, 130, 0.1);
  color: #ff7782;
}

/* Add these new styles */
.insights .trends {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.insights .trend-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.insights .trend-item small {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.insights .trend-item small.daily {
  background-color: rgba(41, 204, 57, 0.1);
  color: #29cc39;
}

.insights .trend-item small.weekly {
  background-color: rgba(115, 128, 236, 0.1);
  color: #7380ec;
}

.insights .trend-item small.monthly {
  background-color: rgba(65, 241, 182, 0.1);
  color: #41f1b6;
}

.insights .percentage {
  margin-top: 0.5rem;
  font-weight: 600;
  color: var(--color-primary);
}

.insights .percentage.positive {
  color: #29cc39;
}

.insights .percentage.negative {
  color: #ff7782;
}

/* Add these responsive styles to the existing <style> section */

@media (max-width: 1200px) {
  .insights {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .insights {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .recent-bookings {
    overflow-x: auto;
  }

  .calendar-section {
    margin: 1rem 0;
  }

  .calendar-container {
    min-height: 600px;
  }

  .days {
    gap: 0.25rem;
  }

  .day {
    min-height: 80px;
    padding: 0.5rem;
  }

  .event-item {
    font-size: 0.75rem;
  }

  .right {
    width: 94%;
    margin: 0 auto 4rem;
  }

  .right .top {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 0 0.8rem;
    height: 4.6rem;
    background: var(--color-white);
    z-index: 2;
    box-shadow: 0 1rem 1rem var(--color-light);
  }

  .profile .info {
    display: none;
  }
}

@media (max-width: 480px) {
  main {
    padding: 1rem;
  }

  .insights > div {
    padding: 1rem;
  }

  .profile-photo {
    width: 2.2rem;
    height: 2.2rem;
  }

  .calendar-container {
    min-height: 400px;
  }

  .day {
    min-height: 60px;
  }
}

.dashboard-container {
  padding: 20px;
  margin-top: 20px; /* Add space from the top */
}

.booking-history-section {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.section-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
}

.table-responsive {
  overflow-x: auto;
  margin-top: 15px;
}

.booking-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.booking-table th {
  background-color: #f5f5f5;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #ddd;
}

.booking-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

/* Add responsive styling */
@media screen and (max-width: 768px) {
  .table-responsive {
    margin: 0 -20px;
    padding: 0 20px;
  }
}

/* Add these new styles */
.dashboard-flex-container {
  display: flex;
  gap: 2rem;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
}

.calendar-section {
  flex: 1;
  max-width: 50%;
}

.gallery-actions {
  flex: 1;
  padding: 1.5rem;
  background: var(--color-white);
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
}

.gallery-actions h2 {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: var(--color-dark);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-gallery,
.update-gallery {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-white);
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 300ms ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-gallery:hover,
.update-gallery:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.post-gallery span.material-icons-sharp,
.update-gallery span.material-icons-sharp {
  padding: 0.5rem;
  border-radius: 50%;
  color: var(--color-white);
  font-size: 1.5rem;
}

.post-gallery span.material-icons-sharp {
  background: #ff7782;
}

.update-gallery span.material-icons-sharp {
  background: #7380ec;
}

/* Modify calendar styles */
.calendar-container {
  min-height: 500px; /* Reduced height */
}

/* Add responsive styles */
@media screen and (max-width: 1200px) {
  .dashboard-flex-container {
    flex-direction: column;
  }

  .calendar-section,
  .gallery-actions {
    width: 100%;
    max-width: 100%;
    margin-top: 1rem;
  }
}
</style>
