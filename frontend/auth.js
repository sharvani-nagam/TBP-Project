// ==================== USER AUTHENTICATION & STORAGE ====================

const AuthManager = {
  // Storage key
  STORAGE_KEY: "optiplusUser",

  // Save user data to localStorage
  saveUser(userData) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  },

  // Get user data from localStorage
  getUser() {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error retrieving user data:", error);
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn() {
    return this.getUser() !== null;
  },

  // Logout user
  logout() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Error logging out:", error);
      return false;
    }
  },

  // Convert image file to base64
  convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Update user profile image
  async updateProfileImage(file) {
    try {
      const base64Image = await this.convertImageToBase64(file);
      const userData = this.getUser();
      if (userData) {
        userData.profileImage = base64Image;
        this.saveUser(userData);
        return base64Image;
      }
      return null;
    } catch (error) {
      console.error("Error updating profile image:", error);
      return null;
    }
  },
};

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthManager;
}
