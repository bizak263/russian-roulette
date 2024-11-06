@echo off
echo Installing dependencies...
npm init -y
npm install express socket.io
echo Starting server...
start http://localhost:3000
node server.js
pause