
const conversationHistory = [];
const chatList = document.getElementById('chatList');
const newChatButton = document.getElementById('newChatButton');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const suggestionBox = document.getElementById('suggestionBox');
const promptContainer = document.getElementById("promptContainer");
const subRecommendations = document.getElementById("subRecommendations");
const helpSection = document.getElementById("helpSection");

sendButton.disabled = true;

// Conversation list
function generateChatId() {
    return 'chat_' + Date.now();
}

userInput.addEventListener('input', () => {
    if (userInput.value.trim() === '') {
        sendButton.disabled = true; // Disable the button if input is empty
    } else {
        sendButton.disabled = false; // Enable the button if input is not empty
    }
});

function disableInput() {
    userInput.disabled = true;
    sendButton.disabled = true;
    userInput.classList.add('disabled'); // Optional: Add a CSS class for a grayed-out effect
    sendButton.classList.add('disabled'); // Optional: Add a CSS class for a grayed-out effect
}
// Function to enable input and send button
function enableInput() {
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.classList.remove('disabled'); // Optional: Remove the CSS class
    sendButton.classList.remove('disabled'); // Optional: Remove the CSS class
}

function saveCurrentChatIdToLocalStorage(chatId) {
    localStorage.setItem("currentChatId", chatId);
}

function getCurrentChatIdFromLocalStorage() {
    const currentChatId = localStorage.getItem("currentChatId")
    if (currentChatId === 'null') return null;
    return currentChatId;
}



// Function to save chat history to local storage
// function saveChatToLocalStorage(chatId, conversation) {
//     const allChats = JSON.parse(localStorage.getItem('allChats')) || {};
//     allChats[chatId] = {
//         id: chatId,
//         title: getConversationTitle(conversation),
//         messages: conversation,
//         timestamp: Date.now()
//     };
//     localStorage.setItem('allChats', JSON.stringify(allChats));
// }


// Function to save chat history to MongoDB
async function saveChatToDatabase(chatId, conversation, userId) {
    try {
        // Transform the conversation messages to the MongoDB format
        const messages = conversation.map(msg => ({
            content: msg.content,
            fromUser: msg.role === 'user',
            timestamp: new Date(msg.datetime)
        }));

        const response = await fetch('https://gemini-intergrated-chatbot.onrender.com/api/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                sessionId: chatId,
                message: messages[messages.length - 1], // Send only the last message
                title: getConversationTitle(conversation),
                timestamp: Date.now(),
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save chat to database');
        }
    } catch (error) {
        console.error("Error saving chat to MongoDB:", error);
    }
}


// Function to get a title from the first user message
function getConversationTitle(conversation) {
    const firstUserMessage = conversation.find(msg => msg.role === 'user');
    if (firstUserMessage) {
        const title = firstUserMessage.content.slice(0, 30);
        return title.length < firstUserMessage.content.length ? title + '...' : title;
    }
    return 'New Chat';
}


async function loadChatsFromMongoDB(userId) {
    try {
        const response = await fetch(`https://gemini-intergrated-chatbot.onrender.com/api/conversations/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load chats');
        }

        const chats = await response.json();

        return chats; // Return the fetched chats from MongoDB
    } catch (error) {
        console.error("Error loading chats from MongoDB:", error);
        return []; // Return an empty array if there's an error
    }
}




// Function to render chat list
async function renderChatList() {
    
    chatList.innerHTML = '';
    const userId = localStorage.getItem('userId');
    const allChats = await loadChatsFromMongoDB(userId); // Fetch chats from MongoDB

    allChats
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // Sort by updatedAt
        .forEach(chat => {
            const chatElement = document.createElement('li');
            chatElement.classList.add('chat-item');
            
            const currentChatId = getCurrentChatIdFromLocalStorage();
            if (chat.sessionId === currentChatId) {
                chatElement.classList.add('active');
            } else {
                chatElement.classList.remove('active');
            }

            chatElement.innerHTML = `
                <span class="chat-title">${chat.title}</span>
                <button class="delete-chat-btn">×</button>
            `;

            chatElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-chat-btn')) {
                  saveCurrentChatIdToLocalStorage(chat.sessionId);
                  loadChat(chat._id);
                  renderChatList(); // Re-render the chat list to update the active state
                }
              });
            chatElement.querySelector('.delete-chat-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteChat(chat._id); // Use the MongoDB ID for deleting the chat
            });

            chatList.appendChild(chatElement);
        });
}

// Function to load a specific chat based on chat ID
async function loadChat(chatId) {
    const userId = localStorage.getItem('userId');
    const allChats = await loadChatsFromMongoDB(userId);


    // Find the specific chat using its MongoDB ID
    const chat = allChats.find(chat => chat._id === chatId);

    if (chat) {
        // Clear existing conversation history and messages
        conversationHistory.length = 0;
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        // Process and display each message
        chat.messages.forEach(message => {
            // Create wrapper for message alignment
            const messageWrapper = document.createElement('div');
            messageWrapper.classList.add('message-wrapper');

            // Create and set up avatar
            const avatar = document.createElement('img');
            avatar.classList.add('avatar', message.fromUser ? 'user-avatar' : 'bot-avatar');
            avatar.src = message.fromUser 
                ? 'https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png' 
                : '../src/img/robot-assistant.png';
            avatar.alt = message.fromUser ? 'User Avatar' : 'Bot Avatar';

            // Create message element
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message', message.fromUser ? 'user-message' : 'bot-message');

            if (message.fromUser) {
                // Handle user message
                messageElement.textContent = message.content;
                
                // Add to conversation history
                conversationHistory.push({
                    role: 'user',
                    content: message.content,
                    datetime: message.timestamp
                });
            } else {
                // Handle bot message
                const messageContainer = document.createElement('div');
                messageContainer.classList.add('message-content');

                const segments = parseContent(message.content);
                segments.forEach(segment => {
                    if (segment.type === 'code') {
                        const codeContainer = createCodeSnippet(segment.language || 'plaintext', segment.content.trim());
                        messageContainer.appendChild(codeContainer);
                        const codeElement = codeContainer.querySelector('code');
                        if (codeElement) {
                            hljs.highlightElement(codeElement);
                        }
                    } else {
                        const textBlock = document.createElement('div');
                        textBlock.classList.add('text-block');
                        textBlock.innerHTML = parseMarkdown(segment.content);
                        messageContainer.appendChild(textBlock);
                    }
                });

                messageElement.appendChild(messageContainer);
                addReadAloudAndCopyButtons(messageElement, message.content);

                // Add to conversation history
                conversationHistory.push({
                    role: 'bot',
                    content: message.content,
                    datetime: message.timestamp
                });
            }

            // Assemble and append the message
            messageWrapper.appendChild(avatar);
            messageWrapper.appendChild(messageElement);
            chatMessages.appendChild(messageWrapper);
        });

        // Hide prompt container and close recommendations
        promptContainer.style.display = "none";
        closeSubRecommendations();
        
        // Scroll to the bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}



async function deleteChat(chatId) {
    const confirmation = confirm("Are you sure you want to delete this chat?");
    if (!confirmation) return;

    const userId = localStorage.getItem("userId");
    const allChats = await loadChatsFromMongoDB(userId);


    // Assuming allChats is an array and you want to remove an item by ID
    const chatIndex = allChats.findIndex(chat => chat.chatId === chatId);
    if (chatIndex > -1) {
        allChats.splice(chatIndex, 1); // Remove the chat
        localStorage.setItem('allChats', JSON.stringify(allChats));
    }

    try {
        const response = await fetch(`https://gemini-intergrated-chatbot.onrender.com/api/delete-chat/${chatId}`, {
            method: 'DELETE',
        });

        console.log('Response status:', response.status); // Log the response status for debugging

        if (!response.ok) {
            throw new Error('Failed to delete chat from server');
        }

        if (getCurrentChatIdFromLocalStorage() === chatId) {
            saveCurrentChatIdToLocalStorage(null);
            conversationHistory.length = 0;
            document.getElementById('chatMessages').innerHTML = '';
        }

        renderChatList(userId); // Pass userId to renderChatList

    } catch (error) {
        console.error('Error deleting chat:', error);
    }
}




function parseMarkdown(text) {
    // Handle bold text with ** or __
    text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<span class="emphasized">$1$2</span>');
    // Handle italic text with * or _
    text = text.replace(/\*(.*?)\*|_(.*?)_/g, '<span class="italicized">$1$2</span>');
    return text;
}


async function simulateTyping(container, content, typingSpeed = 5) {

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    container.appendChild(messageContent);

    const segments = parseContent(content);

    for (const segment of segments) {
        if (segment.type === 'code') {
            const fullCode = segment.content.trim();
            const codeContainer = createCodeSnippet(segment.language || 'plaintext', fullCode);
            messageContent.appendChild(codeContainer);
            const codeElement = codeContainer.querySelector('code');

            // Clear the code element initially
            codeElement.textContent = '';

            // Type out the code
            for (let i = 0; i < fullCode.length; i++) {
                codeElement.textContent += fullCode[i];
                hljs.highlightElement(codeElement);
                await new Promise(resolve => setTimeout(resolve, typingSpeed / 2));
            }
        } else {
            const textBlock = document.createElement('div');
            textBlock.classList.add('text-block');
            messageContent.appendChild(textBlock);

            const parsedContent = parseMarkdown(segment.content);
            textBlock.innerHTML = '';

            const temp = document.createElement('div');
            temp.innerHTML = parsedContent;
            const textContent = temp.textContent;

            let currentHtml = '';
            for (let i = 0; i < textContent.length; i++) {
                currentHtml += textContent[i];
                textBlock.innerHTML = parseMarkdown(currentHtml);
                await new Promise(resolve => setTimeout(resolve, typingSpeed));
            }
        }
    }
}

function parseContent(content) {
    const segments = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        // Add text before code block if exists
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                content: content.substring(lastIndex, match.index)
            });
        }

        // Add code block
        segments.push({
            type: 'code',
            language: match[1],
            content: match[2]
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text if exists
    if (lastIndex < content.length) {
        segments.push({
            type: 'text',
            content: content.substring(lastIndex)
        });
    }

    return segments;
}

function createCodeSnippet(language, code) {
    const container = document.createElement('div');
    container.classList.add('code-snippet-container');

    const header = document.createElement('div');
    header.classList.add('code-header');

    const langDisplay = document.createElement('span');
    langDisplay.classList.add('code-language');
    langDisplay.textContent = language || 'plaintext';
    header.appendChild(langDisplay);

    const copyButton = document.createElement('button');
    copyButton.classList.add('copy-button');
    copyButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
    `;

    // Store the code content as a data attribute
    container.dataset.codeContent = code;

    copyButton.addEventListener('click', async () => {
        try {
            // Get the code from the data attribute instead of the parameter
            const codeToCopy = container.dataset.codeContent;
            await navigator.clipboard.writeText(codeToCopy);
            copyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Copied!</span>
            `;
            copyButton.classList.add('copied');

            setTimeout(() => {
                copyButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy</span>
                `;
                copyButton.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    });

    header.appendChild(copyButton);
    container.appendChild(header);

    const codeContent = document.createElement('div');
    codeContent.classList.add('code-content');

    const pre = document.createElement('pre');
    const codeElement = document.createElement('code');
    if (language) {
        codeElement.className = `language-${language}`;
    }
    codeElement.textContent = code;

    pre.appendChild(codeElement);
    codeContent.appendChild(pre);
    container.appendChild(codeContent);

    return container;
}

function addReadAloudAndCopyButtons(messageElement, text) {
    // Create the Read Aloud button
    const readButton = document.createElement('button');
    readButton.classList.add('read-aloud-button');
    readButton.textContent = "🔊";
    readButton.addEventListener('click', () => readAloud(text));

    // Create the Copy button
    const copyButton = document.createElement('button');
    copyButton.classList.add('copy-button');
    copyButton.textContent = "📋";
    copyButton.addEventListener('click', () => copyToClipboard(text, copyButton));

    // Append both buttons to the message element
    messageElement.appendChild(readButton);
    messageElement.appendChild(copyButton);
}

function copyToClipboard(text, button) {
    // Check if the Clipboard API is supported
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            button.textContent = "✅ Copied!";
            setTimeout(() => (button.textContent = "📋 Copy"), 2000); // Reset text after 2 seconds
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert("Failed to copy text.");
        });
    } else {
        // Fallback for browsers that do not support the Clipboard API
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
            button.textContent = "✅ Copied!";
            setTimeout(() => (button.textContent = "📋 Copy"), 2000); // Reset text after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert("Failed to copy text.");
        } finally {
            document.body.removeChild(textarea); // Clean up
        }
    }
}

function readAloud(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.25; // Adjust the rate of speech if needed
    synth.speak(utterance);
}

function saveToLocalStorage(history = []) {
    localStorage.setItem('conversation', JSON.stringify(history));
}


async function handleBotResponse(response, userId) {
    const text = await response.text();

    try {
        const segments = text.match(/{"response":".*?"}/g);
        const combinedResponse = segments
            .map(segment => JSON.parse(segment).response)
            .join(' ');

        // Remove the loading animation
        const chatMessages = document.getElementById('chatMessages');
        const loadingAnimation = chatMessages.querySelector('dotlottie-player');
        if (loadingAnimation) {
            chatMessages.removeChild(loadingAnimation);
        }
        
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper');    
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', 'bot-message');
        chatMessages.appendChild(messageWrapper);

        // Add IT logo
        const logoElement = document.createElement('img');
        logoElement.src = 'https://raw.githubusercontent.com/BenZimCO/video/cbce971a97a8ec300d22ba33b4c54f58c0f094fd/robot-assistant.png'; // Update the path to your logo
        logoElement.classList.add('bot-logo');

        messageWrapper.appendChild(logoElement);
        messageWrapper.appendChild(messageElement);

        await simulateTyping(messageElement, combinedResponse);
        messageElement.scrollIntoView({ behavior: 'smooth' });
        addReadAloudAndCopyButtons(messageElement, combinedResponse);

        addQuickReplyButtons(messageElement);

        // Add bot response to history
        conversationHistory.push({
            role: 'bot',
            content: combinedResponse,
            datetime: new Date().toISOString()
        });

        // Save to local storage
        saveToLocalStorage(conversationHistory);
        enableInput();

        renderChatList();
    } catch (error) {
        console.error('Error parsing response:', error);
        appendMessage("Sorry, there was an error retrieving the response.", 'bot');
    }

}

function appendMessage(message, type) {
    const chatMessages = document.getElementById('chatMessages');

    // Create wrapper for message alignment
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper');

    // Add avatar for user or bot
    const avatar = document.createElement('img');
    avatar.classList.add('avatar', type === 'user' ? 'user-avatar' : 'bot-avatar');
    avatar.src = type === 'user'
        ? 'https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png'
        : 'https://raw.githubusercontent.com/BenZimCO/video/cbce971a97a8ec300d22ba33b4c54f58c0f094fd/robot-assistant.png';
    avatar.alt = type === 'user' ? 'User Avatar' : 'Bot Avatar';

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${type}-message`);

    if (type === 'user') {
        messageElement.textContent = message;
    } else {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-content');

        const segments = parseContent(message);

        segments.forEach(segment => {
            if (segment.type === 'code') {
                const codeContainer = createCodeSnippet(
                    segment.language || 'plaintext',
                    segment.content.trim()
                );
                messageContainer.appendChild(codeContainer);

                const codeElement = codeContainer.querySelector('code');
                if (codeElement) {
                    hljs.highlightElement(codeElement);
                }
            } else {
                const textBlock = document.createElement('div');
                textBlock.classList.add('text-block');
                textBlock.innerHTML = parseMarkdown(segment.content);
                messageContainer.appendChild(textBlock);
            }
        });

        messageElement.appendChild(messageContainer);
        addReadAloudAndCopyButtons(messageElement, message);
    }
    messageWrapper.appendChild(avatar);
    messageWrapper.appendChild(messageElement);
    chatMessages.appendChild(messageWrapper);
    messageWrapper.scrollIntoView({ behavior: 'smooth' });
    saveChatToDatabase(getCurrentChatIdFromLocalStorage(), conversationHistory);
    renderChatList();
}


// Optional: Add a function to clean up code blocks in stored messages
function sanitizeStoredMessages() {
    const allChats = loadChatsFromLocalStorage();
    let hasChanges = false;


    sanitizeStoredMessages();

    Object.keys(allChats).forEach(chatId => {
        const chat = allChats[chatId];
        chat.messages = chat.messages.map(message => {
            if (message.role === 'bot') {
                const cleanContent = ensureCodeBlockFormat(message.content);
                if (cleanContent !== message.content) {
                    hasChanges = true;
                    return { ...message, content: cleanContent };
                }
            }
            return message;
        });
    });

    if (hasChanges) {
        localStorage.setItem('allChats', JSON.stringify(allChats));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize with a new chat if none exists
    if (!getCurrentChatIdFromLocalStorage()) {
        startNewChat();
    }

    // Set up new chat button
    newChatButton.addEventListener('click', () => startNewChat('newChatButton'));

    // Render existing chats
    renderChatList();
});

function startNewChat(newChatButton) {
    // Generate new chat ID only if we don't have one
    if (!getCurrentChatIdFromLocalStorage() || newChatButton) {
        saveCurrentChatIdToLocalStorage(generateChatId())
    } 

    // Clear conversation history
    conversationHistory.length = 0;
    document.getElementById('chatMessages').innerHTML = '';
    renderChatList();
    promptContainer.style.display = "flex";
    openSubRecommendations();
}

// Event listeners
document.getElementById('sendButton').addEventListener('click', async function () {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    const userId = localStorage.getItem('userId');

    if (!userId) {
        alert('Please log in to send messages');
        return;
    }

    



    
    disableInput();

    if (message !== "") {
        appendMessage(message, 'user');
        userInput.value = '';

        // Create loading animation element
        const loadingAnimation = document.createElement('dotlottie-player');
        loadingAnimation.src = "https://lottie.host/2058cb37-e662-47ef-b20b-b33972803913/QayEIxoE9G.json";
        loadingAnimation.style.width = "50px";
        loadingAnimation.style.height = "50px";
        loadingAnimation.setAttribute("background", "transparent");
        loadingAnimation.setAttribute("loop", "true");
        loadingAnimation.setAttribute("autoplay", "true");

        // Append the loading animation to the chat
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.appendChild(loadingAnimation);
        
        // Add user message to history
        conversationHistory.push({ 
            role: 'user', 
            content: message, 
            datetime: new Date().toISOString(),
            userId: userId
        });

        try {
            const response = await fetch('https://gemini-intergrated-chatbot.onrender.com/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: message,
                    userId: userId,
                    sessionId: getCurrentChatIdFromLocalStorage(), // Using the same chatId throughout
                    history: conversationHistory
                }),
            });

            await handleBotResponse(response, userId);
        } catch (error) {
            console.error('Error:', error);
            appendMessage('Sorry, there was an error.', 'bot');
            
            if (loadingAnimation) {
                chatMessages.removeChild(loadingAnimation);
            }
        }
    }
});

document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('sendButton').click();
    }
});

//----------------------------------------------------------------------------
// quick reply
function sendUserInput(input) {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        alert('Please log in to send messages');
        return;
    }

    // Add the user's quick reply to the conversation history
    conversationHistory.push({ 
        role: 'user', 
        content: input, 
        datetime: new Date().toISOString(),
        userId: userId
    });

    // Create loading animation
    const chatMessages = document.getElementById('chatMessages');
    const loadingAnimation = document.createElement('dotlottie-player');
    loadingAnimation.src = "https://lottie.host/2058cb37-e662-47ef-b20b-b33972803913/QayEIxoE9G.json";
    loadingAnimation.style.width = "50px";
    loadingAnimation.style.height = "50px";
    loadingAnimation.setAttribute("background", "transparent");
    loadingAnimation.setAttribute("loop", "true");
    loadingAnimation.setAttribute("autoplay", "true");
    chatMessages.appendChild(loadingAnimation);

    // Disable input while processing
    disableInput();

    fetch('https://gemini-intergrated-chatbot.onrender.com/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            input: input,
            userId: userId,
            sessionId: getCurrentChatIdFromLocalStorage(),
            history: conversationHistory
        }),
    })
    .then(response => handleBotResponse(response, userId))
    .catch(error => {
        console.error('Error:', error);
        appendMessage('Sorry, there was an error.', 'bot');
        
        // Remove loading animation on error
        if (loadingAnimation) {
            chatMessages.removeChild(loadingAnimation);
        }
        
        // Re-enable input on error
        enableInput();
    });
}

function addQuickReplyButtons(messageElement) {
    const quickReplies = ["Make a new one", "Not this", "Tell me more"];
    const quickReplyContainer = document.createElement('div');
    quickReplyContainer.classList.add('quick-reply-container');

    quickReplies.forEach(reply => {
        const button = document.createElement('button');
        button.classList.add('quick-reply-button');
        button.textContent = reply;
        button.addEventListener('click', () => {
            // Add user message to display
            appendMessage(reply, 'user');
            
            // Handle different quick replies
            if (reply === "Tell me more") {
                // Get the last bot message from conversation history
                const lastBotMessage = [...conversationHistory]
                    .reverse()
                    .find(msg => msg.role === 'bot');
                
                if (lastBotMessage) {
                    const followUpMessage = `Can you elaborate more on: "${lastBotMessage.content}"`;
                    sendUserInput(followUpMessage);
                } else {
                    sendUserInput(reply);
                }
            } else {
                sendUserInput(reply);
            }
        });
        quickReplyContainer.appendChild(button);
    });

    messageElement.appendChild(quickReplyContainer);
}

//----------------------------------------------------------------------------------
//recommendation do not touch this code plz 
function openSubRecommendations() {
    subRecommendations.style.display = "flex";
    helpSection.classList.remove("hide");
}

function closeSubRecommendations() {
    subRecommendations.style.display = "none";
    helpSection.classList.add("hide");
}