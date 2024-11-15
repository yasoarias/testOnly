<template>
  <div class="admin-dashboard">
    <AdminSidebar />
    <main>
      <div class="insights">
        <div class="bookings">
          <span class="material-icons-sharp">event</span>
          <div class="middle">
            <div class="left">
              <h3>Total Events</h3>
              <h1>{{ events.length }}</h1>
            </div>
            <div class="progress">
              <svg>
                <circle cx="38" cy="38" r="36"></circle>
              </svg>
              <div class="number">
                <p>{{ Math.round((events.length / 100) * 100) }}%</p>
              </div>
            </div>
          </div>
          <small class="text-muted">All scheduled events</small>
        </div>
      </div>
      <div class="recent-bookings">
        <h2>Recent Events</h2>
        <table>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Client</th>
              <th>Package</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in filteredEvents" :key="event.id">
              <td>{{ event.event_type }}</td>
              <td>{{ formatDate(event.event_date) }}</td>
              <td>{{ event.full_name }}</td>
              <td>{{ event.package_name }}</td>
              <td>{{ event.expected_guests }}</td>
              <td>
                <span :class="getStatusClass(event.status)">
                  {{ event.status }}
                  <i
                    v-if="event.status === 'Completed'"
                    class="fas fa-check"
                  ></i>
                </span>
              </td>
              <td>
                <button @click="viewEventDetails(event)" class="btn-details">
                  Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PackageDetailsModalAdminEvents
        :isOpen="isModalOpen"
        :packageData="selectedPackage"
        :eventData="selectedEvent"
        @close="closeModal"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import AdminSidebar from "./AdminSidebar.vue";
import { useAuth } from "@/composables/useAuth";
import PackageDetailsModalAdminEvents from "@/components/modals/PackageDetailsModalAdminEvents.vue";

const { token } = useAuth();

const events = ref([]);
const showMenu = ref(false);
const isModalOpen = ref(false);
const selectedPackage = ref(null);
const selectedEvent = ref(null);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const fetchEvents = async () => {
  try {
    if (!token.value) {
      console.error("No token found");
      return;
    }
    console.log("Fetching bookings with token:", token.value);
    const response = await fetch("http://localhost:3000/api/bookings", {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Failed to fetch bookings: ${response.status} - ${errorText}`
      );
    }
    const data = await response.json();
    console.log("Fetched bookings:", data);
    events.value = data.map((event) => ({
      ...event,
      status:
        event.status === "Accepted" && new Date(event.event_date) < new Date()
          ? "Completed"
          : event.status,
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

const filteredEvents = computed(() => {
  return events.value.filter((event) =>
    ["Completed", "Declined"].includes(event.status)
  );
});

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "status-completed";
    case "declined":
      return "status-declined";
    default:
      return "status-pending";
  }
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const viewEventDetails = async (event) => {
  try {
    if (!event.package_id) {
      console.error("No package ID associated with this event");
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

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Package not found");
      }
      throw new Error("Failed to fetch package details");
    }

    const packageData = await response.json();
    // Modify the image path to include the full URL
    if (packageData.image_path) {
      packageData.image = `http://localhost:3000${packageData.image_path}`;
    }
    selectedPackage.value = packageData;
    selectedEvent.value = event;
    isModalOpen.value = true;
  } catch (error) {
    console.error("Error fetching package details:", error);
    // You might want to show an error message to the user here
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedPackage.value = null;
  selectedEvent.value = null;
};

onMounted(fetchEvents);
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
  padding: 2rem;
  overflow-y: auto;
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #363949;
}

@media screen and (max-width: 768px) {
  .menu-btn {
    display: block;
  }

  .admin-dashboard {
    position: relative;
  }

  .show-menu {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 70%;
    height: 100vh;
    z-index: 100;
    background-color: white;
    box-shadow: 0 2rem 3rem rgba(132, 139, 200, 0.18);
  }
}

h2 {
  margin-bottom: 1rem;
  color: #363949;
}

.insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.6rem;
  margin-bottom: 2rem;
}

.bookings {
  background: white;
  padding: 1.8rem;
  border-radius: 2rem;
  box-shadow: 0 2rem 3rem rgba(132, 139, 200, 0.18);
  transition: all 300ms ease;
}

.bookings:hover {
  box-shadow: none;
}

.bookings .material-icons-sharp {
  background: #7380ec;
  padding: 0.5rem;
  border-radius: 50%;
  color: white;
  font-size: 2rem;
}

.bookings .middle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bookings h3 {
  margin: 1rem 0 0.6rem;
  font-size: 1rem;
}

.bookings .progress {
  position: relative;
  width: 92px;
  height: 92px;
  border-radius: 50%;
}

.bookings svg {
  width: 7rem;
  height: 7rem;
}

.bookings svg circle {
  fill: none;
  stroke: #7380ec;
  stroke-width: 14;
  stroke-linecap: round;
  transform: translate(5px, 5px);
  stroke-dasharray: 110;
  stroke-dashoffset: 92;
}

.bookings .number {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.recent-bookings {
  margin-top: 2rem;
}

.recent-bookings table {
  background: white;
  width: 100%;
  border-radius: 2rem;
  padding: 1.8rem;
  text-align: center;
  box-shadow: 0 2rem 3rem rgba(132, 139, 200, 0.18);
  transition: all 300ms ease;
}

.recent-bookings table:hover {
  box-shadow: none;
}

.recent-bookings table th {
  padding: 0.8rem 0;
  color: #363949;
  font-weight: 600;
}

.recent-bookings table td {
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(132, 139, 200, 0.18);
  color: #677483;
}

.btn-details {
  background: #7380ec;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  border: none;
  cursor: pointer;
  transition: all 300ms ease;
}

.btn-details:hover {
  background: #5a67d8;
}

.show-all {
  display: block;
  text-align: center;
  margin: 1rem auto;
  color: #7380ec;
}

.add-event {
  background: white;
  border-radius: 2rem;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  box-shadow: 0 2rem 3rem rgba(132, 139, 200, 0.18);
  transition: all 300ms ease;
  cursor: pointer;
}

.add-event:hover {
  box-shadow: none;
}

.add-event .material-icons-sharp {
  background: #7380ec;
  padding: 0.5rem;
  border-radius: 50%;
  color: white;
  font-size: 2rem;
}

.status-completed,
.status-declined,
.status-pending {
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.status-completed {
  background-color: #4caf50;
  color: white;
}

.status-completed i {
  margin-left: 4px;
  font-size: 0.8em;
}

.status-declined {
  background-color: #ff7782;
  color: white;
}

.status-pending {
  background-color: #7380ec;
  color: white;
}

/* Remove these color classes as they're no longer needed */
/* .upcoming, .planning, .completed, .pending { ... } */
</style>
