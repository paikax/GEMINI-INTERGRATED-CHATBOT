<<<<<<< Updated upstream
function parseMarkdown(text) {
    // Handle bold text with ** or __
    text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<span class="emphasized">$1$2</span>');
    return text;
}

async function simulateTyping(container, content, typingSpeed = 30) {
=======
const conversationHistory = [];
let currentChatId = null;
const chatList = document.getElementById('chatList');
const newChatButton = document.getElementById('newChatButton');

// Conversation list
function generateChatId() {
    return 'chat_' + Date.now();
}

// Function to save chat history to local storage
function saveChatToLocalStorage(chatId, conversation) {
    const allChats = JSON.parse(localStorage.getItem('allChats') || '{}');
    allChats[chatId] = {
        id: chatId,
        title: getConversationTitle(conversation),
        messages: conversation,
        timestamp: Date.now()
    };
    localStorage.setItem('allChats', JSON.stringify(allChats));
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

// Function to load chat history from local storage
function loadChatsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('allChats') || '{}');
}

// Function to render chat list
function renderChatList() {
    chatList.innerHTML = '';
    const allChats = loadChatsFromLocalStorage();
    
    Object.values(allChats)
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach(chat => {
            const chatElement = document.createElement('li');
            chatElement.classList.add('chat-item');
            if (chat.id === currentChatId) {
                chatElement.classList.add('active');
            }
            
            chatElement.innerHTML = `
                <span class="chat-title">${chat.title}</span>
                <button class="delete-chat-btn">×</button>
            `;
            
            chatElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-chat-btn')) {
                    loadChat(chat.id);
                }
            });
            
            chatElement.querySelector('.delete-chat-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteChat(chat.id);
            });
            
            chatList.appendChild(chatElement);
        });
}

function loadChat(chatId) {
    const allChats = loadChatsFromLocalStorage();
    const chat = allChats[chatId];
    if (chat) {
        currentChatId = chatId;
        conversationHistory.length = 0;
        conversationHistory.push(...chat.messages);
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        chat.messages.forEach(message => {
            // Create wrapper for message alignment
            const messageWrapper = document.createElement('div');
            messageWrapper.classList.add('message-wrapper');
            
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message', 
                message.role === 'user' ? 'user-message' : 'bot-message');
            
            if (message.role === 'user') {
                messageElement.textContent = message.content;
            } else {
                const messageContainer = document.createElement('div');
                messageContainer.classList.add('message-content');
                
                const segments = parseContent(message.content);
                
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
                addReadAloudAndCopyButtons(messageElement, message.content);
            }
            
            messageWrapper.appendChild(messageElement);
            chatMessages.appendChild(messageWrapper);
        });
        
        renderChatList();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}


// Function to delete a chat
function deleteChat(chatId) {
    const allChats = loadChatsFromLocalStorage();
    delete allChats[chatId];
    localStorage.setItem('allChats', JSON.stringify(allChats));
    
    if (currentChatId === chatId) {
        currentChatId = null;
        conversationHistory.length = 0;
        document.getElementById('chatMessages').innerHTML = '';
    }
    
    renderChatList();
}

// Function to start a new chat
function startNewChat() {
    currentChatId = generateChatId();
    conversationHistory.length = 0;
    document.getElementById('chatMessages').innerHTML = '';
    renderChatList();
}

function parseMarkdown(text) {
    // Handle bold text with ** or __
    text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<span class="emphasized">$1$2</span>');
     // Handle italic text with * or _
    text = text.replace(/\*(.*?)\*|_(.*?)_/g, '<span class="italicized">$1$2</span>');
    return text;
}

async function simulateTyping(container, content, typingSpeed = 20) {
>>>>>>> Stashed changes
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    container.appendChild(messageContent);

    const segments = parseContent(content);
    
    for (const segment of segments) {
        if (segment.type === 'code') {
            const codeContainer = createCodeSnippet(segment.language || 'plaintext', '');
            messageContent.appendChild(codeContainer);
            const codeElement = codeContainer.querySelector('code');
            
<<<<<<< Updated upstream
            for (let i = 0; i < segment.content.length; i++) {
                codeElement.textContent += segment.content[i];
=======
            // Clear the code element initially

            codeElement.textContent = '';

            // Type out the code

            for (let i = 0; i < fullCode.length; i++) {
                codeElement.textContent += fullCode[i];
>>>>>>> Stashed changes
                hljs.highlightElement(codeElement);
                await new Promise(resolve => setTimeout(resolve, typingSpeed / 2));
            }
        } else {
            const textBlock = document.createElement('div');
            textBlock.classList.add('text-block');
            messageContent.appendChild(textBlock);

            for (let i = 0; i < segment.content.length; i++) {
                textBlock.textContent += segment.content[i];
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
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                content: content.substring(lastIndex, match.index)
            });
        }

        segments.push({
            type: 'code',
            language: match[1],
            content: match[2]
        });

        lastIndex = match.index + match[0].length;
    }

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

<<<<<<< Updated upstream
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(code);
=======
    container.dataset.codeContent = code;

    copyButton.addEventListener('click', async () => {
        try {
            const codeToCopy = container.dataset.codeContent;
            await navigator.clipboard.writeText(codeToCopy);
>>>>>>> Stashed changes
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
    const readButton = document.createElement('button');
    readButton.classList.add('read-aloud-button');
    readButton.textContent = "🔊";
    readButton.addEventListener('click', () => readAloud(text));
    
    const copyButton = document.createElement('button');
    copyButton.classList.add('copy-button');
    copyButton.textContent = "📋";
    copyButton.addEventListener('click', () => copyToClipboard(text, copyButton));
    
    messageElement.appendChild(readButton);
    messageElement.appendChild(copyButton);
}

function copyToClipboard(text, button) {
<<<<<<< Updated upstream
    navigator.clipboard.writeText(text).then(() => {
        button.textContent = "✅ Copied!";
        setTimeout(() => (button.textContent = "📋 Copy"), 2000); // Reset text after 2 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert("Failed to copy text.");
    });
=======
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            button.textContent = "✅ Copied!";
            setTimeout(() => (button.textContent = "📋 Copy"), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert("Failed to copy text.");
        });
    } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
            button.textContent = "✅ Copied!";
            setTimeout(() => (button.textContent = "📋 Copy"), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert("Failed to copy text.");
        } finally {
            document.body.removeChild(textarea);
        }
    }
>>>>>>> Stashed changes
}

function readAloud(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.25;
    synth.speak(utterance);
}

async function handleBotResponse(response) {
    const text = await response.text();
    console.log('Raw Response:', text);

    try {
        const segments = text.match(/{"response":".*?"}/g);
        const combinedResponse = segments
            .map(segment => JSON.parse(segment).response)
            .join(' ');

        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', 'bot-message');
        document.getElementById('chatMessages').appendChild(messageElement);

<<<<<<< Updated upstream
        // // Add "Read Aloud" button
        // const readButton = document.createElement('button');
        // readButton.textContent = "🔊";
        // readButton.classList.add('read-aloud-button');
        // readButton.addEventListener('click', () => readAloud(combinedResponse));
        // messageElement.appendChild(readButton);

        await simulateTyping(messageElement, combinedResponse);
        messageElement.scrollIntoView({ behavior: 'smooth' });
=======
        await simulateTyping(messageElement, combinedResponse);
        messageElement.scrollIntoView({ behavior: 'smooth' });
        addReadAloudAndCopyButtons(messageElement, combinedResponse);

        addQuickReplyButtons(messageElement);

        conversationHistory.push({ role: 'bot', content: combinedResponse, datetime: new Date().toISOString() });

         // Save to local storage
        saveToLocalStorage(conversationHistory);
>>>>>>> Stashed changes
    } catch (error) {
        console.error('Error parsing response:', error);
        appendMessage("Sorry, there was an error retrieving the response.", 'bot');
    }
}

function appendMessage(message, type) {
    const chatMessages = document.getElementById('chatMessages');
<<<<<<< Updated upstream
=======
    
    // Create wrapper for message alignment
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper');
    
>>>>>>> Stashed changes
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');

    if (type === 'user') {
        messageElement.classList.add('user-message');
        messageElement.textContent = message;
    } else {
        messageElement.classList.add('bot-message');
        messageElement.textContent = message;
    }

    chatMessages.appendChild(messageElement);
    messageElement.scrollIntoView({ behavior: 'smooth' });
}

<<<<<<< Updated upstream
//quick reply function
function showQuickReplies(options) {
    const quickReplyContainer = document.createElement('div');
    quickReplyContainer.classList.add('quick-reply-container');

    options.forEach(option => {
        const quickReplyButton = document.createElement('button');
        quickReplyButton.classList.add('quick-reply-button');
        quickReplyButton.textContent = option;
        
        quickReplyButton.addEventListener('click', async () => {
            appendMessage(option, 'user');

            try {
                const response = await fetch('http://localhost:3000/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ input: option }),
                });

                await handleBotResponse(response);
            } catch (error) {
                console.error('Error:', error);
                appendMessage('Sorry, there was an error.', 'bot');
            }
        });

        quickReplyContainer.appendChild(quickReplyButton);
    });

    document.getElementById('chatMessages').appendChild(quickReplyContainer);
    quickReplyContainer.scrollIntoView({ behavior: 'smooth' });
}

// Event listeners
=======
function addQuickReplyButtons(messageElement) {
    const quickReplies = ["Make a new one", "Not this", "Tell me more"];
    const quickReplyContainer = document.createElement('div');
    quickReplyContainer.classList.add('quick-reply-container');

    quickReplies.forEach(reply => {
        const button = document.createElement('button');
        button.classList.add('quick-reply-button');
        button.textContent = reply;
        button.addEventListener('click', () => {
            appendMessage(reply, 'user');
            conversationHistory.push({ role: 'user', content: reply, datetime: new Date().toISOString() });
            sendUserInput(reply);
        });
        quickReplyContainer.appendChild(button);
    });

    messageElement.appendChild(quickReplyContainer);
}

function sendUserInput(input) {
    fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            input: input,
            sessionId: currentChatId
        }),
    })
    .then(response => handleBotResponse(response))
    .catch(error => {
        console.error('Error:', error);
        appendMessage('Sorry, there was an error.', 'bot');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    newChatButton.addEventListener('click', startNewChat);
    
    if (!currentChatId) {
        startNewChat();
    }
    
    renderChatList();
});

>>>>>>> Stashed changes
document.getElementById('sendButton').addEventListener('click', async function() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();

<<<<<<< Updated upstream
=======
    const messageElement = document.createElement('div');
    document.getElementById('chatMessages').appendChild(messageElement);
    
    const loadingAnimation = document.createElement('dotlottie-player');
    loadingAnimation.src = "https://lottie.host/2058cb37-e662-47ef-b20b-b33972803913/QayEIxoE9G.json";
    loadingAnimation.style.width = "50px";
    loadingAnimation.style.height = "50px";
    loadingAnimation.setAttribute("background", "transparent");
    loadingAnimation.setAttribute("loop", "true");
    loadingAnimation.setAttribute("autoplay", "true");
    messageElement.appendChild(loadingAnimation);

>>>>>>> Stashed changes
    if (message !== "") {
        appendMessage(message, 'user');
        userInput.value = '';

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
<<<<<<< Updated upstream
                body: JSON.stringify({ input: message }),
=======
                body: JSON.stringify({ 
                    input: message, 
                    sessionId: currentChatId
                }),
>>>>>>> Stashed changes
            });

            await handleBotResponse(response);
        } catch (error) {
            console.error('Error:', error);
            appendMessage('Sorry, there was an error.', 'bot');
        }
    }
});

document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('sendButton').click();
    }
});