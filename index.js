require("dotenv").config();
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
const { spawn } = require("child_process");
const Pool = require("pg").Pool;
const cors = require("cors");
const request = require("request");

app.use(cors());
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
    console.log(msg);
    const python = spawn("python", ["script.py", msg]);
    var dataToSend;
    python.stdout.on("data", function (data) {
      dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on("close", (code) => {
      // send data to browser
      // res.send(dataToSend);
      console.log(dataToSend);
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
//////////////////////////////////////////////////////////////
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "chatbot",
  password: "srushti6",
  port: 5432,
});
app.get("/allquestions", function (req, res) {
  // const id = parseInt(request.params.id);

  pool.query('SELECT * FROM "Admin_query_table"', (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
  // res.sendFile(__dirname + "/index.html");
});

app.get("/home", function (req, res) {
  // request("http://127.0.0.1:5000/flask", function (error, response, body) {
  //   console.error("error:", error); // Print the error
  //   console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
  //   console.log("body:", body); // Print the data received
  //   res.send(body); //Display the response on the website
  // });
  request.post(
    { url: "http://127.0.0.1:5000/flask", form: { key: "value" } },
    function (error, response, body) {
      console.error("error:", error); // Print the error
      console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
      console.log("body:", body); // Print the data received
      res.send(body); //Display the response on the website
    }
  );
});
