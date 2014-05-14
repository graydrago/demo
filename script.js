(function () {
    var _width = 0,
        _height = 0,
        _player = null,
        CTX = null,
        CANVAS = null,
        FPS = 1000/30;

    var _controll = {
        up: false,
        right: false,
        down: false,
        left: false,
        fire: false,
        mouse_x: 0,
        mouse_y: 0,
    }

    var _units = [];

    window.onload = function () {
        var result = init();
        if ( result ) {
            resize();
            window.onresize = resize;
            loop();
        } else {
            console.log( "Не удалось инициировать контекст." );
        }
    }

    function init() {
        var rect = screenRect();
        _width = rect.width;
        _height = rect.height;

        var controll = function(value) { // bool value
            return function(e) {
                switch ( e.keyCode ) {
                    case 87: _controll.up    = value; break; // w
                    case 68: _controll.right = value; break; // d
                    case 83: _controll.down  = value; break; // s
                    case 65: _controll.left  = value; break; // a
                }
            }
        }

        CANVAS = document.getElementById( "canvas" );
        if ( CANVAS.getContext )
        {
            CTX = CANVAS.getContext( "2d" );
            clear();

            CANVAS.onmousemove = function(e) {
                _controll.mouse_x = e.pageX;
                _controll.mouse_y = e.pageY;
            };

            window.onkeydown = controll(true);
            window.onkeyup = controll(false);
            window.onmousedown = function() { _controll.fire = true  };
            window.onmouseup   = function() { _controll.fire = false };

            unit = new Unit();
            unit.x = 200;
            unit.y = 200;
            _units.push( unit );
            _player = new Player();
            _player.x = 100;
            _player.y = 100;
            _units.push(_player);

        } else {
            return false;
        }

        return true;
    }

    function resize() {
        var rect = screenRect();
        _width = rect.width;
        _height = rect.height;

        CANVAS.width = _width;
        CANVAS.height = _height;

        clear();
    }

    function screenRect() {
        var rect = {
            width:  window.innerWidth,
            height: window.innerHeight,
        }
        return rect;
    }

    function loop() {
        window.setInterval(function() {
            update();
            clear();
            draw();
        }, FPS);
    }

    function draw() {
        for ( i in _units ) {
            _units[i].draw(CTX);
        }
    }

    function update() {
        for ( i in _units ) {
            if ( _units[i].update )
                _units[i].update( _controll );
            if ( _units[i].name === "Unit" ) {
                _units[i].point_collision( _player.gun_clip );
            }
        }

        if ( _controll.fire ) {
            var bullet = null;
            if ( _player.gun_clip.length <= _player.max_bullets ) {
                bullet = new Bullet();
                _player.gun_clip.push(bullet);
                _units.push(bullet);
            } else {
                for( var i in _player.gun_clip ) {
                    if ( _player.gun_clip[i].live_time <= 0 ) {
                        bullet = _player.gun_clip[i];
                        break;
                    }
                }
            }

            if ( bullet ) bullet.shoot( _player );
        }

    }

    function clear() {
        CTX.clearRect( 0, 0, _width, _height );
    }

})()
