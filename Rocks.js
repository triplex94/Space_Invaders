/**
 * Created by N�kkvi on 31.10.2015.
 */
// ====
// ROCK
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
 0        1         2         3         4         5         6         7         8
 12345678901234567890123456789012345678901234567890123456789012345678901234567890
 */


// A generic contructor which accepts an arbitrary descriptor object
function Rock(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.randomisePosition();
    this.randomiseVelocity();

    // Default sprite and scale, if not otherwise specified
    this.sprite = this.sprite || g_sprites.rock;
    this.scale  = this.scale  || 1;

    /*
     // Diagnostics to check inheritance stuff
     this._rockProperty = true;
     console.dir(this);
     */

};

Rock.prototype = new Entity();

Rock.prototype.randomisePosition = function () {
    // Rock randomisation defaults (if nothing otherwise specified)

    var MIN_SPAWN_Y = g_canvas.height/ 2,
        MAX_SPAWN_Y = MIN_SPAWN_Y+g_canvas.height/3;

    this.cx = this.cx || Math.random() * g_canvas.width;
    this.cy = util.randRange(MIN_SPAWN_Y, MAX_SPAWN_Y);
    this.rotation = this.rotation || 0;
};

Rock.prototype.randomiseVelocity = function () {
    var MIN_SPEED = 10,
        MAX_SPEED = 40;

    var speed = util.randRange(MIN_SPEED, MAX_SPEED) / SECS_TO_NOMINALS;


    var dirn;
    if(this.cx < 0){
        dirn = 3*Math.PI/2+Math.PI/4;
    }else{
       dirn = 3*Math.PI/2-Math.PI/4;
    }


    this.velX = this.velX || speed * Math.cos(dirn);
    this.velY = this.velY || speed * Math.sin(dirn);


    var MIN_ROT_SPEED = 0.5,
        MAX_ROT_SPEED = 2.5;

    this.velRot = this.velRot ||
        util.randRange(MIN_ROT_SPEED, MAX_ROT_SPEED) / SECS_TO_NOMINALS;
};

Rock.prototype.update = function (du) {
    spatialManager.unregister(this);

    if (this._isDeadNow) return entityManager.KILL_ME_NOW;

    this.cx += this.velX * du;
    this.cy += this.velY * du;

    this.rotation += 1 * this.velRot;
    this.rotation = util.wrapRange(this.rotation,
        0, consts.FULL_CIRCLE);

    this.wrapPosition();

    spatialManager.register(this);

};

Rock.prototype.getRadius = function () {
    return this.scale * (this.sprite.width / 2) * 0.9;
};

// HACKED-IN AUDIO (no preloading)
Rock.prototype.splitSound = new Audio(
    "sounds/rockSplit.ogg");
Rock.prototype.evaporateSound = new Audio(
    "sounds/rockEvaporate.ogg");

Rock.prototype.takeBulletHit = function () {
    this.kill();

    if (this.scale > 0.25) {
        this._spawnFragment();
        this._spawnFragment();

        this.splitSound.play();
    } else {
        this.evaporateSound.play();
    }
};

Rock.prototype._spawnFragment = function () {
    entityManager.generateRock({
        cx : this.cx,
        cy : this.cy,
        scale : this.scale /2
    });
};

Rock.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawWrappedCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
};