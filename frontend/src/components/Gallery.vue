<template>
  <div class="gallery-page" :class="{ 'dark-mode': isDarkMode }">
    <Navbar
      @openLoginModal="openLoginModal"
      @openRegisterModal="openRegisterModal"
      @logout="handleLogout"
    />
    <div class="content-wrapper">
      <main>
        <!-- <h1 class="gallery-title">Latest Posts</h1> -->
        <div v-if="isLoading" class="loading">Loading...</div>
        <div v-else class="posts-grid">
          <div v-for="post in posts" :key="post.id" class="post-card">
            <!-- Post Header -->
            <div class="post-header">
              <div class="author-section">
                <img
                  :src="getProfilePicture(post.user_id)"
                  alt="User Avatar"
                  class="author-avatar"
                />
                <div class="author-info">
                  <h4 class="author-name">{{ post.userName }}</h4>
                  <span class="post-meta">{{
                    formatDate(post.created_at)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Post Content -->
            <div class="post-content">
              <p>{{ truncateContent(post.content) }}</p>
              <div v-if="post.images" class="image-container">
                <img
                  :src="getImageUrl(post.images.split(',')[0])"
                  :alt="post.content"
                  loading="lazy"
                />
              </div>
            </div>

            <!-- Engagement Stats -->
            <div class="engagement-stats">
              <span>{{ post.likes || 0 }} likes</span>
              <div class="stat-divider">•</div>
              <span>{{ post.comments || 0 }} comments</span>
            </div>

            <!-- Action Buttons -->
            <div class="action-bar">
              <button class="action-btn">
                <i class="fas fa-heart"></i>
                <span>Like</span>
              </button>
              <button class="action-btn" @click="toggleComments(post.id)">
                <i class="fas fa-comment"></i>
                <span>Comment</span>
              </button>
            </div>

            <!-- Comment Section -->
            <div v-if="activeCommentId === post.id" class="comment-section">
              <div class="comment-input-wrapper">
                <img
                  :src="getProfilePicture(post.user_id)"
                  alt="User Avatar"
                  class="comment-avatar"
                />
                <div class="comment-input-container">
                  <input 
                    type="text" 
                    class="comment-input"
                    placeholder="Write a comment..."
                  />
                  <button class="send-comment-btn">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Login and Register modals -->
    <Login
      v-if="isModalOpen && activeModal === 'login'"
      :isOpen="isModalOpen"
      @close="closeModal"
      @login="handleLogin"
      @loginComplete="handleLoginComplete"
      @switchToRegister="switchToRegister"
    />
    <Register
      v-if="isModalOpen && activeModal === 'register'"
      :isOpen="isModalOpen"
      @close="closeModal"
      @register="handleRegister"
      @switchToLogin="switchToLogin"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Navbar from "./Navbar.vue";
import Login from "./login.vue";
import Register from "./register.vue";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const { token } = useAuth();

const isDarkMode = ref(false);
const isLoggedIn = ref(false);
const isModalOpen = ref(false);
const activeModal = ref("login");
const posts = ref([]);
const isLoading = ref(true);
const activeCommentId = ref(null);

const fetchPosts = async (authToken) => {
  try {
    const response = await fetch("http://localhost:3000/api/posts", {
      headers: {
        Authorization: authToken || token.value,
      },
    });
    if (response.ok) {
      posts.value = await response.json();
    } else {
      console.error("Failed to fetch posts");
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  } finally {
    isLoading.value = false;
  }
};

const initializeGallery = async (authToken) => {
  const storedToken = authToken || localStorage.getItem("token");
  if (!storedToken) {
    router.push("/");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  isLoggedIn.value = !!user;
  await fetchPosts(storedToken);
};

onMounted(initializeGallery);

// Watch for changes in the route
watch(
  () => router.currentRoute.value,
  async (newRoute) => {
    if (newRoute.path === "/gallery") {
      await initializeGallery();
    }
  }
);

const handleLoginComplete = async (newToken) => {
  await initializeGallery(newToken);
};

const getImageUrl = (imagePath) => {
  return `http://localhost:3000/uploads/${imagePath}`;
};

const getProfilePicture = (userId) => {
  // Replace this with actual logic to get user's profile picture
  return `https://api.dicebear.com/6.x/initials/svg?seed=user${userId}`;
};

const truncateContent = (content, maxLength = 150) => {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + "...";
};

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const handleLogout = () => {
  localStorage.removeItem("token");
  isLoggedIn.value = false;
};

const openLoginModal = () => {
  isModalOpen.value = true;
  activeModal.value = "login";
};

const openRegisterModal = () => {
  isModalOpen.value = true;
  activeModal.value = "register";
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleLogin = (credentials) => {
  console.log("Login credentials received:", credentials);
  closeModal();
};

const handleRegister = (userData) => {
  console.log("Registration data received:", userData);
  closeModal();
};

const switchToRegister = () => {
  activeModal.value = "register";
};

const switchToLogin = () => {
  activeModal.value = "login";
};

const toggleComments = (postId) => {
  activeCommentId.value = activeCommentId.value === postId ? null : postId;
};
</script>

<style scoped>
.posts-grid {
  max-width: 680px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.post-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-section {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-top: 2px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: #050505;
  margin: 0;
  line-height: 1.2;
}

.post-meta {
  font-size: 13px;
  color: #65676B;
  line-height: 1.2;
  margin-top: 1px;
}

.post-meta::after {
  content: "";
}

.post-meta i {
  font-size: 12px;
  color: #65676B;
}

.post-content {
  padding: 4px 16px 16px;
}

.post-content p {
  font-size: 15px;
  line-height: 1.5;
  color: #050505;
  margin-bottom: 12px;
}

.image-container {
  margin: 0;
  background: #F0F2F5;
}

.image-container img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  display: block;
}

.engagement-stats {
  padding: 10px 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-top: 1px solid #CED0D4;
  font-size: 15px;
  color: #65676B;
}

.engagement-stats span {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.stat-divider {
  margin: 0 8px;
  color: #65676B;
}

.action-bar {
  padding: 4px 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 1px solid #CED0D4;
}

.action-btn {
  padding: 6px 0;
  color: #65676B;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.15s ease;
  background: transparent;
  border: none;
  cursor: pointer;
}

.action-btn:hover {
  background: transparent;
  opacity: 0.7;
}

.action-btn i {
  font-size: 18px;
}

/* Dark mode styles */
.dark-mode .post-card {
  background: #242526;
  box-shadow: none;
}

.dark-mode .author-name {
  color: #E4E6EB;
}

.dark-mode .post-meta,
.dark-mode .options-btn {
  color: #B0B3B8;
}

.dark-mode .post-content p {
  color: #E4E6EB;
}

.dark-mode .engagement-stats {
  border-color: #3E4042;
  color: #B0B3B8;
}

.dark-mode .action-bar {
  border-color: #3E4042;
}

.dark-mode .action-btn {
  color: #B0B3B8;
}

.dark-mode .action-btn:hover {
  background: transparent;
  opacity: 0.7;
}

.dark-mode .options-btn:hover {
  background: transparent;
  opacity: 0.7;
}

/* Loading animation */
.loading {
  text-align: center;
  padding: 40px;
  color: #65676B;
  font-size: 15px;
  font-weight: 500;
}

.comment-section {
  padding: 8px 16px;
  border-top: 1px solid #CED0D4;
  background: #F0F2F5;
}

.comment-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 4px 0;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-input-container {
  flex: 1;
  background: #ffffff;
  border-radius: 18px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: #050505;
  padding: 0;
  margin: 0;
}

.comment-input::placeholder {
  color: #65676B;
}

/* Dark mode styles */
.dark-mode .comment-section {
  background: #3A3B3C;
  border-color: #3E4042;
}

.dark-mode .comment-input-container {
  background: #242526;
}

.dark-mode .comment-input {
  color: #E4E6EB;
}

.dark-mode .comment-input::placeholder {
  color: #B0B3B8;
}

.send-comment-btn {
  background: transparent;
  border: none;
  color: #1877F2;
  cursor: pointer;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  margin-left: auto;
}

.send-comment-btn i {
  font-size: 16px;
}

.send-comment-btn:hover {
  opacity: 0.7;
}

/* Add to dark mode section */
.dark-mode .send-comment-btn {
  color: #2D88FF;
}
</style>
