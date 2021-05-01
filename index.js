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
    // const python = spawn("python", ["script.py", msg]);
    // var dataToSend;
    // python.stdout.on("data", function (data) {
    //   dataToSend = data.toString();
    // });
    request.post(
      {
        url: "http://127.0.0.1:5000/flask",
        form: { message: msg, flag: "1" },
      },
      async function (error, response, body) {
        console.error("error:", error); // Print the error
        console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
        console.log("body:", body); // Print the data received
        responseData = JSON.parse(body);
        console.log(responseData.qid);
        await pool.query(
          `SELECT * FROM "query_table" where id=${responseData.qid}`,
          (error, results) => {
            if (error) {
              throw error;
            }
            console.log(results.rows);
          }
        );
        // res.send(body); //Display the response on the website
        io.in(socket.id).emit("chat message", "from bot " + body);
      }
    );
    // in close event we are sure that stream from child process is closed
    // python.on("close", (code) => {
    //   // send data to browser
    //   // res.send(dataToSend);
    //   console.log(dataToSend);
    //   io.in(socket.id).emit("chat message", "from bot " + dataToSend);
    // });

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
  console.log("listening on *:" + port);
});
//////////////////////////////////////////////////////////////
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const pool = new Pool({
  user: "dyhgctjqbmdgzi",
  host: "ec2-23-22-191-232.compute-1.amazonaws.com",
  database: "d8vvied9p5rnob",
  password: "f42f02ba1dec14620f2ee83428f08c834f39edf81ed018d48669ebbfdbc4bb44",
  port: 5432,
  ssl: true,
});
app.get("/allquestions", function (req, res) {
  // const id = parseInt(request.params.id);

  pool.query('SELECT * FROM "query_table"', (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
  // res.sendFile(__dirname + "/index.html");
});
