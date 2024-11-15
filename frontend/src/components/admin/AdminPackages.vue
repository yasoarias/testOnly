<template>
  <div class="admin-dashboard">
    <AdminSidebar />
    <main>
      <div class="insights">
        <div class="packages">
          <span class="material-icons-sharp">inventory</span>
          <div class="middle">
            <div class="left">
              <h3>Total Packages</h3>
              <h1>{{ packages.length }}</h1>
            </div>
            <div class="progress">
              <svg>
                <circle cx="38" cy="38" r="36"></circle>
              </svg>
              <div class="number">
                <p>{{ Math.round((packages.length / 100) * 100) }}%</p>
              </div>
            </div>
          </div>
          <small class="text-muted">All available packages</small>
        </div>
      </div>

      <div class="recent-packages">
        <h2>Recent Packages</h2>
        <div class="package-grid">
          <div
            v-for="pkg in paginatedPackages"
            :key="pkg.id"
            class="package-card"
          >
            <img
              :src="pkg.image"
              :alt="pkg.name"
              class="package-image"
              @error="handleImageError"
            />
            <div class="package-info">
              <h3>{{ pkg.name }}</h3>
              <p>Category: {{ pkg.category }}</p>
              <p>
                Price: ₱{{ pkg.price ? pkg.price.toLocaleString() : "N/A" }}
              </p>
              <p :class="pkg.status ? pkg.status.toLowerCase() : ''">
                Status: {{ pkg.status || "N/A" }}
              </p>
              <div class="package-actions">
                <button
                  class="btn-details"
                  @click="openPackageDetailsModal(pkg)"
                >
                  Details
                </button>
                <button class="btn-update" @click="openUpdatePackageModal(pkg)">
                  Update
                </button>
                <button
                  class="btn-delete"
                  @click.stop="handleSingleDelete(pkg)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="pagination">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="btn-pagination"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="btn-pagination"
          >
            Next
          </button>
        </div>
      </div>

      <div class="action-buttons">
        <div class="button-group">
          <button class="add-package" @click="openAddPackageModal">
            <span class="material-icons-sharp">add</span>
            <span>Add Package</span>
          </button>
          <button class="remove-package" @click="openRemovePackageModal">
            <span class="material-icons-sharp">delete</span>
            <span>Remove Package</span>
          </button>
        </div>
      </div>

      <!-- Modals -->
      <AddPackageModal
        :isOpen="isAddPackageModalOpen"
        @close="closeAddPackageModal"
      />
      <UpdatePackageModal
        :isOpen="isUpdatePackageModalOpen"
        :packageData="selectedPackage"
        @close="closeUpdatePackageModal"
      />
      <PackageDetailsModal
        :isOpen="isPackageDetailsModalOpen"
        :packageData="selectedPackage"
        @close="closePackageDetailsModal"
      />
      <RemovePackageModal
        :isOpen="isRemovePackageModalOpen"
        :packages="packages"
        @close="closeRemovePackageModal"
        @packageDeleted="handlePackageDeleted"
      />
      <AlertNotification
        :show="alert.show"
        :message="alert.message"
        :type="alert.type"
        @close="closeAlert"
      />
      <ConfirmationModal
        :show="showDeleteConfirmation"
        title="Delete Package"
        :message="`Are you sure you want to delete '${packageToDelete?.name}'? This action cannot be undone.`"
        confirmText="Delete"
        @confirm="confirmSingleDelete"
        @cancel="cancelDelete"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import AdminSidebar from "./AdminSidebar.vue";
import AddPackageModal from "./AddPackageModal.vue";
import UpdatePackageModal from "../modals/UpdatePackageModal.vue";
import PackageDetailsModal from "../modals/PackageDetailsModal.vue";
import RemovePackageModal from "../modals/RemovePackageModal.vue";
import AlertNotification from "../modals/AlertNotification.vue";
import ConfirmationModal from "../modals/ConfirmationModal.vue";

const packages = ref([]);
const isAddPackageModalOpen = ref(false);
const isUpdatePackageModalOpen = ref(false);
const isPackageDetailsModalOpen = ref(false);
const isPostModalOpen = ref(false);
const showMenu = ref(false);
const currentPage = ref(1);
const itemsPerPage = 4;
const selectedPackage = ref(null);

const totalPages = computed(() =>
  Math.ceil(packages.value.length / itemsPerPage)
);

const paginatedPackages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return packages.value.slice(start, end);
});

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const openAddPackageModal = () => {
  isAddPackageModalOpen.value = true;
};

const closeAddPackageModal = () => {
  isAddPackageModalOpen.value = false;
};

const openUpdatePackageModal = (pkg) => {
  selectedPackage.value = pkg;
  isUpdatePackageModalOpen.value = true;
};

const closeUpdatePackageModal = () => {
  isUpdatePackageModalOpen.value = false;
};

const openPackageDetailsModal = (pkg) => {
  selectedPackage.value = pkg;
  isPackageDetailsModalOpen.value = true;
};

const closePackageDetailsModal = () => {
  isPackageDetailsModalOpen.value = false;
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const fetchPackages = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/products");
    const data = await response.json();
    packages.value = data.map((pkg) => ({
      ...pkg,
      status: pkg.status || "N/A",
      image: pkg.image_path
        ? `http://localhost:3000${pkg.image_path}`
        : "https://via.placeholder.com/150",
    }));
  } catch (error) {
    console.error("Error fetching packages:", error);
  }
};

onMounted(async () => {
  await fetchPackages();
});

const handleImageError = (event) => {
  event.target.src = "https://via.placeholder.com/150";
};

const openPostModal = () => {
  isPostModalOpen.value = true;
};

const closePostModal = () => {
  isPostModalOpen.value = false;
};

const isRemovePackageModalOpen = ref(false);

const openRemovePackageModal = () => {
  isRemovePackageModalOpen.value = true;
};

const closeRemovePackageModal = () => {
  isRemovePackageModalOpen.value = false;
};

const handlePackageDeleted = async () => {
  await fetchPackages(); // Refresh the packages list
};

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

const handleSingleDelete = (pkg) => {
  packageToDelete.value = pkg;
  showDeleteConfirmation.value = true;
};

const cancelDelete = () => {
  showDeleteConfirmation.value = false;
  packageToDelete.value = null;
};

const confirmSingleDelete = async () => {
  try {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      showAlert("Authentication required. Please login again.", "error");
      return;
    }

    console.log("Deleting package:", packageToDelete.value);

    const response = await fetch(
      `http://localhost:3000/api/products/${packageToDelete.value.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: storedToken,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete package");
    }

    showAlert(
      `Successfully deleted "${packageToDelete.value.name}"`,
      "success"
    );
    await fetchPackages(); // Refresh the list
  } catch (error) {
    console.error("Error deleting package:", error);
    showAlert("Failed to delete package. Please try again.", "error");
  } finally {
    showDeleteConfirmation.value = false;
    packageToDelete.value = null;
  }
};

const showDeleteConfirmation = ref(false);
const packageToDelete = ref(null);
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  height: 100vh;
  background-color: #f6f6f9;
}

main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

h2 {
  margin-bottom: 1rem;
  color: #363949;
}

.insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.6rem;
  margin-bottom: 2rem;
}

.packages {
  background: white;
  padding: 1.8rem;
  border-radius: 2rem;
  box-shadow: 0 2rem 3rem rgba(132, 139, 200, 0.18);
  transition: all 300ms ease;
}

.packages:hover {
  box-shadow: none;
}

.packages .material-icons-sharp {
  background: #7380ec;
  padding: 0.5rem;
  border-radius: 50%;
  color: white;
  font-size: 2rem;
}

.packages .middle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.packages h3 {
  margin: 1rem 0 0.6rem;
  font-size: 1rem;
}

.packages .progress {
  position: relative;
  width: 92px;
  height: 92px;
  border-radius: 50%;
}

.packages svg {
  width: 7rem;
  height: 7rem;
}

.packages svg circle {
  fill: none;
  stroke: #7380ec;
  stroke-width: 14;
  stroke-linecap: round;
  transform: translate(5px, 5px);
  stroke-dasharray: 110;
  stroke-dashoffset: 92;
}

.packages .number {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.recent-packages {
  margin-top: 2rem;
}

.recent-packages table {
  background: white;
  width: 100%;
  border-radius: 2rem;
  padding: 1.8rem;
  text-align: center;
  box-shadow: 0 2rem 3rem rgba(132, 139, 200, 0.18);
  transition: all 300ms ease;
}

.recent-packages table:hover {
  box-shadow: none;
}

.recent-packages table th {
  padding: 0.8rem 0;
  color: #363949;
  font-weight: 600;
}

.recent-packages table td {
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(132, 139, 200, 0.18);
  color: #677483;
}

.btn-details {
  background: #7380ec;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  border: none;
  cursor: pointer;
  transition: all 300ms ease;
}

.btn-details:hover {
  background: #5a67d8;
}

.show-all {
  display: block;
  text-align: center;
  margin: 1rem auto;
  color: #7380ec;
}

.add-package,
.update-package,
.post-gallery {
  background: white;
  border-radius: 2rem;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  box-shadow: 0 2rem 3rem rgba(132, 139, 200, 0.18);
  transition: all 300ms ease;
  cursor: pointer;
  border: none;
  flex: 1;
}

.add-package:hover,
.update-package:hover,
.post-gallery:hover {
  box-shadow: none;
}

.add-package .material-icons-sharp,
.update-package .material-icons-sharp,
.post-gallery .material-icons-sharp {
  background: #7380ec;
  padding: 0.5rem;
  border-radius: 50%;
  color: white;
  font-size: 2rem;
}

.post-gallery {
  background: #f6f6f9;
}

.post-gallery .material-icons-sharp {
  background: #ff7782;
}

@media screen and (max-width: 768px) {
  .menu-btn {
    display: inline-block;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: #363949;
  }

  .admin-dashboard {
    position: relative;
  }

  .show-menu {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 70%;
    height: 100vh;
    z-index: 100;
    background-color: white;
    box-shadow: 0 2rem 3rem rgba(132, 139, 200, 0.18);
  }

  .action-buttons {
    flex-direction: column;
  }

  .add-package,
  .remove-package,
  .post-gallery {
    padding: 1.2rem;
  }
}

/* Additional styles to ensure consistency */

/* End of new styles */

/* Existing media query styles... */

.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.package-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1rem 2rem rgba(132, 139, 200, 0.18);
  transition: all 300ms ease;
}

.package-card:hover {
  box-shadow: none;
}

.package-image {
  width: 100%;
  height: 200px; /* Adjust this value as needed */
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
}

.pagination button {
  background: #7380ec;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 300ms ease;
}

.pagination button:hover:not(:disabled) {
  background: #5a67d8;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  margin: 0 1rem;
}

/* ... rest of your existing styles ... */

.btn-details,
.btn-update {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-details {
  background-color: #007bff;
  color: white;
}

.btn-details:hover {
  background-color: #0056b3;
}

.btn-update {
  background-color: #28a745;
  color: white;
  margin-left: 0.5rem;
}

.btn-update:hover {
  background-color: #218838;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #7380ec;
  outline: none;
}

select.form-control {
  background-color: white;
  cursor: pointer;
}

.remove-package {
  background: white;
  border-radius: 2rem;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  box-shadow: 0 2rem 3rem rgba(132, 139, 200, 0.18);
  transition: all 300ms ease;
  cursor: pointer;
  border: none;
  flex: 1;
}

.remove-package:hover {
  box-shadow: none;
}

.remove-package .material-icons-sharp {
  background: #ff7782;
  padding: 0.5rem;
  border-radius: 50%;
  color: white;
  font-size: 2rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.button-group .add-package,
.button-group .remove-package {
  flex: 1;
}

@media screen and (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .add-package,
  .remove-package,
  .post-gallery {
    padding: 1.2rem;
    width: 100%;
  }
}

.btn-delete {
  background-color: #dc3545;
  color: white;
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-delete:hover {
  background-color: #c82333;
}
</style>
