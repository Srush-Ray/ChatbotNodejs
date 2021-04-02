require("dotenv").config();
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
const { spawn } = require("child_process");

const port = process.env.PORT;

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
let users = {};

io.on("connection", function (socket) {
  console.log("a user connected");
  users[socket.id] = socket.id;
  socket.join(socket.id);
  // console.log(socket.rooms);
  socket.on("chat message", function (msg) {
    const python = spawn("python", ["script.py", msg]);
    var dataToSend;
    python.stdout.on("data", function (data) {
      dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on("close", (code) => {
      // send data to browser
      // res.send(dataToSend);
      io.in(socket.id).emit("chat message", "from bot " + dataToSend);
    });

    // io.in(socket.id).emit("chat message", "from bot " + msg);
    // console.log("message: " + msg);
  });
  socket.on("disconnect", function () {
    console.info("disconnected user (id=" + socket.id + ").");
    delete users[socket.id];
    // console.log(users);
    // console.log(socket.rooms);
  });
});

http.listen(port || 5000, function () {
  console.log("listening on *:3000");
});
