// Toggle menu visibility
function toggleMenu() {
    const menu = document.getElementById("menu");
    menu.classList.toggle("active");
}

// Open overlay modal and load specific content
function openOverlay(fragment) {
    const overlay = document.getElementById("overlay");
    overlay.classList.add("active");
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove("active"));
    document.getElementById(fragment).classList.add("active");
    window.location.hash = fragment;  // Set URL fragment
}

// Close overlay modal
function closeOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("active");
    window.location.hash = '';  // Remove fragment from URL
}
