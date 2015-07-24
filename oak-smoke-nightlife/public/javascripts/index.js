angular.module('nightlife', [])
    .controller('NightlifeCtrl', ['$scope', function ($scope) {
        $scope.bars = [];
        $scope.latLong = '';
        $scope.tab = 0;
        $scope.user = null;
        $scope.initialHide = true;

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
                            if ($scope.initialHide) {
                                $scope.initialHide = false;
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
                })
        }
        function getLocation() {
            navigator.geolocation.getCurrentPosition(function (position) {
                var latitude  = position.coords.latitude;
                var longitude = position.coords.longitude;
                $scope.latLong = latitude + ',' + longitude;
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
                        })
                    }
                }

            );
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
            }
        };
        $scope.logout = logout;

    }]);