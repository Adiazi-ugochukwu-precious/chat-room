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

        if (profileInput) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePic = e.target.result;
                joinChat(username, profilePic);
            };
            reader.readAsDataURL(profileInput);
        } else {
            profilePic = null;
            joinChat(username, profilePic);
        }
    });

    function joinChat(username, profilePic) {
        socket.emit("newuser", { username, profilePic });
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    }

    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length === 0) return;

        renderMessage("my", {
            username: uname,
            text: message,
            profilePic: profilePic,
            timestamp: new Date().toLocaleTimeString(),
        });

        socket.emit("chat", {
            username: uname,
            text: message,
            profilePic: profilePic,
        });

        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        socket.emit("exituser", uname);
        app.querySelector(".chat-screen").classList.remove("active");
        app.querySelector(".join-screen").classList.add("active");
        uname = null;
    });

    socket.on("update", function (updateMessage) {
        renderMessage("update", updateMessage);
    });

    socket.on("chat", function (message) {
        renderMessage("other", message);
    });

    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");

        let el = document.createElement("div");

        if (type === "update") {
            el.classList.add("message", "update");
            el.innerText = message;
        } else {
            let profileHtml = message.profilePic
                ? `<img src="${message.profilePic}" alt="Profile" class="profile-pic">`
                : `<div class="profile-placeholder">👤</div>`;

            let contentHtml = `
                <div class="content">
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                    <div class="timestamp">${message.timestamp}</div>
                </div>
            `;

            el.classList.add("message", type === "my" ? "my-message" : "other-message");
            el.innerHTML = profileHtml + contentHtml;
        }

        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
})();
