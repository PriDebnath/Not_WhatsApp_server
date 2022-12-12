let express = require("express");
let { Server } = require("socket.io");
let http = require("http");
let cors = require("cors");

let app = express();

app.use(cors);

let server = http.createServer(app);

let io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  //console.log("id", socket.id);
  socket.rooms.forEach((room)=>{console.log(room)})

  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
    console.log(data);
  });
});

let port = 3001;
server.listen(port, () => {
  console.log("Running on ", port);
});
