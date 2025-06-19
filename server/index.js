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
    const animation = [];
    for(let i = 0; i < games[lobbyID].players.length; i++){
        let event = games[lobbyID].players[i].registeredEvent;
        let player = games[lobbyID].players[i];

        if(event.isProject){
            let amount = 2 + (games[lobbyID].players[i].flags?.["extra-resource-use"] ?? 0);

            switch(event.type){
                case "active": {
                    let project = games[lobbyID].gameState.projects.active.find(u => u.name == event.name);
                    if(project){
                        if(event.cost.resources){
                            amount = Math.min(amount, project.cost.resources - project.progress.resources,player.resources);
                            player.resources -= amount;
                            project.progress.resources += amount;
                        }else if(event.cost.food){
                            amount = Math.min(amount, project.cost.food - project.progress.food,player.food);
                            player.food -= amount;
                            project.progress.food += amount;
                        }

                        animation.push({
                            type: "action",
                            project: project,
                            player: player,
                            action: "project",
                            amount: amount
                        });

                        if(amount != 0 && !((project.cost.resources && (project.cost.resources - project.progress.resources <= 0)) || (project.cost.food && (project.cost.food - project.progress.food <= 0)))){
                            animation.push({
                                type: "action",
                                project: project,
                                player: player,
                                action: "project-completition",
                                amount: amount
                            })
                        }
                    }
                } break;
                case "passive": {
                    let project = games[lobbyID].gameState.projects.passive.find(u => u.name == event.name);
                    if(project){
                        if(event.upkeep.resources){
                            amount = Math.min(amount, player.resources);
                            player.resources -= amount;
                            project["this-turn-amt"].resources += amount;
                        }
                        if(event.upkeep.food){
                            amount = Math.min(amount, player.food);
                            player.food -= amount;
                            project["this-turn-amt"].food += amount;
                        }

                        animation.push({
                            type: "action",
                            player: player,
                            action: "project",
                            amount: amount
                        })
                    }
                } break;
            }
        }else{
            if(event.type == "Food"){
                let amount = 2 + (games[lobbyID].players[i].flags?.["extra-food"] ?? 0);
                player.food += amount;

                animation.push({
                    type: "action",
                    player: games[lobbyID].players[i],
                    action: "food",
                    amount: amount
                });
            }else if (event.type == "Resources"){
                let amount = 2 + (games[lobbyID].players[i].flags?.["extra-resource"] ?? 0);
                player.resources += amount;

                animation.push({
                    type: "action",
                    player: games[lobbyID].players[i],
                    action: "resource",
                    amount: amount
                });
            }
        }
        player.registeredEvent = null;
    }

    {
        let passiveProjs = games[lobbyID].gameState.projects.passive;
        for(let i = passiveProjs.length - 1; i >= 0; i--){
            let proj = passiveProjs[i];
            if((proj.upkeep.food && (proj.upkeep.food > proj["this-turn-amt"].food)) || (proj.upkeep.resources && (proj.upkeep.resources > proj["this-turn-amt"].resources))){
                proj.isAlive = false;
                animation.push({
                    type: "project",
                    project: proj,
                    event: "died"
                });
            }
            if(!proj.isAlive){
                passiveProjs.splice(i,1);
                break;
            }
        }
    }

    animation.push({
        type: "time",
        action: "nightime"
    })

    console.log("Emitting Animate");
    console.log("Sockets in room", lobbyID, Array.from(io.sockets.adapter.rooms.get(lobbyID) || []));
    io.to(lobbyID).emit("animate",animation);
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
                                console.log(`Evaluating ${expr}...`);
                                console.log(`Resulting in ${eval(expr)}`);
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
                    progress: {
                        "resources": 0,
                        "food": 0
                    },
                    cost
                });
            }
            
            for(const project of Projects.passive){
                games[lobbyId].gameState.projects.passive.push({
                    ...project,
                    isAlive: true,
                    "this-turn-amt": {
                        "resources": 0,
                        "food": 0
                    }
                });
            }

            for(const player of games[lobbyId].players){
                player.HP = 3;
                player.food = 0;
                player.resources = 0;
                player.registeredEvent = {type: "None"};
            }
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
            if(games[lobbyId].players.every((p) => (p.registeredEvent?.type !== "None"))){
                resolveDay(lobbyId);
            }
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