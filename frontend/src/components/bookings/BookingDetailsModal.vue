<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Booking Details</h2>
        <button class="close-icon" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="booking-info">
        <div class="info-grid">
          <div class="info-item">
            <label>Booking ID</label>
            <span>{{ booking.id }}</span>
          </div>
          
          <div class="info-item">
            <label>Package ID</label>
            <span>{{ booking.package_id || 'N/A' }}</span>
          </div>
          
          <div class="info-item">
            <label>Package Category</label>
            <span>{{ booking.package_name || 'N/A' }}</span>
          </div>
          
          <div class="info-item">
            <label>Package Type</label>
            <span>{{ booking.event_type || 'N/A' }}</span>
          </div>
          
          <div class="info-item">
            <label>Package Price</label>
            <span class="price">{{ formatPrice(booking.package_price) }}</span>
          </div>
          
          <div class="info-item">
            <label>Event Date</label>
            <span>{{ formatDate(booking.event_date) }}</span>
          </div>
          
          <div class="info-item">
            <label>Venue</label>
            <span>{{ booking.venue_name }}</span>
          </div>
          
          <div class="info-item">
            <label>Status</label>
            <span :class="['status', `status-${booking.status.toLowerCase()}`]">
              {{ booking.status }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps(["booking"]);
defineEmits(["close"]);

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatPrice = (price) => {
  if (!price || isNaN(price)) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    currencyDisplay: 'symbol'
  }).format(price).replace('PHP', '₱');
};
</script>

<style scoped>
.modal {
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
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-icon {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  transition: color 0.2s;
}

.close-icon:hover {
  color: #ff4757;
}

.booking-info {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.info-item span {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.price {
  color: #2ecc71 !important;
  font-size: 1.1rem !important;
}

.status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.875rem !important;
  text-transform: capitalize;
}

.status-pending {
  background-color: #ffeaa7;
  color: #d35400 !important;
}

.status-accepted {
  background-color: #55efc4;
  color: #00b894 !important;
}

.status-declined {
  background-color: #fab1a0;
  color: #d63031 !important;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 0.75rem 2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background-color: #2980b9;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .modal {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-header h2 {
    font-size: 1.25rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .modal-header,
  .booking-info,
  .modal-footer {
    padding: 1rem;
  }
}
</style>
