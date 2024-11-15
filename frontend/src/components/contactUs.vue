<template>
  <div class="contact-us-page" :class="{ 'dark-mode': isDarkMode }">
    <Navbar 
      @openLoginModal="openLoginModal"
      @openRegisterModal="openRegisterModal"
      @logout="handleLogout"
    />
    <div class="contact-us-content">
      <h1>Contact Us</h1>
      <form @submit.prevent="submitForm" class="contact-form">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="formData.name" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="formData.email" required />
        </div>
        <div class="form-group">
          <label for="phone">Phone:</label>
          <input type="tel" id="phone" v-model="formData.phone" />
        </div>
        <div class="form-group">
          <label for="message">Message:</label>
          <textarea id="message" v-model="formData.message" required></textarea>
        </div>
        <button type="submit" class="submit-btn">Send Message</button>
      </form>
    </div>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-left">
          <p>We Would Love to Have You Visit Us soon!</p>
          <p>Contact Number: 09123456789</p>
          <p>Email: razz.rel.events@gmail.com</p>
        </div>
        <div class="footer-right">
          <p>Follow Us!</p>
          <div class="social-icons">
            <a href="#" aria-label="Facebook"
              ><i class="fab fa-facebook-f"></i
            ></a>
            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"
              ><i class="fab fa-instagram"></i
            ></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>All Rights Reserved 2024</p>
      </div>
    </footer>
    
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
import { ref } from "vue";
import Navbar from "./Navbar.vue";
import Login from "./login.vue";
import Register from "./register.vue";

const isDarkMode = ref(false);
const isModalOpen = ref(false);
const activeModal = ref("login");

const formData = ref({
  name: "",
  email: "",
  phone: "",
  message: "",
});

const submitForm = () => {
  console.log("Form submitted:", formData.value);
  // Add your form submission logic here
  formData.value = { name: "", email: "", phone: "", message: "" };
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
};

const switchToRegister = () => {
  activeModal.value = "register";
};

const switchToLogin = () => {
  activeModal.value = "login";
};

const handleLogin = (credentials) => {
  console.log("Login credentials received:", credentials);
  closeModal();
};

const handleRegister = (userData) => {
  console.log("Registration data received:", userData);
  closeModal();
};

const handleLogout = () => {
  console.log("User logged out");
  // Implement any additional logout logic if needed
};
</script>

<style scoped>
.contact-us-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.contact-us-page.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

.contact-us-content {
  flex: 1;
  max-width: 700px; /* Reduced from 800px */
  width: 85%; /* Slightly reduced from 90% */
  margin: 2rem auto;
  padding: 1.5rem; /* Reduced padding */
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 2.5rem; /* Reduced padding */
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  border: 1px solid #ccc;
}

.form-group {
  margin-bottom: 1.25rem; /* Slightly reduced spacing */
}

label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
  color: #333;
  font-size: 1rem; /* Slightly reduced font size */
}

input,
textarea {
  width: 100%;
  padding: 0.6rem; /* Slightly reduced padding */
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ffffff;
  color: #333;
  font-size: 0.95rem; /* Slightly reduced font size */
}

textarea {
  height: 150px; /* Reduced height */
  resize: vertical;
}

.submit-btn {
  background-color: #ff6347;
  color: white;
  border: none;
  padding: 0.8rem 1.6rem; /* Reduced padding */
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 5px;
  align-self: flex-start;
}

.submit-btn:hover {
  background-color: #ff4500;
}

/* Ensure header text is visible in dark mode */
.contact-us-page.dark-mode .logo,
.contact-us-page.dark-mode nav a,
.contact-us-page.dark-mode .user-actions,
.contact-us-page.dark-mode h1 {
  color: #ffffff;
}

/* Keep dropdown text dark */
.contact-us-page.dark-mode .dropdown-content a {
  color: #000000;
}

/* Ensure footer text is visible in dark mode */
.contact-us-page.dark-mode .footer {
  color: #ffffff;
}
</style>
