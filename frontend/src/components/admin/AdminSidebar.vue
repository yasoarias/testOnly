<template>
  <aside>
    <div class="top">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" />
      </div>
    </div>

    <div class="sidebar">
      <router-link to="/admin" exact-active-class="active" @click="handleClick">
        <span class="material-icons-sharp">grid_view</span>
        <h3>Dashboard</h3>
      </router-link>
      <router-link to="/admin/users" active-class="active" @click="handleClick">
        <span class="material-icons-sharp">person_outline</span>
        <h3>Users</h3>
      </router-link>
      <router-link
        to="/admin/transaction-history"
        active-class="active"
        @click="handleClick"
      >
        <span class="material-icons-sharp">event</span>
        <h3>Transaction History</h3>
      </router-link>
      <router-link
        to="/admin/booked-oversight"
        active-class="active"
        @click="handleClick"
      >
        <span class="material-icons-sharp">event</span>
        <h3>Booking Oversight</h3>
      </router-link>
      <router-link
        to="/admin/packages"
        active-class="active"
        @click="handleClick"
      >
        <span class="material-icons-sharp">inventory</span>
        <h3>Packages</h3>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userRole = ref(localStorage.getItem("userRole")); // Assuming user role is stored in localStorage

const handleClick = () => {
  // No need to reload the page; just navigate
  if (userRole.value === "admin") {
    // You can add any specific logic for admin here if needed
  }
};
</script>

<style scoped>
aside {
  height: 100vh;
  background-color: #fff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  width: 230px;
  position: relative;
  left: -10px;
  overflow-y: auto; /* Changed to auto to allow scrolling if needed */
}

aside .top {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}
aside .logo {
  display: flex;
  gap: 0.8rem;
}

aside .logo img {
  width: 2rem;
  height: 2rem;
}

aside .sidebar {
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
}

aside h3 {
  font-weight: 500;
}

aside .sidebar a {
  display: flex;
  color: var(--color-info-dark);
  padding: 1rem;
  align-items: center;
  position: relative;
  height: 3.7rem;
  transition: all 300ms ease;
  text-decoration: none;
}

aside .sidebar a span {
  font-size: 1.6rem;
  transition: all 300ms ease;
}

aside .sidebar a.active {
  background: var(--color-light);
  color: var(--color-primary);
}

aside .sidebar a.active::before {
  content: "";
  width: 6px;
  height: 100%;
  background: var(--color-primary);
  position: absolute;
  left: 0;
}

aside .sidebar a.active span {
  color: var(--color-primary);
  margin-left: 0.2rem;
}

aside .sidebar a:hover {
  color: var(--color-primary);
}

aside .sidebar a:hover span {
  margin-left: 0.5rem;
}

/* Hide scrollbar for Chrome, Safari and Opera */
aside::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
aside {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

aside .sidebar a:last-child {
  position: static;
  bottom: auto;
  width: auto;
}

/* Remove any styles that might be causing the violet line */
a:focus,
a:active {
  outline: none;
  border: none;
}

/* ... rest of your styles ... */

a,
a:focus,
a:active,
a:visited {
  text-decoration: none;
  color: inherit;
  outline: none;
  border: none;
  box-shadow: none;
}

/* ... rest of your styles ... */

.sidebar a,
.sidebar a:focus,
.sidebar a:active,
.sidebar a.router-link-active {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  padding: 1rem;
  transition: all 300ms ease;
  border-left: 4px solid transparent !important;
  outline: none;
}

.sidebar a:hover,
.sidebar a.router-link-active {
  background-color: var(--color-light);
  color: var(--color-primary);
  font-weight: bold;
}

/* ... rest of your styles ... */

a {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  padding: 1rem;
  transition: all 300ms ease;
  border-left: 4px solid transparent; /* This creates space for the highlight without showing a line */
}

a:hover,
a.router-link-active {
  background-color: var(--color-light);
  color: var(--color-primary);
}

/* Remove the violet line for active links */
a.router-link-active {
  border-left-color: transparent !important;
}

/* If you want to keep some indication of the active link, you can use a different style */
a.router-link-active {
  font-weight: bold;
  /* You can add a subtle box shadow instead of the border if you want */
  /* box-shadow: inset 4px 0 0 var(--color-primary); */
}

/* Add these responsive styles to the existing <style> section */

@media (max-width: 768px) {
  aside {
    position: fixed;
    left: -100%;
    width: 70%;
    z-index: 1000;
    transition: left 0.3s ease;
    background: white;
  }

  aside.show-menu {
    left: 0;
  }

  .top {
    padding: 0.5rem;
  }

  .logo img {
    width: 1.5rem;
    height: 1.5rem;
  }

  .sidebar a {
    padding: 0.75rem;
    height: 3rem;
  }

  .sidebar a span {
    font-size: 1.2rem;
  }

  .sidebar h3 {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  aside {
    width: 85%;
  }

  .sidebar a {
    padding: 0.5rem;
    height: 2.5rem;
  }
}
</style>
