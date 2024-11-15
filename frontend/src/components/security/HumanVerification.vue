<template>
  <div class="verification-modal" v-if="show">
    <div class="verification-content">
      <h3>Human Verification</h3>
      <p>Please select all images that contain a {{ targetObject }}:</p>

      <div class="image-grid">
        <div
          v-for="(image, index) in verificationImages"
          :key="index"
          class="image-box"
          :class="{ selected: selectedBoxes.includes(index) }"
          @click="toggleBoxSelection(index)"
        >
          <img :src="image.url" :alt="'Verification image'" loading="lazy" />
        </div>
      </div>

      <div class="verification-actions">
        <button @click="verify" class="verify-btn">Verify</button>
        <button @click="$emit('close')" class="cancel-btn">Cancel</button>
      </div>
    </div>
    <AlertModal
      v-if="showAlert"
      show="true"
      type="error"
      title="Verification Failed"
      :message="alertMessage"
      confirmText="Try Again"
      @confirm="handleAlertConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AlertModal from "../modals/AlertModal.vue";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["success", "close"]);

const selectedBoxes = ref([]);
const verificationImages = ref([]);
const correctBoxes = ref([]);
const targetObject = ref("");

const showAlert = ref(false);
const alertMessage = ref("");

// List of possible verification objects and their image sets
const verificationSets = {
  car: {
    correct: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=200&h=200&fit=crop",
    ],
    incorrect: [
      "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=200&h=200&fit=crop",
    ],
  },
  dog: {
    correct: [
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&h=200&fit=crop",
    ],
    incorrect: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1449614115178-cb924f730780?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop",
    ],
  },
};

const initializeVerification = () => {
  // Reset selections
  selectedBoxes.value = [];
  correctBoxes.value = [];
  verificationImages.value = [];

  // Randomly select verification type
  const types = Object.keys(verificationSets);
  const selectedType = types[Math.floor(Math.random() * types.length)];
  targetObject.value = selectedType;

  const set = verificationSets[selectedType];

  // Get 3 correct images
  const correctImages = [...set.correct]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((url) => ({ url, isCorrect: true }));

  // Get 6 incorrect images
  const incorrectImages = [...set.incorrect]
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)
    .map((url) => ({ url, isCorrect: false }));

  // Combine and shuffle all images
  verificationImages.value = [...correctImages, ...incorrectImages].sort(
    () => Math.random() - 0.5
  );

  // Store correct box indices
  correctBoxes.value = verificationImages.value
    .map((img, index) => (img.isCorrect ? index : -1))
    .filter((index) => index !== -1);
};

onMounted(() => {
  initializeVerification();
});

const toggleBoxSelection = (index) => {
  const currentIndex = selectedBoxes.value.indexOf(index);
  if (currentIndex === -1) {
    selectedBoxes.value.push(index);
  } else {
    selectedBoxes.value.splice(currentIndex, 1);
  }
};

const verify = () => {
  const isCorrect =
    selectedBoxes.value.length === correctBoxes.value.length &&
    selectedBoxes.value.every(
      (index) => verificationImages.value[index].isCorrect
    );

  if (isCorrect) {
    emit("success");
  } else {
    alertMessage.value = "Verification failed. Please try again.";
    showAlert.value = true;
  }
};

const handleAlertConfirm = () => {
  showAlert.value = false;
  selectedBoxes.value = [];
  initializeVerification();
};
</script>

<style scoped>
.verification-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.verification-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
}

.verification-content h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.2rem;
}

.verification-content p {
  margin-bottom: 1.5rem;
  color: #666;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 20px 0;
}

.image-box {
  aspect-ratio: 1;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.image-box:hover {
  border-color: #7380ec;
  transform: translateY(-2px);
}

.image-box.selected {
  border-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.verification-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.verify-btn,
.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.verify-btn {
  background: #4caf50;
  color: white;
}

.verify-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.cancel-btn {
  background: #f44336;
  color: white;
}

.cancel-btn:hover {
  background: #da190b;
  transform: translateY(-1px);
}
</style>
