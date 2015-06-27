var app = angular.module('App', ['ngRoute', 'ngMaterial']);
var geocoder = new google.maps.Geocoder();

app.config(['$routeProvider',
  function($routeProvider)
{
  $routeProvider.
    when('/', {
      templateUrl: '/partials/home.html',
      controller: 'HomeController'
    }).
    otherwise({
      redirectTo: '/'
    });
}]);

app.controller('ToolbarController', ['$rootScope', '$http',
  function($rootScope, $http)
{
  $rootScope.user = null;
  $http.get('/user/current').
    success(function(data) {
      if (data.type == 'success') {
        $rootScope.user = data.user;
      };
    });
}]);

app.controller('HomeController', ['$http', '$scope',
  function($http, $scope)
{
  $scope.dayNDaysInFuture = function(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toLocaleString().substring(0, 5);
  };
  $scope.searchParams = {
    location: ''
  };
  $scope.applySearch = function() {
    geocoder.geocode({address: $scope.searchParams.location}, function(results) {
      if (results.length > 0) {
        var location = results[0].geometry.location;
        $scope.map.setCenter(location);
        $scope.currentPosition = [location.lng(), location.lat()];
        $scope.updateFromOffset();
      }
    });
  };
  $scope.currentDateOffset = 0;
  $scope.currentMarkers = [];
  $scope.updateFromOffset = function() {
    var paramObj = {
      lowerLongitude: $scope.currentPosition[0] - 0.5,
      upperLongitude: $scope.currentPosition[0] + 0.5,
      lowerLatitude: $scope.currentPosition[1] - 0.5,
      upperLatitude: $scope.currentPosition[1] + 0.5,
      inDays: $scope.currentDateOffset
    };
    $http.post('/event/search', paramObj).
      success(function(data) {
        for (var m=0; m<$scope.currentMarkers.length; m++) {
          $scope.currentMarkers[m].setMap(null);
        }
        $scope.currentMarkers = [];
        var events = data.events;
        for (var e=0; e<events.length; e++) {
          $scope.currentMarkers.push(new google.maps.Marker({
            position: new google.maps.LatLng(events[e].latitude, events[e].longitude),
            map: $scope.map,
            title: events[e].name
          }));
        }
      });
  };
  $scope.mapElement = document.getElementById('map');
  $scope.mapQueryElement = $('#map');
  $scope.userPosition = [51.5, 0];
  $scope.currentPosition = [$scope.userPosition[0], $scope.userPosition[1]];
  $scope.setScale = function() {
    $scope.mapHeight = $(window).height() - $('#sw_toolbar').height() - $('#sw_slider').height();
    $scope.mapQueryElement.css('height', $scope.mapHeight);
    google.maps.event.trigger($scope.mapElement, "resize");
  };
  var mapOptions = {
      zoom: 13,
      center: new google.maps.LatLng($scope.userPosition[0], $scope.userPosition[1]),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [{"featureType":"administrative.province","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"on"},{"color":"#f4f6f7"}]},{"featureType":"poi","elementType":"all","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"off"},{"color":"#dee2e4"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"all","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","elementType":"all","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry","stylers":[{"lightness":-25},{"saturation":-97},{"color":"#a4afb6"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]}]
  };
  $scope.map = new google.maps.Map($scope.mapElement, mapOptions);
  navigator.geolocation.getCurrentPosition(function(position) {
    $scope.userPosition = [position.coords.longitude, position.coords.latitude];
    $scope.currentPosition = [$scope.userPosition[0], $scope.userPosition[1]];
    $scope.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    $scope.updateFromOffset();
  });
  $(window).resize($scope.setScale);
  $scope.setScale();
  $scope.resetAddition = function() {
    $scope.addition = {
      name: '',
      startTime: new Date(),
      longitude: $scope.userPosition[0],
      latitude: $scope.userPosition[1]
    };
    $scope.addition.startTime.setMilliseconds(null);
    $scope.addition.startTime.setSeconds(null);
  };
  $scope.additionMarker = null;
  $scope.settingPosition = false;
  $scope.setAdditionPosition = function() {
    if (!$scope.settingPosition) {
      $scope.settingPosition = true;
      if ($scope.additionMarker != null) {
        $scope.additionMarker.setMap(null);
      }
      var listener = google.maps.event.addListener($scope.map, 'click', function(event) {
        $scope.settingPosition = false;
        $scope.addition.longitude = event.latLng.lng();
        $scope.addition.latitude = event.latLng.lat();
        $scope.additionMarker = new google.maps.Marker({
            position: event.latLng,
            map: $scope.map
        });
        google.maps.event.removeListener(listener);
        $scope.$apply();
      });
    }
  };
  $scope.resetAddition();
  $scope.makeAddition = function() {
    var addDate = new Date();
    addDate.setDate(addDate.getDate() + $scope.currentDateOffset);
    addDate.setHours(addDate.getHours());
    addDate.setMinutes(addDate.getMinutes());
    addDate.setSeconds(null);
    addDate.setMilliseconds(null);
    var paramObj = {
      name: $scope.addition.name,
      start_time: addDate.toISOString().replace('T', ' ').substring(0, 19),
      longitude: $scope.addition.longitude,
      latitude: $scope.addition.latitude
    };
    console.log(paramObj);
    $http.post('/event/add', paramObj).
      success(function(data) {
        $scope.additionMarker.setMap(null);
        $scope.additionMarker = null;
        $scope.resetAddition();
        $scope.updateFromOffset();
      });
  };
}]);
