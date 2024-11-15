<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h2>Remove Packages</h2>
      <div class="package-list">
        <div v-if="packages.length === 0" class="no-packages">
          No packages available to remove
        </div>
        <div v-for="pkg in packages" :key="pkg.id" class="package-item">
          <label class="checkbox-container">
            <input 
              type="checkbox" 
              :value="pkg.id" 
              v-model="selectedPackages"
            >
            <span class="checkmark"></span>
          </label>
          <div class="package-info">
            <img 
              :src="pkg.image" 
              :alt="pkg.name" 
              @error="handleImageError"
            >
            <div class="package-details">
              <h3>{{ pkg.name }}</h3>
              <p>Price: ₱{{ pkg.price ? pkg.price.toLocaleString() : 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-actions">
        <p class="selection-info" v-if="selectedPackages.length > 0">
          {{ selectedPackages.length }} package(s) selected
        </p>
        <div class="buttons">
          <button class="btn-cancel" @click="$emit('close')">Cancel</button>
          <button 
            class="btn-delete" 
            @click="handleDelete" 
            :disabled="isDeleting || selectedPackages.length === 0"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Selected' }}
          </button>
        </div>
      </div>
    </div>
    <ConfirmationModal
      :show="showConfirmation"
      title="Delete Packages"
      :message="`Are you sure you want to delete ${selectedPackages.length} selected package(s)? This action cannot be undone.`"
      confirmText="Delete"
      @confirm="confirmDelete"
      @cancel="showConfirmation = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AlertNotification from './AlertNotification.vue';
import ConfirmationModal from './ConfirmationModal.vue';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
  isOpen: Boolean,
  packages: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'packageDeleted']);
const isDeleting = ref(false);
const selectedPackages = ref([]);
const alert = ref({
  show: false,
  message: '',
  type: 'success'
});
const showConfirmation = ref(false);
const { token } = useAuth();

const showAlert = (message, type = 'success') => {
  alert.value = {
    show: true,
    message,
    type
  };
  setTimeout(() => {
    closeAlert();
  }, 3000);
};

const closeAlert = () => {
  alert.value.show = false;
};

const handleDelete = () => {
  if (selectedPackages.value.length === 0) return;
  showConfirmation.value = true;
};

const confirmDelete = async () => {
  try {
    isDeleting.value = true;
    showConfirmation.value = false;
    
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      throw new Error('Authentication required');
    }

    console.log('Selected packages to delete:', selectedPackages.value);

    // Delete packages one by one to ensure proper error handling
    for (const id of selectedPackages.value) {
      const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': storedToken
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete package ${id}`);
      }
    }
    
    showAlert(`Successfully deleted ${selectedPackages.value.length} package(s)`, 'success');
    emit('packageDeleted');
    emit('close');
    selectedPackages.value = [];
  } catch (error) {
    console.error('Error deleting packages:', error);
    showAlert(error.message || 'Failed to delete packages. Please try again.', 'error');
  } finally {
    isDeleting.value = false;
  }
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/150';
};

const hasToken = computed(() => {
  return !!localStorage.getItem('token');
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.package-list {
  overflow-y: auto;
  margin: 1rem 0;
  max-height: 50vh;
}

.package-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  gap: 1rem;
}

.package-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.package-info img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.package-details {
  flex: 1;
}

.package-details h3 {
  margin: 0;
  font-size: 1rem;
}

.package-details p {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 0.9rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.buttons {
  display: flex;
  gap: 1rem;
}

.btn-cancel, .btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.selection-info {
  color: #666;
  margin: 0;
}

.no-packages {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* Checkbox styling */
input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style> 