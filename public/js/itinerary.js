function showLoading() {
    document.getElementById("loading-img").style.display = "block"; // Show the loading img
    document.getElementsByClassName("loader")[0].style.display = "flex"; // Show the loading container
    document.getElementById("genTitle").innerHTML = "Generating your perfect itinerary..."; // Change the title
    // Hide error message
    let err = document.getElementsByClassName('error')[0];
    if (err) err.style.display = "none";
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
    currentDayIndex = (currentDayIndex - 1 + dayDivs.length) % dayDivs.length; // Decrease index (if it's the first day, loop to the last day)
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
    // Show restaraunt container div
    document.getElementById("restaraunt_day_" + day).style.display = "block";
    // Hide all container divs
    document.getElementById("activity_day_" + day).style.display = "none";
    document.getElementById("acomm_day_" + day).style.display = "none";
    document.getElementById("weather_day_" + day).style.display = "none";
}

// Function to show activities
function showActivites(day) {
    // Show activity container div
    document.getElementById("activity_day_" + day).style.display = "block";
    // Hide all container divs
    document.getElementById("restaraunt_day_" + day).style.display = "none";
    document.getElementById("acomm_day_" + day).style.display = "none";
    document.getElementById("weather_day_" + day).style.display = "none";
}

// Function to show accomodations
function showAccom(day) {
    // Show accomodation container div
    document.getElementById("acomm_day_" + day).style.display = "block";
    // Hide all container divs
    document.getElementById("restaraunt_day_" + day).style.display = "none";
    document.getElementById("activity_day_" + day).style.display = "none";
    document.getElementById("weather_day_" + day).style.display = "none";
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

// Booking redirect function
function booking(type, query) {
    let url = (type == "accom") ? `https://www.booking.com/searchresults.en-gb.html?ss=${query}` : `https://www.google.com/search?q=${query}`;
    // Open url in new tab
    window.open(url, "_blank");
}

// replace src of img with placeholder image if it fails to load
function imgError(image) {
    image.onerror = "";
    image.src = "https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg";
    return true;
}