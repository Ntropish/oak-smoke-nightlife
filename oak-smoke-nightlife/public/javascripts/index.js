angular.module('nightlife', [])
    .controller('nightlifeCtrl', [function () {
        var bars = this.bars = [];
        this.user = {};
        this.latLong = navigator.geolocation.getCurrentPosition(function (position) {
            var latitude  = position.coords.latitude;
            var longitude = position.coords.longitude;
            return latitude + ',' + longitude;
        });

        this.findBars = function () {
            if (this.latLong) {
                $.ajax('/city',
                    {
                        type: 'GET',
                        data: {
                            location: this.latLong
                        },
                        success: function(res) {
                            bars = res;
                        }
                    }

                );
            }
        }

    }]);