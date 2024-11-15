<!-- src/components/PackageDetailsModal.vue -->
<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <button @click="$emit('close')" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
      <h2>Event Details</h2>
      <div v-if="packageData">
        <img :src="packageData.image || packageData.image_path" :alt="packageData.name" class="package-image">
        <h3>{{ packageData.name }}</h3>
        <p><strong>Event Type:</strong> {{ eventData.event_type }}</p>
        <p><strong>Event Date:</strong> {{ formatDate(eventData.event_date) }}</p>
        <p><strong>Client:</strong> {{ eventData.full_name }}</p>
        <p><strong>Package:</strong> {{ packageData.name }}</p>
        <p><strong>Expected Guests:</strong> {{ eventData.expected_guests }}</p>
        <p>
          <strong>Status:</strong>
          <span :class="getStatusClass(eventData.status)">
            {{ eventData.status }}
            <i v-if="eventData.status === 'Completed'" class="fas fa-check"></i>
          </span>
        </p>
        <p><strong>Category:</strong> {{ packageData.category }}</p>
        <p><strong>Price:</strong> ₱{{ packageData.price ? packageData.price.toLocaleString() : 'N/A' }}</p>
        <p><strong>Description:</strong> {{ packageData.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  packageData: Object,
  eventData: Object
});

const emit = defineEmits(['close']);

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'status-completed';
    case 'declined':
      return 'status-declined';
    default:
      return 'status-pending';
  }
};
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
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.package-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.status-completed,
.status-declined,
.status-pending {
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.status-completed {
  background-color: #4CAF50;
  color: white;
}

.status-completed i {
  margin-left: 4px;
  font-size: 0.8em;
}

.status-declined {
  background-color: #ff7782;
  color: white;
}

.status-pending {
  background-color: #7380ec;
  color: white;
}
</style>
