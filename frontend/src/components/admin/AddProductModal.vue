<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h2>Add New Package</h2>
      <form @submit.prevent="addProduct">
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
          <button type="submit" :disabled="isLoading">Add Package</button>
          <button type="button" @click="$emit('close')" :disabled="isLoading">
            Cancel
          </button>
        </div>
      </form>
      <LoadingAnimation
        v-if="isLoading || showSuccess"
        :showSuccess="showSuccess"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import LoadingAnimation from "@/components/ui/LoadingAnimation.vue";

const props = defineProps(["isOpen"]);
const emit = defineEmits(["close"]);

const name = ref("");
const description = ref("");
const price = ref("");
const category = ref("");
const selectedFile = ref(null);
const imagePreview = ref(null);
const isLoading = ref(false);
const showSuccess = ref(false);

const onFileSelected = (event) => {
  handleFile(event.target.files[0]);
};

const onFileDrop = (event) => {
  handleFile(event.dataTransfer.files[0]);
};

const handleFile = (file) => {
  if (file && file.type.startsWith("image/")) {
    selectedFile.value = file;
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

const addProduct = async () => {
  isLoading.value = true;
  showSuccess.value = false;
  const startTime = Date.now();
  const formData = new FormData();
  formData.append("name", name.value);
  formData.append("description", description.value);
  formData.append("price", price.value.replace(/,/g, ""));
  formData.append("category", category.value);
  formData.append("image", selectedFile.value);

  try {
    const response = await fetch("http://localhost:3000/api/products", {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Product added:", result);

      // Ensure loading animation shows for at least 4 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 4000 - elapsedTime);

      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      // Show success message for 2 seconds
      showSuccess.value = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));

      emit("close");
      // Reset form fields
      name.value = "";
      description.value = "";
      price.value = "";
      category.value = "";
      selectedFile.value = null;
      imagePreview.value = null;
    } else {
      console.error("Failed to add product");
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  } catch (error) {
    console.error("Error adding product:", error);
    await new Promise((resolve) => setTimeout(resolve, 4000));
  } finally {
    isLoading.value = false;
    showSuccess.value = false;
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

.file-input {
  position: relative;
  overflow: hidden;
  display: inline-block;
  width: 100%;
}

.file-input input[type="file"] {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-input label {
  display: inline-block;
  padding: 0.75rem 1rem;
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  text-align: center;
  transition: background-color 0.3s ease;
}

.file-input:hover label {
  background-color: #e0e0e0;
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

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
