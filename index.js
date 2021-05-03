require("dotenv").config();
const cors = require("cors");
const request = require("request");

var app = require("express")();
app.use(cors());

var http = require("http").createServer(app);
var io = require("socket.io")(http, {
  cors: {
    origin: "*",
    credentials: true,
  },
});
// const { spawn } = require("child_process");
const Pool = require("pg").Pool;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// const pool = new Pool({
//   user: "dyhgctjqbmdgzi",
//   host: "ec2-23-22-191-232.compute-1.amazonaws.com",
//   database: "d8vvied9p5rnob",
//   password: "f42f02ba1dec14620f2ee83428f08c834f39edf81ed018d48669ebbfdbc4bb44",
//   port: 5432,
//   ssl: true,
// });

const pool = new Pool({
  user: "xymanbcpmaetso",
  host: "ec2-23-22-191-232.compute-1.amazonaws.com",
  database: "dfl4jabh70qmq2",
  password: "380616dfaa56e873b66e3cd42bf259c513a1ed1fb8613aca732bffc7c230f3a5",
  port: 5432,
  ssl: true,
});

const port = process.env.PORT || 3000;
console.log(__dirname);
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/templates/index.html");
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
        url: "https://flask-webapp-chatbot.herokuapp.com/flask",
        form: { message: msg, flag: "1" },
      },
      async function (error, response, body) {
        if (error) {
          console.log(error);
          io.in(socket.id).emit("chat message", "from bot " + error);
        } else {
          console.log("went good");
          console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
          console.log("body:", body); // Print the data received
          responseData = JSON.parse(body);
          await pool.query(
            `SELECT * FROM "query_table" where id=${responseData.qid}`,
            (error, results) => {
              if (error) {
                console.log(error);
                // throw error;
                io.in(socket.id).emit("chat message", "from bot " + error);
              }
              console.log(results.rows[0].answer);
              io.in(socket.id).emit(
                "chat message",
                "from bot :" + results.rows[0].answer
              );
            }
          );
        }
        // res.send(body); //Display the response on the website
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

http.listen(process.env.PORT || 3000, function () {
  console.log("listening on *:" + port);
});
//////////////////////////////////////////////////////////////

// heroku ps:scale web=1 other-web=1

// web: python main.py
// app: npm start
// web: gunicorn model:app
//
// webpy: python server.py
// webjs: node server.js
