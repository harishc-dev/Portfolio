const API = "https://whispr-fu3w.onrender.com";
let sessionUser = null;
let chatWith = null;
let token = null;

const USERS = ["guest1", "guest2"];

function $(id) { return document.getElementById(id); }

function renderLogin() {
  document.getElementById('root').innerHTML = `
    <div style="text-align:center;margin-top:24px;">
      <img src="logo.png" alt="Whispr" style="width:54px;height:54px;border-radius:12px;box-shadow:0 2px 8px #6366f133;">
    </div>
    <h2>Whispr Web Demo</h2>
    <p>Login as one of the guest users to start chatting.</p>
    <button class="login-btn" onclick="quickLogin('guest1')">Login as guest1</button>
    <button class="login-btn" onclick="quickLogin('guest2')">Login as guest2</button>
  `;
}

window.quickLogin = function(user) {
  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: user, password: user })
  })
  .then(res => res.json())
  .then(res => {
    if (res.status === "Success") {
      sessionUser = user;
      chatWith = USERS.find(u => u !== user);
      token = res.token || null;
      renderChat();
      pollMessages();
    } else {
      alert("Login failed.");
    }
  });
};

window.logout = function() {
  sessionUser = null;
  chatWith = null;
  token = null;
  renderLogin();
};

function renderChat() {
  document.getElementById('root').innerHTML = `
    <div>
      <button class="logout-btn" onclick="logout()">Logout</button>
      <div style="text-align:center;margin-top:10px;">
        <img src="logo.png" alt="Whispr" style="width:40px;height:40px;border-radius:10px;box-shadow:0 2px 8px #6366f133;">
      </div>
      <h3 style="text-align:center;">Logged in as: ${sessionUser}</h3>
      <div class="profile">
        <b>Profile:</b> ${sessionUser}<br>
        <span class="status" id="status-info">Status: ...</span>
      </div>
      <div style="text-align:center;"><b>Chatting with:</b> ${chatWith}</div>
      <div id="chat-box" class="chat-box"></div>
      <form class="chat-input" onsubmit="return sendMessage();">
        <input type="text" id="msg-input" placeholder="Type a message..." autocomplete="off" autofocus>
        <button class="send-btn" type="submit">Send</button>
      </form>
    </div>
  `;
  fetchStatus();
  fetchMessages();
}

function fetchStatus() {
  fetch(`${API}/online_status/${chatWith}`)
    .then(res => res.json())
    .then(res => {
      $("status-info").innerText = "Status: " + (res.online ? "Online" : "Offline");
    });
}

function fetchMessages() {
  fetch(`${API}/chat/${sessionUser}/${chatWith}`)
    .then(res => res.json())
    .then(res => {
      const box = $("chat-box");
      box.innerHTML = "";
      (res.messages || []).forEach(([sender, msg, ts], i) => {
        const who = sender === sessionUser ? "me" : "other";
        box.innerHTML += `<div class="chat-msg ${who}" style="opacity:0;">${sender}: ${msg} <span>${ts}</span></div>`;
      });
      // Animate messages in
      const msgs = box.querySelectorAll('.chat-msg');
      msgs.forEach((el, i) => setTimeout(() => el.style.opacity = 1, 60 * i));
      box.scrollTop = box.scrollHeight;
    });
}

window.sendMessage = function() {
  const input = $("msg-input");
  const msg = input.value.trim();
  if (!msg) return false;
  fetch(`${API}/send_message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender: sessionUser, receiver: chatWith, message: msg })
  })
  .then(res => res.json())
  .then(res => {
    if (res.status === "Message sent") {
      input.value = "";
      fetchMessages();
    }
  });
  return false; // Prevent form submit
};

function pollMessages() {
  if (!sessionUser) return;
  fetchMessages();
  fetchStatus();
  setTimeout(pollMessages, 2000);
}

// Initial render
renderLogin();