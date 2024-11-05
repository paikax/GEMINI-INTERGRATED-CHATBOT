document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById("userInput");
    const promptContainer = document.getElementById("promptContainer");
    const subRecommendations = document.getElementById("subRecommendations");
    const sendButton = document.getElementById("sendButton");
    const helpSection = document.getElementById("helpSection");
    const prompts = ["Code", "Get Advice", "Summarize Text", "Make Plan", "Help Me Write", "Surprise Me"];
    let lastDisplayedSuggestions = [];
    let showAllPrompts = false;

    const detailedSuggestions = {
        "Code": [
            "Write a function in JavaScript 👋",
            "Debug Python code ",
            "Optimize SQL queries",
            "Convert code to another language",
            "Create a RESTful API with Node.js",
            "Add authentication to a web app",
            "Test features with Jest",
            "Write code using MVC architecture",
            "Explain bubble sort algorithm",
            "Write HTML for a contact form",
            "Integrate Google Analytics into a site",
            "Write CSS for responsive design"
        ],
        "Get Advice": [
            "Suggest resources for learning programming",
            "Productivity improvement tips",
            "Career development advice",
            "Work-life balance strategies",
            "How to become a better programmer",
            "Effective programming tools",
            "Optimize study time",
            "Develop teamwork skills",
            "Build critical thinking",
            "Manage tasks and time effectively",
            "Essential soft skills",
            "Personal growth consultancy"
        ],
        "Summarize Text": [
            "Summarize an article on AI",
            "Provide an overview of blockchain",
            "Condense a lengthy report",
            "Summarize a scientific paper",
            "Summarize book content",
            "Extract key information from a document",
            "Condense a long email",
            "Highlight main points from a conference",
            "Summarize a business meeting",
            "Condense project documentation",
            "Market research overview",
            "Summarize a presentation"
        ],
        "Make Plan": [
            "Plan a work project",
            "Guide to creating a study plan",
            "Daily to-do list creation",
            "Organize a personal development plan",
            "Plan for the new week",
            "Build a programming learning path",
            "Create a team project plan",
            "Schedule study sessions",
            "Create a task assignment chart",
            "Design an optimal study schedule",
            "Plan cost-saving strategies",
            "Generate new project ideas"
        ],
        "Help Me Write": [
            "Write a self-introduction",
            "Generate blog post ideas",
            "Create an advertisement",
            "Write product descriptions",
            "Draft a cover letter",
            "Compose a thank you email",
            "List SEO keywords",
            "Write a video script",
            "Write an event invitation",
            "Report project results",
            "Create a social media post",
            "Analyze data in writing"
        ],
        "Surprise Me": [
            "Give me a new challenge",
            "Suggest a creative idea",
            "Provide unexpected advice",
            "Fun tech trivia",
            "An interesting project to try",
            "Experiment with a new language",
            "Mobile app idea",
            "Unique blog topic",
            "Recommend a good podcast",
            "Tell a short story",
            "Suggest a fun riddle",
            "Self-development advice"
        ]
    };

    function displayInitialPrompts() {
        promptContainer.innerHTML = "";
        prompts.slice(0, 4).forEach(prompt => createPromptButton(prompt));
        createPromptButton("More", true);
    }

    function createPromptButton(prompt, isMore = false) {
        const button = document.createElement("button");
        button.classList.add("recommend-btn");
        button.textContent = prompt;
        button.onclick = () => isMore ? toggleAllPrompts() : handlePromptClick(prompt);
        promptContainer.appendChild(button);
    }

    function handlePromptClick(prompt) {
        showSubRecommendations(prompt);
    }

    function toggleAllPrompts() {
        if (showAllPrompts) {
            displayInitialPrompts();
        } else {
            promptContainer.innerHTML = "";
            prompts.forEach(prompt => createPromptButton(prompt));
        }
        showAllPrompts = !showAllPrompts;
    }

    function showSubRecommendations(prompt) {
        const suggestions = detailedSuggestions[prompt];
        let newSuggestions;
        do {
            newSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 4);
        } while (JSON.stringify(newSuggestions) === JSON.stringify(lastDisplayedSuggestions));

        lastDisplayedSuggestions = newSuggestions;

        subRecommendations.innerHTML = "";
        subRecommendations.classList.remove("hide");
        newSuggestions.forEach(suggestion => {
            const suggestionBtn = document.createElement("button");
            suggestionBtn.innerText = suggestion;
            suggestionBtn.onclick = () => {
                userInput.value = suggestion;
                sendButton.disabled = false; // Enable the send button
                togglePromptContainer(); // Toggle prompt container
                closeSubRecommendations();
            };
            subRecommendations.appendChild(suggestionBtn);
        });
    }

    function togglePromptContainer() {
        if (promptContainer.style.display === "none" || promptContainer.style.display === "") {
            promptContainer.style.display = "flex";
        } else {
            promptContainer.style.display = "none";
        }
    }

    userInput.addEventListener("input", () => {
        sendButton.disabled = userInput.value.trim() === "";
        if (userInput.value === "") {
            promptContainer.style.display = "flex"; // Show prompt container
            openSubRecommendations();
        } else {
            promptContainer.style.display = "none"; // Hide prompt container
            closeSubRecommendations();
        }
    });

    // sendButton.onclick = () => {
    //     if (userInput.value.trim() !== "") {
    //         alert(`Message sent: ${userInput.value}`);
    //         userInput.value = "";
    //         sendButton.disabled = true;
    //     }
    // };

    function openSubRecommendations() {
        subRecommendations.style.display = "flex";
        helpSection.classList.remove("hide");
    }

    function closeSubRecommendations() {
        subRecommendations.style.display = "none";
        helpSection.classList.add("hide");
    }

    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && userInput.value.trim() !== "") {
            sendButton.click();
        }
    });

    displayInitialPrompts();
});