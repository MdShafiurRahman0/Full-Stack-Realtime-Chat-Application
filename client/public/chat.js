const chatForm = document.getElementById("chat-form");
const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("message-input");

const socket = io();

console.log("Socket connected with ID:", socket.id);

socket.on("connect", () => {
  console.log("Connected to server with socket ID:", socket.id);
  updateConnectionStatus(true);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
  updateConnectionStatus(false);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
  updateConnectionStatus(false);
});

let isTyping = false;
let typingTimer;

function updateConnectionStatus(isConnected) {
  const statusDot = document.querySelector(".status-dot");
  const statusText = document.querySelector(".status-text");

  if (isConnected) {
    statusDot.style.background = "var(--success-color)";
    statusText.textContent = "Live Chat";
    statusText.style.color = "var(--success-color)";
  } else {
    statusDot.style.background = "#ef4444";
    statusText.textContent = "Connecting...";
    statusText.style.color = "#ef4444";
  }
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = messageInput.value.trim();

  if (!msg) {
    return false;
  }

  const sendBtn = document.querySelector(".send-btn");
  sendBtn.classList.add("loading");
  sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  socket.emit("chatMessage", { text: msg, user: userName, userId: userId });

  messageInput.value = "";
  messageInput.focus();

  socket.emit("stopTyping");

  setTimeout(() => {
    sendBtn.classList.remove("loading");
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
  }, 500);
});

messageInput.addEventListener("input", () => {
  if (!isTyping) {
    isTyping = true;
    socket.emit("typing", { user: userName, userId: userId });
  }

  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    isTyping = false;
    socket.emit("stopTyping");
  }, 1000);
});

socket.on("chatMessage", (message) => {
  console.log("Received message:", message);

  const existingMessage = document.querySelector(
    `[data-message-id="${message.messageId}"]`
  );
  if (existingMessage) {
    console.log("Message already exists, skipping duplicate");
    return;
  }

  outputMessage(message);

  scrollToBottom();

  if (message.userId !== userId) {
    playMessageSound();
    addMessageNotification(message);
  }
});

socket.on("typing", (data) => {
  if (data.userId !== userId) {
    showTypingIndicator(data.user);
  }
});

socket.on("stopTyping", () => {
  hideTypingIndicator();
});

function addMessageNotification(message) {
  const notification = document.createElement("div");
  notification.className = "message-notification";
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-user">${message.user}</span>
            <span class="notification-text">${message.text}</span>
        </div>
    `;

  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function outputMessage(message) {
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add("message-wrapper");

  if (message.messageId) {
    messageWrapper.setAttribute("data-message-id", message.messageId);
  }

  const isCurrentUser = message.userId === userId;

  if (isCurrentUser) {
    messageWrapper.classList.add("message-own");
  } else {
    messageWrapper.classList.add("message-other");
  }

  if (!isCurrentUser) {
    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("message-avatar");
    avatarDiv.innerHTML = `<span>${message.user[0]}</span>`;
    messageWrapper.appendChild(avatarDiv);
  }

  const messageBubble = document.createElement("div");
  messageBubble.classList.add("message-bubble");

  if (!isCurrentUser) {
    const senderDiv = document.createElement("div");
    senderDiv.classList.add("message-sender");
    senderDiv.textContent = message.user;
    messageBubble.appendChild(senderDiv);
  }

  const messageText = document.createElement("div");
  messageText.classList.add("message-text");
  messageText.textContent = message.text;
  messageBubble.appendChild(messageText);

  const messageTime = document.createElement("div");
  messageTime.classList.add("message-time");
  messageTime.innerHTML = `<i class="far fa-clock"></i> ${message.time}`;
  messageBubble.appendChild(messageTime);

  messageWrapper.appendChild(messageBubble);

  if (isCurrentUser) {
    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("message-avatar", "own-avatar");
    avatarDiv.innerHTML = `<span>${message.user[0]}</span>`;
    messageWrapper.appendChild(avatarDiv);
  }

  messagesContainer.appendChild(messageWrapper);

  console.log(`Message added to DOM: ${message.user}: ${message.text}`);
}

function showTypingIndicator(user) {
  hideTypingIndicator();

  const typingWrapper = document.createElement("div");
  typingWrapper.classList.add(
    "message-wrapper",
    "message-other",
    "typing-indicator-wrapper"
  );
  typingWrapper.id = "typing-indicator";

  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add("message-avatar");
  avatarDiv.innerHTML = `<span>${user[0]}</span>`;
  typingWrapper.appendChild(avatarDiv);

  const typingBubble = document.createElement("div");
  typingBubble.classList.add("message-bubble");

  const typingText = document.createElement("div");
  typingText.classList.add("typing-indicator");
  typingText.innerHTML = `
        <span>${user} is typing</span>
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;

  typingBubble.appendChild(typingText);
  typingWrapper.appendChild(typingBubble);

  messagesContainer.appendChild(typingWrapper);

  scrollToBottom();
}

function hideTypingIndicator() {
  const existingIndicator = document.getElementById("typing-indicator");
  if (existingIndicator) {
    existingIndicator.remove();
  }
}

function scrollToBottom() {
  const scrollOptions = {
    top: messagesContainer.scrollHeight,
    behavior: "smooth",
  };

  messagesContainer.scrollTo(scrollOptions);
}

window.addEventListener("load", () => {
  scrollToBottom();
});

document.addEventListener("DOMContentLoaded", () => {
  messageInput.focus();

  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event("submit"));
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-btn")) {
    }
  });

  messageInput.addEventListener("focus", () => {
    document.querySelector(".input-wrapper").classList.add("focused");
  });

  messageInput.addEventListener("blur", () => {
    document.querySelector(".input-wrapper").classList.remove("focused");
  });

  const headerBtns = document.querySelectorAll(".header-btn");
  headerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.style.transform = "scale(0.95)";
      setTimeout(() => {
        btn.style.transform = "";
      }, 150);
    });
  });

  initializeTheme();
});

function playMessageSound() {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      600,
      audioContext.currentTime + 0.1
    );

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.log("Audio not supported, skipping sound");
  }
}

const style = document.createElement("style");
style.textContent = `
  .message-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    box-shadow: var(--shadow-lg);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    max-width: 300px;
  }
  
  .message-notification.show {
    transform: translateX(0);
  }
  
  .notification-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .notification-user {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
  }
  
  .notification-text {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.4;
  }
  
  .input-wrapper.focused {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px var(--primary-light);
  }
  
  .send-btn.loading {
    pointer-events: none;
    opacity: 0.8;
  }
`;
document.head.appendChild(style);

function initializeTheme() {
  const savedTheme = localStorage.getItem("chat-theme") || "light";
  setTheme(savedTheme);

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  updateThemeToggleIcon(theme);

  localStorage.setItem("chat-theme", theme);

  updateBodyBackground(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);

  addThemeTransitionEffect();
}

function updateThemeToggleIcon(theme) {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    const icon = themeToggle.querySelector("i");
    if (icon) {
      if (theme === "dark") {
        icon.className = "fas fa-sun";
        themeToggle.title = "Switch to light mode";
      } else {
        icon.className = "fas fa-moon";
        themeToggle.title = "Switch to dark mode";
      }
    }
  }
}

function updateBodyBackground(theme) {
  if (theme === "dark") {
    document.body.style.background =
      "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)";
  } else {
    document.body.style.background =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  }
}

function addThemeTransitionEffect() {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.style.transform = "scale(1.2)";
    themeToggle.style.boxShadow = "0 0 20px var(--primary-color)";

    setTimeout(() => {
      themeToggle.style.transform = "";
      themeToggle.style.boxShadow = "";
    }, 300);
  }
}

function checkSystemPreference() {
  if (localStorage.getItem("chat-theme")) {
    return;
  }

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    setTheme("dark");
  }
}

if (window.matchMedia) {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("chat-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    });
}

checkSystemPreference();
