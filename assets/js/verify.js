/* =========================================================
   SCHOOLMAP — verify.js
   Admin verification flow
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", function() {
  initializeVerifyPage();
});

function initializeVerifyPage() {
  var user = getCurrentUser();
  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  if (user.verified) {
    window.location.href = "map.html";
    return;
  }

  var instructions = document.getElementById("verify-instructions");
  if (instructions) {
    instructions.textContent =
      "A verification code has been sent to " + user.email + ". Enter it below to continue.";
  }

  requestVerificationCode(user.email, user.fullName, false);

  var form = document.getElementById("verify-form");
  if (form) {
    form.addEventListener("submit", handleVerifySubmit);
  }

  var resendButton = document.getElementById("resend-code");
  if (resendButton) {
    resendButton.addEventListener("click", function() {
      requestVerificationCode(user.email, user.fullName, true);
    });
  }
}

function handleVerifySubmit(event) {
  event.preventDefault();
  var user = getCurrentUser();
  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  var codeInput = document.getElementById("verify-code");
  var code = codeInput ? codeInput.value.trim() : "";
  var stored = storageGet("schoolmap_admin_verification", {});
  var expected = stored && stored.email === user.email ? stored.code : "";

  if (!code) {
    showVerifyError("Please enter the verification code.");
    return;
  }

  if (code !== expected) {
    showVerifyError("Code is incorrect. Please try again.");
    return;
  }

  user.verified = true;
  setCurrentUser(user);
  localStorage.removeItem("schoolmap_admin_verification");
  showToast("Verification successful. Redirecting to the map...");
  window.location.href = "map.html";
}

function requestVerificationCode(email, fullName, forceResend) {
  var infoBox = document.getElementById("verify-sent-info");
  if (infoBox) {
    infoBox.textContent = "Sending verification email to " + email + "...";
  }

  fetch("../backend/api.php?action=send_verification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: email, fullName: fullName })
  })
    .then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          throw new Error(data.message || "Failed to send verification email.");
        }
        var code = data.data && data.data.code ? data.data.code : null;
        storageSet("schoolmap_admin_verification", {
          email: email,
          code: code,
          sentAt: new Date().toISOString()
        });
        if (infoBox) {
          infoBox.textContent = "A verification code was sent to " + email + ". Use code: " + code + ".";
        }
        showToast("Verification email sent.");
      });
    })
    .catch(function(error) {
      if (infoBox) {
        infoBox.textContent = "Unable to send email. Displaying a fallback code for local testing.";
      }
      var fallbackCode = generateVerificationCode(6);
      storageSet("schoolmap_admin_verification", {
        email: email,
        code: fallbackCode,
        sentAt: new Date().toISOString()
      });
      if (infoBox) {
        infoBox.textContent = "Fallback code: " + fallbackCode + ".";
      }
      showToast(error.message || "Email send failed; using fallback code.");
    });
}

function generateVerificationCode(length) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var code = "";
  for (var i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function showVerifyError(message) {
  var errorBox = document.getElementById("verify-error");
  if (!errorBox) { return; }
  errorBox.textContent = message;
  errorBox.style.display = "";
}
