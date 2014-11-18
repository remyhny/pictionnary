/**
 * Created by rehenry on 18/11/2014.
 */
'use strict';

angular
    .module('pictionnary', [
        'ngRoute',
        'rooms',
        'accueil'
    ])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/accueil'});
    }]);