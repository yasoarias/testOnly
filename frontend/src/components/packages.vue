<template>
  <div class="packages-page" :class="{ 'dark-mode': isDarkMode }">
    <header :class="{ 'dark-mode': isDarkMode }">
      <div class="content-container header-content">
        <div class="logo-container">
          <img :src="logoPath" alt="Razz Rel Events Logo" class="logo" />
        </div>
        <nav>
          <router-link to="/">Home</router-link>
          <router-link to="/gallery">Gallery</router-link>
          <router-link to="/contact">Contact</router-link>
          <div class="dropdown">
            <button class="dropbtn" @click="toggleDropdown">Packages</button>
            <div class="dropdown-content" v-show="isDropdownOpen">
              <router-link to="/packages/wedding">Wedding</router-link>
              <router-link to="/packages/debut">Debut</router-link>
              <router-link to="/packages/kiddie-party">Kiddie Party</router-link>
              <router-link to="/packages/christening">Christening</router-link>
            </div>
          </div>
        </nav>
        <div class="user-actions">
          <button @click="toggleDarkMode" class="dark-mode-toggle">
            <i class="fas" :class="isDarkMode ? 'fa-sun' : 'fa-moon'"></i>
          </button>
          <div class="user-icon" @click="toggleLoginModal">
            <i class="fas fa-user"></i>
          </div>
        </div>
      </div>
    </header>

    <router-view></router-view>

    <footer class="footer">
      <!-- Footer content -->
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import logoImage from '../assets/logo.png';

const isDarkMode = ref(false);
const logoPath = ref(logoImage);
const isDropdownOpen = ref(false);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.body.classList.toggle('dark-mode', isDarkMode.value);
};

const toggleLoginModal = () => {
  // Implement login modal logic here
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (event) => {
  if (!event.target.closest('.dropdown')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
/* Add your styles here */
</style>
