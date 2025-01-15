// Step 1: Remove HttpOnly from the Cookie
function setCookieWithoutHttpOnly(token) {
  document.cookie = `csrfToken=${token}; Secure; SameSite=Strict`;
}

// Step 2: Store the token in a hidden form field
document.addEventListener("DOMContentLoaded", () => {
  const csrfTokenElement = document.getElementById("csrf-token");
  if (csrfTokenElement) {
    csrfTokenElement.value = generateCSRFToken();
  }
});

// Step 3: Change SameSite attribute to Lax
function setCookieWithLax(token) {
  document.cookie = `csrfToken=${token}; Secure; SameSite=Lax`;
}

// Step 4: Validate the token
function validateCSRFToken(token) {
  const storedToken = getCookie("csrfToken");
  if (!storedToken || storedToken !== token) {
    showNotification("CSRF token is invalid.");
    return false;
  }
  return true;
}

// Helper function to get cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Step 5: Extend token expiration
function setCookieWithExpiry(token) {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + 30 * 60 * 1000); // 30 minutes
  document.cookie = `csrfToken=${token}; expires=${expiryDate.toUTCString()}; Secure; SameSite=Lax`;
}
