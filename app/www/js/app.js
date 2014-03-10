angular.module('todo', ['ionic'])
/**
 * The Projects factory handles saving and loading projects
 * from local storage, and also lets us save and load the
 * last active project index.
 */
    .factory('Projects', function() {
        return {
            all: function() {
                var projectString = window.localStorage['projects'];
                if(projectString) {
                    return angular.fromJson(projectString);
                }
                return [];
            },
            save: function(projects) {
                window.localStorage['projects'] = angular.toJson(projects);
            },
            newProject: function(projectTitle) {
                // Add a new project
                return {
                    title: projectTitle,
                    tasks: []
                };
            },
            getLastActiveIndex: function() {
                return parseInt(window.localStorage['lastActiveProject']) || 0;
            },
            setLastActiveIndex: function(index) {
                window.localStorage['lastActiveProject'] = index;
            }
        }
    })

    .controller('TodoCtrl', function($scope, $timeout, $ionicModal, Projects) {

        function getCurrentDate() {

            var d = new Date();
            var curr_date = d.getDate();
            var curr_month = d.getMonth() + 1; //Months are zero based
            var curr_year = d.getFullYear();

            return curr_date + "-" + curr_month + "-" + curr_year;
        }

        // A utility function for creating a new project
        // with the given projectTitle
        var createProject = function(projectTitle) {
            var newProject = Projects.newProject(projectTitle);
            $scope.projects.push(newProject);
            Projects.save($scope.projects);
            $scope.selectProject(newProject, $scope.projects.length-1);
        }


        // Load or initialize projects
        $scope.projects = Projects.all();

        // Grab the last active, or the first project
        $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

        // Called to create a new project
        $scope.newProject = function() {
            var projectTitle = prompt('Project name', getCurrentDate());
            if(projectTitle) {
                createProject(projectTitle);
            }
        };

        $scope.deleteProject = function(project)
        {
            $scope.projects.splice($scope.projects.indexOf(project), 1);
            $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

            Projects.save($scope.projects);
        };

        // Called to select the given project
        $scope.selectProject = function(project, index) {
            $scope.activeProject = project;
            Projects.setLastActiveIndex(index);
            $scope.sideMenuController.close();
        };

        // Create our modal
        $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
            $scope.taskModal = modal;
        }, {
            scope: $scope
        });

        $scope.createTask = function(task) {
            if(!$scope.activeProject || !task) {
                return;
            }

            for (var key in tasks = task.title.split(/\r\n|\r|\n|et|,/g)){
                $scope.activeProject.tasks.push({
                    title: tasks[key],
                    done: false
                });
            }

            $scope.taskModal.hide();

            // Inefficient, but save all the projects
            Projects.save($scope.projects);

            task.title = "";
        };

        $scope.newTask = function() {
            $scope.taskModal.show();
        };

        $scope.closeNewTask = function() {
            $scope.taskModal.hide();
        }

        $scope.toggleProjects = function() {
            $scope.sideMenuController.toggleLeft();
        };


        $scope.done = function(task) {
            task.done = !task.done;
            Projects.save($scope.projects);
        }

        // Try to create the first project, make sure to defer
        // this by using $timeout so everything is initialized
        // properly
        $timeout(function() {
            if($scope.projects.length == 0) {
                while(true) {
                    var projectTitle = prompt('Your first task:', getCurrentDate());
                    if(projectTitle) {
                        createProject(projectTitle);
                        break;
                    }
                }
            }
        });

    });