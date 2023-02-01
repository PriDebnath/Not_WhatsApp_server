/*
@version -1

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

*/

let express = require("express");
let { Server } = require("socket.io");
let http = require("http");
let cors = require("cors");

let app = express();
app.use(cors());
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*")
    // res.header("Access-Control-Allow-Methods","GET, HEAD, OPTIONS, POST, PUT, DELETE")
    // res. header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization")
    next();
      
})

let server = http.createServer(app);

let io = new Server(server, {
  maxHttpBufferSize : 1_000_000 ,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let ids = {
  global: {
    id: "global",
    user: "global chat",
  },
};
// console.log(ids);

app.get("/", (req, res) => {
  console.log("client came");
  res.header("Access-Control-Allow-Origin", "*")

  res.send(ids);
});


io.on("connection", (socket) => {

  ids[socket.id] = { id: socket.id, user: `Guest ${socket.id.slice(0, 2)}` };

  socket.on("send_message", (data) => {
    data = { ...data, fromClient: false, ids };

    // storing all ids with user name
    ids[socket.id] = { id: socket.id, user: data.user.slice(0,8) };

    console.log({ data });

    // logic to send message to global or individual
    if (data.receiverId == "global") {
      socket.broadcast.emit("receive_message", data);
    } else {
      let sendTo = data.receiverId;
      let sendData = { ...data, receiverId: data.id };
      // io.to(sendTo).emit(sendData);
      socket.to(sendTo).emit("receive_message", sendData);
      // console.log({ sendData, sendTo });
    }

  });

  // when user leave
  
  socket.on("disconnect", (reason) => {
    // let index = ids.indexOf(socket.id)
    // ids.splice(index,1)
    data = {
      id: socket.id,
      user: ids[socket.id].user,
      receiverId: "global",
      time: new Date().toLocaleTimeString(),
      message: `${ids[socket.id].user} - left`,
      ids,
    };
    socket.broadcast.emit("receive_message", data);
    delete ids[socket.id];
    console.log(" left", socket.id, reason);
  });
});

let port = process.env.PORT || 3001;
const address = "0.0.0.0"  // hostname
server.listen(port, address, (err) => {
  console.log(" Running on ", address, port,err);
  if (err) throw err
});
   