import { ref, onMounted } from "vue";

export const useAuth = () => {
  const user = ref(null);
  const token = ref(null);

  const initializeAuth = () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser);
      token.value = storedToken;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    user.value = null;
    token.value = null;
  };

  onMounted(() => {
    initializeAuth();
  });

  return {
    user,
    token,
    logout,
    initializeAuth,
  };
};
