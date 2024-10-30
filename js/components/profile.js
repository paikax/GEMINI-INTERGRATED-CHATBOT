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