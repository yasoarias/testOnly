<template>
  <div class="profile-settings-modal" v-if="isOpen">
    <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
      <h2>Profile Settings</h2>
      <div class="settings-container">
        <!-- Profile Picture Section -->
        <div class="profile-picture-section">
          <div class="profile-picture-container">
            <img :src="profileImage" alt="Profile Picture" />
          </div>
          <input 
            type="file" 
            @change="handleImageUpload" 
            accept="image/*" 
            style="display: none" 
            ref="fileInput"
          />
          <button 
            type="button" 
            class="change-picture-btn" 
            @click="$refs.fileInput.click()"
          >
            Change Profile Picture
          </button>
        </div>

        <!-- Profile Information Form -->
        <form @submit.prevent="handleSubmit" class="profile-form">
          <div class="form-group">
            <label>Full Name:</label>
            <input type="text" v-model="formData.fullName" required />
          </div>
          
          <div class="form-group">
            <label>Email:</label>
            <input type="email" v-model="formData.email" required />
            <span class="verification-status">Unverified</span>
          </div>
          
          <div class="form-group">
            <label>Phone Number:</label>
            <input type="tel" v-model="formData.phoneNumber" required />
            <span class="verification-status">Unverified</span>
          </div>

          <!-- Password Form -->
          <div class="password-form">
            <h3>Change Password</h3>
            <div class="form-group">
              <label>Current Password:</label>
              <input 
                type="password" 
                v-model="passwordData.currentPassword"
                placeholder="Enter your current password"
              />
            </div>

            <div class="form-group">
              <label>New Password:</label>
              <input 
                type="password" 
                v-model="passwordData.newPassword"
                placeholder="Enter new password"
                minlength="8"
              />
            </div>

            <div class="form-group">
              <label>Confirm New Password:</label>
              <input 
                type="password" 
                v-model="passwordData.confirmPassword"
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="button-group">
            <button type="submit" class="save-btn">Save Changes</button>
            <button type="button" class="cancel-btn" @click="$emit('close')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  transition: background-color 0.3s, color 0.3s;
}

/* Dark Mode Styles */
.modal-content.dark-mode {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #404040;
}

.modal-content.dark-mode h2,
.modal-content.dark-mode h3 {
  color: #ffffff;
}

.modal-content.dark-mode .form-group label {
  color: #ffffff;
}

.modal-content.dark-mode input {
  background: #2d2d2d;
  border: 1px solid #404040;
  color: #ffffff;
}

.modal-content.dark-mode input::placeholder {
  color: #a0a0a0;
}

.modal-content.dark-mode .verification-status {
  color: #ff6b6b;
}

.modal-content.dark-mode .password-form {
  border-top: 1px solid #404040;
}

.modal-content.dark-mode .change-picture-btn {
  background-color: #2196F3;
  color: #ffffff;
}

.modal-content.dark-mode .save-btn {
  background-color: #4CAF50;
  color: #ffffff;
}

.modal-content.dark-mode .cancel-btn {
  background-color: #f44336;
  color: #ffffff;
}

/* Add styles for text elements to ensure visibility */
.modal-content.dark-mode p,
.modal-content.dark-mode span:not(.verification-status) {
  color: #ffffff;
}

/* Improve input contrast in dark mode */
.modal-content.dark-mode input:focus {
  border-color: #2196F3;
  outline: none;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
}

/* Improve button hover states in dark mode */
.modal-content.dark-mode .change-picture-btn:hover {
  background-color: #1976D2;
}

.modal-content.dark-mode .save-btn:hover {
  background-color: #45a049;
}

.modal-content.dark-mode .cancel-btn:hover {
  background-color: #d32f2f;
}

/* Add transition for smooth mode switching */
.modal-content {
  transition: background-color 0.3s, color 0.3s;
}

input {
  transition: background-color 0.3s, border-color 0.3s, color 0.3s;
}

/* Regular Styles */
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-picture-section {
  text-align: center;
}

.profile-picture-container {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
}

.profile-picture-container img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

.verification-status {
  position: absolute;
  right: 0;
  top: 0;
  color: #ff4444;
  font-size: 0.8rem;
}

.password-form {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #ddd;
}

.password-form h3 {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.save-btn, .cancel-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.save-btn {
  background-color: #4CAF50;
  color: white;
}

.save-btn:hover {
  background-color: #45a049;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

.cancel-btn:hover {
  background-color: #da190b;
}

.change-picture-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.3s;
}

.change-picture-btn:hover {
  background-color: #1976D2;
}

@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .save-btn, .cancel-btn {
    width: 100%;
  }
}
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'success']);
const { token } = useAuth();

const formData = ref({
  fullName: '',
  email: '',
  phoneNumber: ''
});

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const newProfileImage = ref(null);
const profileImage = ref('default-profile-image.jpg');

// Initialize form data with user info
onMounted(() => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  formData.value = {
    fullName: userData.fullName || '',
    email: userData.email || '',
    phoneNumber: userData.contactNo || ''
  };
  if (userData.profilePicture) {
    profileImage.value = userData.profilePicture.startsWith('http') 
      ? userData.profilePicture 
      : `http://localhost:3000${userData.profilePicture}`;
  }
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    newProfileImage.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  try {
    // Update profile
    await updateProfile();
    
    // Update password if any password field is filled
    if (passwordData.value.currentPassword || 
        passwordData.value.newPassword || 
        passwordData.value.confirmPassword) {
      if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      await updatePassword();
    }
    
    alert('Changes saved successfully');
    emit('close');
  } catch (error) {
    alert(error.message);
  }
};

const updateProfile = async () => {
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('fullName', formData.value.fullName);
    formDataToSend.append('email', formData.value.email);
    formDataToSend.append('contactNo', formData.value.phoneNumber);
    
    if (newProfileImage.value) {
      formDataToSend.append('profilePicture', newProfileImage.value);
    }

    const response = await fetch('http://localhost:3000/api/user/update', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: formDataToSend
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem('user', JSON.stringify(result.user));
      emit('success', 'Profile updated successfully');
      emit('close');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    alert(error.message || 'Failed to update profile');
  }
};

const updatePassword = async () => {
  const response = await fetch('http://localhost:3000/api/user/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token.value
    },
    body: JSON.stringify({
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }
};
</script> 