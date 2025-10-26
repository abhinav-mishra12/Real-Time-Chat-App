const socket = io('http://localhost:8000');

const form = document.getElementById("send-container");
const messageInp = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
const userCountElement = document.getElementById('user-count');

// Audio notification
const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');

// Function to format time
const formatTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

// Function to append messages
const append = (message, position, sender = '', showTime = true) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    
    if (position === 'center') {
        messageElement.innerHTML = `<div class="message-text">${message}</div>`;
    } else {
        let messageHTML = '';
        if (sender && position === 'left') {
            messageHTML += `<div class="message-sender">${sender}</div>`;
        }
        messageHTML += `<div class="message-text">${message}</div>`;
        if (showTime) {
            messageHTML += `<div class="message-time">${formatTime()}</div>`;
        }
        messageElement.innerHTML = messageHTML;
    }
    
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
};

// Handle form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInp.value.trim();
    
    if (message === '') return;
    
    append(message, 'right', 'You');
    socket.emit('send', message);
    messageInp.value = '';
});

// Get user name
let userName = '';
while (!userName || userName.trim() === '') {
    userName = prompt("Enter your name to join the chat:");
    if (userName === null) {
        userName = 'Anonymous';
        break;
    }
    userName = userName.trim();
}

// Emit new user joined
socket.emit('new-user-joined', userName);

// Listen for user joined
socket.on('user-joined', (data) => {
    append(`${data.name} joined the chat`, 'center', '', false);
    updateUserCount(data.userCount);
    playNotification();
});

// Listen for receive message
socket.on('receive', (data) => {
    append(data.message, 'left', data.name);
    playNotification();
});

// Listen for user left
socket.on('left', (data) => {
    append(`${data.name} left the chat`, 'center', '', false);
    updateUserCount(data.userCount);
});

// Update user count
socket.on('user-count', (count) => {
    updateUserCount(count);
});

// Function to update user count display
const updateUserCount = (count) => {
    if (userCountElement) {
        userCountElement.textContent = `${count} online`;
    }
};

// Play notification sound
const playNotification = () => {
    audio.play().catch(err => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
    });
};

// Handle page unload
window.addEventListener('beforeunload', () => {
    socket.disconnect();
});