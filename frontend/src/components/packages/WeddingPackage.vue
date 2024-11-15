<template>
  <div class="package-section">
    <Navbar
      @openLoginModal="openLoginModal"
      @openRegisterModal="openRegisterModal"
      @logout="handleLogout"
    />
    <h2 class="section-title">Premium Wedding Event Packages</h2>
    <div v-if="isLoading" class="loading">Loading packages...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="packages-container">
      <div class="packages-wrapper">
        <div class="packages-row">
          <div
            v-for="product in weddingProducts"
            :key="product.id"
            class="package-card"
          >
            <img
              :src="getImageUrl(product.image_path)"
              :alt="product.name"
              class="package-image"
              @error="handleImageError"
            />
            <div class="package-details">
              <h3>{{ product.name }}</h3>
              <p v-if="!token" class="login-message">Login to view price</p>
              <p v-else class="package-price">
                {{ formatPrice(product.price) }}
              </p>
              <button class="package-link" @click="handleViewDetails(product)">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <div v-if="selectedProduct" class="modal">
      <div class="modal-content">
        <button @click="closeModal" class="close-button">×</button>
        <h3>{{ selectedProduct.name }}</h3>
        <img
          :src="getImageUrl(selectedProduct.image_path)"
          :alt="selectedProduct.name"
          class="modal-image"
          @error="handleImageError"
        />
        <p>{{ selectedProduct.description }}</p>
        <p v-if="token" class="package-price">
          {{ formatPrice(selectedProduct.price) }}
        </p>
        <p v-else class="login-message">Login to view price</p>
        <button v-if="token" @click="bookNow" class="book-now-button">
          Book Now
        </button>
        <button v-else @click="openLoginModal" class="login-button">
          Login to Book
        </button>
      </div>
    </div>

    <!-- Booking Form -->
    <BookingForm
      v-if="isBookingModalOpen"
      :isOpen="isBookingModalOpen"
      :eventType="'Wedding'"
      :selectedProduct="selectedProduct"
      :initialData="{
        fullName:
          user.value?.firstName && user.value?.lastName
            ? `${user.value.firstName} ${user.value.lastName}`.trim()
            : '',
        contactNumber: user.value?.phoneNumber || '',
        email: user.value?.email || '',
      }"
      @close="closeBookingModal"
      @submit="handleBookingSuccess"
      @error="handleBookingError"
    />

    <!-- Login and Register modals -->
    <Login
      v-if="isModalOpen && activeModal === 'login'"
      :isOpen="isModalOpen"
      @close="closeModal"
      @login="handleLogin"
      @switchToRegister="switchToRegister"
    />
    <Register
      v-if="isModalOpen && activeModal === 'register'"
      :isOpen="isModalOpen"
      @close="closeModal"
      @register="handleRegister"
      @switchToLogin="switchToLogin"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import Navbar from "@/components/Navbar.vue";
import Login from "@/components/login.vue";
import Register from "@/components/register.vue";
import BookingForm from "@/components/bookings/BookingForm.vue";
import { useAuth } from "@/composables/useAuth";

const props = defineProps(["userRole"]);
const { token } = useAuth();

const activeModal = ref(null);
const isModalOpen = ref(false);
const weddingProducts = ref([]);
const selectedProduct = ref(null);
const isLoading = ref(true);
const error = ref(null);
const userRole = ref(props.userRole);
const user = ref({
  id: null,
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
});
const isBookingModalOpen = ref(false);

onMounted(async () => {
  await fetchUserInfo();
  fetchWeddingProducts();
});

const fetchUserInfo = async () => {
  try {
    if (!token.value) {
      console.error("No token found");
      return;
    }

    const response = await fetch("http://localhost:3000/user/profile", {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData = await response.json();
      user.value = userData;
      userRole.value = userData.role;
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
};

const fetchWeddingProducts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await fetch(
      "http://localhost:3000/api/products?category=wedding",
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      weddingProducts.value = data.filter(
        (product) => product.category.toLowerCase() === "wedding"
      );
    } else {
      throw new Error("Failed to fetch wedding products");
    }
  } catch (err) {
    console.error("Error fetching wedding products:", err);
    error.value = "Failed to load wedding packages. Please try again later.";
  } finally {
    isLoading.value = false;
  }
};

const getImageUrl = (imagePath) => {
  return `http://localhost:3000${imagePath}`;
};

const formatPrice = (price) => {
  return "₱" + new Intl.NumberFormat("en-PH").format(price);
};

const handleViewDetails = (product) => {
  if (!token.value) {
    openLoginModal();
    return;
  }
  selectedProduct.value = product;
};

const handleImageError = (event) => {
  event.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
};

const openLoginModal = () => {
  isModalOpen.value = true;
  activeModal.value = "login";
};

const openRegisterModal = () => {
  isModalOpen.value = true;
  activeModal.value = "register";
};

const closeModal = () => {
  isModalOpen.value = false;
  activeModal.value = null;
  selectedProduct.value = null;
};

const switchToRegister = () => {
  activeModal.value = "register";
};

const switchToLogin = () => {
  activeModal.value = "login";
};

const handleLogin = async (credentials) => {
  try {
    await fetchUserInfo();
    closeModal();
    if (selectedProduct.value) {
      handleViewDetails(selectedProduct.value);
    }
  } catch (error) {
    console.error("Login error:", error);
  }
};

const handleRegister = (userData) => {
  console.log("Registration data received:", userData);
  closeModal();
};

const handleLogout = () => {
  userRole.value = null;
  user.value = null;
};

const bookNow = () => {
  if (!user.value) {
    console.error("User data not available");
    return;
  }
  isBookingModalOpen.value = true;
};

const closeBookingModal = () => {
  isBookingModalOpen.value = false;
  setTimeout(() => {
    window.location.reload();
  }, 100);
};

const handleBookingSuccess = () => {
  closeBookingModal();
};

const handleBookingError = (error) => {
  console.error("Booking error:", error);
  if (
    error.message.includes("Unauthorized") ||
    error.message.includes("session has expired") ||
    error.message.includes("Please log in")
  ) {
    handleLogout();
    openLoginModal();
  } else {
    alert(error.message || "Failed to submit booking");
  }
};

watch(
  () => props.userRole,
  (newRole) => {
    if (newRole) {
      userRole.value = newRole;
    }
  }
);
</script>

<style>
@import "@/assets/styles/packageStyles.css";
</style>
