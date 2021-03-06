require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const cors = require('cors');
const socket = require('socket.io')

const user = require("./app/routes/user");
const blocker = require('./app/routes/blocker.js');

app.use(cors());
mongoose.Promise = global.Promise;

const username = process.env.USERNAME;
const password = process.env.PASSWORD;

const uri = `mongodb+srv://${username}:${password}@cluster0.hkrzv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(uri, {
  useNewUrlParser: true
}).then(() => {
  console.log("Successfully connected to the database");
}).catch(err => {
  console.log('Could not connect to the database. Error...', err);
  process.exit();
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use("/user", user);

app.use("/blocker", blocker);

const server = app.listen(process.env.PORT || 3001, function () {
  console.log('listening on 3000')
});

const io = socket(server);

io.on('connection', (socket) => {
  socket.on('message', (data) => {
    io.emit('message', data);
  });
});
