// Login Pipeline
let loginBtn = document.getElementById('login_login_btn');
loginBtn.addEventListener('click', function () {
    let username = document.getElementById('login_username').value;
    let password = document.getElementById('login_password').value;

    let loginData = {
        username: username,
        password: password
    };

    document.cookie = "";

    axios.post('http://localhost:3000/auth/login', loginData, { withCredentials: true }).then(function (response) {
        window.location.href = '/home';
    }).catch(function (error) {
        showErrorNotification(error.response.data);
    });
});

// Page transitions
let registrationPageTransitionBtn = document.getElementById('login_register_btn');
let loginPageTransitionBtn = document.getElementById('register_back_btn');

loginPageTransitionBtn.addEventListener('click', toggleContainers);
registrationPageTransitionBtn.addEventListener('click', toggleContainers);

function toggleContainers() {
    let loginContainer = document.querySelector('.login-container');
    let registrationContainer = document.querySelector('.register-container');

    loginContainer.classList.toggle('fade-out');
    registrationContainer.classList.toggle('fade-out');

    // clear the search results
    let resultsDiv = document.getElementById('register_university_search_results');

    resultsDiv.innerHTML = '';
    resultsDiv.style.display = 'none';

    // clear the university info
    let universityInfo = document.getElementById('register_university_info');

    universityInfo.style.display = 'none';
    universityInfo.querySelectorAll('input').forEach(function (input) {
        input.value = '';
    });

    let textarea = universityInfo.querySelector('textarea');
    textarea.value = '';

    // clear the university search
    let universitySearch = document.getElementById('register_university_search');

    let universitySearchBar = universitySearch.querySelector('input');

    universitySearch.style.display = 'none';
    universitySearchBar.value = '';

    // clear the user type
    let userType = document.getElementById('register_user_type');

    userType.value = '';

    // clear the location input
    let locationInput = document.getElementById('register_location');
    locationInput.value = '';

    if (loginContainer.classList.contains('fade-out')) {
        loginContainer.style.display = 'none';
        registrationContainer.style.display = 'block';
    } else {
        loginContainer.style.display = 'block';
        registrationContainer.style.display = 'none';
    }
}

function parseUserType() {
    let userType = document.getElementById('register_user_type').value;

    if (userType === '') {
        return -1;
    } else if (userType === 'student') {
        return 0;
    } else if (userType === 'university-staff') {
        return 2;
    }
}

// Register Pipeline
let userChosenUniversity = null;

let registerBtn = document.getElementById('register_register_btn');
registerBtn.addEventListener('click', async function () {
    let userType = parseUserType();

    let registrationForm = {
        userLevel: userType,
    };

    try {
        if (userType === 0) {
            Object.assign(registrationForm, await parseRegistrationFormForStudent());
        } else if (userType === 2) {
            Object.assign(registrationForm, await parseRegistrationFormForUniversityStaff());
        }
    } catch (error) {
        console.log(error);
        return;
    }

    axios.post('http://localhost:3000/auth/register', registrationForm).then(function (response) {
        window.location.href = 'http://localhost:3000/home';
    }).catch(function (error) {
        showErrorNotification(error.response.data);
    });
});

// Parser functions for Registration Form
function parseBaseInfo() {
    let firstName = document.getElementById('register_first_name').value;
    let lastName = document.getElementById('register_last_name').value;
    let username = document.getElementById('register_username').value;
    let email = document.getElementById('register_email').value;
    let password = document.getElementById('register_password').value;

    return {
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
        password: password
    };
}

async function parseRegistrationFormForUniversityStaff() {
    let baseInfo = parseBaseInfo();

    let name = document.getElementById('register_university_name').value;
    let location = document.getElementById('register_location').value;
    let numStudents = document.getElementById('register_num_students').value;
    let description = document.getElementById('register_university_description').value;

    let longitude = location.split(',')[0];
    let latitude = location.split(',')[1];

    // let universities = await performUniversitySearch(name);

    // // Check if university already exists
    // // universities.forEach((university) => { 
    // //     if (university.name.toLowerCase() === name.toLowerCase()) {

    // //     }
    // // });

    return {
        ...baseInfo,
        university: {
            name: name,
            description: description,
            numStudents: numStudents,
            location: {
                address: "",
                longitude: longitude,
                latitude: latitude
            }
        }
    };
}

async function parseRegistrationFormForStudent() {
    let baseInfo = parseBaseInfo();

    if (userChosenUniversity === null) {
        showErrorNotification('Please select a university');
        return;
    }

    return axios.get('http://localhost:3000/universities/' + userChosenUniversity.universityID).then(function (response) {
        return {
            ...baseInfo,
            university: response.data
        };   
    }).catch(function (error) {
        showErrorNotification(error.response.data);
    });
}

// University Searching
let searchInput = document.getElementById('register_university_search_bar');
let searchResults = document.getElementById('register_university_search_results');

searchInput.addEventListener("input", async (event) => {
    const searchTerm = event.target.value.toLowerCase();

    // Clear previous search results
    searchResults.innerHTML = "";

    if (searchTerm.length < 1) {
        searchResults.style.display = "none";
        return;
    }

    let results = await performUniversitySearch(searchTerm);
    displaySearchResults(results);
});

async function performUniversitySearch(searchTerm) {
    return axios.get(`http://localhost:3000/universities`, {
        params: {
            query: searchTerm
        }
    }).then(function (response) {
        return response.data;
    }).catch(function (error) {
        showErrorNotification(error.response.data);
    });
}

function displaySearchResults(results) {
    const filteredUniversities = results.filter((university) =>
        university.name
    );

    filteredUniversities.forEach((university) => {
        const listItem = document.createElement("div");
        listItem.classList.add("register_university_search_result");
        listItem.textContent = university.name;
        listItem.dataset.id = university.id;

        listItem.addEventListener("click", () => {
            userChosenUniversity = results.find((university) => university.name === listItem.textContent);

            searchInput.value = listItem.textContent;
            searchResults.innerHTML = "";
            searchResults.style.display = "none";
        });

        searchResults.appendChild(listItem);
    });

    searchResults.style.display = "block";
}

// User Type Selection
window.showFields = function showFields() {
    var userType = document.getElementById("register_user_type").value;
    var universitySearch = document.getElementById("register_university_search");
    var universityInfo = document.getElementById("register_university_info");

    if (userType === "student") {
        universitySearch.style.display = "block";
        universityInfo.style.display = "none";
    } else if (userType === "university-staff") {
        universitySearch.style.display = "none";
        universityInfo.style.display = "block";
    } else {
        universitySearch.style.display = "none";
        universityInfo.style.display = "none";
    }
}

// Load the Google Maps API
window.initMap = function initMap() {
    // Create a new map object and set the center to a default location
    var map = new google.maps.Map(document.getElementById('register_location_map'), {
        center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        zoom: 8 // Set the initial zoom level
    });

    // Create a new marker object
    var marker = new google.maps.Marker({
        map: map,
        position: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        draggable: true // Allow the user to drag the marker
    });

    // Add an event listener to the marker for when it is dragged
    marker.addListener('dragend', function () {
        // Get the updated position of the marker
        var position = marker.getPosition();

        // Update the input field with the new location
        document.getElementById('register_location').value = position.lat() + ', ' + position.lng();
    });
}

function showErrorNotification(error) {
    // Create the error notification container
    if (error == null) {
        error = "An error has occurred.";
    }

    let errors = Array(error);

    let extractedErrors = errors.reduce((acc, value) => {
        if (typeof value === 'object') {
            const values = Object.values(value).map(value => Object.values(value)[0]);
            return acc.concat(values);
        } else {
            return acc.concat(value);
        }

    }, []);

    extractedErrors.forEach(content => {
        createErrorNotification(content);
    });
}

function getErrorNotificationContainer() {
    let container = document.getElementById("error-notification-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "error-notification-container";
        container.style.position = "fixed";
        container.style.top = "10px";
        container.style.right = "10px";
        container.style.zIndex = "1000";
        document.body.appendChild(container);
    }

    return container;
}

function createErrorNotification(content) {
    const container = getErrorNotificationContainer();

    const errorNotification = document.createElement("div");
    errorNotification.classList.add("error-notification");
    errorNotification.textContent = content;

    // Apply styles to the error notification
    errorNotification.style.padding = "10px";
    errorNotification.style.marginBottom = "10px";
    errorNotification.style.backgroundColor = "#f44336"; // Red background color
    errorNotification.style.color = "white";
    errorNotification.style.borderRadius = "4px";
    errorNotification.style.fontFamily = "Arial, sans-serif";
    errorNotification.style.fontSize = "14px";

    container.appendChild(errorNotification);

    // Remove the error notification after 3 seconds
    setTimeout(() => {
        errorNotification.remove();
    }, 3000);
}