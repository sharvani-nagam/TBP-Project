// ==================== LOGIN MODAL HANDLER ====================

document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const loginBtn = document.getElementById("loginBtn");
  const modalOverlay = document.getElementById("modalOverlay");
  const closeModal = document.getElementById("closeModal");
  const loginForm = document.getElementById("loginForm");
  const hasEyeIssuesCheckbox = document.getElementById("hasEyeIssues");
  const eyesightSection = document.getElementById("eyesightSection");
  const userProfileNav = document.getElementById("userProfileNav");
  const logoutBtn = document.getElementById("logoutBtn");
  const profileImageInput = document.getElementById("profileImageInput");
  const imagePlaceholder = document.getElementById("imagePlaceholder");
  const profileImageContainer = document.getElementById(
    "profileImageContainer"
  );

  let selectedImageBase64 = null;

  // ==================== MODAL CONTROLS ====================

  // Open Modal
  if (loginBtn) {
    loginBtn.addEventListener("click", openModal);
  }

  function openModal() {
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // Close Modal
  function closeModalFunc() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  if (closeModal) {
    closeModal.addEventListener("click", closeModalFunc);
  }

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModalFunc();
  });

  // ==================== IMAGE UPLOAD ====================

  profileImageInput.addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      try {
        selectedImageBase64 = await AuthManager.convertImageToBase64(file);
        displayProfileImage(selectedImageBase64);
      } catch (error) {
        console.error("Error loading image:", error);
        alert("Error loading image. Please try again.");
      }
    }
  });

  function displayProfileImage(imageBase64) {
    profileImageContainer.innerHTML = `
      <img src="${imageBase64}" 
           class="profile-image-preview" 
           alt="Profile" 
           onclick="document.getElementById('profileImageInput').click()">
    `;
  }

  // ==================== TOGGLE EYESIGHT SECTION ====================

  hasEyeIssuesCheckbox.addEventListener("change", (e) => {
    if (e.target.checked) {
      eyesightSection.classList.add("active");
    } else {
      eyesightSection.classList.remove("active");
    }
  });

  // ==================== FORM SUBMISSION ====================

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
      fullName: document.getElementById("fullName").value,
      phone: document.getElementById("phone").value,
      age: document.getElementById("age").value,
      email: document.getElementById("email").value,
      hasEyeIssues: hasEyeIssuesCheckbox.checked,
      profileImage: selectedImageBase64,
      loginDate: new Date().toISOString(),
    };

    // Add eyesight data if checkbox is checked
    if (hasEyeIssuesCheckbox.checked) {
      userData.eyesight = {
        leftEye: document.getElementById("leftEye").value,
        rightEye: document.getElementById("rightEye").value,
        condition: document.getElementById("eyeCondition").value,
      };
    }

    // Save user data
    const saved = AuthManager.saveUser(userData);

    if (saved) {
      // Update UI
      updateUserProfile(userData);

      // Close modal
      closeModalFunc();

      // Reset form
      loginForm.reset();
      eyesightSection.classList.remove("active");
      profileImageContainer.innerHTML = `
        <div class="profile-image-placeholder" id="imagePlaceholder" onclick="document.getElementById('profileImageInput').click()">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <span>Click to upload<br>profile photo</span>
        </div>
      `;
      selectedImageBase64 = null;

      // Show success message
      alert("Login successful! Welcome, " + userData.fullName);

      // Redirect to results if user has eye issues
      if (userData.hasEyeIssues && userData.eyesight) {
        setTimeout(() => {
          window.location.hash = "#results";
          // Or use: window.location.href = 'results.html';
        }, 1000);
      }
    } else {
      alert("Error saving data. Please try again.");
    }
  });

  // ==================== UPDATE USER PROFILE DISPLAY ====================

  function updateUserProfile(userData) {
    const userImageContainer = document.getElementById("userImageContainer");
    const userProfileName = document.getElementById("userProfileName");

    // Display profile image or initials
    if (userData.profileImage) {
      userImageContainer.innerHTML = `
        <img src="${userData.profileImage}" 
             class="user-profile-image" 
             alt="${userData.fullName}">
      `;
    } else {
      const initials = userData.fullName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      userImageContainer.innerHTML = `
        <div class="user-profile-initials">${initials}</div>
      `;
    }

    // Display first name
    const firstName = userData.fullName.split(" ")[0];
    userProfileName.textContent = firstName;

    // Show profile, hide login button
    loginBtn.style.display = "none";
    userProfileNav.classList.add("active");
  }

  // ==================== LOGOUT ====================

  logoutBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    if (confirm("Are you sure you want to logout?")) {
      AuthManager.logout();
      loginBtn.style.display = "block";
      userProfileNav.classList.remove("active");
      alert("Logged out successfully!");

      // Redirect to home
      window.location.hash = "";
    }
  });

  // ==================== AUTO-LOGIN ON PAGE LOAD ====================

  const storedUser = AuthManager.getUser();
  if (storedUser) {
    updateUserProfile(storedUser);
  }
});
