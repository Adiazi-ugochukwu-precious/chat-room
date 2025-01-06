(function () {
    const app = document.querySelector(".app");
    const socket = io();
    let uname;
    let profilePic; // Store profile picture as Base64

    // Handle user joining the chatroom
    app.querySelector(".join-screen #join-user").addEventListener("click", function () {
        let username = app.querySelector(".join-screen #username").value;
        let profileInput = app.querySelector(".join-screen #profile-pic").files[0];

        if (username.length === 0) {
            return;
        }

        // Convert profile picture to Base64 (if selected)
        if (profileInput) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePic = e.target.result; // Store Base64 image
                joinChat(username, profilePic);
            };
            reader.readAsDataURL(profileInput);
        } else {
            profilePic = null; // No profile picture
            joinChat(username, profilePic);
        }
    });

    function joinChat(username, profilePic) {
        socket.emit("newuser", { username, profilePic });
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    }

    // Handle sending a message
    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length === 0) {
            return;
        }
        renderMessage("my", {
            username: uname,
            text: message,
            profilePic: profilePic,
        });
        socket.emit("chat", {
            username: uname,
            text: message,
            profilePic: profilePic,
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    // Handle user exiting the chat
    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        socket.emit("exituser", uname);
        app.querySelector(".chat-screen").classList.remove("active");
        app.querySelector(".join-screen").classList.add("active");
        uname = null;
    });

    // Listen for updates
    socket.on("update", function (updateMessage) {
        renderMessage("update", updateMessage); // Render updates as plain text
    });

    // Listen for incoming chat messages
    socket.on("chat", function (message) {
        renderMessage("other", message); // Render other users' messages
    });

    // Render messages in the chat window
    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        if (!messageContainer) return;

        let el = document.createElement("div");
        let profileHtml = message.profilePic
            ? `<img src="${message.profilePic}" alt="Profile" class="profile-pic">`
            : `<div class="profile-placeholder">👤</div>`;
        let timestampHtml = message.timestamp
            ? `<div class="timestamp">${message.timestamp}</div>`
            : '';

        if (type === "my") {
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div>
                    ${profileHtml}
                    <div class="content">
                        <div class="name">You</div>
                        <div class="text">${message.text}</div>
                        ${timestampHtml}
                    </div>
                </div>`;
        } else if (type === "other") {
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                    ${profileHtml}
                    <div class="content">
                        <div class="name">${message.username}</div>
                        <div class="text">${message.text}</div>
                        ${timestampHtml}
                    </div>
                </div>`;
        } else if (type === "update") {
            el.setAttribute("class", "update");
            el.innerText = message; // Render updates as plain text
        }

        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
})();
