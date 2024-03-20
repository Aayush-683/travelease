function showLoading() {
    document.getElementsByClassName("form-container")[0].style.display =
        "none"; // Hide the form
    document.getElementById("loading-img").style.display = "block"; // Show the loading img
    document.getElementById("loader").style.display = "flex"; // Show the loading container
    document.getElementById("genTitle").innerHTML =
        "Generating your perfect itinerary..."; // Change the title
    return true; // Continue with the form submission (return false to cancel the submission)
}

var currentDayIndex = 0; // Current day index

// Get all days and hide all except the first day
var dayDivs = document.querySelectorAll('[class^="day"]');
for (var i = 1; i < dayDivs.length; i++) {
    dayDivs[i].style.display = "none";
}

// Function to show the previous day
function showPreviousDay() {
    console.log(currentDayIndex, dayDivs.length)
    dayDivs[currentDayIndex].style.display = "none";
    currentDayIndex =
        (currentDayIndex - 1 + dayDivs.length) % dayDivs.length; // Decrease index (if it's the first day, loop to the last day)
    dayDivs[currentDayIndex].style.display = "block";
}

// Function to show the next day
function showNextDay() {
    console.log(currentDayIndex, dayDivs.length)
    dayDivs[currentDayIndex].style.display = "none";
    currentDayIndex = (currentDayIndex + 1) % dayDivs.length; // Increase index (if it's the last day, loop to the first day)
    dayDivs[currentDayIndex].style.display = "block";
}

// Get all containers and hide all except the first container
var containerDivs = document.querySelectorAll('[class^="container"]');
for (var i = 0; i < containerDivs.length; i++) {
    if (containerDivs[i].id.includes("restaraunt")) {
        containerDivs[i].style.display = "block";
    } else {
        containerDivs[i].style.display = "none";
    }
}

// Function to show restaraunts
function showRestaraunt(day) {
    // Hide all container divs
    document.getElementById("activity_day_" + day).style.display = "none";
    document.getElementById("acomm_day_" + day).style.display = "none";
    document.getElementById("weather_day_" + day).style.display = "none";
    // Show restaraunt container div
    document.getElementById("restaraunt_day_" + day).style.display =
        "block";
}

// Function to show activities
function showActivites(day) {
    // Hide all container divs
    document.getElementById("restaraunt_day_" + day).style.display = "none";
    document.getElementById("acomm_day_" + day).style.display = "none";
    document.getElementById("weather_day_" + day).style.display = "none";
    // Show activity container div
    document.getElementById("activity_day_" + day).style.display = "block";
}

// Function to show accomodations
function showAccom(day) {
    // Hide all container divs
    document.getElementById("restaraunt_day_" + day).style.display = "none";
    document.getElementById("activity_day_" + day).style.display = "none";
    document.getElementById("weather_day_" + day).style.display = "none";
    // Show accomodation container div
    document.getElementById("acomm_day_" + day).style.display = "block";
}

// Function to show weather
function showWeather(day) {
    // Hide all container divs
    document.getElementById("restaraunt_day_" + day).style.display = "none";
    document.getElementById("activity_day_" + day).style.display = "none";
    document.getElementById("acomm_day_" + day).style.display = "none";
    // Show weather container div
    document.getElementById("weather_day_" + day).style.display = "block";
}