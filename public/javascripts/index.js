angular.module('nightlife', [])
    .controller('NightlifeCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
        $scope.bars = [];
        $scope.latLong = '';
        $scope.tab = 0;
        $scope.user = null;
        $scope.initialHide = true;
        $scope.viewMessageVisible = false;
        $scope.message = {
            title: '',
            text: ''
        };
        $scope.messageFade = 'fade-out';
        var promises = [];
        function getBarIndexById(id) {
            for (var i = 0, l = $scope.bars.length; i < l; i++) {
                if ($scope.bars[i].id === id) {
                    return i;
                }
            }
        }
        function addVisitorsById(id, addend) {
            var index = getBarIndexById(id);
            if (index) {
                $scope.bars[index].attending += addend;
            }
        }

        function viewMessage(message, time) {
            // Cancel previous promises
            promises.forEach(function(promise){
                $timeout.cancel(promise);
            });

            // Set up shown message
            $scope.message = message;
            $scope.viewMessageVisible = true;
            $scope.messageFade = 'fade-in';

            // Hide message
            promises.push($timeout(function(){
                $scope.messageFade = 'fade-out';
            }, time - 200));
            promises.push($timeout(function(){
                $scope.viewMessageVisible = false;
            }, time));
        }
        function getUser() {
            $.ajax('/login',
                {
                    type: 'GET',
                    success: function(res) {
                        $scope.$apply( function() {
                            if (res.success) {
                                $scope.user = {
                                    username: res.username,
                                    location: res.location,
                                    visiting: res.visiting
                                };
                            } else {
                                user = null;
                            }
                        });
                    }
                })
        }
        function login() {
            $.ajax('/login',
                {
                type: 'POST',
                data: {
                    username: $scope.username,
                    password: $scope.password
                },
                success: function(res) {
                    if (res.success) {
                        $scope.username = '';
                        $scope.password = '';
                        getUser();
                    }
                }
            })
        }
        function logout() {
            $.ajax('/logout',
                {
                    type: 'POST',
                    success: function(res) {
                        $scope.$apply( function() {
                            if (res.success) {
                                $scope.user = null;
                            }
                        });
                    }
                });
            $scope.tab = 0;
        }
        function getLocation() {
            navigator.geolocation.getCurrentPosition(function (position) {
                var latitude  = position.coords.latitude;
                var longitude = position.coords.longitude;
                $scope.latLong = latitude + ',' + longitude;
                updateBars();
            });
        }
        function updateBars() {
            $.ajax('/city',
                {
                    type: 'GET',
                    data: {
                        location: $scope.latLong
                    },
                    success: function(res){
                        $scope.$apply(function(){
                            $scope.bars = res;
                            if ($scope.initialHide) {
                                $scope.initialHide = false;
                            }
                        })
                    }
                }

            );
        }
        function register() {
            if ($scope.password === $scope.confirm) {
                $.ajax('/register',
                    {
                        type: 'POST',
                        data: {
                            username: $scope.username,
                            password: $scope.password
                        },
                        success: function (res) {
                            $scope.$apply(function () {
                                if (res.success) {
                                    $scope.confirm = '';
                                    $scope.tab = 0;
                                }
                            });
                        }

                    }
                );
            } else {
                viewMessage({title: 'Those Passwords Don\'t Match', text: 'Try that again'}, 2000);
            }
        }
        function attend(index) {
            var barId = $scope.bars[index].id;
            $.ajax('/city',
                {
                    type: 'POST',
                    data: {
                        id: barId
                    },
                    success: function(res){
                        $scope.$apply(function(){
                            if (res.success) {
                                addVisitorsById($scope.user.visiting, -1);
                                $scope.user.visiting = barId;
                                addVisitorsById(barId, 1);
                            }
                        });
                    }
                });
        }

        getLocation();
        getUser();

        $scope.switchTab = function switchTabToLogin(tabCode) {
            $scope.tab = tabCode;
        };

        $scope.findBars = function findBars() {
            if ($scope.latLong) {
                updateBars();
            }
        };

        $scope.submitAuthenticationForm = function submitAuthenticationForm() {
            if ($scope.tab === 0) {
                login();
            } else if ($scope.tab === 1) {
                register();
            }
        };
        $scope.logout = logout;
        $scope.attend = attend;
        $scope.getBarIndexById = getBarIndexById;

    }]);