/* =========================================================
   SCHOOLMAP — login.js
   Login visit log page logic
   ========================================================= */

"use strict";

var ADMIN_EMAILS = [
  "admin@school.com"
];

document.addEventListener("DOMContentLoaded", function() {
  initializeLoginPage();
});

function initializeLoginPage() {
  var form = document.getElementById("login-form");
  if (form) {
    form.addEventListener("submit", handleLoginSubmit);
  }
  var timeInInput = document.getElementById("login-timein");
  if (timeInInput) {
    timeInInput.value = formatTimestamp(new Date());
  }
  clearLoginError();
}

function handleLoginSubmit(event) {
  event.preventDefault();
  var fullName = document.getElementById("login-fullname").value.trim();
  var email = document.getElementById("login-email").value.trim();
  var timeIn = document.getElementById("login-timein").value;

  if (!fullName || !email) {
    showLoginError("Please fill in all fields.");
    return;
  }

  if (!isValidEmail(email)) {
    showLoginError("Please enter a valid email address.");
    return;
  }

  if (!timeIn) {
    timeIn = formatTimestamp(new Date());
  }

  var normalizedEmail = email.toLowerCase();
  var role = isAdminEmail(normalizedEmail) ? "admin" : "user";
  var userData = {
    fullName: fullName,
    email: normalizedEmail,
    timeIn: timeIn,
    role: role,
    verified: role === "user"
  };

  setCurrentUser(userData);
  saveVisitLog({
    fullName: fullName,
    email: normalizedEmail,
    timeIn: timeIn,
    role: role,
    verified: userData.verified,
    createdAt: new Date().toISOString()
  });

  if (role === "admin") {
    showLoginStatus("Sending verification email...");
    sendAdminVerification(normalizedEmail, fullName)
      .then(function(response) {
        if (response && response.success === false) {
          showLoginStatus(response.message || "Verification email failed; using fallback code.");
        } else {
          showLoginStatus("Verification email sent. Redirecting...");
        }
        window.location.href = "verify.html";
      })
      .catch(function(error) {
        showLoginError(error.message || "Could not send verification email. Check server mail settings.");
        showLoginStatus("Verification email could not be sent; fallback code is available on the verify page.");
        window.location.href = "verify.html";
      });
  } else {
    window.location.href = "map.html";
  }
}

function showLoginStatus(message) {
  var statusBox = document.getElementById("login-status");
  if (!statusBox) { return; }
  statusBox.textContent = message;
}

function sendAdminVerification(email, fullName) {
  return fetch("../backend/api.php?action=send_verification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: email, fullName: fullName })
  })
    .then(function(response) {
      return response.json().then(function(data) {
        if (response.ok && data && data.data && data.data.code) {
          storageSet("schoolmap_admin_verification", {
            email: email,
            code: data.data.code,
            sentAt: new Date().toISOString()
          });
          return data;
        }

        var fallbackCode = generateVerificationCode(6);
        storageSet("schoolmap_admin_verification", {
          email: email,
          code: fallbackCode,
          sentAt: new Date().toISOString()
        });
        return {
          success: false,
          message: data.message || "Verification email could not be sent. Using fallback code.",
          data: { code: fallbackCode }
        };
      });
    })
    .catch(function() {
      var fallbackCode = generateVerificationCode(6);
      storageSet("schoolmap_admin_verification", {
        email: email,
        code: fallbackCode,
        sentAt: new Date().toISOString()
      });
      return {
        success: false,
        message: "Verification email could not be sent. Using fallback code.",
        data: { code: fallbackCode }
      };
    });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isAdminEmail(value) {
  return ADMIN_EMAILS.indexOf(value) !== -1;
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

function showLoginError(message) {
  var errorBox = document.getElementById("login-error");
  if (!errorBox) { return; }
  errorBox.textContent = message;
  errorBox.style.display = "";
}

function clearLoginError() {
  var errorBox = document.getElementById("login-error");
  if (!errorBox) { return; }
  errorBox.textContent = "";
  errorBox.style.display = "none";
}

function saveVisitLog(entry) {
  var logs = storageGet("schoolmap_visit_logs", []);
  if (!Array.isArray(logs)) {
    logs = [];
  }
  logs.push(entry);
  storageSet("schoolmap_visit_logs", logs);
}
