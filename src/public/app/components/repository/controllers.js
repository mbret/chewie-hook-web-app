(function() {
    'use strict';

    angular
        .module('components.repository')
        .controller('RepositoryListController', function($scope, $rootScope, sharedApiService, auth, _, $uibModal, apiService, $log, APP_CONFIG){
            let vm = this;
            vm.plugins = [];
            vm.installed = [];

            // fetch plugins from local repository
            // We do not use sharedApiService as we need to talk with current server
            apiService.get("/api/repositories/local/plugins")
                .then(function(response) {
                    vm.plugins = response.data;
                });

            // fetch saved plugins
            sharedApiService.get(`/api/devices/${APP_CONFIG.systemId}/plugins`)
                .then(function(response) {
                    vm.installed = _.keyBy(response, "name");
                });

            vm.downloadFromGithub = function() {
                $uibModal.open({
                    animation: true,
                    templateUrl: '/app/components/repository/download-plugin-github.modal.tmpl.html',
                    controller: 'RepositoryModalDownloadGithub',
                    controllerAs: "$ctrl",
                    resolve: {}
                });
            }
        })
        .controller('LocalRepositoryDetailController', function($scope, $rootScope, sharedApiService, $stateParams, auth, apiService, $state, APP_CONFIG){
            $scope.plugin = null;
            let name = $stateParams.name;
            $scope.ready = false;
            $scope.installed = false;

            $scope.save = function() {
                // we do not need "source" with local repository
                let data = {
                    name: $scope.plugin.name,
                    version: $scope.plugin.version,
                    repository: "local",
                    package: $scope.plugin
                };
                sharedApiService.post(`/devices/${APP_CONFIG.systemId}/plugins`, data)
                    .then(function() {
                        $state.go("chewie.dashboard.repository.list");
                    });
            };

            apiService.get("/api/repositories/local/plugins/" + name)
                .then(function(response) {
                    $scope.plugin = response.data;
                });

            sharedApiService.get(`/api/devices/${APP_CONFIG.systemId}/plugins/${name}`)
                .then(function() {
                    $scope.installed = true;
                    $scope.ready = true;
                })
                .catch(function(err) {
                    if (err.status === 404) {
                        $scope.ready = true;
                    }
                });
        })
        .controller('InstalledRepositoryDetailController', function($scope, $rootScope, sharedApiService, $stateParams, auth, apiService, $state, APP_CONFIG){
            $scope.plugin = null;
            let name = $stateParams.name;
            $scope.ready = false;

            $scope.unSave = function() {
                sharedApiService.delete(`/api/devices/${APP_CONFIG.systemId}/plugins/${name}`)
                    .then(function() {
                        $state.go("chewie.dashboard.repository.list");
                    });
            };

            // Fetch details of plugin
            // sharedApiService.get("/api/repositories/local/plugins/" + name)
            //     .then(function(data) {
            //         $scope.plugin = data;
            //     });

            sharedApiService.get(`/api/devices/${APP_CONFIG.systemId}/plugins/${name}`)
                .then(function(response) {
                    $scope.plugin = response;
                    $scope.ready = true;
                })
                .catch(function(err) {
                    if (err.status === 404) {
                        $state.go("chewie.dashboard.repository.list");
                    }
                });
        })

        // Modals

        .controller("RepositoryModalDownloadGithub", function(apiService, $uibModalInstance) {
            let vm = this;
            vm.formData = {
                repoUrl: null
            };

            vm.cancel = function() {
                $uibModalInstance.close();
            };

            vm.confirm = function(form) {
                form.$setSubmitted();
                if (form.$valid) {
                    apiService.post("/api/plugins", { source: vm.formData.repoUrl });
                    $uibModalInstance.close();
                }
            }
        })
})();