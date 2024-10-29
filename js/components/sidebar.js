let sidebarTimeout;

// Toggle sidebar open/close
function toggleSidebar() {
  const sidebar = document.querySelector('.chat-sidebar');
  sidebar.classList.toggle('hidden');
}

// Array to store conversation details
const conversations = [];

// Add new chat conversation
function addNewChat() {
  const conversationList = document.getElementById('conversationList');
  const newId = Date.now().toString();

  const creationTime = new Date().toISOString();
  const newConversation = {
    conversationID: newId,
    title: `Conversation ${newId}`,
    creationTime: creationTime,
    lastMessageTime: creationTime
  };

  // Add conversation to list
  conversations.push(newConversation);

  const li = document.createElement('li');
  li.dataset.conversationId = newId;
  li.classList.add('conversation');
  li.setAttribute('onclick', 'selectConversation(this)');
  li.innerHTML = `
    <span>${newConversation.title}</span>
    <button class="optionsBtn" onclick="toggleOptionsMenu(this, event)">⋮</button>
    <div class="optionsMenu">
      <button onclick="renameConversation(this)">Rename</button>
      <button onclick="deleteConversation(this)">Delete</button>
      <button onclick="showInfo(this)">Info</button>
    </div>
  `;
  conversationList.appendChild(li);
  updateURL(newId);
}

// Update URL with /chat/<data-conversation-id>
function updateURL(conversationId) {
  history.pushState(null, '', `/chat/${conversationId}`);
}

// Select a conversation
function selectConversation(conversation) {
  document.querySelectorAll('.conversation').forEach(conv => conv.classList.remove('active'));
  conversation.classList.add('active');
  updateURL(conversation.dataset.conversationId);
}

// Toggle options menu
function toggleOptionsMenu(button, event) {
  event.stopPropagation();
  const conversation = button.closest('.conversation');
  const isMenuVisible = conversation.classList.contains('show-options');
  document.querySelectorAll('.conversation').forEach(conv => conv.classList.remove('show-options'));
  if (!isMenuVisible) conversation.classList.add('show-options');
}

// Rename conversation
function renameConversation(button) {
  const conversation = button.closest('.conversation');
  const newTitle = prompt("Enter new name for this conversation:");
  if (newTitle) {
    const conversationData = conversations.find(conv => conv.conversationID === conversation.dataset.conversationId);
    if (conversationData) {
      conversationData.title = newTitle;
      conversation.querySelector('span').innerText = newTitle;
    }
  }
}

// Delete conversation with confirmation
function deleteConversation(button) {
  const conversation = button.closest('.conversation');
  const conversationId = conversation.dataset.conversationId;

  // Show confirmation dialog
  const dialog = document.getElementById('deleteConfirmDialog');
  dialog.style.display = 'flex';

  document.getElementById('confirmDelete').onclick = () => {
    // Remove from conversations array
    const index = conversations.findIndex(conv => conv.conversationID === conversationId);
    if (index !== -1) conversations.splice(index, 1);
    conversation.remove();
    dialog.style.display = 'none';
  };

  document.getElementById('cancelDelete').onclick = () => {
    dialog.style.display = 'none';
  };
}

// Show information of a conversation
function showInfo(button) {
  const conversation = button.closest('.conversation');
  const conversationData = conversations.find(conv => conv.conversationID === conversation.dataset.conversationId);
  if (conversationData) {
    alert(
      `ID: ${conversationData.conversationID}\n` +
      `Title: ${conversationData.title}\n` +
      `Creation Time (UTC): ${conversationData.creationTime}\n` +
      `Last Message Time (UTC): ${conversationData.lastMessageTime}`
    );
  }
}
document.addEventListener('mousemove', (event) => {
    const sidebar = document.querySelector('.chat-sidebar');
    
    // Trigger open when mouse near left edge
    if (event.clientX <= 15 && sidebar.classList.contains('hidden')) {
      clearTimeout(sidebarTimeout);
      sidebarTimeout = setTimeout(() => {
        sidebar.classList.remove('hidden');
      }, 500);
    }
  });
  