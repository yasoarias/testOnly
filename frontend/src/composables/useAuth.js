import { ref } from "vue";
import defaultProfileImage from "@/assets/default-profile.png";

const token = ref(localStorage.getItem("token"));
const user = ref(null);

const setToken = (newToken) => {
  token.value = newToken;
  localStorage.setItem("token", newToken);
};

const clearToken = () => {
  token.value = null;
  localStorage.removeItem("token");
  user.value = null;
};

const getToken = () => {
  return token.value;
};

const fetchUserInfo = async () => {
  try {
    if (!token.value) {
      console.error("No token found");
      return;
    }

    console.log("Fetching user info with token:", token.value);

    const response = await fetch("http://localhost:3000/user/profile", {
      headers: {
        Authorization: token.value,
      },
    });

    console.log("User profile response status:", response.status);

    if (response.ok) {
      const userData = await response.json();
      console.log("Raw user data from server:", userData);
      user.value = {
        ...userData,
        profilePicture: userData.profilePicture || defaultProfileImage,
      };
      console.log("Updated user.value:", user.value);
    } else {
      console.error("Failed to fetch user data");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      token.value = null;
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
};

export function useAuth() {
  return {
    token,
    user,
    setToken,
    clearToken,
    getToken,
    fetchUserInfo,
  };
}
