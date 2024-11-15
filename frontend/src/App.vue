<template>
  <div id="app">
    <Navbar />
    <router-view></router-view>
  </div>
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
// import { useActivityTracker } from './utils/ActivityTracker';

// const { isActive } = useActivityTracker();
</script>

<style scoped>
#app {
  font-family: sans-serif;
}

:root {
  --text-color: #333333;
  --background-color: #ffffff;
  --card-background: #ffffff;
  --heading-color: #333333;
  --subtext-color: #666666;
}

:root.dark-mode {
  --text-color: #ffffff;
  --background-color: #1a1a1a;
  --card-background: #2d2d2d;
  --heading-color: #ffffff;
  --subtext-color: #cccccc;
}

/* Apply transition for smooth mode switching */
* {
  transition: background-color 0.3s, color 0.3s;
}

/* Ensure text contrast in dark mode */
.dark-mode {
  background-color: var(--background-color);
  color: var(--text-color);
}

.dark-mode h1,
.dark-mode h2,
.dark-mode h3,
.dark-mode h4,
.dark-mode h5,
.dark-mode h6 {
  color: var(--heading-color);
}

.dark-mode p,
.dark-mode span,
.dark-mode label,
.dark-mode .text-content {
  color: var(--text-color);
}

/* Add specific styles for package cards in dark mode */
.dark-mode .package-card {
  background-color: var(--card-background);
}

.dark-mode .package-details {
  color: var(--text-color);
}

.dark-mode .package-details h3 {
  color: var(--heading-color);
}

.dark-mode .modal-content {
  background-color: var(--card-background);
  color: var(--text-color);
}

.dark-mode .modal-content h3,
.dark-mode .modal-content h4 {
  color: var(--heading-color);
}

.dark-mode .modal-content p {
  color: var(--text-color);
}

.dark-mode input,
.dark-mode textarea,
.dark-mode select {
  background-color: var(--card-background);
  color: var(--text-color);
  border-color: #444444;
}

.dark-mode input::placeholder,
.dark-mode textarea::placeholder {
  color: var(--subtext-color);
}
</style>
