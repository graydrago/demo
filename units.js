/**
 * Наследование
 */
function inherit(Child, Parent) { // child, parent
    var F = function() {};
    F.prototype = Parent.prototype;
    var f = new F;

    for (var prop in Child.prototype) f[prop] = Child.prototype[prop];
    Child.prototype = f;
    Child.prototype.super = Parent.prototype;
}

/**
 * Базовый объект для всех сущностей на экране
 */
function Unit(name) { 
    this.name = name || "Unit";
    this._hw = this.width / 2; // half width
    this._hh = this.height / 2; // half height
}
Unit.prototype = {
    constructor: Unit,
    x: 0,
    y: 0,
    width: 40,
    height: 40,

    draw: function(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.strokeRect(-this._hw, -this._hh, this.width, this.height);
        ctx.restore();
    },

    point_collision: function( bullets ) {
        for ( var i in bullets ) {
            if ( bullets[i].live_time > 0 ) {
                if ( ((this.x - this._hw) < bullets[i].x) && 
                     ((this.x + this._hw) > bullets[i].x) ) {
                    if ( ((this.y - this._hh) < bullets[i].y) && 
                         ((this.y + this._hh) > bullets[i].y) ) {
                        bullets[i].live_time = 0;
                        bullets[i].hit = true;
                     }
                } 
            }
        }
    },
}

/**
 * Игрок
 */
function Player(name) { 
    this.width = 20;
    this.height = 10;
    Unit.call(this, name || "Player"); 
}
Player.prototype = {
    constructor: Player,
    speed_x: 0,
    speed_y: 0,
    max_speed: 5,
    acceleration: 0.2,
    gun_clip: [],
    max_bullets: 100,

    draw: function(ctx) {
        //this.super.draw.call(this, ctx); // parent call, all ok
        ctx.save();
        ctx.translate( this.x, this.y );
        ctx.rotate( this.angle );
        ctx.beginPath();
        ctx.moveTo( -this._hw, -this._hh );
        ctx.lineTo(  this._hw , 0       );
        ctx.lineTo( -this._hw,  this._hh );
        ctx.stroke();
        ctx.restore();
    },

    _move: function(speed) {
        if ( speed > 0 ) {
            speed -= this.acceleration;
            if ( speed < 0 ) speed = 0;
            if ( speed > this.max_speed ) 
                speed = this.max_speed;
        }
        if ( speed < 0 ) {
            speed += this.acceleration;
            if ( speed > 0 ) speed = 0;
            if ( speed < -this.max_speed ) 
                speed = -this.max_speed;
        }
        return speed;
    },

    update: function(controll) {
        this.angle = Math.atan2(
            controll.mouse_y - this.y, 
            controll.mouse_x - this.x );

        var move_x = false,
            move_y = false;

        if( controll.up ) {
            move_y = true;
            this.speed_y -= this.acceleration;
        }
        if( controll.down ) {
            move_y = true;
            this.speed_y += this.acceleration;
        }
        if( controll.left ) {
            move_x = true;
            this.speed_x -= this.acceleration;
        }
        if( controll.right ) {
            move_x = true;
            this.speed_x += this.acceleration;
        }

        if ( ! move_y ) this.speed_y = this._move(this.speed_y);
        if ( ! move_x ) this.speed_x = this._move(this.speed_x);

        this.x += this.speed_x;
        this.y += this.speed_y;

    },
}
inherit(Player, Unit);

/**
 * Пули
 */
function Bullet(name) { 
    this.width = 10;
    this.height = 3;
    Unit.call(this, name || "Bullet"); 
}
Bullet.prototype = {
    constructor: Bullet,
    speed_x: 0,
    speed_y: 0,
    angle: 0,
    max_speed: 8,
    live_time: 100,
    max_live_time: 100,
    hit: false,

    draw: function(ctx) {
        if ( this.live_time > 0 ) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.strokeRect(-this._hw, -this._hh, this.width, this.height);
            ctx.restore();
        } else {
            if ( this.hit ) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.moveTo( -5, -3);
                ctx.lineTo(  0,  0);
                ctx.lineTo( -5,  3);
                ctx.stroke();
                ctx.restore();
            }
        }
    },

    update: function(controll) {
        if ( this.live_time > 0 ) {
            this.x += this.speed_x;
            this.y += this.speed_y;
            this.live_time -= 1;
        }
    },

    shoot: function( player ) {
        this.hit = false;
        this.live_time = this.max_live_time;
        this.angle = player.angle + ( -0.5 + Math.random()) / 6 ;
        this.x = player.x;
        this.y = player.y;
        this.speed_x = Math.cos(this.angle) * this.max_speed;
        this.speed_y = Math.sin(this.angle) * this.max_speed;
    }
}
inherit(Bullet, Unit);
