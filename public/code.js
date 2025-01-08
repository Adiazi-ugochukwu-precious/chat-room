(function () {
    const app = document.querySelector(".app");
    const socket = io();
    let uname;
    let profilePic;

    app.querySelector("#join-user").addEventListener("click", function () {
        let username = app.querySelector("#username").value;
        let profileInput = app.querySelector("#profile-pic").files[0];

        if (!username) return;

        if (profileInput) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePic = e.target.result;
                joinChat(username, profilePic);
            };
            reader.readAsDataURL(profileInput);
        } else {
            joinChat(username, null);
        }
    });

    function joinChat(username, profilePic) {
        socket.emit("newuser", { username, profilePic });
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    }

    app.querySelector("#send-message").addEventListener("click", function () {
        let message = app.querySelector("#message-input").value;
        if (!message) return;

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

        app.querySelector("#message-input").value = "";
    });

    app.querySelector("#exit-chat").addEventListener("click", function () {
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
                ${message.profilePic ? `<img src="${message.profilePic}" alt="Profile" class="profile-pic">` : ''}
                <div class="content">
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                    <div class="timestamp">${message.timestamp}</div>
                </div>`;
        } else if (type === "update") {
            el.classList.add("update");
            el.innerText = message;
        }

        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
})();
