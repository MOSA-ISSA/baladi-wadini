// Function to show a notification message
function showNotification(message, duration = 3000, color = "#333") {
  const notification = document.getElementById("notification");
  if (notification) {
    notification.textContent = message;
    notification.style.display = "block";
    notification.style.backgroundColor = color;
    setTimeout(() => (notification.style.display = "none"), duration);
  }
}

// Function to check if the user is visiting within the allowed time
function isWithinAllowedTime(testDate) {
  const now = new Date();
  const nowInMinutes = now.getHours() * 60 + now.getMinutes(); // current time in minutes

  // Get the test date time in minutes (if no test date, use current time)
  const testTimeInMinutes = testDate
    ? testDate.getHours() * 60 + testDate.getMinutes()
    : nowInMinutes;

  // Define allowed time ranges (in minutes)
  const allowedTimes = [
    [290, 360],  // 4:50 AM - 6:00 AM
    [690, 780],  // 11:30 AM - 1:00 PM
    [855, 915],  // 2:15 PM - 3:15 PM
    [1005, 1065], // 5:00 PM - 6:05 PM
    [1065, 1150], // 6:05 PM - 7:40 PM
  ];

  // Check if the given time is within any of the allowed ranges
  return allowedTimes.some(([start, end]) => testTimeInMinutes >= start && testTimeInMinutes <= end);
}

// Function to update points based on the visit time condition
function updatePointsBasedOnTime() {
  const lastVisitTime = localStorage.getItem("lastVisitTime");
  const points = parseInt(localStorage.getItem("points")) || 0;

  if (isWithinAllowedTime()) {
    console.log("new point:", points + 1);
    fetch("/api/addPoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber: localStorage.getItem("phoneNumber") }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          const newPoints = res.points;
          localStorage.setItem("points", newPoints);
          const pointDisplay = document.getElementById("pointsDisplay");
          if (pointDisplay) pointDisplay.textContent = `${newPoints} نقطة`;
          localStorage.setItem("lastVisitTime", new Date().getTime()); // Update last visit time
          showNotification("لقد حصلت على نقطة جديدة!", 3000, "green");
        } else {
          showNotification(res.message, 3000, "red"); // Show error message
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showNotification("خطأ في الاتصال بالخادم!", 3000 * 60, "red");
      });
  }

  // Update the points display on the page
  const pointsDisplay = document.getElementById("pointsDisplay");
  if (pointsDisplay) pointsDisplay.textContent = `${localStorage.getItem("points")} نقطة`;
}

// Function to register phone number and check user data
function registerPhoneNumber(localNumber) {
  const phoneNumber = document.getElementById("phone-number").value;
  const pointsDisplay = document.getElementById("pointsDisplay");
  const notification = document.getElementById("notification");
  const thankYouMessage = document.getElementById("thank-you-message");

  if (!isWithinAllowedTime()) {
    showNotification("التسجيل مسموح فقط خلال اوقات الصلاة.", 1000 * 60, "red");
    return;
  }

  // Check if phone number is valid and not empty
  if (!localNumber && (!phoneNumber || !/^\d{10}$/.test(phoneNumber))) {
    showNotification("يرجى إدخال رقم هاتف صالح!", 3000, "red");
    return;
  }

  fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber: phoneNumber || localNumber }),
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.success) {
        const points = res.points || 0;

        // Show thank you message and update points
        thankYouMessage.style.display = "block";
        pointsDisplay.textContent = `${points} نقطة`;
        localStorage.setItem("phoneNumber", phoneNumber || localNumber);
        localStorage.setItem("points", points);
        localStorage.setItem("lastVisitTime", new Date().getTime()); // Save visit time
        showNotification("تم التسجيل بنجاح!", 3000, "green");
      } else {
        showNotification(res.message, 3000, "red"); // Show error message
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showNotification("خطأ في الاتصال بالخادم!", 3000 * 60, "red");
    });
}

// Function to show thank you message after registration
function showThankYouMessage(phoneNumber) {
  const thankYouMessage = document.getElementById("thank-you-message");
  const pointsDisplay = document.getElementById("pointsDisplay");

  thankYouMessage.style.display = "block";
  pointsDisplay.textContent = `${localStorage.getItem("points")} نقطة`;
  pointsDisplay.style.display = "block";

  const userPhone = document.getElementById("user-phone");
  if (userPhone) userPhone.textContent = phoneNumber;

  const instagramLink = document.getElementById("instagram-link");
  if (instagramLink) instagramLink.style.display = "block";

  const registrationForm = document.getElementById("registration-form");
  if (registrationForm) registrationForm.style.display = "none";

  updatePointsBasedOnTime();
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const phoneNumber = localStorage.getItem("phoneNumber");

  if (phoneNumber) {
    console.log("on page start phoneNumber: ", phoneNumber);
    showThankYouMessage(phoneNumber);
    const registrationForm = document.getElementById("registration-form");
    if (registrationForm) registrationForm.style.display = "none";
  } else {
    if (!isWithinAllowedTime()) {
      showNotification("التسجيل مسموح فقط خلال اوقات الصلاة.", 1000 * 60, "red");
    }
  }
});
