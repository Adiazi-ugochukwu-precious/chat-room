(function () {
    const app = document.querySelector(".app");
    const socket = io();
    let uname;
    let profilePic;

    app.querySelector("#join-user").addEventListener("click", function () {
        const username = app.querySelector("#username").value;
        const profileInput = app.querySelector("#profile-pic").files[0];

        if (username.length === 0) return;

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

    app.querySelector("#send-message").addEventListener("click", function () {
        const message = app.querySelector("#message-input").value;
        if (message.length === 0) return;

        renderMessage("my", { username: uname, text: message, profilePic, timestamp: new Date().toLocaleTimeString() });
        socket.emit("chat", { username: uname, text: message, profilePic });
        app.querySelector("#message-input").value = "";
    });

    app.querySelector("#exit-chat").addEventListener("click", function () {
        socket.emit("exituser", uname);
        app.querySelector(".chat-screen").classList.remove("active");
        app.querySelector(".join-screen").classList.add("active");
        uname = null;
    });

    socket.on("update", (updateMessage) => renderMessage("update", updateMessage));
    socket.on("chat", (message) => renderMessage("other", message));

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
