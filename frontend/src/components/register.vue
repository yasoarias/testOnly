<template>
  <div class="register-modal" v-if="isOpen">
    <div class="register-content">
      <button class="close-button" @click="$emit('close')">&times;</button>
      <h2 class="register-title">Sign up to Razz Rel Events</h2>
      <form @submit.prevent="startRegistration">
        <div class="form-group">
          <input
            type="text"
            id="fullName"
            v-model="fullName"
            placeholder="Full Name"
            required
          />
        </div>
        <div class="form-group">
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Email"
            required
          />
        </div>
        <div class="form-group password-input">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="password"
            placeholder="Password"
            required
          />
          <button type="button" class="toggle-password" @click="togglePassword">
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>
        <div class="form-group password-input">
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirm Password"
            required
          />
          <button
            type="button"
            class="toggle-password"
            @click="toggleConfirmPassword"
          >
            <i
              :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
            ></i>
          </button>
        </div>
        <div class="form-group">
          <input
            type="tel"
            id="contactNo"
            v-model="contactNo"
            placeholder="Contact No"
            required
          />
        </div>
        <div class="form-group">
          <input
            type="checkbox"
            id="terms"
            v-model="termsAccepted"
            @click="showTermsModal = true"
            required
          />
          <label for="terms" class="terms"
            >I agree to the Terms and Conditions</label
          >
        </div>
        <div class="form-actions">
          <button type="submit">Sign up</button>
        </div>
      </form>
      <div class="login-option">
        Already have an account?
        <a href="#" @click.prevent="$emit('switchToLogin')">Sign In</a>
      </div>
    </div>
  </div>

  <!-- Success Notification -->
  <div v-if="showSuccessNotification" class="success-notification">
    <div class="success-content">
      <i class="fas fa-check-circle"></i>
      <p>Registration Successful!</p>
    </div>
  </div>

  <!-- Terms and Conditions Modal -->
  <div v-if="showTermsModal" class="modal">
    <div class="modal-content">
      <button class="close-button" @click="closeTermsModal">&times;</button>
      <h2 class="terms-title">Terms and Conditions</h2>
      <div class="terms-content">
        <h3>Acceptance of Terms</h3>
        <p>
          By using Razz Rel Events, you agree to these Terms and Conditions.
        </p>

        <h3>Use of Service</h3>
        <p>
          You agree to use our service for lawful purposes only and in a way
          that does not infringe on others' rights.
        </p>

        <h3>User Account</h3>
        <p>
          You are responsible for maintaining the confidentiality of your
          account and password.
        </p>

        <h3>Privacy Policy</h3>
        <p>
          Your use of Razz Rel Events is also governed by our Privacy Policy.
        </p>

        <h3>Limitation of Liability</h3>
        <p>
          Razz Rel Events is not liable for any indirect, incidental, special,
          consequential or punitive damages.
        </p>

        <h3>Changes to Terms</h3>
        <p>
          We reserve the right to modify these terms at any time. Please review
          them periodically.
        </p>
      </div>
      <div class="modal-actions">
        <button @click="acceptTerms">Accept</button>
        <button @click="declineTerms">Decline</button>
      </div>
    </div>
  </div>

  <!-- Add Human Verification Modal -->
  <HumanVerification
    v-if="showVerification"
    :show="showVerification"
    @success="handleVerificationSuccess"
    @close="showVerification = false"
  />

  <!-- Human Check Modal -->
  <HumanCheckModal
    v-if="showHumanCheck"
    :show="showHumanCheck"
    @verified="handleHumanVerified"
  />

  <!-- Alert Modal -->
  <AlertModal
    v-if="showAlert"
    show="true"
    type="error"
    title="Registration Error"
    :message="alertMessage"
    confirmText="OK"
    @confirm="showAlert = false"
  />
</template>

<script setup>
import { ref } from "vue";
import HumanVerification from "./security/HumanVerification.vue";
import HumanCheckModal from "./modals/HumanCheckModal.vue";
import AlertModal from "./modals/AlertModal.vue";

const props = defineProps(["isOpen"]);
const emit = defineEmits(["close", "register", "switchToLogin"]);

const fullName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const contactNo = ref("");
const termsAccepted = ref(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const showTermsModal = ref(false);

const acceptTerms = () => {
  termsAccepted.value = true;
  showTermsModal.value = false;
};

const declineTerms = () => {
  termsAccepted.value = false;
  showTermsModal.value = false;
};

const closeTermsModal = () => {
  showTermsModal.value = false;
};

const showSuccessNotification = ref(false);

const showVerification = ref(false);
const showHumanCheck = ref(false);

const showAlert = ref(false);
const alertMessage = ref("");

const startRegistration = async (e) => {
  e.preventDefault();
  if (password.value !== confirmPassword.value) {
    showAlert.value = true;
    alertMessage.value = "Passwords do not match!";
    return;
  }

  // Verify email before proceeding
  const { verifyEmail } = await import('./security/EmailVerification.js');
  const emailVerification = await verifyEmail(email.value);

  if (!emailVerification.isValid) {
    showAlert.value = true;
    alertMessage.value = emailVerification.message;
    return;
  }

  showHumanCheck.value = true;
};

const handleHumanVerified = () => {
  showHumanCheck.value = false;
  showVerification.value = true;
};

const handleVerificationSuccess = async () => {
  showVerification.value = false;
  try {
    const userData = {
      fullName: fullName.value,
      email: email.value,
      password: password.value,
      contactNo: contactNo.value,
      termsAccepted: termsAccepted.value,
    };

    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (result.success) {
      showSuccessNotification.value = true;
      setTimeout(() => {
        showSuccessNotification.value = false;
        emit("close");
      }, 3000);

      // Clear form fields
      fullName.value = "";
      email.value = "";
      password.value = "";
      confirmPassword.value = "";
      contactNo.value = "";
      termsAccepted.value = false;

      emit("userRegistered");
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred while registering the user");
  }
};
</script>

<style scoped>
.register-modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.register-content {
  position: relative;
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.register-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group input[type="tel"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-group input[type="checkbox"] {
  margin-right: 0.5rem;
}

.form-actions {
  margin-top: 1rem;
}

.form-actions button {
  width: 100%;
  padding: 0.75rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.form-actions button:hover {
  background: #333;
}

.login-option {
  margin-top: 1rem;
}

.login-option a {
  color: #000;
  text-decoration: none;
  font-weight: bold;
}

.login-option a:hover {
  text-decoration: underline;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 30%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
}

.toggle-password i {
  color: #888;
}

.modal {
  position: fixed;
  z-index: 1100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  position: relative;
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 10px;
}

.terms-content {
  text-align: left;
  margin-bottom: 20px;
}

.terms-content h3 {
  margin-top: 15px;
  margin-bottom: 5px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: #4caf50;
  color: white;
}

.modal-actions button:last-child {
  background-color: #f44336;
  color: white;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #aaa;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-button:hover,
.close-button:focus {
  color: #000;
  text-decoration: none;
  cursor: pointer;
}

.success-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1100;
  animation: slideIn 0.5s ease-out, fadeOut 0.5s ease-in 2.5s;
}

.success-content {
  display: flex;
  align-items: center;
}

.success-content i {
  font-size: 24px;
  margin-right: 10px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
