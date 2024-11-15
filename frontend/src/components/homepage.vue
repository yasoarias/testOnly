<template>
  <div class="homepage">
    <Navbar
      @openLoginModal="openLoginModal"
      @openRegisterModal="openRegisterModal"
      @logout="handleLogout"
    />

    <main class="main-content">
      <div class="hero">
        <div class="hero-overlay">
          <img
            src="@/assets/contentimage.png"
            alt="Razz Rel Events logo"
            class="hero-logo"
          />
        </div>
        <button class="book-now" @click="handleBookNowClick">BOOK NOW</button>
      </div>
    </main>

    <!-- Explore Our Services Section -->
    <div class="services-section">
      <h2>EXPLORE OUR SERVICES</h2>
      <div class="services-grid">
        <div class="service-item">
          <router-link to="/packages/wedding">
            <img src="@/assets/wedding.png" alt="Wedding" />
            <h3>Wedding</h3>
          </router-link>
        </div>
        <div class="service-item">
          <router-link to="/packages/debut">
            <img src="@/assets/debut.png" alt="Debut" />
            <h3>Debut</h3>
          </router-link>
        </div>
        <div class="service-item">
          <router-link to="/packages/kiddie-party">
            <img src="@/assets/kiddie.png" alt="Kiddie Party" />
            <h3>Kiddie Party</h3>
          </router-link>
        </div>
        <div class="service-item">
          <router-link to="/packages/christening">
            <img src="@/assets/christening.png" alt="Christening" />
            <h3>Christening</h3>
          </router-link>
        </div>
      </div>
    </div>

    <!-- About Us Section -->
    <AboutUS />

    <!-- Login Modal -->
    <Login
      v-if="isModalOpen && activeModal === 'login'"
      :isOpen="isModalOpen"
      @close="closeModal"
      @login="handleLogin"
      @loginComplete="handleLoginComplete"
      @switchToRegister="switchToRegister"
    />

    <!-- Register Modal -->
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "./Navbar.vue";
import AboutUS from "./aboutUS.vue";
import Login from "./login.vue";
import Register from "./register.vue";

import contentImage from "@/assets/contentimage.png";
import weddingImage from "@/assets/wedding.png";
import kiddieImage from "@/assets/kiddie.png";
import premiumImage from "@/assets/premium.png";
import debutImage from "@/assets/debut.png";

const isModalOpen = ref(false);
const activeModal = ref("login");

const router = useRouter();

// Remove or comment out the following code block:
/*
onMounted(() => {
  const isLoggedIn = localStorage.getItem('user') !== null;
  if (isLoggedIn) {
    router.push('/gallery');
  }
});
*/

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
};

const switchToRegister = () => {
  activeModal.value = "register";
};

const switchToLogin = () => {
  activeModal.value = "login";
};

const handleBookNowClick = () => {
  isModalOpen.value = true;
  activeModal.value = "login";
};

const handleLogin = (credentials) => {
  // Implement login logic
  console.log("Login with:", credentials);
  closeModal();
};

const handleRegister = async (userData) => {
  try {
    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.success) {
      console.log("Registration successful");
      switchToLogin();
    } else {
      console.error("Registration failed:", data.message);
    }
  } catch (error) {
    console.error("Error during registration:", error);
  }
};

const handleLogout = () => {
  // Implement any additional logout logic if needed
  console.log("User logged out");
};

const handleLoginComplete = async () => {
  await router.push("/gallery");
};

// ... any other necessary logic ...
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  background-image: url("@/assets/hero-image.jpg"); /* Update with your actual hero image path */
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-overlay {
  position: absolute;
  top: 36%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

.hero-logo {
  width: 40rem; /* Adjust as needed */
  margin-bottom: 1rem;
}

.hero-overlay h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.hero-overlay p {
  font-size: 1.2rem;
}

.book-now {
  position: absolute;
  bottom: 20%;
  padding: 15px 50px;
  font-size: 1.2rem;
  background-color: AEC0C2;
  opacity: 0.8;
  color: black;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bold;
}

.services-section {
  text-align: center;
  padding: 2rem 0;
}

.services-grid {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.service-item {
  width: 20%;
  margin: 1rem 0;
}

.service-item img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-item:hover img {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.service-item h3 {
  margin-top: 0.5rem;
  font-size: 1.2rem;
}

.service-item a {
  text-decoration: none;
}

/* ... (keep other existing styles) ... */
</style>
