var games = angular.module('accueil', ['ngRoute']);

games
    .controller('accueilCtrl', ['$scope', '$routeParams', '$location', function($scope, $routeParams, $location) {
        var socket = io.connect('http://82.231.46.169/index', {port: 5555});
        socket.on('listGames', function(data) {
            if (data) {
                $scope.games = data;
                $scope.$apply();
            }
        });

        $scope.createGame = function() {
            socket.emit('createGame', $scope.game);
            $scope.game = null;
            $scope.isCreateGame = false;
        };

        $scope.enterGame = function(index) {
            if ($scope.name) {
                sessionStorage.setItem("name", $scope.name);
                sessionStorage.setItem("game", index);
                location.href = "#/room";
            } else {
                $scope.error = true;
            }
        }
    }])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/accueil', {
            templateUrl: 'modules/accueil/accueil.html',
            controller: 'accueilCtrl'
        });
    }]);
