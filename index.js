require("dotenv").config();
const cors = require("cors");
const request = require("request");
// var bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
var app = require("express")();
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

app.use("/static", express.static("public"));

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

const pool = new Pool({
  user: "xymanbcpmaetso",
  host: "ec2-23-22-191-232.compute-1.amazonaws.com",
  database: "dfl4jabh70qmq2",
  password: "380616dfaa56e873b66e3cd42bf259c513a1ed1fb8613aca732bffc7c230f3a5",
  port: 5432,
  ssl: true,
});
const keywords = ["admission", "hostel"];

const port = process.env.PORT || 3000;

console.log(__dirname);
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/templates/index.html");
});

app.get("/demo", function (req, res) {
  res.sendFile(__dirname + "/templates/demo.html");
});

app.post("/satisfycount", async function (req, res) {
  let requestData = req.body;
  console.log(requestData);
  await pool.query(
    `SELECT * FROM "query_table" where id=${requestData.qid}`,
    async (error, results) => {
      if (error) {
        console.log(error);
        // throw error;
        res.status(200).json({ message: error });
      }
      if (requestData.flag === "unsatisfied") {
        let unsatCount = results.rows[0].unsatisfied;
        unsatCount = unsatCount + 1;
        await pool.query(
          `UPDATE query_table SET unsatisfied = ${unsatCount} WHERE id = ${requestData.qid}`,
          (err, updates) => {
            if (err) {
              res.status(200).json({ message: err });
            } else if (updates) {
              pool.query(
                `INSERT INTO list_unsat VALUES(DEFAULT,'${requestData.userQ}','${requestData.qid}')`,
                (err, updates) => {
                  if (err) {
                    // console.log(err);
                    res.status(200).json({ message: err });
                  } else if (updates) {
                    res.status(200).json({ message: "Done" });
                  }
                }
              );
              // res.status(200).json({ message: "Done" });
            }
          }
        );
      } else {
        let satCount = results.rows[0].satisfied;
        satCount = satCount + 1;
        await pool.query(
          `UPDATE query_table SET satisfied = ${satCount} WHERE id = ${requestData.qid}`,
          (err, updates) => {
            if (err) {
              // console.log(err);
              res.status(200).json({ message: err });
            } else if (updates) {
              // console.log(updates.rowCount);
              res.status(200).json({ message: "Done" });
            }
          }
        );
      }
    }
  );
});

let users = {};

io.on("connection", function (socket) {
  console.log("a user connected");
  users[socket.id] = socket.id;
  socket.join(socket.id);
  // console.log(socket.rooms);

  socket.on("chat message", function (userRequest) {
    if (checkInput(userRequest.userMsg, socket.id)) {
    } else {
      console.log(userRequest);
      request.post(
        {
          url: "https://flask-webapp-chatbot.herokuapp.com/flask",
          form: { message: userRequest.userMsg, flag: "1" },
        },
        async function (error, response, body) {
          if (error) {
            console.log(error);
            io.in(socket.id).emit("chat message", "from bot " + error);
          } else {
            console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
            console.log("body:", body); // Print the data received
            responseData = JSON.parse(body);
            await pool.query(
              `SELECT * FROM "query_table" where id=${responseData.qid}`,
              (error, results) => {
                if (error) {
                  console.log(error);
                  // throw error;
                  io.in(socket.id).emit(
                    "chat message",
                    "Please try again later or contact us."
                  );
                }

                let botData = {
                  answer: results.rows[0].answer,
                  id: results.rows[0].id,
                  userQ: userRequest.userMsg,
                  fromAI: false,
                };
                let viewCount = results.rows[0].viewed;
                viewCount = viewCount + 1;
                pool.query(
                  `UPDATE query_table SET viewed = ${viewCount} WHERE id = ${responseData.qid}`,
                  (err, updates) => {
                    if (err) {
                      // console.log(err);
                    } else if (updates) {
                      // console.log(updates.rowCount);
                    }
                  }
                );
                console.log("row", botData);

                io.in(socket.id).emit("chat message", botData);
              }
            );
          }
          // res.send(body); //Display the response on the website
        }
      );
    }
  });
  socket.on("disconnect", function () {
    console.info("disconnected user (id=" + socket.id + ").");
    delete users[socket.id];
  });
});
app.get("/allquestions", function (req, res) {
  // const id = parseInt(request.params.id);
  pool.query('SELECT * FROM "query_table"', (error, results) => {
    if (error) {
      res.status(200).json({ message: "Error. Please check connection!!" });
      // throw error;
    }

    res.status(200).json(results.rows);
  });
  // res.sendFile(__dirname + "/index.html");
});

http.listen(process.env.PORT || 3000, function () {
  console.log("listening on *:" + port);
});

function checkInput(userInput, id) {
  console.log(userInput);

  if (keywords.includes(userInput.toLowerCase())) {
    var botData = {
      outputString: getHTML(userInput),
      fromAI: true,
    };
    io.in(id).emit("chat message", botData);
    return true;
  } else {
    return false;
  }
}

function getHTML(word) {
  switch (word) {
    case "admission":
      var outputString = `<div class="botoutputDiv">
      <h5>Select type of Admission:</h5>
      <span>
        <button class="botoutputButtons" onclick="autoSubmit('CAP Round Admission');">CAP Round</button>
      </span>
      <span>
        <button class="botoutputButtons" onclick="autoSubmit('NRI Admission Process');">NRI Admission Process</button>
      </span>
    </div>`;
      return outputString;
    case "hostel":
      var outputString = `<div class="botoutputDiv">
      <p>Select one:</p>
      <span>
        <button class="botoutputButtons" onclick="autoSubmit('Girls hostel');">Girls</button>
      </span>
      <span>
        <button class="botoutputButtons" onclick="autoSubmit('Boys hostel');">Boys</button>
      </span>
    </div>`;
      return outputString;
    default:
      break;
  }
}
