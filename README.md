chatbot-app/
├── public/
│   └── index.html             # Main HTML file
├── src/
│   ├── assets/                # Static assets (images, fonts, icons)
│   ├── css/
│   │   └── styles.css         # Main CSS for styling
│   ├── js/
│   │   ├── api/
│   │   │   └── geminiAPI.js   # Handles Gemini API integration and calls
│   │   ├── components/
│   │   │   ├── chatUI.js      # Manages chat window and message display
│   │   │   └── quickReplies.js# Component for quick reply buttons
│   │   ├── utils/
│   │   │   └── helpers.js     # Helper functions (e.g., format responses)
│   │   └── main.js            # Main JavaScript file that initializes the app
│   ├── lang/
│   │   └── languages.json     # JSON for multilingual support
│   └── profiles/
│       └── userProfiles.json  # JSON file to store user preferences & history
├── tests/
│   ├── apiTests.js            # Test Gemini API functionality
│   ├── uiTests.js             # Test UI interactions
│   └── integrationTests.js    # Test the integration of various components
└── README.md                  # Project overview and instructions
