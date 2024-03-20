
let signup = document.querySelector(".signup");
let login = document.querySelector(".login");
let slider = document.querySelector(".slider");
let formSection = document.querySelector(".form-section");

signup.addEventListener("click", () => {
    slider.classList.add("moveslider");
    formSection.classList.add("form-section-move");
    setTimeout(() => {
        login.classList.remove("txt-white");
        signup.classList.add("txt-white");
    }, 350);
});

login.addEventListener("click", () => {
    slider.classList.remove("moveslider");
    formSection.classList.remove("form-section-move");
    setTimeout(() => {
        login.classList.add("txt-white");
        signup.classList.remove("txt-white");
    }, 350);
});

// Check Full Name
let fullName = document.querySelector("#fullName");
fullName.addEventListener("keyup", () => {
    let fullNameValue = fullName.value;
    let fullNameRegex = /^[a-zA-Z\s]{3,}$/;
    if (fullNameRegex.test(fullNameValue) && fullNameValue.length <= 20) {
        fullName.setCustomValidity("");
    } else {
        if (fullNameValue.length > 20) fullName.setCustomValidity("Name too long");
        else fullName.setCustomValidity("Invalid Name");
    }
});

// Check Email
let email = document.querySelector("#email");
email.addEventListener("keyup", () => {
    let emailValue = email.value;
    let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (emailRegex.test(emailValue)) {
        email.setCustomValidity("");
    } else {
        email.setCustomValidity("Invalid Email Address");
    }
});

// Check Password
let password = document.querySelector("#password");
password.addEventListener("keyup", () => {
    let passwordValue = password.value;
    let check = false;
    let specialChar = /[!@#$%^&*(),.?":{}|<>]/;
    let nos = /[0-9]/;
    let upperCase = /[A-Z]/;
    if (passwordValue.length >= 6 
        && specialChar.test(passwordValue)
        && upperCase.test(passwordValue)
        && nos.test(passwordValue)) {
        check = true;
    }
    if (passwordRegex.test(passwordValue)) {
        password.setCustomValidity("");
    } else {
        password.setCustomValidity("Password must contain at least 8 characters, including UPPER, lowercase and numbers");
    }
});

// Check Confirm Password
let confirmPassword = document.querySelector("#confirmPassword");
let signupSubmit = document.querySelector("#signup");
signupSubmit.disabled = true;
confirmPassword.addEventListener("keyup", () => {
    if (password.value === confirmPassword.value) {
        confirmPassword.setCustomValidity("");
        signupSubmit.disabled = false;
    } else {
        confirmPassword.setCustomValidity("Passwords do not match");
        signupSubmit.disabled = true;
    }
});

let error = document.querySelector(".error");
if (error) {
    error.addEventListener("click", () => {
        error.style.opacity = "0";
    });

    setTimeout(() => {
        error.style.opacity = "0";
    }, 7000);
}

// View Password
let viewPassword = document.querySelector("#signup-pass");

viewPassword.addEventListener("click", () => {
    let password = document.querySelector("#password");
    if (password.type === "password") {
        password.type = "text";
        viewPassword.style.color = "#2f2f2f";
    } else {
        password.type = "password";
        viewPassword.style.color = "#a0a0a0";
    }
});

// View Confirm Password
let viewConfirmPassword = document.querySelector("#signup-pass-confirm");

viewConfirmPassword.addEventListener("click", () => {
    let confirmPassword = document.querySelector("#confirmPassword");
    if (confirmPassword.type === "password") {
        confirmPassword.type = "text";
        viewConfirmPassword.style.color = "#2f2f2f";
    } else {
        confirmPassword.type = "password";
        viewConfirmPassword.style.color = "#a0a0a0";
    }
});

// View Login Password
let viewLoginPassword = document.querySelector("#login-pass");

viewLoginPassword.addEventListener("click", () => {
    let password = document.querySelector("#login-password");
    if (password.type === "password") {
        password.type = "text";
        viewLoginPassword.style.color = "#2f2f2f";
    } else {
        password.type = "password";
        viewLoginPassword.style.color = "#a0a0a0";
    }
});