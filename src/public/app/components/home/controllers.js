(function () {
  'use strict'

  function controller ($scope, $http, toastr, APP_CONFIG, sharedApiService, auth, sharedApiSocket, notificationService, $interval, googleApi) {

    $scope.externalServicesStatus = [
      {
        name: 'google',
        status: 'NOT_CONNECTED'
      }
    ]
    $scope.runProfiles = []
    $scope.runProfile = null
    $scope.runProfileLock = false

    // Calculate the lifetime of server
    $interval(function () {
      $scope.activeSince = new Date().getTime() - new Date(APP_CONFIG.systemInfo.startedAt).getTime()
    }, 1000)

    // Check external services
    googleApi.authorize()
      .then(function (gapi) {
        $scope.externalServicesStatus[0].status = 'CONNECTED'
      })
      .catch(function (err) {
        // silent
      })

    // fetch external status
    // sharedApiService.get(util.format('/users/%s/external-services', auth.getUser().getId())).then(function(res){
    //     $scope.externalServicesStatus = res.status
    // });

    sharedApiService.get('/users').then(function (data) {
      $scope.runProfiles = data
    })

    sharedApiService.get('/runtime/profile').then(function (data) {
      $scope.runProfile = data
    })

    $scope.shutdown = function () {
      sharedApiService.shutdown().then(function () {
        toastr.success('Buddy bien arrêté')
      })
    }

    $scope.restart = function () {
      sharedApiService.restart().then(function () {
        toastr.success('Buddy redémarre ...')
      })
    }

    $scope.startProfile = function (id) {
      $scope.runProfileLock = true
      sharedApiService.post('/runtime/profile', {id: id})
        .then(function () {
          $scope.runProfile = id
        })
        .finally(function () {
          $scope.runProfileLock = false
        })
    }

    $scope.stopProfile = function () {
      $scope.runProfileLock = true
      sharedApiService.delete('/runtime/profile')
        .then(function () {
          $scope.runProfile = null
        })
        .finally(function () {
          $scope.runProfileLock = false
        })
    }

    $scope.connectThirdService = function (service) {
      switch (service) {
        case 'google':
          googleApi.authorize(false)
            .then(function () {
              notificationService.success('You are now connected to google')
            })
            .catch(function (err) {
              console.log('error', err)
              notificationService.warning(err.message)
            })
          break
      }
    }
  }

  angular
    .module('chewie.components')
    .controller('components.home.HomeController', controller)
})()