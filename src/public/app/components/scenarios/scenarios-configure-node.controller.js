(function(){
    'use strict';

    /**
     * Modal
     * Add a new item.
     */
    angular
        .module("components.scenarios")
        .controller("CreateScenariosNewItemController", controller);

    function controller($scope, $uibModalInstance, _, item, $uibModal, sharedApiService, authenticationService, apiService, APP_CONFIG) {
        $scope.triggers = [];
        $scope.tasks = [];
        $scope.triggerPlugins = [];
        $scope.triggersSelected = [];
        $scope.triggerSelected = null;
        $scope.tasksSelected = [];
        $scope.taskSelected = [];
        $scope.taskPlugins = [];
        $scope.plugins = {};
        $scope.formId = "form-scenario-item-create";

        // scenario node
        $scope.formData = {
            name: item.name,
            pluginSelected: null,
            type: item.type, // trigger / task
            moduleId: item.moduleId, // not null because we are not root (ex log)
            id: item.id,
            configuration: item.configuration || {},
            options: item.options || {},
            nodes: item.nodes || [],
            autoStart: null
        };

        if (item.pluginId) {
            $scope.formData.pluginSelected = item.type + "-" + item.pluginId;
        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.selectPlugin = function(type) {
            // unselect the module
            $scope.formData.moduleId = null;
            $scope.formData.type = type;
            if (type === "trigger") {
                $scope.triggersSelected = getModules($scope.formData.type);
            } else {
                $scope.tasksSelected = getModules($scope.formData.type);
            }
        };

        $scope.changeModule = function() {
            // options are different for every modules so we need to reset it
            $scope.formData.options = {};
            if ($scope.formData.type === "task") {
                $scope.taskSelected = getModule($scope.formData.type, $scope.formData.moduleId);
            } else {
                $scope.triggerSelected = getModule($scope.formData.type, $scope.formData.moduleId);
            }
        };

        $scope.confirm = function(form) {
            form.$setSubmitted();
            if (form.$valid) {
                // use default values if needed
                let data = _.extend({}, $scope.formData, {
                    pluginId: $scope.formData.pluginSelected.substr(($scope.formData.type + "-").length),
                    name: $scope.formData.name || ($scope.formData.type === "task" ? $scope.taskSelected.name : $scope.triggerSelected.name)
                });
                delete data.pluginSelected;
                $uibModalInstance.close(data);
            }
        };

        // fetch triggers
        sharedApiService.get(`/api/devices/${APP_CONFIG.systemId}/plugins-modules`, { type: "trigger" })
            .then(function(data) {
                $scope.triggers = data;
                // build array of unique plugins key
                $scope.triggers.forEach(function(trigger) {
                    $scope.triggerPlugins[trigger.plugin.name] = trigger.plugin;
                });
                $scope.triggerPlugins = _.values($scope.triggerPlugins);
                $scope.triggersSelected = getModules($scope.formData.type);
                $scope.triggerSelected = getModule($scope.formData.type, $scope.formData.moduleId);
            });

        // fetch tasks
        sharedApiService.get(`/api/devices/${APP_CONFIG.systemId}/plugins-modules`, { type: "task" })
            .then(function(data) {
                $scope.tasks = data;
                // build array of unique key
                $scope.tasks.forEach(function(module) {
                    $scope.taskPlugins[module.plugin.name] = module.plugin;
                });
                $scope.taskPlugins = _.values($scope.taskPlugins);
                $scope.tasksSelected = getModules($scope.formData.type);
                $scope.taskSelected = getModule($scope.formData.type, $scope.formData.moduleId);
            });

        sharedApiService.get("/api/devices/" + APP_CONFIG.systemId + "/plugins")
            .then(function(data) {
                $scope.plugins = _.keyBy(data, "name");
            });

        function getModules(type) {
            if (type === "trigger") {
                return _.filter($scope.triggers, function(trigger) {
                    return trigger.plugin.name === $scope.formData.pluginSelected.substr("trigger-".length);
                });
            } else {
                return _.filter($scope.tasks, function(module) {
                    return module.plugin.name === $scope.formData.pluginSelected.substr("task-".length);
                });
            }
        }

        function getModule(type, moduleId) {
            if (type === "task") {
                return _.find($scope.tasks, {id: moduleId});
            } else {
                return _.find($scope.triggers, {id: moduleId});
            }
        }
    }
})();