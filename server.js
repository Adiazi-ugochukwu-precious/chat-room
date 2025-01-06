const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "/public")));

io.on("connection", function (socket) {
    socket.on("newuser", function (data) {
        socket.broadcast.emit("update", `${data.username} joined the conversation`);
        socket.profilePic = data.profilePic; // Store user's profile picture on the socket
    });

    socket.on("exituser", function (username) {
        socket.broadcast.emit("update", `${username} left the conversation`);
    });

    socket.on("chat", function (message) {
        const timestamp = new Date().toLocaleTimeString();
        socket.broadcast.emit("chat", {
            username: message.username,
            text: message.text,
            profilePic: message.profilePic,
            timestamp: timestamp,
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
