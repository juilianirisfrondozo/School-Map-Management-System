/* =========================================================
   SCHOOLMAP — logout.js
   Logout page logic
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", function() {
  initializeLogoutPage();
});

function initializeLogoutPage() {
  var user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  var fullNameInput = document.getElementById("logout-fullname");
  var emailInput = document.getElementById("logout-email");
  var timeoutInput = document.getElementById("logout-timeout");

  if (fullNameInput) {
    fullNameInput.value = user.fullName || "";
  }
  if (emailInput) {
    emailInput.value = user.email || "";
  }
  if (timeoutInput) {
    timeoutInput.value = formatTimestamp(new Date());
  }

  var form = document.getElementById("logout-form");
  if (form) {
    form.addEventListener("submit", handleLogoutSubmit);
  }
}

function handleLogoutSubmit(event) {
  event.preventDefault();
  var user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  var enteredName = document.getElementById("logout-fullname").value.trim();
  var timeoutValue = document.getElementById("logout-timeout").value;
  if (!enteredName) {
    showLogoutError("Please enter your full name to confirm logout.");
    return;
  }

  if (enteredName !== user.fullName) {
    showLogoutError("Name does not match login record.");
    return;
  }

  saveLogoutRecord({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    timeIn: user.timeIn,
    timeOut: timeoutValue,
    loggedOutAt: new Date().toISOString()
  });

  localStorage.removeItem("schoolmap_admin_verification");
  setCurrentUser(null);
  showToast("Logout recorded. Redirecting to login...");
  window.location.href = "login.html";
}

function showLogoutError(message) {
  var errorBox = document.getElementById("logout-error");
  if (!errorBox) { return; }
  errorBox.textContent = message;
  errorBox.style.display = "";
}

function saveLogoutRecord(entry) {
  var records = storageGet("schoolmap_logout_logs", []);
  if (!Array.isArray(records)) {
    records = [];
  }
  records.push(entry);
  storageSet("schoolmap_logout_logs", records);
}

function formatTimestamp(date) {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");
  var hours = String(date.getHours()).padStart(2, "0");
  var minutes = String(date.getMinutes()).padStart(2, "0");
  var seconds = String(date.getSeconds()).padStart(2, "0");
  return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
}
