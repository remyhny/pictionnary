var conf = require('./conf.json');
var http = require('http');
var url = require('url');
var fs = require('fs');
var game = require('./games.js');



var httpServer = http.createServer(onRequest).listen(conf.http.port);

var io = require('socket.io').listen(httpServer, { origins: '*:*' });

//Fonction onRequest est exécutée à chaque requête sur le serveur
function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var extension = pathname.split('.').pop();
    if (pathname == '/') pathname = conf.http.index;
    response.writeHead(200, {
        'Content-Type': conf.http.mime[extension],
        'Access-Control-Allow-Origin': '*'
    });
    try {
        response.end(fs.readFileSync(conf.http.www + pathname));
    } catch (e) {
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.end(e + fs.readFileSync(conf.http.error['404']));
    }
}


function getUsers() {
    var userNames = [];
    for (var name in users) {
        if (users[name]) {
            userNames.push(users[name].name);
        }
    }
    return userNames;
}

var users = {};
var games = {};
var ctn = 0;
var ctnG = 0;

var sendLst = function (lstUser, socket, message) {
    for (var i = 0; i < lstUser.length; i++) {
        users[lstUser[i].key].socket.emit(socket, message);
    }
}

var index = io
    .of('/index')
    .on('connection', function (socket) {
        socket.emit('listGames', games);

        socket.on('createGame', function (newGame) {
            if (newGame.name && newGame.theme) {
                ctnG++;
                myGame = 'game#' + ctnG;
                games[myGame] = new game(newGame.name, newGame.theme, myGame);
                index.emit('listGames', games);
            }
        });

    });

var room = io
    .of('/room')
    .on('connection', function (socket) {

        var myName;
        socket.on('enterGame', function (newUser) {
            ctn++;
            myName = 'user#' + ctn;
            users[myName] = {
                "name": newUser.name,
                "socket": socket,
                "game": newUser.game
            };
            if (games[newUser.game]) {
                games[newUser.game].addUser(users[myName].name, myName);
                lstUser = games[newUser.game].lstUser
                sendLst(lstUser, 'listUsers', lstUser);
            }

        });

        socket.on('disconnect', function () {
            if (users[myName]) {
                lstUser = games[users[myName].game].lstUser
                for (var i = 0; i < lstUser.length; i++) {
                    if (lstUser[i].key == myName) {
                        lstUser.splice(i, 1);
                    }
                }
                sendLst(lstUser, 'listUsers', lstUser);
                users[myName] = null;
            }
        });

        socket.on('message', function (message) {
            lstUser = games[users[myName].game].lstUser
            msg = {
                from: users[myName].name,
                text: message
            }
            sendLst(lstUser, 'newMessage', msg);
        });
    });

var canvas = io
    .of('/canvas')
    .on('connection', function (socket) {
        socket.on('sendDraw', function (message) {
            var position = message.position;
            var game = message.game;
            lstUser = games[game].lstUser

            for (var i = 0; i < lstUser.length; i++) {
                users[lstUser[i].key].socket.emit('receiveDraw', position);
            }
        });

    });
