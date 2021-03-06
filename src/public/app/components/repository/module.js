(function() {
    'use strict';

    angular
        .module('components.repository', [])
        .config(function($stateProvider) {
            $stateProvider
                .state('chewie.dashboard.repository', {
                    url: '/repository',
                    abstract: true,
                    template : '<ui-view></ui-view>',
                })
                .state('chewie.dashboard.repository.list', {
                    url: '/list',
                    controller: 'RepositoryListController',
                    controllerAs: "$ctrl",
                    templateUrl: '/app/components/repository/index.html'
                })
                .state("chewie.dashboard.repository.installedDetail", {
                    url: "/installed/detail/:name",
                    controller: "InstalledRepositoryDetailController",
                    templateUrl: '/app/components/repository/installed-plugin-detail.html'
                })
                .state("chewie.dashboard.repository.localDetail", {
                    url: "/local/detail/:name",
                    controller: "LocalRepositoryDetailController",
                    templateUrl: '/app/components/repository/local-repository-detail.html'
                });
        });
})();