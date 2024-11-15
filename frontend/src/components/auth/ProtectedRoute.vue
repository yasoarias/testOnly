<template>
  <div>
    <router-view v-if="isAuthorized" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const isAuthorized = ref(false);
const router = useRouter();

onMounted(() => {
  const userRole = localStorage.getItem("userRole"); // Assuming user role is stored in localStorage

  if (userRole === "admin") {
    isAuthorized.value = true;
  } else {
    router.push("/"); // Redirect to homepage if not authorized
  }
});
</script>
