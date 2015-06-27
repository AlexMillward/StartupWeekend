var app = angular.module('App', ['ngRoute', 'ngMaterial']);

app.config(['$routeProvider',
  function($routeProvider)
{
  $routeProvider.
    when('/', {
      templateUrl: '/partials/home.html',
      controller: 'HomeController'
    });
}]);

app.controller('HomeController', ['$scope',
  function($scope)
{
  $scope.mapElement = document.getElementById('map');
  $scope.mapQueryElement = $('#map');
  $scope.setScale = function() {
    $scope.mapHeight = $(window).height() - $('#sw_toolbar').height() - $('#sw_slider').height();
    $scope.mapQueryElement.css('height', $scope.mapHeight);
    google.maps.event.trigger($scope.mapElement, "resize");
  };
  var mapOptions = {
      zoom: 13,
      center: new google.maps.LatLng(40.0000, -98.0000),
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  $scope.map = new google.maps.Map($scope.mapElement, mapOptions);
  navigator.geolocation.getCurrentPosition(function(position) {
    $scope.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
  });
  $(window).resize($scope.setScale);
  $scope.setScale();
}]);
