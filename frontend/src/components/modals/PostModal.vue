<template>
  <div class="modal-backdrop" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h2>Create a New Post</h2>
      <textarea 
        v-model="postContent" 
        placeholder="What's on your mind?"
        rows="4"
      ></textarea>
      <div class="image-preview-container">
        <div v-for="(image, index) in imagePreviews" :key="index" class="image-preview">
          <img :src="image" alt="Preview" />
          <button @click="removeImage(index)" class="remove-image">×</button>
        </div>
      </div>
      <div class="modal-actions">
        <label for="image-upload" class="upload-label">
          <span class="material-icons-sharp">add_photo_alternate</span>
          Add Image
        </label>
        <input 
          type="file" 
          id="image-upload" 
          @change="handleImageUpload" 
          accept="image/*" 
          multiple 
          style="display: none;"
        >
        <button @click="submitPost" :disabled="!isPostValid" class="submit-btn">Post</button>
      </div>
      <button @click="closeModal" class="close-btn">&times;</button>
    </div>
    <AlertNotification
      :show="alert.show"
      :message="alert.message"
      :type="alert.type"
      @close="closeAlert"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import AlertNotification from './AlertNotification.vue';

const { token } = useAuth();

const emit = defineEmits(['close', 'post-created']);

const postContent = ref('');
const imageFiles = ref([]);
const imagePreviews = ref([]);

const isPostValid = computed(() => {
  return postContent.value.trim().length > 0 || imageFiles.value.length > 0;
});

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);
  imageFiles.value.push(...files);
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviews.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => {
  imageFiles.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

const submitPost = async () => {
  const formData = new FormData();
  formData.append('content', postContent.value);
  imageFiles.value.forEach((file, index) => {
    formData.append(`images`, file);
  });

  try {
    const response = await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': token.value
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Post created successfully:', result);
      
      showAlert('Post created successfully!', 'success');
      
      postContent.value = '';
      imageFiles.value = [];
      imagePreviews.value = [];
      
      setTimeout(() => {
        emit('post-created');
        closeModal();
      }, 1500);
    } else {
      const errorData = await response.json();
      console.error('Failed to create post:', errorData.message);
      showAlert('Failed to create post. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Error creating post:', error);
    showAlert('Failed to create post. Please try again.', 'error');
  }
};

const closeModal = () => {
  emit('close');
};

const alert = ref({
  show: false,
  message: '',
  type: 'success'
});

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
</script>

<style scoped>
.modal-backdrop {
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
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  position: relative;
  z-index: 1050;
}

h2 {
  margin-bottom: 1rem;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 1rem;
}

.image-preview {
  position: relative;
  width: 100px;
  height: 100px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #1a73e8;
}

.upload-label .material-icons-sharp {
  margin-right: 5px;
}

.submit-btn {
  background-color: #1a73e8;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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

:deep(.alert) {
  z-index: 1100 !important;
}
</style>
