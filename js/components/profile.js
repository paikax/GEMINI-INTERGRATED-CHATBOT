// Function to open the popup
function openPopup() {
    document.getElementById('popup_profile').style.display = 'flex';
}

// Function to close the popup
function closePopup() {
    document.getElementById('popup_profile').style.display = 'none';
}

// Function to dropdown
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}
// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function previewImage(event) {
    const avatarImage = document.getElementById('avatarImage');
    avatarImage.src = URL.createObjectURL(event.target.files[0]);
}

// dark mode
let darkmode = localStorage.getItem('darkmode')
const themeSwitch = document.getElementById('theme-switch')

const enableDarkmode = () => {
    document.body.classList.add('darkmode')
    localStorage.setItem('darkmode', 'active')
}

const disableDarkmode = () => {
    document.body.classList.remove('darkmode')
    localStorage.setItem('darkmode', null)
}

if (darkmode === "active") enableDarkmode()

themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem('darkmode')
    darkmode !== "active" ? enableDarkmode() : disableDarkmode()
})


document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        await fetchUserProfile(userId);
    } else {
        // Handle case where no user is logged in (optional)
        console.log('No user logged in');
    }
});

async function fetchUserProfile(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/user/${userId}`, {
            headers: {

            }
        });

        if (response.ok) {
            const userData = await response.json();
            console.log("User data", userData)
            populateUserProfile(userData);
        } else {
            console.error('Failed to fetch user profile');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

function populateUserProfile(profile) {
    const userEmailInput = document.getElementById('userEmailInput');
    const userNameInput = document.getElementById('userName');
    const genderSelect = document.getElementById('gender');
    userEmailInput.value = profile.email;
    userNameInput.value = profile.fullName;
    genderSelect.value = profile.gender;
}


// update feature
document.getElementById('updateProfileButton').addEventListener('click', async () => {
    const userId = localStorage.getItem('userId');
    const userName = document.getElementById('userName').value;
    const gender = document.getElementById('gender').value;
    const feedbackElement = document.getElementById('updateFeedback');

    if (userId) {
        // Fetch current user profile for comparison
        const response = await fetch(`http://localhost:3000/api/user/${userId}`);
        const currentProfile = await response.json();

        // Check if the input values are the same as the current values
        if (userName === currentProfile.fullName && gender === currentProfile.gender) {
            feedbackElement.textContent = 'No changes made to the profile.';
            feedbackElement.style.color = 'orange'; // Change color to indicate no change
            feedbackElement.style.display = 'block';
            return; // Exit the function early
        }

        const updatedProfile = {
            fullName: userName,
            gender: gender
        };

        try {
            const updateResponse = await fetch(`http://localhost:3000/api/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProfile),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update profile');
            }

            feedbackElement.textContent = 'Profile updated successfully!';
            feedbackElement.style.color = 'green';
            feedbackElement.style.display = 'block';

            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (error) {
            feedbackElement.textContent = 'Error updating profile: ' + error.message;
            feedbackElement.style.color = 'red';
            feedbackElement.style.display = 'block';
        }
    } else {
        console.error('User ID not found in local storage.');
    }
});

function logoutUser() {
    // Clear user data from local storage
    localStorage.removeItem('userId');


    // localStorage.removeItem('userName'); 
    // localStorage.removeItem('userEmail');
    // localStorage.removeItem('userEmail');


    window.location.href = 'https://paikax.github.io/GEMINI-INTERGRATED-CHATBOT/index.html';
}