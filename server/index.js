const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server (server, {
    cors : {
        origin: "http://localhost:5173", // React Dev Server, change later to the correct value, will figure out how to
        methods: ["GET", "POST"]
    }
})

app.get('/', (req, res) => {
    res.send('Server is running!');
})

io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
    })
})

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})