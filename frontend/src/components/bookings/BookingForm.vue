<template>
  <div v-if="isOpen" class="modal booking-modal">
    <div class="modal-content booking-content">
      <button @click="handleClose" class="close-button">×</button>
      <div class="form-header">
        <h3>Book Your {{ eventType }} Package</h3>
        <div class="step-indicator">
          <div
            v-for="step in 3"
            :key="step"
            :class="[
              'step',
              { active: bookingStep >= step, completed: bookingStep > step },
            ]"
          >
            {{ step }}
          </div>
        </div>
      </div>

      <Alert
        :show="alert.show"
        :message="alert.message"
        :type="alert.type"
        @close="alert.show = false"
      />

      <form @submit.prevent="handleSubmit" class="booking-form">
        <transition name="fade" mode="out-in">
          <div class="form-steps-container">
            <!-- Step 1: Basic Information -->
            <div v-if="bookingStep === 1" class="form-step">
              <h4>Basic Information</h4>
              <div class="input-group">
                <label for="fullName">Full Name</label>
                <input
                  id="fullName"
                  v-model="formData.fullName"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div class="input-group">
                <label for="eventDate">Event Date</label>
                <input
                  id="eventDate"
                  v-model="formData.eventDate"
                  type="date"
                  required
                />
              </div>
              <div class="input-group">
                <label for="preferredTime">Preferred Time*</label>
                <div class="time-selection">
                  <select
                    id="preferredTime"
                    v-model="formData.preferredTime"
                    class="form-control"
                    @change="handleTimeSelection"
                    required
                  >
                    <option value="">Select your preferred time</option>
                    <option value="8:00 AM">8:00 AM</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                    <option value="custom">Custom Time</option>
                  </select>

                  <!-- Custom time input that appears when "Custom Time" is selected -->
                  <div v-if="showCustomTime" class="custom-time-input">
                    <input
                      type="time"
                      v-model="customTime"
                      class="form-control"
                      @input="updatePreferredTime"
                      required
                    />
                  </div>
                </div>
              </div>
              <div class="input-group">
                <label for="contactNumber">Contact Number</label>
                <input
                  id="contactNumber"
                  v-model="formData.contactNumber"
                  placeholder="Enter your contact number"
                  required
                />
              </div>
              <div class="input-group">
                <label for="email">Email Address</label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <!-- Step 2: Venue Details -->
            <div v-else-if="bookingStep === 2" class="form-step">
              <h4>Venue Details</h4>
              <div class="input-group">
                <label for="venueName">Venue Name</label>
                <input
                  id="venueName"
                  v-model="formData.venueName"
                  placeholder="Enter venue name"
                  required
                />
              </div>
              <div class="input-group">
                <label for="venueAddress">Venue Address</label>
                <input
                  id="venueAddress"
                  v-model="formData.venueAddress"
                  placeholder="Enter venue address"
                  required
                />
              </div>
              <div class="input-group">
                <label for="expectedGuests">Expected Number of Guests</label>
                <input
                  id="expectedGuests"
                  v-model="formData.expectedGuests"
                  type="number"
                  min="1"
                  placeholder="Enter number of guests"
                  required
                />
              </div>
            </div>

            <!-- Step 3: Additional Information -->
            <div v-else-if="bookingStep === 3" class="form-step">
              <h4>Additional Information</h4>
              <div class="input-group">
                <label for="specialRequests">Special Requests</label>
                <textarea
                  id="specialRequests"
                  v-model="formData.specialRequests"
                  placeholder="Enter any special requests or additional information"
                  rows="4"
                ></textarea>
              </div>
              <div class="input-group">
                <label for="referralSource">How did you hear about us?</label>
                <input
                  id="referralSource"
                  v-model="formData.referralSource"
                  placeholder="Enter referral source"
                />
              </div>
            </div>
          </div>
        </transition>

        <!-- Navigation buttons -->
        <div class="form-navigation">
          <button
            v-if="bookingStep > 1"
            @click="previousStep"
            type="button"
            class="btn-secondary"
          >
            ← Previous
          </button>
          <button
            v-if="bookingStep < 3"
            @click="nextStep"
            type="button"
            class="btn-primary"
          >
            Next →
          </button>
          <button v-if="bookingStep === 3" type="submit" class="btn-submit">
            Submit Booking
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import Alert from "@/components/ui/Alert.vue";

const props = defineProps({
  isOpen: Boolean,
  eventType: String,
  selectedProduct: Object,
  initialData: {
    type: Object,
    default: () => ({
      fullName: "",
      contactNumber: "",
      email: "",
    }),
  },
});

const emit = defineEmits(["close", "submit", "error"]);
const { token } = useAuth();

const bookingStep = ref(1);
const formData = ref({
  fullName: props.initialData.fullName,
  contactNumber: props.initialData.contactNumber,
  email: props.initialData.email,
  eventDate: "",
  preferredTime: "",
  venueName: "",
  venueAddress: "",
  expectedGuests: "",
  specialRequests: "",
  referralSource: "",
});

watch(
  () => props.initialData,
  (newData) => {
    formData.value = {
      ...formData.value,
      fullName: newData.fullName,
      contactNumber: newData.contactNumber,
      email: newData.email,
    };
  },
  { deep: true }
);

onMounted(() => {
  if (props.userData) {
    formData.value = {
      ...formData.value,
      fullName: props.userData.fullName || "",
      contactNumber: props.userData.contactNo || "",
      email: props.userData.email || "",
    };
  }
});

const handleClose = () => {
  bookingStep.value = 1;
  emit("close");
};

const nextStep = () => {
  if (validateStep() && bookingStep.value < 3) {
    bookingStep.value++;
  }
};

const previousStep = () => {
  if (bookingStep.value > 1) bookingStep.value--;
};

const alert = ref({
  show: false,
  message: "",
  type: "info",
});

const handleSubmit = async () => {
  try {
    if (!token.value) {
      showAlert("No authentication token found. Please log in.", "error");
      return;
    }

    if (!formData.value.eventDate) {
      showAlert("Please select an event date", "error");
      return;
    }

    const bookingData = {
      ...formData.value,
      packageId: props.selectedProduct?.id,
      eventType: props.eventType,
    };

    const response = await fetch("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.value,
      },
      body: JSON.stringify(bookingData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (responseData.message.includes("date already booked")) {
        showAlert(
          "This date is already booked. Please select another date.",
          "error"
        );
      } else {
        showAlert(responseData.message || "Failed to submit booking", "error");
      }
      return;
    }

    showAlert("Booking submitted successfully!", "success");
    setTimeout(() => {
      emit("submit", responseData);
      handleClose();
    }, 1500);
  } catch (error) {
    console.error("Error submitting booking:", error);
    emit("error", error);
    showAlert(
      error.message || "An error occurred while submitting your booking",
      "error"
    );
  }
};

const showAlert = (message, type = "info") => {
  alert.value = {
    show: true,
    message,
    type,
  };
  setTimeout(() => {
    alert.value.show = false;
  }, 5000);
};

const validateStep = () => {
  if (bookingStep.value === 1) {
    if (!formData.value.fullName?.trim()) {
      showAlert("Please enter your full name", "error");
      return false;
    }
    if (!formData.value.eventDate) {
      showAlert("Please select an event date", "error");
      return false;
    }
    if (
      !formData.value.preferredTime ||
      (showCustomTime.value && !customTime.value)
    ) {
      showAlert("Please select or enter your preferred time", "error");
      return false;
    }
    if (!formData.value.contactNumber?.trim()) {
      showAlert("Please enter your contact number", "error");
      return false;
    }
    if (!formData.value.email?.trim()) {
      showAlert("Please enter your email address", "error");
      return false;
    }
  } else if (bookingStep.value === 2) {
    if (!formData.value.venueName?.trim()) {
      showAlert("Please enter the venue name", "error");
      return false;
    }
    if (!formData.value.venueAddress?.trim()) {
      showAlert("Please enter the venue address", "error");
      return false;
    }
    if (!formData.value.expectedGuests) {
      showAlert("Please enter the expected number of guests", "error");
      return false;
    }
  }
  return true;
};

const showCustomTime = ref(false);
const customTime = ref("");

const handleTimeSelection = () => {
  if (formData.value.preferredTime === "custom") {
    showCustomTime.value = true;
    formData.value.preferredTime = customTime.value;
  } else {
    showCustomTime.value = false;
  }
};

const updatePreferredTime = () => {
  // Convert 24h format to 12h format for consistency
  if (customTime.value) {
    const [hours, minutes] = customTime.value.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    formData.value.preferredTime = `${hour12}:${minutes} ${ampm}`;
  }
};
</script>

<style scoped>
.booking-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.booking-content {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 16px;
  width: 70%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-height: 85vh;
  overflow-y: auto;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h3 {
  font-size: 1.75rem;
  color: var(--heading-color);
  margin-bottom: 1.5rem;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.step {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #e9ecef;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6c757d;
  position: relative;
}

.step.active {
  background: #ff6347;
  border-color: #ff6347;
}

.step.completed {
  background: #28a745;
  border-color: #28a745;
}

.step:not(:last-child)::after {
  content: "";
  position: absolute;
  right: -2rem;
  top: 50%;
  width: 2rem;
  height: 2px;
  background: #e9ecef;
}

.form-step {
  margin-bottom: 2rem;
  background-color: inherit;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #eaeaea;
}

:root.dark-mode .form-step {
  border-color: #333;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

input,
textarea {
  width: 100%;
  padding: 0.75rem 0.25rem;
  border: 1px solid #dde0e3;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #ffffff;
  color: #2c3e50;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #ff6347;
  box-shadow: 0 0 0 3px rgba(255, 99, 71, 0.1);
}

.form-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary,
.btn-submit {
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: #ff6347;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: #e9ecef;
  color: #2c3e50;
}

.btn-submit {
  background: #28a745;
  color: white;
  width: 100%;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.75rem;
  color: #6c757d;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #ff6347;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 640px) {
  .booking-content {
    padding: 1.5rem;
    width: 95%;
  }

  .form-header h3 {
    font-size: 1.5rem;
  }

  .step-indicator {
    gap: 1.5rem;
  }

  .step {
    width: 30px;
    height: 30px;
  }
}

.form-steps-container {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .booking-content {
    width: 85%;
    padding: 1.5rem;
    margin: 1rem;
    max-height: 90vh;
    overflow-y: auto;
  }

  .form-header h3 {
    font-size: 1.25rem;
  }

  .step-indicator {
    gap: 1rem;
  }

  .step {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }

  .step:not(:last-child)::after {
    right: -1rem;
    width: 1rem;
  }

  .input-group {
    margin-bottom: 1rem;
  }

  input,
  textarea {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .form-navigation {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-primary,
  .btn-secondary,
  .btn-submit {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .booking-content {
    width: 90%;
    padding: 1rem;
  }

  .form-header h3 {
    font-size: 1.1rem;
  }

  .step {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }
}

select.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #dde0e3;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

select.form-control:focus {
  outline: none;
  border-color: #ff6347;
  box-shadow: 0 0 0 3px rgba(255, 99, 71, 0.1);
}

select.form-control:required:invalid {
  color: #6c757d;
}

option {
  color: #2c3e50;
}

option:first-child {
  color: #6c757d;
}

.time-selection {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.custom-time-input {
  flex: 1;
  animation: fadeIn 0.3s ease;
}

input[type="time"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #dde0e3;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  color: #2c3e50;
}

input[type="time"]:focus {
  outline: none;
  border-color: #ff6347;
  box-shadow: 0 0 0 3px rgba(255, 99, 71, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Adjust the select width when custom time is shown */
.time-selection select {
  flex: 1;
}

@media (max-width: 768px) {
  .time-selection {
    flex-direction: column;
    gap: 0.5rem;
  }

  .custom-time-input {
    width: 100%;
  }
}

:root.dark-mode {
  .booking-content {
    background-color: #1a1a1a;
    border: 1px solid #333;
  }

  input,
  textarea,
  select.form-control {
    background-color: #2d2d2d;
    border-color: #404040;
    color: #ffffff;
  }

  .step {
    background: #2d2d2d;
    border-color: #404040;
    color: #ffffff;
  }

  .btn-secondary {
    background: #404040;
    color: #ffffff;
  }

  .close-button {
    color: #ffffff;
  }

  /* Improve contrast for labels and text */
  .input-group label {
    color: #ffffff;
  }

  .form-header h3 {
    color: #ffffff;
  }
}

/* Add a subtle border to the form sections */
.form-step {
  background-color: inherit;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #eaeaea;
}

:root.dark-mode .form-step {
  border-color: #333;
}

/* Improve button styles */
.btn-primary,
.btn-secondary,
.btn-submit {
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-primary:hover,
.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Add scrollbar styling */
.booking-content::-webkit-scrollbar {
  width: 8px;
}

.booking-content::-webkit-scrollbar-track {
  background: transparent;
}

.booking-content::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 4px;
}

:root.dark-mode .booking-content::-webkit-scrollbar-thumb {
  background-color: #404040;
}
</style>
