<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h2>Update Package</h2>
      <form @submit.prevent="updatePackage">
        <div class="input-group">
          <label for="name">Package Name</label>
          <input
            id="name"
            v-model="name"
            placeholder="Enter package name"
            required
          />
        </div>
        <div class="input-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="description"
            placeholder="Enter package description"
            required
          ></textarea>
        </div>
        <div class="input-group">
          <label for="price">Price</label>
          <input
            id="price"
            v-model="price"
            placeholder="Enter price (e.g. 50,000)"
            @input="formatPrice"
            required
          />
        </div>
        <div class="input-group">
          <label for="category">Package Category</label>
          <select id="category" v-model="category" required>
            <option value="">Select Package Category</option>
            <option value="wedding">Wedding</option>
            <option value="christening">Christening</option>
            <option value="kiddieparty">Kiddie Party</option>
            <option value="debut">Debut</option>
          </select>
        </div>
        <div class="file-and-preview">
          <div
            class="file-drop-area"
            @dragover.prevent
            @dragleave.prevent
            @drop.prevent="onFileDrop"
          >
            <input
              type="file"
              @change="onFileSelected"
              accept="image/*"
              id="file-upload"
            />
            <label for="file-upload" class="file-label">
              <span class="file-icon">📁</span>
              <span class="file-text">Choose or drag image here</span>
            </label>
          </div>
          <div v-if="imagePreview" class="image-preview-container">
            <div class="image-preview">
              <img :src="imagePreview" alt="Selected image preview" />
            </div>
          </div>
        </div>
        <div class="button-group">
          <button type="submit" :disabled="isLoading">Update Package</button>
          <button type="button" @click="$emit('close')" :disabled="isLoading">
            Cancel
          </button>
        </div>
      </form>
      <LoadingAnimation
        v-if="isLoading || showSuccess"
        :showSuccess="showSuccess"
      />
      <AlertNotification
        :show="alert.show"
        :message="alert.message"
        :type="alert.type"
        @close="closeAlert"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted } from "vue";
import LoadingAnimation from "@/components/ui/LoadingAnimation.vue";
import AlertNotification from "@/components/modals/AlertNotification.vue";
import { useAuth } from "@/composables/useAuth";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  packageData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "updated"]);

const name = ref("");
const description = ref("");
const price = ref("");
const category = ref("");
const newImage = ref(null);
const imagePreview = ref(null);
const isLoading = ref(false);
const showSuccess = ref(false);
const { token, user, fetchUserInfo } = useAuth();

const alert = ref({
  show: false,
  message: "",
  type: "success",
});

const showAlert = (message, type = "success") => {
  alert.value = {
    show: true,
    message,
    type,
  };
  setTimeout(() => {
    closeAlert();
  }, 3000);
};

const closeAlert = () => {
  alert.value.show = false;
};

watch(
  () => props.packageData,
  (newData) => {
    if (newData) {
      name.value = newData.name || "";
      description.value = newData.description || "";
      price.value = newData.price ? newData.price.toLocaleString() : "";
      category.value = newData.category || "";
      imagePreview.value = newData.image_path
        ? `http://localhost:3000${newData.image_path}`
        : null;
    }
  },
  { immediate: true }
);

const onFileSelected = (event) => {
  handleFile(event.target.files[0]);
};

const onFileDrop = (event) => {
  handleFile(event.dataTransfer.files[0]);
};

const handleFile = (file) => {
  if (file && file.type.startsWith("image/")) {
    newImage.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please select an image file.");
  }
};

const formatPrice = (event) => {
  let value = event.target.value.replace(/\D/g, "");
  if (value.length > 3) {
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  price.value = value;
};

onMounted(async () => {
  console.log("Component mounted, fetching user info");
  await fetchUserInfo();
  if (user.value && user.value.role !== "admin") {
    console.error("User is not an admin");
    emit("close");
  }
});

const updatePackage = async () => {
  try {
    if (!token.value) {
      console.error("No token found");
      return;
    }

    // Check if the user is an admin before proceeding
    if (!user.value || user.value.role !== "admin") {
      console.error("User is not authorized to update packages");
      return;
    }

    isLoading.value = true;
    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("description", description.value);
    formData.append("price", price.value.replace(/,/g, ""));
    formData.append("category", category.value);
    if (newImage.value) {
      formData.append("image", newImage.value);
    } else {
      // If no new image is selected, send the current image path
      formData.append("currentImagePath", props.packageData.image_path || "");
    }

    const response = await fetch(
      `http://localhost:3000/api/products/${props.packageData.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: token.value,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Package updated successfully:", result);
    showSuccess.value = true;
    showAlert("Package updated successfully!", "success");
    setTimeout(() => {
      emit("updated");
      emit("close");
    }, 1500);
  } catch (error) {
    console.error("Failed to update package:", error);
    showAlert("Failed to update package. Please try again.", "error");
  } finally {
    isLoading.value = false;
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: bold;
  color: #555;
}

input,
textarea,
select {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.1s ease;
  flex: 1;
  margin: 0 0.5rem;
}

button:hover {
  transform: translateY(-2px);
}

button[type="submit"] {
  background-color: #4caf50;
  color: white;
}

button[type="submit"]:hover {
  background-color: #45a049;
}

button[type="button"] {
  background-color: #f44336;
  color: white;
}

button[type="button"]:hover {
  background-color: #d32f2f;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.file-drop-area {
  flex: 1;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.file-drop-area:hover {
  background-color: #f0f0f0;
}

.file-drop-area input[type="file"] {
  display: none;
}

.file-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #555;
  font-weight: bold;
  cursor: pointer;
}

.file-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.file-text {
  font-size: 0.9rem;
}

.image-preview-container {
  flex: 0 0 120px;
}

.image-preview {
  width: 120px;
  height: 120px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.file-and-preview {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}
</style>
