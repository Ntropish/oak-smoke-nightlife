$(document).ready(function(){
    var barList = $('#bar-list');
    var barData = [];
    $('#submitRegister').on('click', function(event){
        event.preventDefault();
        var username = $('#usernameRegister').val();
        var password = $('#passwordRegister').val();
        var confirm  = $('#confirmRegister').val();

        if (password !== confirm) {
            console.log('pass don match');
            return;
        }
        $.ajax('/register',
            {
                type: 'POST',
                data: {
                    username: username,
                    password: password
                },
                success: function(res) {
                    console.log(res);
                    if (res.success) {

                        console.log('Registered');
                    }
                }
            }

        );
    });
    $('#submitLogin').on('click', function(event){
        event.preventDefault();
        $.ajax('/login',
            {
                type: 'POST',
                data: {
                    username: $('#usernameLogin').val(),
                    password: $('#passwordLogin').val()
                },
                success: function(res) {
                    console.log(res);
                    if (res.success) {

                        console.log('Logged in');
                    }
                }
            }

        );
    });
    $('#getUsername').on('click', function(event){
        event.preventDefault();
        $.ajax('/login',
            {
                type: 'GET',
                success: function(res) {
                    console.log(res);
                    if (res.success) {
                        $('#usernameGet').val(res.username);
                        console.log('Got name');
                    }
                }
            }

        );
    });
    $('#getBars').on('click', function(event) {
        event.preventDefault();
        navigator.geolocation.getCurrentPosition(function(position){
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            var latLong = latitude+','+longitude;
            console.log(latLong);
            $.ajax('/city',
                {
                    type: 'GET',
                    data: {location: latLong},
                    success: function(res) {
                        barList.empty();
                        res.forEach(function(bar, index){
                            barData.push(bar);
                            var barElement = $('<div class="bar"></div>');
                            barElement.append($('<div class="bar-name">'+bar.name+'</div>'));
                            barElement.append($('<div class="bar-attending">'+bar.attending+'</div>'));
                            barElement.append($('<button class="attend-button" data-index="'+index+'" value="Attend">Attend</button>'));
                            barList.append(barElement);
                        });
                        $('.attend-button').on('click', function(event) {
                            event.preventDefault();
                            var barId = barData[$(this).data('index')].id;
                            console.log(barId);
                            $.ajax('/city',
                                {
                                    type: 'POST',
                                    data: {
                                        id: barId
                                    },
                                    success: function(res){
                                        console.log(res);
                                    }
                                });
                        });
                        console.log(res);
                    }
                }
            );
        });

    });
});
