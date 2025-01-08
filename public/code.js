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
                profilePic = e.target.result;
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

    app.querySelector("#exit-chat").addEventListener("click", function () {
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

    function renderMessage(type, message) {
        const messageContainer = app.querySelector(".messages");
        const el = document.createElement("div");
        el.classList.add("message");

        if (type === "my") {
            el.classList.add("my-message");
            el.innerHTML = `
                <div class="content">
                    <div class="text">${message.text}</div>
                    <div class="timestamp">${message.timestamp}</div>
                </div>`;
        } else if (type === "other") {
            el.classList.add("other-message");
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
            el.classList.add("update");
            el.innerText = message;
        }

        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
})();
