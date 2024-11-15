import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/homepage.vue";
import ContactUs from "../components/contactUs.vue";
import Gallery from "../components/gallery.vue";
import Packages from "../components/packages.vue";
import WeddingPackage from "../components/packages/WeddingPackage.vue";
import DebutPackage from "../components/packages/DebutPackage.vue";
import KiddiePartyPackage from "../components/packages/KiddiePartyPackage.vue";
import ChristeningPackage from "../components/packages/ChristeningPackage.vue";
import Login from "../components/login.vue";
import AdminDashboard from "../components/admin/AdminDashboard.vue";
import AdminUsers from "../components/admin/AdminUsers.vue";
import ADTransactionHistory from "../components/admin/ADTransactionHistory.vue";
import AdminPackages from "../components/admin/AdminPackages.vue";
import ADBookedOversight from "../components/admin/ADBookedOversight.vue";
import AdminSidebar from "../components/admin/AdminSidebar.vue";
import BookedHistory from "../components/BookedHistory.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
    meta: { requiresGuest: true },
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        if (user.role === "admin") {
          next("/admin");
        } else {
          next("/gallery");
        }
      } else {
        next();
      }
    },
  },
  {
    path: "/contact",
    name: "Contact",
    component: ContactUs,
    meta: { hideForAdmin: true, hideForLoggedIn: true },
  },
  {
    path: "/gallery",
    name: "Gallery",
    component: Gallery,
  },
  {
    path: "/packages",
    component: Packages,
    children: [
      {
        path: "wedding",
        name: "WeddingPackage",
        component: WeddingPackage,
      },
      {
        path: "debut",
        name: "DebutPackage",
        component: DebutPackage,
      },
      {
        path: "kiddie-party",
        name: "KiddiePartyPackage",
        component: KiddiePartyPackage,
      },
      {
        path: "christening",
        name: "ChristeningPackage",
        component: ChristeningPackage,
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { hideForLoggedIn: true },
  },
  {
    path: "/admin/sidebar",
    name: "AdminSidebar",
    component: AdminSidebar,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    beforeEnter: (to, from, next) => {
      const userRole = localStorage.getItem("userRole");
      if (userRole !== "admin") {
        next("/"); // Redirect to homepage if not admin
      } else {
        next();
      }
    },
  },
  {
    path: "/admin/users",
    name: "AdminUsers",
    component: AdminUsers,
    meta: { requiresAdmin: true },
    beforeEnter: (to, from, next) => {
      const userRole = localStorage.getItem("userRole");
      if (userRole !== "admin") {
        next("/");
      } else {
        next();
      }
    },
  },
  {
    path: "/admin/transaction-history",
    name: "ADTransactionHistory",
    component: ADTransactionHistory,
    meta: { requiresAuth: true, requiresAdmin: true },
    beforeEnter: (to, from, next) => {
      const userRole = localStorage.getItem("userRole");
      if (userRole !== "admin") {
        next("/");
      } else {
        next();
      }
    },
  },
  {
    path: "/admin/packages",
    name: "AdminPackages",
    component: AdminPackages,
    meta: { requiresAdmin: true },
    beforeEnter: (to, from, next) => {
      const userRole = localStorage.getItem("userRole");
      if (userRole !== "admin") {
        next("/");
      } else {
        next();
      }
    },
  },
  {
    path: "/admin/booked-oversight",
    name: "ADBookedOversight",
    component: ADBookedOversight,
    meta: { requiresAdmin: true },
    beforeEnter: (to, from, next) => {
      const userRole = localStorage.getItem("userRole");
      if (userRole !== "admin") {
        next("/");
      } else {
        next();
      }
    },
  },
  {
    path: "/booked-history",
    name: "BookedHistory",
    component: BookedHistory,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userRole = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  // Check for admin routes
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    if (!token || userRole !== "admin") {
      next("/");
      return;
    }
  }

  // Check for authenticated routes
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      next("/");
      return;
    }
  }

  next();
});

export default router;
