function handleGoogleSignIn() {
    const auth2 = gapi.auth2.getAuthInstance();
    if (!auth2) {
        console.error("Google Auth instance not available.");
        return;
    }

    auth2.signIn().then((user) => {
        const profile = user.getBasicProfile();
        const userInfo = {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            imageUrl: profile.getImageUrl()
        };

        // Save user info to MongoDB via your backend
        saveUserInfoToDB(userInfo);
    }).catch((error) => {
        console.error("Error signing in: ", error);
    });
}

function onLoad() {
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: '932017646849-37s7h70tcggvtkidb8v1u9hipqaa0q1p.apps.googleusercontent.com'
        });
    });
}