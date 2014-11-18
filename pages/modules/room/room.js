var rooms = angular.module('rooms', ['ngRoute']);

rooms
    .controller('roomCtrl', ['$scope', '$routeParams', '$location', '$timeout', function($scope, $routeParams, $location, $timeout) {
        var socket = io.connect('http://localhost/room', {port: 5555});
        var textChat = document.getElementById("textChat");

        if (sessionStorage.getItem('name') && sessionStorage.getItem('game')) {
            $scope.name = sessionStorage.getItem('name');
            $scope.game = sessionStorage.getItem('game');
            socket.emit('enterGame', {"name": $scope.name, "game": $scope.game});

            $scope.$watch('name', function(newValue) {
                if (newValue == "" || newValue == null) {
                    location.href = "#/accueil";
                }
            });

            $scope.$watch('game', function(newValue) {
                if (newValue == "" || newValue == null) {
                    location.href = "#/accueil";
                }
            });
        } else {
            location.href = "#/accueil";
        }


        socket.on('listUsers', function(lstUsers) {
            $scope.lstUsers = lstUsers;
            $scope.$apply();
        });

        $scope.messages = [];


        $scope.$watch('messages.length', function(newValue) {
            $timeout(function() {
                textChat.scrollTop = textChat.scrollHeight + 100;
            }, 200);
        });

        socket.on('newMessage', function(msg) {
            if (msg.from != $scope.name) {
                console.log(msg);
                $scope.messages.push(msg.from + " : " + msg.text);
                $scope.$apply();
            }
        });

        socket.on('receiveDraw', function(position) {
            $scope.$broadcast('receiveDraw', position);
        });

        $scope.sendMessage = function() {
            if ($scope.message) {
                socket.emit('message', $scope.message);
                $scope.messages.push($scope.name + " : " + $scope.message);
                $scope.message = null;
            }
        };

        $scope.keyPress = function(event) {
            if (event.keyCode === 13) {
                $scope.sendMessage();
            }
        }
    }])
    .directive('canvas', ['$window', '$http', function($window, $http) {
        return {
            restrict: 'A',
            templateUrl: 'modules/room/template/canvas.html',
            link: function(scope, elem, attr) {
            },
            controller: ['$scope', '$http', '$timeout', function($scope, $http) {
                var beginPath = false;
                var position = {x: null, y: null};
                var color = "#000";
                var canvas, ctx = null;

                var socket = io.connect('http://localhost/canvas', {port: 5555});

                $scope.$on('receiveDraw', function(event, position) {
                    canvasObj.socketDraw(position);
                });


                $scope.init = function() {
                    jscolor.init();
                    canvasObj.createCanvas('myCanvas');
                };

                var changeColor = function(event) {
                    canvasObj.changeColor(event.target.value);
                };

                $scope.clearCanvas = function() {
                    canvasObj.clearCanvas();
                };


                var beginDrawLine = function(event) {
                    canvasObj.beginDraw(event.layerX, event.layerY);
                };

                var continueDrawLine = function(event) {
                    canvasObj.continueDraw(event.layerX, event.layerY);
                };

                var endDraw = function(event) {
                    canvasObj.endDraw();
                };

                canvasObj = {
                    createCanvas: function(id) {
                        canvas = document.getElementById(id);
                        colorDiv = document.getElementById('myColor');
                        ctx = canvas.getContext('2d');
                        canvas.addEventListener('mousedown', beginDrawLine);
                        canvas.addEventListener('mouseup', endDraw);
                        canvas.addEventListener('mouseleave', endDraw);
                        canvas.addEventListener('mousemove', continueDrawLine);
                        colorDiv.addEventListener('change', changeColor);
                    },
                    beginDraw: function(x, y) {
                        if (!beginPath) {
                            var sendPosition = {debut: {x: x, y: y}, fin: {x: x + 1, y: y + 1}, color: color};
                            ctx.beginPath();
                            position.x = x;
                            position.y = y;
                            beginPath = true;
                            ctx.moveTo(x, y);
                            ctx.lineTo(x + 1, y + 1);
                            ctx.strokeStyle = color;
                            ctx.stroke();
                            ctx.closePath();
                            socket.emit('sendDraw', {"position": sendPosition, "game": $scope.game});
                        }
                    },
                    continueDraw: function(x, y) {
                        if (beginPath) {
                            var sendPosition = {debut: {x: position.x, y: position.y}, fin: {x: x, y: y}, color: color};
                            beginPath = false;
                            ctx.beginPath();
                            ctx.moveTo(position.x, position.y);
                            ctx.lineTo(x, y);
                            position.x = x;
                            position.y = y;
                            ctx.strokeStyle = color;
                            ctx.stroke();
                            beginPath = true;
                            ctx.closePath();
                            socket.emit('sendDraw', {"position": sendPosition, "game": $scope.game});
                        }
                    },
                    socketDraw: function(position) {
                        if (position != "clear") {
                            ctx.beginPath();
                            ctx.moveTo(position.debut.x, position.debut.y);
                            ctx.lineTo(position.fin.x, position.fin.y);
                            ctx.strokeStyle = position.color;
                            ctx.stroke();
                            ctx.closePath();
                        } else {
                            ctx.clearRect(0, 0, 450, 450);
                        }
                    },
                    endDraw: function() {
                        beginPath = false;
                        ctx.closePath();
                    },
                    changeColor: function(c) {
                        color = "#" + c;
                    },
                    clearCanvas: function() {
                        ctx.clearRect(0, 0, 450, 450);
                        socket.emit('sendDraw', {position: "clear", "game": $scope.game});
                    }
                }
            }]
        };
    }])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/room', {
            templateUrl: 'modules/room/room.html',
            controller: 'roomCtrl'
        });
    }]);