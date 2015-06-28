var app = angular.module('App', ['ngRoute', 'ngMaterial']);
var geocoder = new google.maps.Geocoder();

app.config(['$routeProvider', '$mdThemingProvider',
  function($routeProvider, $mdThemingProvider)
{
  $routeProvider.
    when('/', {
      templateUrl: '/partials/home.html',
      controller: 'HomeController'
    }).
    otherwise({
      redirectTo: '/'
    });
  var tealT = $mdThemingProvider.extendPalette('teal', {
    '400': '81cbb3'
  });
  var pinkT = $mdThemingProvider.extendPalette('pink', {
    '400': 'f7a696'
  });
  $mdThemingProvider.definePalette('teal0', tealT);
  $mdThemingProvider.definePalette('pink0', pinkT);
  $mdThemingProvider.theme('default')
    .primaryPalette('teal0', {
      'default': '400'
    }).
    accentPalette('pink0', {
      'default': '400'
    });
}]);

app.controller('ToolbarController', ['$rootScope', '$scope', '$http', '$mdDialog',
  function($rootScope, $scope, $http, $mdDialog)
{
  $rootScope.user = null;
  $http.get('/user/current').
    success(function(data) {
      if (data.type == 'success') {
        $rootScope.user = data.user;
      };
    });
  $scope.openTimeline = function() {
    $mdDialog.show({
      parent: angular.element(document.body),
      templateUrl: '/partials/timeline.html',
      controller: 'TimelineController',
      clickOutsideToClose: true
    });
  };
}]);

app.controller('HomeController', ['$http', '$rootScope', '$scope', '$mdDialog',
  function($http, $rootScope, $scope, $mdDialog)
{
  $rootScope.iterator = 0;
  $rootScope.icons = [];
  for (var i=27; i<40; i++) {
    $rootScope.icons.push(new google.maps.MarkerImage(
      '/assets/markers/oh-' + i +'.png',
      new google.maps.Size(246, 208),
      new google.maps.Point(0, 0),
      new google.maps.Point(21, 36),
      new google.maps.Size(42, 36)
    ));
  }
  $rootScope.getMarkerImage = function() {
    $rootScope.iterator++;
    if ($rootScope.iterator == 13) {
      $rootScope.iterator = 0;
    }
    return $rootScope.icons[$rootScope.iterator];
  };
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
      lowerLongitude: $scope.currentPosition[0] - 2.5,
      upperLongitude: $scope.currentPosition[0] + 2.5,
      lowerLatitude: $scope.currentPosition[1] - 2.5,
      upperLatitude: $scope.currentPosition[1] + 2.5,
      inDays: $scope.currentDateOffset
    };
    $http.post('/event/search', paramObj).
      success(function(data) {
        for (var m=0; m<$scope.currentMarkers.length; m++) {
          $scope.currentMarkers[m].marker.setMap(null);
          google.maps.event.removeListener($scope.currentMarkers[m].listener);
        }
        $scope.currentMarkers = [];
        var events = data.events;
        var addItems = [];
        function addEvent(e) {
          var addItem = {
            marker: new google.maps.Marker({
              position: new google.maps.LatLng(e.latitude, e.longitude),
              map: $scope.map,
              title: e.name,
              icon: $rootScope.getMarkerImage()
            }),
            event: e
          };
          addItem.listener = google.maps.event.addListener(addItem.marker, 'click', function(event) {
            $mdDialog.show({
              parent: angular.element(document.body),
              targetEvent: event,
              templateUrl: '/partials/event.html',
              controller: 'EventController',
              clickOutsideToClose: true,
              locals: {
                event: addItem.event
              }
            });
          });
          $scope.currentMarkers.push(addItem);
        }
        for (var e=0; e<events.length; e++) {
          addEvent(events[e]);
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
            map: $scope.map,
            icon: $rootScope.getMarkerImage()
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
    $http.post('/event/add', paramObj).
      success(function(data) {
        $scope.additionMarker.setMap(null);
        $scope.additionMarker = null;
        $scope.resetAddition();
        $scope.updateFromOffset();
      });
  };
}]);

app.controller('EventController', ['$scope', '$mdDialog', 'event', '$http',
  function($scope, $mdDialog, event, $http)
{
  $scope.event = event;
  console.log(event);
  $scope.attending = false;
  $scope.checkAttendance = function() {
    $http.get('/event/attending/' + event.id).
      success(function(data) {
        console.log(data);
        if (data.type == 'success') {
          $scope.attending = true;
        }
      });
  };
  $scope.attend = function() {
    if (!$scope.attending) {
      $http.get('/event/register_attendance/' + event.id).
        success(function(data) {
          $scope.checkAttendance();
        });
    }
  };
  $scope.checkAttendance();
}]);

app.controller('TimelineController', ['$http', '$scope',
  function($http, $scope)
{
  $scope.events = [];
  $http.get('/event/timeline').
    success(function(data) {
      $scope.events = data.events;
    });
}]);
