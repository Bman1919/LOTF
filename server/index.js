const Projects = require('../src/assets/projects.json');

const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server (server, {
    cors : {
        origin: "*", // React Dev Server, change later to the correct value, will figure out how to
        methods: ["GET", "POST"]
    }
})
const lobbies = {};
const games = {};

function resolveDay(lobbyID){
    const newGames = games[lobbyID];
    
}

app.get('/', (req, res) => {
    res.send('Server is running!');
})

io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
    })

    socket.on('join-lobby', (lobbyId) => {
        socket.join(lobbyId);
        if(!lobbies[lobbyId]) lobbies[lobbyId] = [];
        lobbies[lobbyId].push({
            id: socket.id,
            characterIndex: -1
        });

        io.to(lobbyId).emit('lobby-users', lobbies[lobbyId]);

        console.log(`Joined ${lobbyId} as ${socket.id}`);
    });

    socket.on('leave-lobby', (lobbyId) => {
        socket.leave(lobbyId);
        if(lobbies[lobbyId]){
            lobbies[lobbyId] = lobbies[lobbyId].filter(id => id.id !== socket.id);
            io.to(lobbyId).emit('lobby-users', lobbies[lobbyId]);
            // Clean up empty lobbies
            if(lobbies[lobbyId].length === 0) delete lobbies[lobbyId];
        }
    });

    socket.on('disconnecting', () => {
        for(const lobbyId of socket.rooms){
            if(lobbies[lobbyId]){
                lobbies[lobbyId] = lobbies[lobbyId].filter(id => id.id !== socket.id);
                io.to(lobbyId).emit('lobby-users', lobbies[lobbyId]);
                if (lobbies[lobbyId].length === 0) delete lobbies[lobbyId];
            }
        }
    })

    socket.on('change-user', (cId) => {
        for(const lobbyId of socket.rooms){
            if(lobbies[lobbyId]){
                const user = lobbies[lobbyId].find(u => u.id === socket.id);
                if(user){
                    user.characterIndex = cId;
                    io.to(lobbyId).emit('lobby-users', lobbies[lobbyId]);
                }
            }
        }
    })

    socket.on('start-game', (lobbyId) => {
        if(games[lobbyId]){socket.emit("start-game-failed"); console.log("Start-game-failed"); return;}
        if(lobbies[lobbyId]){
            if(!games[lobbyId]) games[lobbyId] = {
                players: lobbies[lobbyId],
                gameState:{
                    isDay: true,
                    conch: Math.floor(Math.random() * lobbies[lobbyId].length),
                    projects: {
                        active: [],
                        passive: []
                    }
                }
            };
            
            for(const project of Projects.active){
                let cost = {};
                if(project.cost) {
                    for(const [resource, value] of Object.entries(project.cost)){
                        if(typeof value === "string" && value.includes("numPlayers")){
                            const expr = value.replace(/numPlayers/g,lobbies[lobbyId].length);
                            try{
                                cost["resources"] = eval(expr);
                            }catch{
                                cost["resources"] = value;
                            }
                        }else{
                            cost["resources"] = value;
                        }
                    }
                }

                games[lobbyId].gameState.projects.active.push({
                    ...project,
                    progress: 0,
                    cost
                });
            }
            
            for(const project of Projects.passive){
                games[lobbyId].gameState.projects.passive.push({
                    ...project,
                    isAlive: true
                });
            }

            for(const player of games[lobbyId].players){
                player.HP = 3;
                player.food = 0;
                player.resources = 0;
                player.registeredEvent = {type: "None"};
            }
            delete lobbies[lobbyId];
            io.to(lobbyId).emit('game-started');
        }
    })

    socket.on('sync-event', (event, lobbyId) => {
        if (games[lobbyId]) {
            const player = games[lobbyId].players.find(u => u.id === socket.id);
            if (player) {
                player.registeredEvent = event;
            }
            io.to(lobbyId).emit('sync-game-state',games[lobbyId]);
        }
    });

    socket.on('get-game-state', (lobbyId, callback) => {
        if(games[lobbyId]){
            callback(games[lobbyId]);
        }else{
            callback(null);
        }
    });
})

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})