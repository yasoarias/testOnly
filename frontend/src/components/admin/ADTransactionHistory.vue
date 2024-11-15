<template>
  <div class="admin-dashboard">
    <AdminSidebar />
    <main>
      <div class="insights">
        <div class="bookings">
          <span class="material-icons-sharp">event</span>
          <div class="middle">
            <div class="left">
              <h3>Total Bookings</h3>
              <h1>{{ bookings.length }}</h1>
            </div>
            <div class="progress">
              <svg>
                <circle cx="38" cy="38" r="36"></circle>
              </svg>
              <div class="number">
                <p>{{ Math.round((bookings.length / 100) * 100) }}%</p>
              </div>
            </div>
          </div>
          <small class="text-muted">Total received bookings</small>
        </div>
      </div>
      <div class="recent-bookings">
        <h2>Recent Bookings</h2>
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Event Date</th>
              <th>Contact Number</th>
              <th>Email</th>
              <th>Venue Name</th>
              <th>Expected Guests</th>
              <th>Category</th>
              <th>Event Type</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in paginatedBookings" :key="booking.id">
              <td>{{ booking.full_name }}</td>
              <td>{{ formatDate(booking.event_date) }}</td>
              <td>{{ booking.contact_number }}</td>
              <td>{{ booking.email }}</td>
              <td>{{ booking.venue_name }}</td>
              <td>{{ booking.expected_guests }}</td>
              <td>{{ booking.package_name }}</td>
              <td>{{ booking.event_type }}</td>
              <td>{{ booking.status || "Pending" }}</td>
              <td>
                <button
                  @click="acceptBooking(booking.id)"
                  class="btn-action btn-accept"
                  title="Accept"
                >
                  <span class="material-icons-sharp">check</span>
                </button>
                <button
                  @click="declineBooking(booking.id)"
                  class="btn-action btn-decline"
                  title="Decline"
                >
                  <span class="material-icons-sharp">close</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="btn-pagination"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="btn-pagination"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import AdminSidebar from "./AdminSidebar.vue";
import { useAuth } from "@/composables/useAuth";

const { token, user, fetchUserInfo } = useAuth();

const bookings = ref([]);
const currentPage = ref(1);
const itemsPerPage = 6;

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return bookings.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(bookings.value.length / itemsPerPage)
);

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const fetchBookings = async () => {
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
    // Filter out only pending bookings
    bookings.value = data.filter((booking) => booking.status === "Pending");
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const acceptBooking = async (bookingId) => {
  try {
    if (!token.value) {
      console.error("No token found");
      return;
    }
    const response = await fetch(
      `http://localhost:3000/api/bookings/${bookingId}/accept`,
      {
        method: "PUT",
        headers: {
          Authorization: token.value,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to accept booking");
    }
    // Remove the accepted booking from the list
    bookings.value = bookings.value.filter(
      (booking) => booking.id !== bookingId
    );
  } catch (error) {
    console.error("Error accepting booking:", error);
  }
};

const declineBooking = async (bookingId) => {
  try {
    if (!token.value) {
      console.error("No token found");
      return;
    }
    const response = await fetch(
      `http://localhost:3000/api/bookings/${bookingId}/decline`,
      {
        method: "PUT",
        headers: {
          Authorization: token.value,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to decline booking");
    }
    await fetchBookings(); // Refresh the bookings list
  } catch (error) {
    console.error("Error declining booking:", error);
  }
};

onMounted(async () => {
  await fetchUserInfo();
  if (user.value && user.value.role === "admin") {
    fetchBookings();
  } else {
    console.error("User is not an admin");
    // Handle non-admin access (e.g., redirect to login or show an error message)
  }
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

.recent-bookings {
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

.btn-accept,
.btn-decline {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-accept {
  background-color: #4caf50;
  color: white;
  margin-right: 5px;
}

.btn-accept:hover {
  background-color: #45a049;
}

.btn-decline {
  background-color: #f44336;
  color: white;
}

.btn-decline:hover {
  background-color: #da190b;
}

.btn-action {
  padding: 6px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin-right: 5px;
}

.material-icons-sharp {
  font-size: 18px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.btn-pagination {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  margin: 0 10px;
}

.btn-pagination:hover {
  background-color: #45a049;
}

.btn-pagination:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .recent-bookings {
    overflow-x: auto;
  }

  table {
    min-width: 800px;
  }

  .btn-action {
    width: 24px;
    height: 24px;
    padding: 4px;
  }

  .material-icons-sharp {
    font-size: 16px;
  }

  .insights > div {
    padding: 1rem;
  }

  .insights h3 {
    font-size: 0.9rem;
  }

  .insights h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  main {
    padding: 1rem;
  }

  .insights > div {
    padding: 0.75rem;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-pagination {
    width: 100%;
  }
}
</style>
