// Get references to important DOM elements for the chat functionality
// These elements are used throughout the chat application
const chatForm = document.getElementById("chat-form"); // The form for sending messages
const messagesContainer = document.getElementById("messages"); // Container where messages are displayed
const messageInput = document.getElementById("message-input"); // Input field where users type messages

// The userName and userId variables are available from the script tag in chat.hbs
// These are set by the server when rendering the page and contain current user info

// Connect to the Socket.IO server for real-time communication
// Socket.IO enables instant messaging between users without page refresh
const socket = io();

// Debug connection - log the socket ID for troubleshooting
console.log("Socket connected with ID:", socket.id);

// Listen for successful connection to the server
socket.on("connect", () => {
  // Log successful connection with the socket ID
  console.log("Connected to server with socket ID:", socket.id);
  // Update the UI to show connection status
  updateConnectionStatus(true);
});

// Listen for disconnection from the server
socket.on("disconnect", () => {
  // Log when connection is lost
  console.log("Disconnected from server");
  // Update the UI to show disconnection status
  updateConnectionStatus(false);
});

// Listen for connection errors
socket.on("connect_error", (error) => {
  // Log any connection errors for debugging
  console.error("Connection error:", error);
  // Update the UI to show error status
  updateConnectionStatus(false);
});

// Variables to track typing state for the current user
let isTyping = false; // Whether the user is currently typing
let typingTimer; // Timer to stop typing indicator after delay

// Function to update the connection status in the UI
// This shows users whether they're connected to the chat server
function updateConnectionStatus(isConnected) {
  // Get references to the status elements in the header
  const statusDot = document.querySelector(".status-dot");
  const statusText = document.querySelector(".status-text");

  if (isConnected) {
    // If connected, show green status with "Live Chat" text
    statusDot.style.background = "var(--success-color)";
    statusText.textContent = "Live Chat";
    statusText.style.color = "var(--success-color)";
  } else {
    // If disconnected, show red status with "Connecting..." text
    statusDot.style.background = "#ef4444";
    statusText.textContent = "Connecting...";
    statusText.style.color = "#ef4444";
  }
}

// Handle form submission when users send messages
chatForm.addEventListener("submit", (e) => {
  // Prevent the default form submission behavior
  e.preventDefault();

  // Get the message text and remove any leading/trailing whitespace
  const msg = messageInput.value.trim();

  // If message is empty, don't send anything
  if (!msg) {
    return false;
  }

  // Add loading state to send button to show it's working
  const sendBtn = document.querySelector(".send-btn");
  sendBtn.classList.add("loading");
  sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  // Send the message to the server via Socket.IO
  // Include user info so other users know who sent the message
  socket.emit("chatMessage", { text: msg, user: userName, userId: userId });

  // Clear the input field and focus it for the next message
  messageInput.value = "";
  messageInput.focus();

  // Stop the typing indicator since message was sent
  socket.emit("stopTyping");

  // Remove loading state after a short delay to show completion
  setTimeout(() => {
    sendBtn.classList.remove("loading");
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
  }, 500);
});

// Handle input typing to show typing indicators to other users
messageInput.addEventListener("input", () => {
  // If user wasn't typing before, start typing indicator
  if (!isTyping) {
    isTyping = true;
    // Tell other users that this user is typing
    socket.emit("typing", { user: userName, userId: userId });
  }

  // Clear the existing timer to reset the typing indicator
  clearTimeout(typingTimer);

  // Set a new timer to stop typing indicator after 1 second of no input
  // This prevents the indicator from staying on forever
  typingTimer = setTimeout(() => {
    isTyping = false;
    // Tell other users that this user stopped typing
    socket.emit("stopTyping");
  }, 1000);
});

// Listen for incoming messages from other users or the server
socket.on("chatMessage", (message) => {
  // Log received message for debugging
  console.log("Received message:", message);

  // Check if message already exists to prevent duplicates
  // This prevents the same message from appearing multiple times
  const existingMessage = document.querySelector(
    `[data-message-id="${message.messageId}"]`
  );
  if (existingMessage) {
    console.log("Message already exists, skipping duplicate");
    return;
  }

  // Display the message in the chat interface
  outputMessage(message);

  // Scroll down smoothly to show the new message
  scrollToBottom();

  // Play sound for messages from other users (not your own messages)
  if (message.userId !== userId) {
    playMessageSound();
    // Add a subtle notification effect for new messages
    addMessageNotification(message);
  }
});

// Listen for typing events from other users
socket.on("typing", (data) => {
  // Only show typing indicator for other users, not yourself
  if (data.userId !== userId) {
    showTypingIndicator(data.user);
  }
});

// Listen for when users stop typing
socket.on("stopTyping", () => {
  // Hide the typing indicator
  hideTypingIndicator();
});

// Function to add a subtle notification effect for new messages
// This creates a toast notification that appears briefly
function addMessageNotification(message) {
  // Create a notification element
  const notification = document.createElement("div");
  notification.className = "message-notification";
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-user">${message.user}</span>
            <span class="notification-text">${message.text}</span>
        </div>
    `;

  // Add the notification to the page
  document.body.appendChild(notification);

  // Animate the notification in after a short delay
  setTimeout(() => notification.classList.add("show"), 100);

  // Remove the notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    // Wait for animation to complete before removing from DOM
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Function to display messages in the chat interface
// This creates the visual representation of each message
function outputMessage(message) {
  // Create a wrapper div for the entire message
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add("message-wrapper");

  // Add message ID to prevent duplicates
  if (message.messageId) {
    messageWrapper.setAttribute("data-message-id", message.messageId);
  }

  // Determine if this message is from the current user
  const isCurrentUser = message.userId === userId;

  // Add appropriate CSS classes for styling
  if (isCurrentUser) {
    messageWrapper.classList.add("message-own");
  } else {
    messageWrapper.classList.add("message-other");
  }

  // Add avatar for other users (not for your own messages)
  if (!isCurrentUser) {
    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("message-avatar");
    // Use first letter of username as avatar
    avatarDiv.innerHTML = `<span>${message.user[0]}</span>`;
    messageWrapper.appendChild(avatarDiv);
  }

  // Create the message bubble container
  const messageBubble = document.createElement("div");
  messageBubble.classList.add("message-bubble");

  // Add sender name for other users (not for your own messages)
  if (!isCurrentUser) {
    const senderDiv = document.createElement("div");
    senderDiv.classList.add("message-sender");
    senderDiv.textContent = message.user;
    messageBubble.appendChild(senderDiv);
  }

  // Create the message text content
  const messageText = document.createElement("div");
  messageText.classList.add("message-text");
  messageText.textContent = message.text;
  messageBubble.appendChild(messageText);

  // Create the message timestamp
  const messageTime = document.createElement("div");
  messageTime.classList.add("message-time");
  // Add clock icon and time
  messageTime.innerHTML = `<i class="far fa-clock"></i> ${message.time}`;
  messageBubble.appendChild(messageTime);

  // Add the message bubble to the wrapper
  messageWrapper.appendChild(messageBubble);

  // Add avatar for current user (for your own messages)
  if (isCurrentUser) {
    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("message-avatar", "own-avatar");
    // Use first letter of username as avatar
    avatarDiv.innerHTML = `<span>${message.user[0]}</span>`;
    messageWrapper.appendChild(avatarDiv);
  }

  // Add the complete message to the messages container
  messagesContainer.appendChild(messageWrapper);

  // Log successful message addition for debugging
  console.log(`Message added to DOM: ${message.user}: ${message.text}`);
}

// Function to show typing indicator for other users
// This displays "User is typing..." with animated dots
function showTypingIndicator(user) {
  // Remove any existing typing indicator first
  hideTypingIndicator();

  // Create the typing indicator wrapper
  const typingWrapper = document.createElement("div");
  typingWrapper.classList.add(
    "message-wrapper",
    "message-other",
    "typing-indicator-wrapper"
  );
  typingWrapper.id = "typing-indicator";

  // Create avatar for the typing user
  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add("message-avatar");
  avatarDiv.innerHTML = `<span>${user[0]}</span>`;
  typingWrapper.appendChild(avatarDiv);

  // Create the typing bubble
  const typingBubble = document.createElement("div");
  typingBubble.classList.add("message-bubble");

  // Create the typing text with animated dots
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

  // Assemble the typing indicator
  typingBubble.appendChild(typingText);
  typingWrapper.appendChild(typingBubble);

  // Add to the messages container
  messagesContainer.appendChild(typingWrapper);

  // Scroll down to show the typing indicator
  scrollToBottom();
}

// Function to hide the typing indicator
function hideTypingIndicator() {
  // Find the existing typing indicator by ID
  const existingIndicator = document.getElementById("typing-indicator");
  if (existingIndicator) {
    // Remove it from the DOM
    existingIndicator.remove();
  }
}

// Function to smoothly scroll to the bottom of the messages
// This ensures new messages are always visible
function scrollToBottom() {
  // Define smooth scrolling options
  const scrollOptions = {
    top: messagesContainer.scrollHeight, // Scroll to the very bottom
    behavior: "smooth", // Use smooth animation
  };

  // Perform the smooth scroll
  messagesContainer.scrollTo(scrollOptions);
}

// Auto-scroll to bottom when the page loads
// This ensures users see the most recent messages first
window.addEventListener("load", () => {
  scrollToBottom();
});

// Enhanced interactive features that run when the page is ready
document.addEventListener("DOMContentLoaded", () => {
  // Focus on the message input when the page loads
  // This makes it easy for users to start typing immediately
  messageInput.focus();

  // Add enter key support for sending messages
  messageInput.addEventListener("keydown", (e) => {
    // If Enter is pressed without Shift, send the message
    // Shift+Enter could be used for new lines in the future
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Trigger the form submission
      chatForm.dispatchEvent(new Event("submit"));
    }
  });

  // Add click outside functionality for future dropdown features
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-btn")) {
      // Hide any open dropdowns here (future feature)
    }
  });

  // Add input focus effects for better user experience
  messageInput.addEventListener("focus", () => {
    // Add focused class when input is selected
    document.querySelector(".input-wrapper").classList.add("focused");
  });

  messageInput.addEventListener("blur", () => {
    // Remove focused class when input loses focus
    document.querySelector(".input-wrapper").classList.remove("focused");
  });

  // Add header button interactions for better feedback
  const headerBtns = document.querySelectorAll(".header-btn");
  headerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Add ripple effect when buttons are clicked
      btn.style.transform = "scale(0.95)";
      setTimeout(() => {
        btn.style.transform = "";
      }, 150);
    });
  });

  // Initialize the theme system for dark/light mode
  initializeTheme();
});

// Function to play a subtle notification sound for new messages
// This provides audio feedback when messages arrive
function playMessageSound() {
  // Create a subtle notification sound using Web Audio API
  try {
    // Create audio context for generating sounds
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Create an oscillator for the sound wave
    const oscillator = audioContext.createOscillator();

    // Create a gain node to control volume
    const gainNode = audioContext.createGain();

    // Connect the oscillator to the gain node
    oscillator.connect(gainNode);

    // Connect the gain node to the speakers
    gainNode.connect(audioContext.destination);

    // Set the sound frequency (pitch) - starts high and goes lower
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      600,
      audioContext.currentTime + 0.1
    );

    // Set the volume - starts loud and fades out
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    );

    // Start and stop the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    // If audio is not supported, just log it and continue
    console.log("Audio not supported, skipping sound");
  }
}

// Add CSS styles for the notification system
// This creates the visual appearance of message notifications
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
// Add the styles to the document head
document.head.appendChild(style);

// Theme System Functions for Dark/Light Mode Toggle
// These functions handle switching between different visual themes

// Function to initialize the theme system when the page loads
function initializeTheme() {
  // Get saved theme from localStorage or default to 'light'
  const savedTheme = localStorage.getItem("chat-theme") || "light";
  setTheme(savedTheme);

  // Add click event to theme toggle button
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

// Function to set the current theme and update the UI
function setTheme(theme) {
  // Set the data-theme attribute on the document for CSS styling
  document.documentElement.setAttribute("data-theme", theme);

  // Update the theme toggle button icon to match current theme
  updateThemeToggleIcon(theme);

  // Save theme preference to localStorage for persistence
  localStorage.setItem("chat-theme", theme);

  // Update body background for smooth transition between themes
  updateBodyBackground(theme);
}

// Function to toggle between light and dark themes
function toggleTheme() {
  // Get the current theme from the document
  const currentTheme = document.documentElement.getAttribute("data-theme");
  // Switch to the opposite theme
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);

  // Add a subtle animation effect when switching themes
  addThemeTransitionEffect();
}

// Function to update the theme toggle button icon
function updateThemeToggleIcon(theme) {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    const icon = themeToggle.querySelector("i");
    if (icon) {
      if (theme === "dark") {
        // Show sun icon for dark mode (click to switch to light)
        icon.className = "fas fa-sun";
        themeToggle.title = "Switch to light mode";
      } else {
        // Show moon icon for light mode (click to switch to dark)
        icon.className = "fas fa-moon";
        themeToggle.title = "Switch to dark mode";
      }
    }
  }
}

// Function to update the body background based on theme
function updateBodyBackground(theme) {
  if (theme === "dark") {
    // Dark theme uses darker gradient background
    document.body.style.background =
      "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)";
  } else {
    // Light theme uses lighter gradient background
    document.body.style.background =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  }
}

// Function to add visual feedback when switching themes
function addThemeTransitionEffect() {
  // Get the theme toggle button
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    // Add a subtle pulse effect
    themeToggle.style.transform = "scale(1.2)";
    themeToggle.style.boxShadow = "0 0 20px var(--primary-color)";

    // Remove the effect after animation completes
    setTimeout(() => {
      themeToggle.style.transform = "";
      themeToggle.style.boxShadow = "";
    }, 300);
  }
}

// Function to check for system preference on page load
function checkSystemPreference() {
  // If user has already set a theme preference, don't override it
  if (localStorage.getItem("chat-theme")) {
    return;
  }

  // Check if user's system prefers dark mode
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    setTheme("dark");
  }
}

// Listen for system theme changes (user changes system theme)
if (window.matchMedia) {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem("chat-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    });
}

// Initialize system preference check when the script loads
checkSystemPreference();
