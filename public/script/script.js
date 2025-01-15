// Function to show a notification message
function showNotification(message, duration, color) {
  const notification = document.getElementById("notification");
  if (notification) {
    notification.textContent = message;
    notification.style.display = "block";
    notification.style.backgroundColor = color || "#333";
    setTimeout(() => (notification.style.display = "none"), duration || 3000);
  }
}

// Function to check if the user is visiting within the allowed time
function isWithinAllowedTime(testDate) {
  const now = new Date();
  const nowInMinutes = now.getHours() * 60 + now.getMinutes(); // current time in minutes

  // Get the test date time in minutes (if no test date, use current time)
  const testTimeInMinutes = testDate ? testDate.getHours() * 60 + testDate.getMinutes() : nowInMinutes;

  // Define allowed time ranges (in minutes)
  const allowedTimes = [
    [290, 360],  // 4:50 AM - 6:00 AM
    [690, 780],  // 11:30 AM - 1:00 PM
    [855, 915],  // 2:15 PM - 3:15 PM
    [1005, 1065], // 5:00 PM - 6:05 PM
    [1065, 1150], // 6:05 PM - 7:40 PM
  ];

  // Check if the given time is within any of the allowed ranges
  return allowedTimes.some(
    ([start, end]) => testTimeInMinutes >= start && testTimeInMinutes <= end
  );
};

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
          const point = document.getElementById("pointsDisplay");
          point.textContent = `${newPoints} نقطة`;
          localStorage.setItem("lastVisitTime", new Date().getTime()); // Update last visit time
          showNotification("لقد حصلت على نقطة جديدة!", 3000, "green"); // Show point increment message
        } else {
          showNotification(res.message, 3000, "red"); // Show error message
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showNotification("خطاء في الاتصال بالخادم!", 3000 * 60, "red");
      });
  }

  // Update the points display on the page
  document.getElementById("pointsDisplay").textContent = `${localStorage.getItem("points")} نقطة`;
}

// Function to register phone number and check user data
function registerPhoneNumber(localNumber) {
  const phoneNumber = document.getElementById("phone-number").value;
  const pointsDisplay = document.getElementById("pointsDisplay");
  const notification = document.getElementById("notification");
  const thankYouMessage = document.getElementById("thank-you-message");
  const pointsInput = document.getElementById("pointsDisplay");
  console.log("phoneNumber: ", phoneNumber || !localNumber);
  // console.log("pointsDisplay: ", pointsDisplay);
  // console.log("thankYouMessage: ", thankYouMessage);
  // console.log("pointsInput: ", pointsInput);

  if (!isWithinAllowedTime()) {
    showNotification("التسجيل مسموح فقط خلال اوقات الصلاة.", 1000 * 60, "red");
    return;
  }

  // Check if phone number is valid and not empty
  if (!localNumber) {
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      showNotification("يرجى إدخال رقم هاتف صالح!", 3000, "red");
      return;
    }
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
        const data = res.data;
        const points = res.points;
        console.log("points", points);

        thankYouMessage.style.display = "block";
        pointsInput.value = points; // Update hidden points value
        pointsDisplay.textContent = `${points || " 0 "} نقطة`;
        pointsDisplay.style.display = "block";
        localStorage.setItem("phoneNumber", phoneNumber); // Save phone number in localStorage
        localStorage.setItem("points", points); // Save points in localStorage
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
  userPhone.textContent = phoneNumber;

  const instagramLink = document.getElementById("instagram-link");
  instagramLink.style.display = "block";

  const registrationForm = document.getElementById("registration-form");
  if (registrationForm) registrationForm.style.display = "none";

  updatePointsBasedOnTime();
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // localStorage.clear();
  const phoneNumber = localStorage.getItem("phoneNumber");
  if (phoneNumber) {
    console.log("on page start phoneNumber: ", phoneNumber);
    registerPhoneNumber(phoneNumber);
    showThankYouMessage(phoneNumber);
    const registrationForm = document.getElementById("registration-form");
    if (registrationForm) registrationForm.style.display = "none";
  } else {
    if (!isWithinAllowedTime()) {
      showNotification("التسجيل مسموح فقط خلال اوقات الصلاة.", 1000 * 60, "red");
      return;
    }
  }

  // updatePointsBasedOnTime(); // Ensure points are updated on page load
});
