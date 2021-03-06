(function(){
    'use strict';

    angular
        .module('components.tasks')

        .controller('TasksController', function(){

        })

        .controller('TasksListController', function($rootScope, $scope, $http, APP_CONFIG, TASK_TYPE, notificationService, sharedApiService, tasksService, _, SweetAlert, auth, sharedApiSocket){

            // http://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
            $scope.tasks = [];

            sharedApiService.get("/runtime/executing-tasks")
                .then(function(data) {
                    $scope.executingTasks = data.filter(function(elt) {
                        return elt.type === 1; // DIRECT
                    });
                });

            sharedApiService.get(`/users/${auth.getUser().id}/tasks`).then(function(data){
                    $scope.tasks = data;

                    $scope.tasks.forEach(function(task){
                        task.locked = false;
                        // task.active = false;
                    });

                    // runtime tasks are obligatory related to current user
                    // so the db tasks match the runtime tasks
                    // Runtime tasks allow us to get extra information about triggers like nextInvocation
                    // sharedApiService.get('/runtime/tasks').then(function(data){
                    //
                    //     // merge runtime task with user tasks
                    //     _.forEach($scope.tasks, function(task, i){
                    //         // try to find runtime task
                    //         var tmpIndex = _.findIndex(data, {id: task.id});
                    //
                    //         // The task may not exist if it is not active
                    //         if(tmpIndex === -1){
                    //             return;
                    //         }
                    //
                    //         var tmp = data[tmpIndex];
                    //
                    //         // merge triggers
                    //         // the db tasks should match the runtime tasks
                    //         _.forEach(task.triggers, function(trigger, j){
                    //             var tmpTrigger = tmp.triggers[_.findIndex(tmp.triggers, {id: trigger.id})];
                    //             task.triggers[j] = _.merge(trigger, tmpTrigger);
                    //         });
                    //
                    //         task.active = true;
                    //     });
                    // });
                });

            /**
             *
             */
            //$scope.removeTask = function(id){
            //    SweetAlert.swal({
            //            title: "Are you sure?",
            //            text: "Your will not be able to recover this imaginary file!",
            //            type: "warning",
            //            showCancelButton: true,
            //            confirmButtonColor: "#DD6B55",confirmButtonText: "Yes, delete it!",
            //            cancelButtonText: "No, cancel plx!",
            //            closeOnConfirm: false,
            //            closeOnCancel: true },
            //        function(isConfirm){
            //            if (isConfirm) {
            //                //tasksService.remove(id)
            //                //    .then(function(data){
            //
            //                $rootScope.$apply(function(){
            //                    _.remove($scope.scheduledTasks, function(task){
            //                        console.log(task.id, id);
            //                        return task.id === id;
            //                    });
            //                });
            //                SweetAlert.swal("Deleted!", "Your imaginary file has been deleted.", "success");
            //                //});
            //            }
            //        });
            //};

            $scope.toggleTaskActive = function(task) {
                task.locked = true;
                if(task.active) {
                    // Here we stop the task
                    // stop for runtime
                    // then save to database new state so at next profile load the task will keep the same state
                    // It is better to not parallelize call as we can deal with error easier
                    sharedApiService.put('/runtime/profile/tasks/' + task.id, {active: false})
                        .then(function(){
                            task.active = false;
                            return sharedApiService.put(`/users/${auth.getUser().id}/tasks/${task.id}`, {active: false});
                        })
                        .then(function(){
                            task.locked = false;
                        })
                        .catch(function(){
                            task.locked = false;
                        });
                }
                else{
                    // Here we start the task
                    // start for runtime
                    // then save to database new state
                    // It is better to not parallelize call as we can deal with error easier
                    sharedApiService.put('/runtime/profile/tasks/' + task.id, {active: true})
                        .then(function(){
                            task.active = true;
                            return sharedApiService.put(`/users/${auth.getUser().id}/tasks/${task.id}`, {active: true});
                        })
                        .then(function(){
                            task.locked = false;
                        })
                        .catch(function(){
                            task.locked = false;
                        });
                }
            };
            
            // $scope.runTask = function(task, trigger){
            //     sharedApiService.post(util.format('/runtime/tasks/%s/triggers/%s', task.id, trigger.id))
            //         .then(function() {
            //
            //         });
            // };

            $scope.stopTask = function(executinTask) {
                sharedApiService.delete("/runtime/executing-tasks/" + executinTask.id);
            };

            $scope.executeTask = function(task) {
                sharedApiService.post("/runtime/tasks/" + task.id);
            };

            $scope.$on("$destroy", function() {
                sharedApiSocket.removeListener("runtime:executing-tasks:update", onRuntimeExecutingTasksUpdate);
            });

            sharedApiSocket.on("runtime:executing-tasks:update", onRuntimeExecutingTasksUpdate);

            function onRuntimeExecutingTasksUpdate(data) {
                $scope.executingTasks = data.filter(function(elt) {
                    return elt.type === 1; // DIRECT
                });
            }
        })

        .controller('components.tasks.CreateController', function($scope, $http, $uibModal, APP_CONFIG, $log, tasksService, notificationService, sharedApiService, auth){
            $scope.modules = [];

            sharedApiService.get(`/users/${auth.getUser().id}/modules`, {type: 'task'}).then(function(response){
                $scope.modules = response;
            });
        });

    // lire un scenario
    // executer ses triggers
    // les trigger vont executer / stopper des taches
    // trigger a execute tache 123 (A) et la range dans tasks.A = {object}
    // trigger b stop tache 123 (B), il cherche dans tasks.A et stop la tache + delete de tasks.A
})();