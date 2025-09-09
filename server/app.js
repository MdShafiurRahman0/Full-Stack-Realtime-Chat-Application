const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config({ path: "../.env" });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const publicDirectory = path.join(__dirname, "../client/public");

app.use(express.static(publicDirectory));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../client/views"));

app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chatMessage", (msg) => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    io.emit("chatMessage", { ...msg, time: time });
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
