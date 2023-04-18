// Get references to the menu items and content areas
const eventsLink = document.querySelector('a[href="#events"]');
const rsoLink = document.querySelector('a[href="#rso"]');
const profileLink = document.querySelector('a[href="#profile"]');

const eventsContent = document.getElementById('events');
const rsoContent = document.getElementById('rso');
const profileContent = document.getElementById('profile');

let activeEvent = null;
let activeRSO = null;

const dropdownButton = document.querySelector('.custom-dropdown-button');
const dropdownMenu = document.querySelector('.custom-dropdown-menu');
const dropdownOptions = document.querySelectorAll('.custom-dropdown-option');

dropdownButton.addEventListener('click', function () {
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

let currentSelectedType = null;

dropdownOptions.forEach(function (option) {
    option.addEventListener('click', async function () {
        dropdownButton.textContent = option.textContent;
        dropdownMenu.style.display = 'none';

        // Get the value of the selected option
        currentSelectedType = option.getAttribute('data-value');

        // Call the fetchEvents function with the selected type
        await fetchEvents(currentSelectedType);
    });
});

// Close the dropdown when clicking outside of it
window.addEventListener('click', function (event) {
    if (!event.target.matches('.custom-dropdown-button')) {
        dropdownMenu.style.display = 'none';
    }
});

// Add click event listeners to menu items
eventsLink.addEventListener('click', () => {
    eventsContent.style.display = 'block';
    rsoContent.style.display = 'none';
    profileContent.style.display = 'none';
});

rsoLink.addEventListener('click', () => {
    eventsContent.style.display = 'none';
    rsoContent.style.display = 'block';
    profileContent.style.display = 'none';

    rsoSearchBar.dispatchEvent(new Event('input'));
});

profileLink.addEventListener('click', async () => {
    eventsContent.style.display = 'none';
    rsoContent.style.display = 'none';
    profileContent.style.display = 'block';

    await showUserInfo();
});

async function showUserInfo() {
    let user = await getUser();
    profileContent.innerHTML = '';

    const div = document.createElement('div');

    const fields = [
        { label: 'ID', value: user.userID },
        { label: 'Username', value: user.username },
        { label: 'First Name', value: user.firstName },
        { label: 'Last Name', value: user.lastName },
        { label: 'Last Seen', value: new Date(user.lastSeen) },
        { label: 'Email', value: user.email },
        { label: 'User Level', value: user.userLevel === 0 ? 'Student' : 'Admin' },
        { label: 'University Affiliation', value: user.universityAffiliation.organizationName },
    ];

    fields.forEach(field => {
        const fieldDiv = document.createElement('div');
        const label = document.createElement('label');

        label.textContent = `${field.label}: ${field.value}`;

        fieldDiv.appendChild(label);

        div.appendChild(fieldDiv);
    });

    const button = document.createElement('button');

    button.textContent = 'Logout';
    button.classList.add("button");

    button.addEventListener('click', async () => {
        axios.get('http://localhost:3000/auth/logout', {}, { withCredentials: true }).then(async (response) => {
            window.location.href = '/';
        }).catch((error) => {
            showErrorNotification(error.response.data);
        });
    });

    div.appendChild(button);

    profileContent.appendChild(div);
}


// const eventTypeFilter = document.getElementById("event_type_filter");
const deleteEventBtn = document.getElementById("delete_event_popup");
const eventList = document.getElementById("event_list");

deleteEventBtn.addEventListener('click', async () => {
    if (activeEvent == null) {
        throw Error("No event selected");
    }

    axios.delete('http://localhost:3000/events/' + activeEvent.eventID, { withCredentials: true }).then(async (response) => {
        closeButton.click();
        await fetchEvents(currentSelectedType)
        // eventTypeFilter.dispatchEvent(new Event('change'));
    }).catch((error) => {
        showErrorNotification(error.response.data);
    });
});

async function getUser() {
    return axios.get('http://localhost:3000/users', { withCredentials: true }).then((response) => {
        return response.data;
    }).catch((error) => {
        showErrorNotification(error.response.data);
    });
}

const createEvent = document.getElementById("create_new_event_create");
const eventName = document.getElementById("create_new_event_name");
const eventDescription = document.getElementById("create_new_event_description");
const eventDate = document.getElementById("create_new_event_date");
const eventCategory = document.getElementById("create_new_event_category");
const eventEmail = document.getElementById("create_new_event_email");
const eventPhone = document.getElementById("create_new_event_phone");
const eventLocation = document.getElementById("create_new_event_location");

const hostTypeSelect = document.getElementById("create_new_event_type_select");


createEvent.addEventListener('click', async () => {
    let longitude = eventLocation.value.split(",")[0];
    let latitude = eventLocation.value.split(",")[1];

    let hostType = -1;

    let hostID;

    if (hostTypeSelect.value == "public") {
        hostType = 0;
        hostID = (await getUser()).userID;
    } else if (hostTypeSelect.value == "rso") {
        hostType = 1;
        hostID = document.getElementById("create_new_event_rso_select").value;
    } else if (hostTypeSelect.value == "university") {
        hostType = 2;
        hostID = (await getUser()).universityAffiliation.organizationID;
    }

    const event = {
        name: eventName.value,
        description: eventDescription.value,
        date: new Date(eventDate.value).getTime(),
        category: eventCategory.value,
        email: eventEmail.value,
        phone: eventPhone.value,
        location: {
            longitude: longitude,
            latitude: latitude,
            address: ""
        },
        hostID: hostID,
        hostType: hostType
    };

    axios.post('http://localhost:3000/events', event, { withCredentials: true }).then(async (response) => {
        await fetchEvents(currentSelectedType)
        createEventCloseButton.click();
    }).catch((error) => {
        showErrorNotification(error.response.data);
    });
});

// Load the Google Maps API
window.initMap = function () {
    // Create a new map object and set the center to a default location
    var map = new google.maps.Map(document.getElementById('create_new_event_location_map'), {
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
        document.getElementById('create_new_event_location').value = position.lat() + ', ' + position.lng();
    });
}

async function fetchComments(eventID) {
    return axios.get('http://localhost:3000/events/' + eventID + '/comments', { withCredentials: true }).then((response) => {
        return response.data;
    }).catch((error) => {
        showErrorNotification(error.response.data);
    });
}

async function displayComments(event) {
    const comments = await fetchComments(event.eventID);

    const commentsContainer = document.getElementById("comment-container");

    commentsContainer.innerHTML = "";

    let header = document.createElement("h3");
    header.textContent = "Comments:";

    commentsContainer.appendChild(header);

    const currentUser = await getUser();

    comments.forEach(comment => {
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("comment");

        const authorP = document.createElement("p");
        authorP.classList.add("comment-author");
        authorP.textContent = `${comment.username}:`;
        commentDiv.appendChild(authorP);

        const contentP = document.createElement("textarea");
        contentP.classList.add("readonly-comment");

        contentP.textContent = comment.content;

        contentP.setAttribute("readonly", true);

        commentDiv.appendChild(contentP);

        if (comment.userID === currentUser.userID) {
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("comment-button-container");

            const editButton = document.createElement("button");
            editButton.classList.add("comment-edit-button");
            editButton.textContent = "Edit";

            editButton.addEventListener("click", () => {
                contentP.removeAttribute("readonly");
                contentP.focus();

                editButton.textContent = "Save";

                editButton.removeEventListener("click", editButton.click);

                editButton.addEventListener("click", async () => {
                    comment.content = contentP.value;
                    axios.post('http://localhost:3000/events/' + event.eventID + '/comments/' + comment.commentID, {
                        content: comment.content
                    }, { withCredentials: true }).then(async () => {
                        await displayComments(event);
                    }).catch((error) => {
                        showErrorNotification(error.response.data);
                    });
                });
            });

            buttonContainer.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("comment-delete-button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", async () => {
                axios.delete('http://localhost:3000/events/' + event.eventID + '/comments/' + comment.commentID, { withCredentials: true }).then(async () => {
                    await displayComments(event);
                }).catch((error) => {
                    showErrorNotification(error.response.data);
                });
            });

            buttonContainer.appendChild(deleteButton);

            commentDiv.appendChild(buttonContainer);
        }

        commentsContainer.appendChild(commentDiv);
    });
}
const commentBtn = document.getElementById("send_comment_btn");
const commentForm = document.getElementById("comment");

commentBtn.addEventListener("click", async (e) => {
    const comment = commentForm.value;
    axios.post('http://localhost:3000/events/' + activeEvent.eventID + '/comments', { content: comment }, { withCredentials: true })
        .then(async (response) => {
            await displayComments(activeEvent);
        }).catch((error) => {
            showErrorNotification(error.response.data)
        });
});

async function showEventPopup(event) {
    const eventPopup = document.getElementById("event_popup");
    activeEvent = event;

    let eventType = "";

    if (event.hostType == 0) {
        eventType = "Public";
    } else if (event.hostType == 1) {
        eventType = "RSO";
    } else if (event.hostType == 2) {
        eventType = "University";
    }

    let eventLocation = event.location.longitude + ", " + event.location.latitude;

    // Populate the event popup with event details
    document.getElementById("event_name").textContent = event.name;
    document.getElementById("event_type").textContent = `Type: ${eventType}`
    document.getElementById("event_date").textContent = `Date: ${new Date(event.date).toLocaleDateString()}`;
    document.getElementById("event_category").textContent = `Category: ${event.category}`;
    document.getElementById("event_description").textContent = `Description: ${event.description}`;
    document.getElementById("event_email").textContent = `Email: ${event.email}`;
    document.getElementById("event_phone").textContent = `Phone: ${event.phone}`;
    document.getElementById("event_location").textContent = `Location: ${eventLocation}`;

    commentForm.value = "";

    await displayComments(activeEvent);

    // Display the event popup
    eventPopup.style.display = "block";
};

function showErrorNotification(error) {
    // Create the error notification container
    if (error == null) {
        error = "An error has occurred.";
    }

    let errors = Array(error);

    let extractedErrors = errors.reduce((acc, value) => {
        console.log();

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


function generateEventItems(events) {
    // Clear the events list
    eventList.innerHTML = "";

    // Create and insert event items into the events list
    for (const event of events) {
        const eventItem = document.createElement("div");
        eventItem.classList.add("list-item");

        eventItem.addEventListener("mouseover", (e) => {
            e.stopPropagation();
            eventItem.classList.add("list-item-hover");
        });

        eventItem.addEventListener("mouseout", (e) => {
            e.stopPropagation();
            eventItem.classList.remove("list-item-hover");
        });

        const eventLabel = document.createElement("label");
        eventLabel.textContent = event.name;

        eventItem.addEventListener("click", (e) => {
            e.preventDefault();
            showEventPopup(event);
        });

        eventItem.appendChild(eventLabel);
        eventList.appendChild(eventItem);
    }
};

async function fetchEvents(selectedType) {
    let result = [];

    switch (selectedType) {
        case "public":
            // Perform action for public events
            result = await performEventSearch(0);
            eventList.style.display = "block";
            break;
        case "university":
            // Perform action for university events
            result = await performEventSearch(2);
            eventList.style.display = "block";
            break;
        case "rso":
            // Perform action for RSO events
            result = await performEventSearch(1);
            eventList.style.display = "block";
            break;
        default:
            // Perform action for no selection or invalid selection
            eventList.style.display = "none";
    }

    generateEventItems(result);
}

// get events from the server
async function performEventSearch(hostType) {
    return axios.get('http://localhost:3000/events', {
        params: {
            hostType: hostType
        }
    }, { withCredentials: true }).then(function (response) {
        console.log(response.data);
        return response.data;
    }).catch(function (error) {
        showErrorNotification(error.response.data);
    });
}


// get all the event items
const eventItems = document.querySelectorAll('.event-item');

// get the popup element
const popup = document.getElementById('event_popup');

// loop through the event items and add a click event listener to each one
eventItems.forEach(eventItem => {
    eventItem.addEventListener('click', () => {
        // show the popup
        popup.style.display = 'block';
    });
});

// get the close button element inside the popup
const closeButton = document.getElementById('close_event_popup');

// add a click event listener to the close button to hide the popup
closeButton.addEventListener('click', () => {
    activeEvent = null;
    popup.style.display = 'none';
});

// get the create event button
const createEventButton = document.getElementById('create_new_event_btn');

// get the create event popup
const createEventPopup = document.getElementById('new_event_popup');

// add a click event listener to the create event button to show the popup
createEventButton.addEventListener('click', () => {
    createEventPopup.style.display = 'block';
});

const rso_select = document.getElementById('create_new_event_rso_select_container');
const type_select = document.getElementById('create_new_event_type_select');

function getUserRSO() {
    return axios.get('http://localhost:3000/rsos', {
        params: {
            userRSOS: true
        }
    }, { withCredentials: true }).then(function (response) {
        return response.data;
    }).catch(function (error) {
        showErrorNotification(error.response.data);
    });
}

let userRSO = [];

type_select.addEventListener('change', async () => {
    if (type_select.value === 'rso') {
        const selectElement = document.createElement('select');

        selectElement.id = 'create_new_event_rso_select';
        selectElement.name = 'rso';

        userRSO = await getUserRSO();

        let options = userRSO.map((rso) => {
            return { id: rso.rsoID, name: rso.name };
        });

        options.unshift({ id: '', name: 'Select RSO' });

        options.forEach((optionData) => {
            const optionElement = document.createElement('option');
            optionElement.value = optionData.id;
            optionElement.textContent = optionData.name;
            selectElement.appendChild(optionElement);
        });

        const container = rso_select;
        container.appendChild(selectElement);

        rso_select.style.display = 'block';
    } else {
        rso_select.style.display = 'none';

        if (document.getElementById("create_new_event_rso_select")) {
            document.getElementById("create_new_event_rso_select").remove();
        }
    }
});

// get the close button element inside the popup
const createEventCloseButton = document.getElementById('create_new_event_close')

// add a click event listener to the close button to hide the popup
createEventCloseButton.addEventListener('click', () => {
    eventName.value = '';
    eventDescription.value = '';
    eventDate.value = '';
    eventCategory.value = '';
    eventEmail.value = '';
    eventPhone.value = '';
    eventLocation.value = '';
    hostTypeSelect.value = '';

    createEventPopup.style.display = 'none';
});

const createNewButton = document.getElementById("create-new-button");
const rsoPopup = document.getElementById("rso_popup");
const addMember = document.getElementById("add-member");
const membersList = document.getElementById("members-list");
const createRso = document.getElementById("create-rso");

createNewButton.addEventListener("click", () => {
    rsoPopup.style.display = "block";
});

addMember.addEventListener("click", () => {
    const memberId = document.getElementById("member-id").value;

    if (!memberId) {
        return;
    }

    const li = document.createElement("li");
    li.classList.add("member");

    const span = document.createElement("span");
    span.textContent = memberId;
    li.appendChild(span);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
        li.remove();
    });
    li.appendChild(deleteButton);

    const makeLeaderButton = document.createElement("button");
    makeLeaderButton.textContent = "Make Leader";
    makeLeaderButton.addEventListener("click", () => {
        const allLeaderButtons = document.querySelectorAll(".member .leader");

        allLeaderButtons.forEach((button) => {
            button.classList.remove("leader");
            button.textContent = "Make Leader";
        });
        makeLeaderButton.classList.add("leader");
        makeLeaderButton.textContent = "Leader";
    });

    li.appendChild(makeLeaderButton);

    membersList.appendChild(li);
});

createRso.addEventListener("click", async () => {
    const rsoName = document.getElementById("rso-name").value;
    const rsoDescription = document.getElementById("rso-description").value;
    const members = [];

    let user = await getUser();
    const allMembers = document.querySelectorAll(".member");

    allMembers.forEach((member) => {
        const memberId = member.querySelector("span").textContent;
        const isLeader = member.querySelector(".leader") !== null;

        members.push({ userID: memberId, memberType: isLeader ? 1 : 0 });
    });

    axios.post('http://localhost:3000/rsos', {
        name: rsoName,
        description: rsoDescription,
        members: members,
        universityID: user.universityAffiliation.organizationID
    }, { withCredentials: true }).then(function (response) {
        rsoPopup.style.display = "none";

        rsoSearchBar.dispatchEvent(new Event('input'));

        document.getElementById("rso-name").value = "";
        document.getElementById("rso-description").value = "";
        document.getElementById("member-id").value = "";
        membersList.innerHTML = "";
    }).catch(function (error) {
        showErrorNotification(error.response.data);
    });
});

const rsoList = document.getElementById("rso_list");
const rsoSearchBar = document.getElementById("rso-search-bar");

rsoSearchBar.addEventListener("input", () => {
    let rsoSearchInput = rsoSearchBar.value;

    rsoList.innerHTML = "";

    axios.get('http://localhost:3000/rsos', {
        params: {
            query: rsoSearchInput
        }
    }, { withCredentials: true }).then(async function (response) {
        console.log(response.data);

        userRSO = await getUserRSO();

        response.data.forEach((rso) => {

            const rsoItem = document.createElement("div");
            rsoItem.classList.add("list-item");

            const rsoLabel = document.createElement("label");
            rsoLabel.textContent = rso.name;
            rsoItem.appendChild(rsoLabel);

            const button = document.createElement("button");
            button.classList.add("rso-button");

            button.addEventListener("mouseover", (e) => {
                e.stopPropagation();
                rsoItem.classList.remove("list-item-hover");
            });

            button.addEventListener("mouseout", (e) => {
                e.stopPropagation();
                rsoItem.classList.add("list-item-hover");
            });

            rsoItem.addEventListener("mouseover", (e) => {
                e.stopPropagation();
                rsoItem.classList.add("list-item-hover");
            });

            rsoItem.addEventListener("mouseout", (e) => {
                e.stopPropagation();
                rsoItem.classList.remove("list-item-hover");
            });

            if (userRSO.some((userRso) => userRso.rsoID === rso.rsoID)) {
                button.textContent = "Leave";

                button.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    leaveRSO(rso);
                });
            } else {
                button.textContent = "Join";

                button.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    joinRSO(rso);
                });
            }

            rsoItem.addEventListener("click", (e) => {
                e.preventDefault();
                showRSOPopup(rso);
            });

            rsoItem.appendChild(button);

            rsoList.appendChild(rsoItem);
        });

        rsoList.style.display = "block";
    }).catch(function (error) {
        showErrorNotification(error.response.data);
    });
});

const deleteRSOButton = document.getElementById("delete_rso_popup");
const closeRSOButton = document.getElementById("close_rso_popup");

deleteRSOButton.addEventListener("click", () => {
    axios.delete(`http://localhost:3000/rsos/${activeRSO.rsoID}`, { withCredentials: true }).then(function (response) {
        closeRSOButton.click();
    }).catch(function (error) {
        showErrorNotification(error.response.data);
    });
});

closeRSOButton.addEventListener("click", () => {
    document.getElementById("rso_item_popup").style.display = "none";
    activeRSO = null;
});

function showRSOPopup(rso) {
    activeRSO = rso;
    const rsoPopup = document.getElementById("rso_item_popup");
    const rsoName = document.getElementById("rso_name");
    const rsoDescription = document.getElementById("rso_description");
    const rsoMembers = document.getElementById("rso_members");

    rsoName.textContent = rso.name;
    rsoDescription.textContent = rso.description;

    rsoMembers.innerHTML = "";

    rso.members.forEach(async (member) => {
        const memberItem = document.createElement("div");
        memberItem.classList.add("list-item");

        const memberLabel = document.createElement("label");

        try {
            let user = (await axios.get(`http://localhost:3000/users/${member.userID}`, { withCredentials: true })).data;
            memberLabel.textContent = user.username;
            memberItem.appendChild(memberLabel);

            const memberType = document.createElement("label");
            memberType.textContent = member.memberType === 0 ? "Member" : "Leader";
            memberItem.appendChild(memberType);

            rsoMembers.appendChild(memberItem);
        } catch (error) {
            showErrorNotification(error.response.data);
        };
    });

    rsoPopup.style.display = "block";
}

function leaveRSO(rso) {
    axios.get(`http://localhost:3000/rsos/${rso.rsoID}/leave`, { withCredentials: true }).then(function (response) {
        rsoSearchBar.dispatchEvent(new Event("input"));
    }).catch(function (error) {
        showErrorNotification(error.response.data);
    });
}

function joinRSO(rso) {
    axios.get(`http://localhost:3000/rsos/${rso.rsoID}/enter`, { withCredentials: true }).then(function (response) {
        rsoSearchBar.dispatchEvent(new Event("input"));
    }).catch(function (error) {
        showErrorNotification(error.response.data);
    });
}

const close_rso_create_popup = document.getElementById("close_rso_create_popup");

close_rso_create_popup.addEventListener("click", (event) => {
    rsoPopup.style.display = "none";
});
