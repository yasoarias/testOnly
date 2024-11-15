<template>
  <div>
    <div class="login-modal" v-if="isOpen">
      <div class="login-content">
        <button class="close-button" @click="$emit('close')">&times;</button>
        <h2 class="login-title">Sign in to Razz Rel Events</h2>
        <form @submit.prevent="startLogin">
          <div class="form-group">
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Email"
              required
            />
          </div>
          <div class="form-group">
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="Password"
              required
            />
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="form-actions">
            <button type="submit">Login</button>
          </div>
        </form>
        <div class="register-option">
          Do not have an account?
          <a href="#" @click.prevent="$emit('switchToRegister')">Sign Up</a>
        </div>
      </div>
    </div>

    <!-- Loading Animation -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-animation">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="loading-text">Loading...</div>
      </div>
    </div>

    <!-- Human Check Modal -->
    <HumanCheckModal
      v-if="showHumanCheck"
      :show="showHumanCheck"
      @verified="handleHumanVerified"
    />

    <!-- Human Verification Modal -->
    <HumanVerification
      v-if="showVerification"
      :show="showVerification"
      @success="handleVerificationSuccess"
      @close="showVerification = false"
    />

    <!-- Alert Modal -->
    <AlertModal
      v-if="showAlert"
      show="true"
      type="error"
      title="Login Error"
      :message="alertMessage"
      confirmText="OK"
      @confirm="showAlert = false"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import HumanVerification from "@/components/security/HumanVerification.vue";
import HumanCheckModal from "@/components/modals/HumanCheckModal.vue";
import AlertModal from "@/components/modals/AlertModal.vue";

const router = useRouter();
const props = defineProps(["isOpen"]);
const emit = defineEmits(["close", "login", "switchToRegister"]);

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const showHumanCheck = ref(false);
const showVerification = ref(false);
const showAlert = ref(false);
const alertMessage = ref("");

const startLogin = (e) => {
  e.preventDefault();
  showHumanCheck.value = true;
};

const handleHumanVerified = () => {
  showHumanCheck.value = false;
  showVerification.value = true;
};

const handleVerificationSuccess = async () => {
  showVerification.value = false;
  try {
    isLoading.value = true;
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.auth) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.user.role);

      setTimeout(async () => {
        isLoading.value = false;
        emit("close");
        await router.push("/gallery");
        emit("loginComplete", data.token);
      }, 2000);
    } else {
      errorMessage.value = data.message || "Login failed";
      isLoading.value = false;
    }
  } catch (error) {
    console.error("Error during login:", error);
    errorMessage.value = "Server error. Please try again later.";
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.login-content {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  text-align: center;
  position: relative;
}

.login-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.form-actions {
  margin-top: 1rem;
}

button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

button[type="submit"]:hover {
  background: #333;
}

.register-option {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.register-option a {
  color: #000;
  text-decoration: none;
  font-weight: bold;
}

.register-option a:hover {
  text-decoration: underline;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
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

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-animation {
  position: relative;
  width: 200px;
  height: 200px;
}

.circle {
  position: absolute;
  border: 4px solid transparent;
  border-radius: 50%;
  animation: rotate 3s linear infinite;
}

.circle-1 {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-top-color: #ff00ff;
}

.circle-2 {
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  border-top-color: #00ffff;
  animation-delay: -1s;
}

.circle-3 {
  top: 40px;
  left: 40px;
  right: 40px;
  bottom: 40px;
  border-top-color: #00ff00;
  animation-delay: -2s;
}

.loading-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.error-message {
  color: #ff0000;
  margin-top: 1rem;
  font-size: 0.9rem;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
