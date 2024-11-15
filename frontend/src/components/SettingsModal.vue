<!-- frontend/src/components/SettingsModal.vue -->
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2 class="modal-title">Profile Settings</h2>
      <div class="profile-picture-section">
        <div class="profile-picture-container">
          <img :src="currentProfileImage" alt="Profile Picture" class="profile-picture" @error="handleImageError" />
        </div>
        <input type="file" @change="handleImageUpload" accept="image/*" ref="fileInput" style="display: none;" />
        <button @click="$refs.fileInput.click()" class="change-picture-btn">Change Profile Picture</button>
      </div>
      <form @submit.prevent="saveSettings">
        <div class="form-group">
          <label for="fullName">Full Name:</label>
          <input type="text" id="fullName" v-model="formData.fullName" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <div class="email-input-container">
            <input type="email" id="email" v-model="formData.email" required />
            <span class="unverified"><i class="fas fa-times-circle"></i> Unverified</span>
          </div>
        </div>
        <div class="form-group">
          <label for="contactNo">Phone Number:</label>
          <div class="phone-input-container">
            <input type="tel" id="contactNo" v-model="formData.contactNo" required />
            <span class="unverified"><i class="fas fa-times-circle"></i> Unverified</span>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="save-btn">Save Changes</button>
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  </div>
  <div v-if="successMessage" class="notification-modal-overlay">
    <div class="notification-modal">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="notification-content">
        <h3>Success!</h3>
        <p>{{ successMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import defaultProfilePicture from '@/assets/default-profile.png';

const props = defineProps(['user', 'token']);
const emit = defineEmits(['close', 'update-user']);

const formData = ref({
  fullName: '',
  email: '',
  contactNo: '',
});

const previewImage = ref(null);
const fileInput = ref(null);
const successMessage = ref('');

onMounted(() => {
  formData.value = {
    fullName: props.user.fullName,
    email: props.user.email,
    contactNo: props.user.contactNo || '',
  };
});

const currentProfileImage = computed(() => {
  console.log('Preview image:', previewImage.value);
  console.log('User profile picture:', props.user.profilePicture);
  console.log('Default profile picture:', defaultProfilePicture);

  if (previewImage.value) {
    return previewImage.value;
  } else if (props.user.profilePicture) {
    return props.user.profilePicture.startsWith('http')
      ? props.user.profilePicture
      : `http://localhost:3000${props.user.profilePicture}`;
  }
  return defaultProfilePicture;
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const saveSettings = async () => {
  const formDataToSend = new FormData();
  formDataToSend.append('fullName', formData.value.fullName);
  formDataToSend.append('email', formData.value.email);
  formDataToSend.append('contactNo', formData.value.contactNo);

  if (fileInput.value && fileInput.value.files[0]) {
    formDataToSend.append('profilePicture', fileInput.value.files[0]);
  }

  try {
    if (!props.token) {
      console.error('No token found');
      return;
    }

    const response = await fetch('http://localhost:3000/api/user/update', {
      method: 'POST',
      headers: {
        'Authorization': props.token,
      },
      body: formDataToSend,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        emit('update-user', data.user);
        successMessage.value = 'Profile updated successfully!';
        setTimeout(() => {
          successMessage.value = '';
          emit('close');
        }, 2500);
      } else {
        console.error('Failed to update user information:', data.message);
      }
    } else {
      const errorData = await response.json();
      console.error('Failed to update user information:', errorData.message);
    }
  } catch (error) {
    console.error('Error updating user information:', error);
  }
};

const handleImageError = (e) => {
  console.error('Error loading image:', e);
  e.target.src = defaultProfilePicture;
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
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.profile-picture-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.profile-picture-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.change-picture-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.change-picture-btn:hover {
  background-color: #3a7bc8;
}

.form-group {
  margin-bottom: 1.5rem;
  margin-right: 20px; /* Add margin to the right */
  position: relative;
  width: 100%; /* Ensure it takes full width */
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: bold;
}

input[type="text"],
input[type="email"],
input[type="tel"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.unverified {
  position: absolute;
  right: 10px; /* Adjust as needed */
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem; /* Smaller font size */
  color: #e74c3c;
  cursor: pointer; /* Change cursor to pointer */

}

.unverified:hover {
  text-decoration: underline; /* Underline on hover */
}

.phone-input-container,
.email-input-container {
  position: relative;
  width: 100%; /* Ensure it takes full width */
}

.phone-input-container input,
.email-input-container input,
.form-group input {
  padding-right: 100px; /* Add padding to the right for the label */
  width: 100%; /* Ensure the input takes full width */
  box-sizing: border-box; /* Include padding in width calculation */
}

.unverified i {
  margin-right: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.save-btn,
.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.save-btn {
  background-color: #2ecc71;
  color: white;
}

.save-btn:hover {
  background-color: #27ae60;
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
  margin-left: 10px; /* Add margin to separate buttons */
}

.cancel-btn:hover {
  background-color: #c0392b;
}

.email-input-container {
  position: relative;
  width: 100%; /* Ensure it takes full width */
}

.email-input-container input {
  padding-right: 100px; /* Add padding to the right for the label */
  width: 100%; /* Ensure the input takes full width */
  box-sizing: border-box; /* Include padding in width calculation */
}

.notification-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
  animation: fadeIn 0.3s ease-in-out;
}

.notification-modal {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 400px;
  width: 90%;
  animation: slideIn 0.3s ease-out;
}

.success-icon {
  font-size: 48px;
  color: #2ecc71;
  margin-bottom: 20px;
}

.notification-content {
  text-align: center;
}

.notification-content h3 {
  color: #2ecc71;
  margin: 0 0 10px 0;
  font-size: 24px;
}

.notification-content p {
  color: #666;
  margin: 0;
  font-size: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
</style>
