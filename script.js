const API_KEY = "AIzaSyBAxYtJa_e4W9MeXeyiz5UjWtf_-46VDNM";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = `You are a helpful, friendly, and professional Customer Care Assistant 
for an e-commerce store called ShopEase. 

You help customers with:
- Order tracking (ask for order ID if needed)
- Refund and return policies (refunds within 7 days, returns within 30 days)
- Product information and recommendations
- Cancellation requests
- General FAQs

Always be polite, concise, and empathetic. If you cannot help, suggest contacting 
human support at support@shopease.com or calling 1800-123-4567.

Keep responses short and friendly. Use emojis occasionally to be approachable.`;

// Track conversation history
let conversationHistory = [];

async function sendMessage() {
  const input    = document.getElementById("userInput");
  const message  = input.value.trim();
  if (!message) return;

  // Hide quick replies after first message
  const qr = document.getElementById("quickReplies");
  if (qr) qr.style.display = "none";

  appendMessage(message, "user");
  input.value = "";
  input.focus();

  showTyping();

  // Add to conversation history
  conversationHistory.push({ role: "user", parts: [{ text: message }] });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: conversationHistory
      })
    });

    const data = await response.json();

    if (data.error) {
      removeTyping();
      appendMessage("⚠️ API Error: " + data.error.message, "bot");
      return;
    }

    const reply = data.candidates[0].content.parts[0].text;

    // Add bot reply to history
    conversationHistory.push({ role: "model", parts: [{ text: reply }] });

    removeTyping();
    appendMessage(reply, "bot");

  } catch (error) {
    removeTyping();
    appendMessage("⚠️ Could not connect. Check your API key and internet connection.", "bot");
    console.error(error);
  }
}

function appendMessage(text, sender) {
  const chatBody = document.getElementById("chatBody");

  const wrapper = document.createElement("div");
  wrapper.className = `message ${sender === "user" ? "user-message" : "bot-message"}`;

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  // Convert markdown-like **bold** and line breaks
  bubble.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");

  const time = document.createElement("span");
  time.className = "msg-time";
  time.textContent = getTime();

  wrapper.appendChild(bubble);
  wrapper.appendChild(time);
  chatBody.appendChild(wrapper);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function showTyping() {
  const chatBody = document.getElementById("chatBody");
  const wrap = document.createElement("div");
  wrap.className = "typing-wrap";
  wrap.id = "typingIndicator";

  const bubble = document.createElement("div");
  bubble.className = "typing-bubble";
  bubble.innerHTML = "<span></span><span></span><span></span>";

  wrap.appendChild(bubble);
  chatBody.appendChild(wrap);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTyping() {
  document.getElementById("typingIndicator")?.remove();
}

function quickSend(text) {
  document.getElementById("userInput").value = text;
  sendMessage();
}

function clearChat() {
  conversationHistory = [];
  const chatBody = document.getElementById("chatBody");
  chatBody.innerHTML = `
    <div class="message bot-message">
      <div class="msg-bubble">
        👋 Hello! I'm your <strong>AI Customer Care Assistant</strong>.<br/><br/>
        I can help you with:<br/>
        📦 Order tracking &nbsp;|&nbsp; 💰 Refunds &nbsp;|&nbsp; ❓ FAQs
      </div>
      <span class="msg-time">Just now</span>
    </div>
    <div class="quick-replies" id="quickReplies">
      <button onclick="quickSend('Track my order')">📦 Track Order</button>
      <button onclick="quickSend('Refund policy')">💰 Refund Policy</button>
      <button onclick="quickSend('Talk to human agent')">🧑 Human Agent</button>
      <button onclick="quickSend('Cancel my order')">❌ Cancel Order</button>
    </div>`;
}

function handleKey(event) {
  if (event.key === "Enter") sendMessage();
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}