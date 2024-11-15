<!-- src/components/PackageDetailsModal.vue -->
<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h2>Package Details</h2>
      <div v-if="packageData">
        <img :src="packageData.image" :alt="packageData.name" class="package-image">
        <h3>{{ packageData.name }}</h3>
        <p><strong>Category:</strong> {{ packageData.category }}</p>
        <p><strong>Price:</strong> ₱{{ packageData.price ? packageData.price.toLocaleString() : 'N/A' }}</p>
        <p><strong>Status:</strong> {{ packageData.status || 'N/A' }}</p>
        <p><strong>Description:</strong> {{ packageData.description }}</p>
      </div>
      <button @click="$emit('close')" class="close-btn">Close</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  packageData: Object,
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
}

.package-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.close-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.close-btn:hover {
  background-color: #0056b3;
}
</style>

