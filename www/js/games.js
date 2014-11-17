var games = angular.module('games', ['ngRoute']);

games.controller('gamesCtrl', ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
    var socket = io.connect('http://82.231.46.169/index', { port: 5555 });
    socket.on('listGames', function (data) {
        if (data) {
            $scope.games = data;
            $scope.$apply();
        }
    });

    $scope.createGame = function () {
        socket.emit('createGame', $scope.game);
        $scope.game = null;
    }

    $scope.enterGame = function (index) {
        if ($scope.name) {
            sessionStorage.setItem("name", $scope.name);
            sessionStorage.setItem("game", index);
            location.href = "room.html";
        } else {
            $scope.error = true;
        }
    }
}]);
