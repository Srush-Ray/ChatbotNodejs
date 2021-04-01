require("dotenv").config();
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
const port = process.env.PORT;

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
let users = {};

io.on("connection", function (socket) {
  console.log("a user connected");
  users[socket.id] = socket.id;
  console.log(users);
  socket.join(socket.id);
  socket.on("chat message", function (msg) {
    io.in(socket.id).emit("chat message", msg);
    console.log("message: " + msg);
  });
  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

http.listen(port || 5000, function () {
  console.log("listening on *:3000");
});
