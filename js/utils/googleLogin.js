function onLoad() {
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: '932017646849-37s7h70tcggvtkidb8v1u9hipqaa0q1p.apps.googleusercontent.com', // Replace with your Client ID
        });
    });
}

function signIn() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(onSignIn);
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());

    // Here you can send the ID token to your server for further processing
    var id_token = googleUser.getAuthResponse().id_token;
    console.log('ID Token: ' + id_token);
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}
