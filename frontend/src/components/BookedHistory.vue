<template>
  <div class="booked-history-page">
    <Navbar
      @openLoginModal="openLoginModal"
      @openRegisterModal="openRegisterModal"
      @logout="handleLogout"
    />

    <div class="content-wrapper">
      <div class="title-section">
        <div class="title-icon">
          <i class="fas fa-clock-rotate-left"></i>
        </div>
        <h1>Booked History</h1>
      </div>

      <div class="bookings-section">
        <div class="bookings-header">
          <div class="bookings-header-left">
            <i class="fas fa-calendar"></i>
            <h2>Recent Bookings</h2>
          </div>

          <div class="search-section">
            <div class="search-container">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search by booking ID"
              />
            </div>
          </div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>BOOKING ID</th>
                <th>PACKAGE ID</th>
                <th>PACKAGE CATEGORY</th>
                <th>PACKAGE TYPE</th>
                <th>PACKAGE PRICE</th>
                <th>EVENT DATE</th>
                <th>VENUE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in paginatedBookings" :key="booking.id">
                <td>#{{ booking.id }}</td>
                <td>{{ booking.package_id || "N/A" }}</td>
                <td>{{ booking.package_name || "N/A" }}</td>
                <td>{{ booking.event_type || "N/A" }}</td>
                <td>
                  {{
                    booking.package_price
                      ? formatPrice(booking.package_price)
                      : "₱0.00"
                  }}
                </td>
                <td>{{ formatDate(booking.event_date) }}</td>
                <td>{{ booking.venue_name }}</td>
                <td>
                  <span class="status" :class="booking.status.toLowerCase()">
                    {{ booking.status }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      @click="viewBookingDetails(booking)"
                      class="btn-view"
                    >
                      Details
                    </button>
                    <button
                      v-if="booking.status === 'Pending'"
                      @click="cancelBooking(booking)"
                      class="btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <BookingDetailsModal
      v-if="selectedBooking"
      :booking="selectedBooking"
      @close="closeBookingDetailsModal"
    />

    <div v-if="showCancelAnimation" class="cancel-animation-overlay">
      <!-- Keep existing animation content -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Navbar from "@/components/Navbar.vue";
import { useAuth } from "@/composables/useAuth";
import BookingDetailsModal from "@/components/bookings/BookingDetailsModal.vue";

const { token } = useAuth();

const bookings = ref([]);
const currentPage = ref(1);
const itemsPerPage = 10;

const searchQuery = ref("");

const filteredBookings = computed(() => {
  let filtered = bookings.value.filter(
    (booking) => booking.status !== "Cancelled"
  );

  if (searchQuery.value) {
    filtered = filtered.filter((booking) =>
      booking.id.toString().includes(searchQuery.value.trim())
    );
  }

  return filtered;
});

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredBookings.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredBookings.value.length / itemsPerPage)
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

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const openLoginModal = () => {
  // Implementation
};

const openRegisterModal = () => {
  // Implementation
};

const handleLogout = () => {
  // Implementation
};

const fetchBookings = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/bookings", {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      console.log("Received bookings data:", data); // Debug log
      // Verify each booking has an id
      data.forEach((booking) => {
        if (!booking.id) {
          console.warn("Booking missing ID:", booking);
        }
      });
      bookings.value = data;
    } else {
      console.error("Failed to fetch bookings");
    }
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
};

const viewBookingDetails = (booking) => {
  selectedBooking.value = booking;
};

const cancelBooking = async (booking) => {
  try {
    const packageId = booking.package_id;
    console.log("Attempting to cancel booking:", booking);

    if (!packageId || packageId <= 0) {
      throw new Error(`Invalid package ID: ${packageId}`);
    }

    if (!token.value) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `http://localhost:3000/api/bookings/${packageId}/cancel`,
      {
        method: "PUT",
        headers: {
          Authorization: token.value,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          created_at: booking.created_at,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to cancel booking");
    }

    // Show animation
    showCancelAnimation.value = true;

    // Wait for animation and then reload
    setTimeout(async () => {
      await fetchBookings();
      showCancelAnimation.value = false;
      window.location.reload();
    }, 2000); // 2 seconds delay
  } catch (error) {
    console.error("Error cancelling booking:", error);
    alert(error.message || "Failed to cancel booking");
  }
};

const closeBookingDetailsModal = () => {
  selectedBooking.value = null;
};

const selectedBooking = ref(null);

const formatPrice = (price) => {
  // Check if price is null, undefined, or not a number
  if (!price || isNaN(price)) {
    return "₱0.00";
  }

  // Convert string to number if needed
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  // Format the price with PHP currency
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    currencyDisplay: "symbol",
  })
    .format(numericPrice)
    .replace("PHP", "₱");
};

onMounted(() => {
  if (!token.value) {
    console.error("No token found");
    // Redirect to login or handle unauthorized state
    return;
  }
  fetchBookings();
});

watch(
  paginatedBookings,
  (newBookings) => {
    console.log("Paginated bookings:", newBookings);
  },
  { deep: true }
);

// Add new ref for animation control
const showCancelAnimation = ref(false);

// Add this new method to your existing script
const getStatusClass = (status) => {
  return {
    "status-pending": status === "Pending",
    "status-confirmed": status === "Confirmed",
    "status-cancelled": status === "Cancelled",
    "status-completed": status === "Completed",
  };
};
</script>

<style scoped>
.booked-history-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.content-wrapper {
  max-width: 98%;
  margin: 0 auto;
  padding: 1rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.title-icon {
  background-color: #6c5ce7;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.title-section h1 {
  color: #2d3436;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.bookings-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  margin: 0.5rem 0;
}

.bookings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem 0.4rem 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.bookings-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bookings-header i {
  color: #6c5ce7;
}

.bookings-header h2 {
  color: #2d3436;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.search-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0;
  padding: 0;
}

.search-container {
  position: relative;
  width: 220px;
  margin-right: 2.5rem;
}

.search-container input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.813rem;
  color: #1f2937;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 32px;
}

.search-container input:focus {
  outline: none;
  border-color: #6c5ce7;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
}

.search-container::before {
  content: "\f002";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 0.813rem;
}

.table-container {
  overflow-x: auto;
  margin: 0;
  padding: 1.5rem;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0.5rem; /* Creates space between rows */
  min-width: 100%;
}

th {
  background-color: #ffffff;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 1rem 1.5rem;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: none;
}

tr {
  transition: all 0.2s ease;
}

tbody tr {
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

td {
  padding: 1.25rem 1.5rem;
  color: #1f2937;
  font-size: 0.875rem;
  border: none;
  background: inherit;
}

tbody tr:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
}

.status.pending {
  background-color: #fef9c3;
  color: #854d0e;
  border: 1px solid #fde047;
}

.status.accepted {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.status.cancelled {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-view,
.btn-cancel {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-view {
  background-color: #6c5ce7;
  color: white;
  box-shadow: 0 2px 4px rgba(108, 92, 231, 0.2);
}

.btn-view:hover {
  background-color: #5a4bd1;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(108, 92, 231, 0.3);
}

.btn-cancel {
  background-color: #ffffff;
  color: #dc2626;
  border: 1px solid #dc2626;
}

.btn-cancel:hover {
  background-color: #dc2626;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 2.5rem;
  padding: 1.5rem;
}

.pagination-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 10px;
  background-color: #6c5ce7;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(108, 92, 231, 0.2);
}

.pagination-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(108, 92, 231, 0.3);
}

.pagination-btn:disabled {
  background-color: #e2e8f0;
  cursor: not-allowed;
  box-shadow: none;
}

th:first-child,
td:first-child {
  padding-left: 1.5rem;
}

th:last-child,
td:last-child {
  padding-right: 1.5rem;
}

@media (max-width: 768px) {
  .content-wrapper {
    max-width: 100%;
    padding: 0.5rem;
  }

  .bookings-section {
    padding: 0.75rem;
    border-radius: 8px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-view,
  .btn-cancel {
    width: 100%;
  }

  .table-container {
    padding: 0.5rem;
  }

  th,
  td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
