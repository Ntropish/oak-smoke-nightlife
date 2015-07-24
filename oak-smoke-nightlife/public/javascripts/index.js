angular.module('nightlife', [])
    .controller('NightlifeCtrl', ['$scope', function ($scope) {
        $scope.bars = [{name: 'ayo'}];
        $scope.user = {};
        $scope.latLong = '';
        $scope.tab = 0;
        $scope.user = null;

        function login() {
            $.ajax('/login',
                {
                type: 'POST',
                data: {
                    username: $scope.username,
                    password: $scope.password
                },
                success: function(res) {
                    console.log(res);
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

        $scope.switchTab = function switchTabToLogin(tabCode) {
            $scope.tab = tabCode;
        };

        $scope.findBars = function findBars() {
            if ($scope.latLong) {
                updateBars();
            }
        }

    }]);