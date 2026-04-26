/* =========================================================
   SCHOOLMAP — register.js
   Register page specific code
   ========================================================= */

"use strict";

var selectedRole = "student";

document.addEventListener("DOMContentLoaded", function() {
  resetRegisterForm();
});

function resetRegisterForm() {
  var form = document.getElementById("register-form");
  if (form) { form.reset(); }
  selectedRole = "student";
  var roleButtons = document.querySelectorAll(".role-btn");
  roleButtons.forEach(function(btn) {
    btn.classList.toggle("active", btn.textContent.trim() === "student");
  });
  var roleInput = document.getElementById("reg-role");
  if (roleInput) { roleInput.value = "student"; }
  ["fullname", "email", "username", "password", "confirm"].forEach(function(f) {
    var el = document.getElementById("err-" + f);
    if (el) { el.textContent = ""; }
  });
  var btn = document.getElementById("register-submit");
  if (btn) { btn.textContent = "Register"; btn.disabled = false; }
}

function selectRole(role, button) {
  selectedRole = role;
  var roleInput = document.getElementById("reg-role");
  if (roleInput) { roleInput.value = role; }
  var roleButtons = document.querySelectorAll(".role-btn");
  roleButtons.forEach(function(btn) { btn.classList.remove("active"); });
  if (button) { button.classList.add("active"); }
}

function handleRegister(event) {
  event.preventDefault();

  var fullName  = document.getElementById("reg-fullname").value.trim();
  var email     = document.getElementById("reg-email").value.trim();
  var username  = document.getElementById("reg-username").value.trim();
  var password  = document.getElementById("reg-password").value;
  var confirm   = document.getElementById("reg-confirm").value;
  var role      = document.getElementById("reg-role").value || "student";
  var submitBtn = document.getElementById("register-submit");

  var errors = {};
  if (!fullName) {
    errors.fullname = "Full name is required";
  }
  if (!email.includes("@")) {
    errors.email = "Enter a valid email address";
  }
  if (username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  }
  if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  if (password !== confirm) {
    errors.confirm = "Passwords do not match";
  }

  var users = getStoredUsers();
  if (!errors.email && users.some(function(u) { return u.email === email; })) {
    errors.email = "Email already registered";
  }
  if (!errors.username && users.some(function(u) { return u.username === username; })) {
    errors.username = "Username already taken";
  }

  ["fullname", "email", "username", "password", "confirm"].forEach(function(f) {
    var el = document.getElementById("err-" + f);
    if (el) { el.textContent = errors[f] || ""; }
    var input = document.getElementById("reg-" + f);
    if (input) {
      if (errors[f]) { input.classList.add("error"); }
      else { input.classList.remove("error"); }
    }
  });

  if (Object.keys(errors).length > 0) { return; }

  submitBtn.textContent = "Creating account...";
  submitBtn.disabled    = true;

  setTimeout(function() {
    var newUser = {
      id:       "user-" + Date.now(),
      fullName: fullName,
      email:    email,
      username: username,
      role:     role,
      password: password
    };
    users.push(newUser);
    storeUsers(users);

    var safeUser = { id: newUser.id, fullName: newUser.fullName, email: newUser.email, username: newUser.username, role: newUser.role };
    AppState.currentUser = safeUser;
    setCurrentUser(safeUser);

    showToast("Account created! Welcome, " + fullName.split(" ")[0] + "! 🎉");
    window.location.href = "map.html";
  }, 600);
}

function togglePasswordVisibility(inputId, button) {
  var input = document.getElementById(inputId);
  if (!input) { return; }
  var isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  if (button) {
    button.innerHTML = isPassword
      ? '<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      : '<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  }
}
