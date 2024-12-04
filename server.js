const express = require('express');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;
const server = app.listen(port, () => {
    console.log("Server is running");
});

const wss = new WebSocket.Server({ server });

const rooms = {};

wss.on('connection', (ws, req) => {
    const roomId = req.url.substring(1) || uuidv4(); // Generate roomId if not present in URL
    if (!rooms[roomId]) {
        rooms[roomId] = [];
    }

    rooms[roomId].push(ws);
    console.log(`New connection in room ${roomId}`);

    ws.on('message', (message) => {
        console.log(`Received message in room ${roomId}: ${message}`);
        // Send message to all participants in the room
        rooms[roomId].forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log(`Connection closed in room ${roomId}`);
        rooms[roomId] = rooms[roomId].filter(client => client !== ws);
        if (rooms[roomId].length === 0) {
            delete rooms[roomId]; // Remove room if it is empty
        }
    });
});
