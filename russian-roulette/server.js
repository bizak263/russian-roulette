const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

const games = new Map();

io.on('connection', (socket) => {
    socket.on('join_game', ({ code, username }) => {
        console.log('Join attempt:', { code, username });
        
        let game = games.get(code);
        if (!game) {
            game = {
                players: [],
                shells: ['🔴', '🔴', '⚪', '⚪', '⚪']
            };
            games.set(code, game);
        }

        if (game.players.length < 2) {
            game.players.push({
                id: socket.id,
                username,
                health: 4
            });
            
            socket.join(code);
            
            if (game.players.length === 2) {
                io.to(code).emit('game_started', { players: game.players });
            }
        }
    });

    socket.on('shoot', ({ code }) => {
        const game = games.get(code);
        if (!game) return;

        const isLoaded = Math.random() < 0.4;
        if (isLoaded) {
            const player = game.players.find(p => p.id === socket.id);
            if (player) {
                player.health -= 1;
            }
        }

        io.to(code).emit('shot_result', {
            players: game.players,
            isLoaded
        });
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});