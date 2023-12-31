var anim_fast = .25;

var anim_fast_x2 = anim_fast * 2;

var anim_fast_third = anim_fast / 3;

var anim_fast_half = anim_fast / 2;

var anim_fast_2_third = anim_fast * .66;

var anim_med = .75;

var anim_med_mid = anim_med * 1.5;

var anim_med_x2 = anim_med * 2;

var anim_slow = 3;

var anim_slow_x2 = anim_slow * 2;

var frame_wait = 2.5;

var countdown_wait = .25;

function round(value, exp) {
    if (typeof exp === "undefined" || +exp === 0) return Math.round(value);
    value = +value;
    exp = +exp;
    if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) return NaN;
    value = value.toString().split("e");
    value = Math.round(+(value[0] + "e" + (value[1] ? +value[1] + exp : exp)));
    value = value.toString().split("e");
    return +(value[0] + "e" + (value[1] ? +value[1] - exp : -exp));
}

var isEven = function(number) {
    if (number % 2 == 0) {
        return true;
    } else {
        return false;
    }
};

$.fn.rotate = function(degree) {
    return this.css({
        "-webkit-transform": "rotate(" + degree + "deg)",
        "-moz-transform": "rotate(" + degree + "deg)",
        "-ms-transform": "rotate(" + degree + "deg)",
        "-o-transform": "rotate(" + degree + "deg)",
        transform: "rotate(" + degree + "deg)",
        zoom: 1
    });
};

var randomInt = function($highest, $lowest) {
    var randInt = Math.floor(Math.random() * $highest + $lowest);
    return randInt;
};

var msToTime = function(s) {
    var ms = s % 1e3;
    s = (s - ms) / 1e3;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    return mins + ":" + secs;
};

var game = {};

game.score = {};

game.score.current = 0;

game.score.max = 76 + 30;

game.score.min = -76 - 28;

game.winStatus = false;

game.running = false;

game.paused = false;

game.time = {};

game.time.timer = 0;

game.time.currentTime = 0;

game.time.el = $("#game-timer");

game.time.startTime = 0;

game.time.playTime = 0;

game.time.pauseTime = 0;

game.time.isPaused = false;

game.time.unPauseTime = 0;

game.time.maxTime = 3e4;

game.timeLine = new TimelineMax();

game.timeLinePauseGame = new TimelineMax();

game.controlKeys = {};

game.controlKeys.left = [ "up", 52, 37, 65 ];

game.controlKeys.right = [ "up", 54, 39, 68 ];

game.controlKeys.up = [ "up", 104, 38, 87 ];

game.controlKeys.down = [ "up", 98, 40, 83 ];

game.soundAlerts = 0;

function gameController() {
    var init = function() {
        bug("Game - Core Started");
        setupCTAs();
        setupControls();
    };
    var cacheEl = function() {
        game.cta = {};
    };
    var setupCTAs = function() {
        cacheEl();
    };
    var setupControls = function() {
        $(document).keydown(function(event) {
            onKey(event, "down");
        });
        $(document).keyup(function(event) {
            onKey(event, "up");
        });
    };
    var onKey = function($event, $inputType) {
        var $keycode = $event.keyCode || $event.which;
        checkInputType($event, game.controlKeys.right, $inputType, "right", $keycode);
    };
    var checkInputType = function($event, $keyArray, $inputType, $direction, $keycode) {
        if ($.inArray($keycode, $keyArray) > 0) {
            $event.preventDefault();
            if ($keyArray[0] == "up" && $inputType == "down") {
                val("key-status", $direction + " - " + $inputType);
                $keyArray[0] = "down";
                if (!game.paused && game.running) {
                    scoreUpdate(randomPoints());
                }
            } else if ($keyArray[0] == "down" && $inputType == "up") {
                val("key-status", $direction + " - " + $inputType);
                $keyArray[0] = "up";
            }
        }
    };
    var gameRun = function() {
        bug("Game - Running");
        if (siteCore.viewStatus == "end-level") {
            updateScoreNextLevel();
        } else {
            resetScore();
        }
        siteCore.apps.gameCore.resetObjects();
        resetGameTimer();
        startGameTimer();
        game.running = true;
    };
    var gameKill = function() {
        bug("Game - Killed");
        game.timeLine.clear();
        game.paused = false;
        game.running = false;
        stopGameTimer();
    };
    var gamePause = function($state) {
        if ($state && !game.paused) {
            game.paused = true;
            siteCore.apps.viewAnimations.pauseGame();
        } else if (!$state && game.paused) {
            game.paused = false;
            siteCore.apps.viewAnimations.unpauseGame();
        }
    };
    var moveScoreCounter = function() {};
    var scoreUpdate = function($value, $resetScore) {
        $resetScore = $resetScore || false;
        $value = $value || 0;
        if ($resetScore) {
            game.score.current = 0;
            bug("game.score Reset = " + game.score.current);
        } else {
            game.score.current += $value;
            bug("game.score Updated (" + $value + ") = " + game.score.current);
        }
        if (game.score.current <= game.score.min) {
            gameLoose();
        } else if (game.score.current >= game.score.max) {
            gameWin();
        }
        moveScoreCounter();
    };
    var resetScore = function() {};
    var updateScoreNextLevel = function() {};
    var randomPoints = function() {
        var randomNumber = Math.floor(Math.random() * 15 + 1);
        if (randomNumber > 10) {
            randomNumber = Math.floor(Math.random() * 15 + 1);
        }
        return randomNumber;
    };
    var gameLoose = function() {
        bug("Player Lost = " + game.score.score);
        gameKill();
        game.winStatus = true;
        siteCore.apps.viewUX.changeView("end-game");
    };
    var gameWin = function() {
        bug("Player Won = " + game.score.score);
        gameKill();
        game.winStatus = true;
        siteCore.apps.viewUX.changeView("game-won");
    };
    var startGameTimer = function() {
        bug("Game Timer Started");
        game.time.el.empty().html(msToTime(game.time.maxTime));
        game.time.startTime = Date.now();
        game.time.timer = setInterval(calculateGameTime, 250);
    };
    var stopGameTimer = function() {
        bug("Game Timer Stopped");
        clearInterval(game.time.timer);
    };
    var resetGameTimer = function() {
        bug("Game Timer Reset");
        game.time.playTime = 0;
    };
    var calculateGameTime = function() {
        game.time.currentTime = Date.now();
        if (game.running && !game.paused) {
            game.time.playTime = game.time.currentTime - game.time.startTime;
            if (game.minPoisonSpawnTime < poison[0].spawnTime.min) {
                poison[0].spawnTime.min = 2e3 - game.minPoisonSpawnTime * (game.time.playTime / 2500);
            } else {
                poison[0].spawnTime.min = game.minPoisonSpawnTime;
            }
            if (game.maxPoisonSpawnTime < poison[0].spawnTime.max) {
                poison[0].spawnTime.max = 7e3 - game.maxPoisonSpawnTime * (game.time.playTime / 2500);
            } else {
                poison[0].spawnTime.max = game.maxPoisonSpawnTime;
            }
            var thisTime = (game.time.maxTime - game.time.playTime) / 1e3;
            if (thisTime <= 1) {
                $globalEl.game.HUDwrap.addClass("time-running-out");
                if (game.soundAlerts == 9) {
                    sound.play(sound.fx.beep);
                    game.soundAlerts++;
                }
            } else if (thisTime <= 1.5) {
                $globalEl.game.HUDwrap.removeClass("time-running-out");
            } else if (thisTime <= 2) {
                $globalEl.game.HUDwrap.addClass("time-running-out");
                if (game.soundAlerts == 8) {
                    sound.play(sound.fx.beep);
                    game.soundAlerts++;
                }
            } else if (thisTime <= 2.5) {
                $globalEl.game.HUDwrap.removeClass("time-running-out");
            } else if (thisTime <= 3) {
                $globalEl.game.HUDwrap.addClass("time-running-out");
                if (game.soundAlerts == 7) {
                    sound.play(sound.fx.beep);
                    game.soundAlerts++;
                }
            } else if (thisTime <= 3.5) {
                $globalEl.game.HUDwrap.removeClass("time-running-out");
            } else if (thisTime <= 4) {
                $globalEl.game.HUDwrap.addClass("time-running-out");
                if (game.soundAlerts == 6) {
                    sound.play(sound.fx.beep);
                    game.soundAlerts++;
                }
            } else if (thisTime <= 4.5) {
                $globalEl.game.HUDwrap.removeClass("time-running-out");
            } else if (thisTime <= 5) {
                $globalEl.game.HUDwrap.addClass("time-running-out");
                if (game.soundAlerts == 5) {
                    sound.play(sound.fx.beep);
                    game.soundAlerts++;
                }
            } else if (thisTime <= 5.5) {
                $globalEl.game.HUDwrap.removeClass("time-running-out");
            } else if (thisTime <= 6) {
                $globalEl.game.HUDwrap.addClass("time-running-out");
                if (game.soundAlerts == 4) {
                    sound.play(sound.fx.beep);
                    game.soundAlerts++;
                }
            } else if (thisTime <= 6.5) {
                $globalEl.game.HUDwrap.removeClass("time-running-out");
            } else if (thisTime <= 7) {
                $globalEl.game.HUDwrap.addClass("time-running-out");
                if (game.soundAlerts == 3) {
                    sound.play(sound.fx.beep);
                    game.soundAlerts++;
                }
            } else if (thisTime <= 7.5) {
                $globalEl.game.HUDwrap.removeClass("time-running-out");
            } else if (thisTime <= 8) {
                $globalEl.game.HUDwrap.addClass("time-running-out");
                if (game.soundAlerts == 2) {
                    sound.play(sound.fx.beep);
                    game.soundAlerts++;
                }
            } else if (thisTime <= 8.5) {
                $globalEl.game.HUDwrap.removeClass("time-running-out");
            } else if (thisTime <= 9) {
                $globalEl.game.HUDwrap.addClass("time-running-out");
                if (game.soundAlerts == 1) {
                    sound.play(sound.fx.beep);
                    game.soundAlerts++;
                }
            } else if (thisTime <= 9.5) {
                $globalEl.game.HUDwrap.removeClass("time-running-out");
            } else if (thisTime <= 10) {
                $globalEl.game.HUDwrap.addClass("time-running-out");
                $globalEl.game.HUDwrap.addClass("big-timer");
                if (game.soundAlerts == 0) {
                    sound.play(sound.fx.beep);
                    game.soundAlerts++;
                }
            } else {
                $globalEl.game.HUDwrap.removeClass("time-running-out");
                $globalEl.game.HUDwrap.removeClass("big-timer");
                game.soundAlerts = 0;
            }
            if (game.time.maxTime - game.time.playTime <= 0) {
                bug("Game Time Run Out");
                gameWin();
                if (game.score.current >= 0) {} else {}
            }
        } else if (game.running && game.paused) {
            game.time.startTime = game.time.currentTime - game.time.playTime;
        }
        game.time.el.empty().html(msToTime(game.time.maxTime - game.time.playTime));
        val("game-time", game.time.playTime);
    };
    var loadNextLevel = function() {
        game.currentLevel++;
    };
    init();
    return {
        loadNextLevel: function() {
            loadNextLevel();
        },
        gameWin: function() {
            gameWin();
        },
        gameLoose: function() {
            gameLoose();
        },
        gameRun: function() {
            gameRun();
        },
        gameKill: function() {
            gameKill();
        },
        gamePause: function($state) {
            gamePause($state);
        },
        init: function() {
            init();
        }
    };
}

var collisionViewActive = false;

game.score = {};

game.score.el = $("#score-counter");

game.score.minHeight = 0;

game.score.maxHeight = 261 - game.score.minHeight;

game.score.maxScore = 20;

game.score.score = 0;

game.score.textEl = $("#game-score-text, #score-count, #end-game-loose-count");

game.score.textEndGameEl = $("#game-won-score-text");

game.combo = {};

game.combo.multiplier = .5;

game.combo.score = 0;

game.presentSpawnTime = {};

game.presentSpawnTime.last = 0;

game.presentSpawnTime.next = 0;

game.presentSpawnTime.min = 250;

game.presentSpawnTime.max = 600;

game.minPoisonSpawnTime = 100;

game.maxPoisonSpawnTime = 600;

game.layerMovement = [ 500, 600 ];

game.playing = false;

game.paused = false;

game.timeoutPause = false;

game.start = true;

game.currentGameObject = 0;

game.maxGameObjects = 1e3;

game.score.sprite = [];

game.currentScoreObject = 0;

var gameObjects = [];

function backgroundObject() {
    this.bounds = {};
    this.bounds.minX = 0;
    this.bounds.maxX = 0;
    this.bounds.minY = 0;
    this.bounds.maxY = 0;
    this.moveRatio = .5;
    this.position = {};
    this.position.x = 0;
    this.position.y = 225;
    this.sprite = {};
}

function nonPlayerObject() {
    this.stats = {};
    this.bounds = {};
    this.bounds = {};
    this.sprite = {};
    this.spawnTime = {};
    this.position = {};
    this.value = 1;
    this.active = true;
    this.opacity = 1;
    this.bounds.minX = 0;
    this.bounds.maxX = 0;
    this.bounds.minY = 0;
    this.bounds.maxY = 0;
    this.bounds.colliderActive = true;
    this.stats.minSpeed = 150;
    this.stats.maxSpeed = 500;
    this.stats.currentSpeed = 0;
    this.stats.acceleration = .2;
    this.stats.layer = 0;
    this.stats.offset = {};
    this.stats.offset.x = 0;
    this.stats.offset.y = 0;
    this.stats.type = "food";
    this.stats.velocity = {};
    this.stats.velocity.x = false;
    this.stats.velocity.deceleration = 200;
    this.position.x = 100;
    this.position.y = 50;
    this.stats.name = "default";
    this.stats.rotation = 0;
    this.spawnTime.last = 0;
    this.spawnTime.next = 0;
    this.spawnTime.min = 2e3;
    this.spawnTime.max = 4e3;
}

var food = [];

var spew = [];

var poison = [];

var clock = [];

var foodParticles = [];

var player = {};

player.playerPosition = {};

player.stats = {};

player.bounds = {};

player.playerPosition.x = 0;

player.playerPosition.y = 0;

player.stats.faceWidth = 150;

player.stats.faceHeight = 150;

player.playerPosition.startPositionX = 0;

player.stats.maxSpeed = 300;

player.stats.currentSpeed = 0;

player.stats.acceleration = 10;

player.bounds.minX = 0;

player.bounds.maxX = 0;

player.opacity = 1;

player.collider = {};

player.collider.offset = {};

player.collider.offset.x = 35;

player.collider.offset.y = 150;

player.collider.width = 120;

player.collider.height = 65;

player.playerJaw = {};

player.playerJaw.moveYpx = 20;

player.playerJaw.mouthOpen = true;

player.playerJaw.currentPercent = 100;

player.spew = {};

player.spew.position = {};

player.spew.position.x = 58;

player.spew.position.y = 136;

player.spew.length = 10;

player.spew.active = false;

player.spew.timeLeft = 0;

player.spew.valueMultiplier = -.01;

player.yum = {};

player.yum.position = {};

player.yum.position.x = 80;

player.yum.position.y = 100;

player.yum.length = 10;

player.yum.active = false;

player.yum.timeLeft = 0;

player.yum.valueMultiplier = -4;

player.score = {};

player.score.position = {};

player.score.position.x = 100;

player.score.position.y = 180;

player.bounds.percentageX = 0;

function gameCore() {
    var $el = {};
    var timeLine = new TimelineLite();
    var init = function() {
        cacheEl();
        bug("Game - Core Started");
    };
    var postImagesLoaded = function() {};
    var cacheEl = function() {};
    var runtime = function() {
        if (game.running) {
            createRandomizedObject(food[randomInt(food.length, 0)]);
            createSpew(spew[randomInt(spew.length, 0)]);
            createRandomizedObject(poison[randomInt(poison.length, 0)]);
            createYum(foodParticles[randomInt(foodParticles.length, 0)]);
            createRandomizedObject(clock[0]);
            createRandomizedObject(clock[1]);
        }
    };
    var createRandomizedObject = function($object) {
        if (game.time.playTime > $object.spawnTime.next) {
            bug("Creating Object - " + $object.name);
            $object.spawnTime.next = game.time.playTime;
            $object.spawnTime.next += randomInt($object.spawnTime.max, $object.spawnTime.min);
            createGameObject($object);
        }
    };
    var setupGame = function() {
        calculateObjectBounds();
        bug("Game Setup");
    };
    var calculateObjectBounds = function() {
        $.each(food, function() {
            this.bounds.minX = 0;
            this.bounds.maxX = $gameCanvas.canvas.width - this.sprite.width;
            this.bounds.minY = -this.sprite.height;
            this.bounds.maxY = $gameCanvas.canvas.height;
        });
        $.each(spew, function() {
            this.bounds.minX = 0;
            this.bounds.maxX = $gameCanvas.canvas.width - this.sprite.width;
            this.bounds.minY = -this.sprite.height;
            this.bounds.maxY = $gameCanvas.canvas.height;
        });
        $.each(poison, function() {
            this.bounds.minX = 0;
            this.bounds.maxX = $gameCanvas.canvas.width - this.sprite.width;
            this.bounds.minY = -this.sprite.height;
            this.bounds.maxY = $gameCanvas.canvas.height;
        });
        $.each(foodParticles, function() {
            this.bounds.minX = 0;
            this.bounds.maxX = $gameCanvas.canvas.width - this.sprite.width;
            this.bounds.minY = -this.sprite.height;
            this.bounds.maxY = $gameCanvas.canvas.height;
        });
        $.each(clock, function() {
            this.bounds.minX = 0;
            this.bounds.maxX = $gameCanvas.canvas.width - this.sprite.width;
            this.bounds.minY = -this.sprite.height;
            this.bounds.maxY = $gameCanvas.canvas.height;
        });
    };
    var createGameObject = function($object) {
        var thisObj = $object;
        var obj = {};
        obj.sprite = thisObj.sprite;
        obj.position = {};
        obj.position.x = Math.floor(Math.random() * thisObj.bounds.maxX + thisObj.bounds.minX);
        obj.position.y = thisObj.bounds.minY;
        obj.active = true;
        obj.onGround = false;
        obj.opacity = 1;
        obj.value = thisObj.value;
        obj.bounds = thisObj.bounds;
        obj.stats = thisObj.stats;
        obj.rotationSpeed = Math.floor(Math.random() * 100 + 2);
        obj.stats.velocity.x = true;
        obj.velocity = {};
        var direction = -250;
        obj.velocity.x = direction + randomInt(500, 0);
        gameObjects[game.currentGameObject] = obj;
        if (game.currentGameObject < game.maxGameObjects) {
            game.currentGameObject++;
        } else {
            game.currentGameObject = 0;
        }
    };
    var createYum = function($object) {
        if (player.yum.timeLeft > 0) {
            bug("yum");
            var thisObj = $object;
            var obj = {};
            obj.sprite = thisObj.sprite;
            obj.position = {};
            obj.position.x = player.playerPosition.x + player.yum.position.x;
            obj.position.y = player.playerPosition.y + player.yum.position.y;
            obj.active = true;
            obj.onGround = false;
            obj.opacity = 1;
            obj.value = thisObj.value;
            obj.bounds = thisObj.bounds;
            obj.stats = thisObj.stats;
            obj.rotationSpeed = 0;
            obj.stats.velocity.x = true;
            obj.velocity = {};
            var direction = -500;
            obj.velocity.x = direction + randomInt(1e3, 0);
            gameObjects[game.currentGameObject] = obj;
            if (game.currentGameObject < game.maxGameObjects) {
                game.currentGameObject++;
            } else {
                game.currentGameObject = 0;
            }
            player.yum.timeLeft -= deltaTime(20);
            player.yum.active = true;
        } else {
            player.yum.timeLeft = 0;
            player.yum.active = false;
        }
    };
    var createSpew = function($object) {
        if (player.spew.timeLeft > 0) {
            var thisObj = $object;
            var obj = {};
            obj.sprite = thisObj.sprite;
            obj.position = {};
            obj.position.x = player.playerPosition.x + player.spew.position.x;
            obj.position.y = player.playerPosition.y + player.spew.position.y;
            obj.active = true;
            obj.onGround = false;
            obj.opacity = 1;
            obj.value = thisObj.value;
            obj.bounds = thisObj.bounds;
            obj.stats = thisObj.stats;
            obj.rotationSpeed = 0;
            gameObjects[game.currentGameObject] = obj;
            if (game.currentGameObject < game.maxGameObjects) {
                game.currentGameObject++;
            } else {
                game.currentGameObject = 0;
            }
            player.spew.timeLeft -= deltaTime(20);
            player.spew.active = true;
        } else {
            player.spew.timeLeft = 0;
            player.spew.active = false;
        }
    };
    var createScoreSprite = function($obj, $value) {
        var obj = {};
        obj.position = {};
        obj.position.x = player.playerPosition.x + player.score.position.x;
        obj.position.y = player.playerPosition.y + player.score.position.y;
        obj.opacity = 1;
        obj.value = $value;
        obj.size = 1;
        game.score.sprite[game.currentScoreObject] = obj;
        if (game.currentScoreObject < game.maxGameObjects) {
            game.currentScoreObject++;
        } else {
            game.currentScoreObject = 0;
        }
    };
    var timeExtended = function($value) {
        bug("Time Extended + " + $value + " seconds");
        game.time.maxTime += $value * 1e3;
        sound.play(sound.fx.alarm);
        $globalEl.game.timeExtendedText.empty().html("+" + $value);
        timeLine.clear();
        timeLine.to($globalEl.game.timeExtended, anim_fast, {
            opacity: 1
        });
        timeLine.to($globalEl.game.timeExtended, anim_fast, {
            opacity: 0
        });
        timeLine.to($globalEl.game.timeExtended, anim_fast, {
            opacity: 1
        });
        timeLine.to($globalEl.game.timeExtended, anim_fast, {
            opacity: 0
        });
        timeLine.to($globalEl.game.timeExtended, anim_fast, {
            opacity: 1
        });
        timeLine.to($globalEl.game.timeExtended, anim_fast, {
            opacity: 0
        });
        timeLine.to($globalEl.game.timeExtended, anim_fast, {
            opacity: 1
        });
        timeLine.to($globalEl.game.timeExtended, anim_fast, {
            opacity: 0
        });
    };
    var updateGameScore = function($value) {
        if ($value < 0) {
            player.spew.timeLeft = player.spew.valueMultiplier * $value;
            sound.play(sound.fx.spew);
        } else {
            player.yum.timeLeft = 5;
            updateCombo(true);
            bug("Combo Hit!! = " + game.combo.score);
        }
        createScoreSprite("score", $value);
        game.score.score += $value;
        val("score", game.score.score);
        game.score.textEl.empty().html(game.score.score);
        game.score.textEndGameEl.empty().html(game.score.score);
    };
    var resetObjects = function() {
        bug("resetObjects()");
        game.score.score = 0;
        updateGameScore(0);
        $.each(poison, function() {
            this.spawnTime.last = 0;
            this.spawnTime.next = 0;
        });
        $.each(food, function() {
            this.spawnTime.last = 0;
            this.spawnTime.next = 0;
        });
    };
    var updateCombo = function($status) {
        if (!$status) {
            game.combo.score = 0;
        } else {
            game.combo.score++;
        }
        $globalEl.game.comboCounter.empty().html(game.combo.score);
    };
    var moveObjects = function() {
        $.each(gameObjects, function() {
            if (game.paused) {
                return;
            }
            if (this.active && !this.onGround) {
                this.position.y += deltaTime(this.stats.maxSpeed);
                if (this.position.y > this.bounds.maxY) {
                    this.onGround = true;
                }
                if (this.stats.velocity.x) {
                    if (this.velocity.x > 0) {
                        this.position.x += deltaTime(this.velocity.x -= deltaTime(this.stats.velocity.deceleration));
                        if (this.velocity.x < 0) {
                            this.velocity.x = 0;
                        }
                    }
                    if (this.velocity.x < 0) {
                        this.position.x += deltaTime(this.velocity.x -= deltaTime(this.stats.velocity.deceleration));
                        if (this.velocity.x > 0) {
                            this.velocity.x = 0;
                        }
                    }
                }
            } else if (this.active && this.onGround) {
                if (this.value > 0) {
                    updateCombo(false);
                }
                this.active = false;
            }
        });
    };
    var collision = function($gameObject) {
        bug("Collision: " + $gameObject.stats.name);
        if ($gameObject.stats.type == "food") {
            updateGameScore($gameObject.value);
        } else if ($gameObject.stats.type == "time") {
            timeExtended($gameObject.value);
        }
        $gameObject.active = false;
        sound.play(sound.fx.eat);
    };
    var checkCollisions = function() {
        var playerColliderOffsetX = player.playerPosition.x + player.collider.offset.x;
        var playerColliderOffsetY = player.playerPosition.y + player.collider.offset.y;
        var playerColliderBoundsX = player.playerPosition.x + player.collider.offset.x + player.collider.width;
        var playerColliderBoundsY = player.playerPosition.y + player.collider.offset.y + player.collider.height;
        if (collisionViewActive) {
            $gameCanvas.ctx.lineWidth = 1;
            $gameCanvas.ctx.strokeStyle = "blue";
            $gameCanvas.ctx.strokeRect(playerColliderOffsetX, playerColliderOffsetY, player.collider.width, player.collider.height);
        }
        if (!player.spew.active) {
            $.each(gameObjects, function() {
                if (this.active && this.bounds.colliderActive) {
                    if (collisionViewActive) {
                        $gameCanvas.ctx.strokeStyle = "green";
                        $gameCanvas.ctx.lineWidth = 1;
                        $gameCanvas.ctx.strokeRect(this.position.x, this.position.y, this.sprite.sprite.width, this.sprite.sprite.height);
                    }
                    if (this.position.x > playerColliderOffsetX && this.position.x < playerColliderBoundsX && this.position.y > playerColliderOffsetY && this.position.y < playerColliderBoundsY) {
                        collision(this);
                    }
                }
            });
        }
    };
    init();
    return {
        setupGame: function() {
            setupGame();
        },
        updateObjects: function() {
            moveObjects();
        },
        checkCollisions: function() {
            checkCollisions();
        },
        runtime: function() {
            runtime();
        },
        postImagesLoaded: function() {
            postImagesLoaded();
        },
        resetObjects: function() {
            resetObjects();
        }
    };
}

var sprites = {};

function calculateNewSprite(sprite, scale) {
    scale = scale || 1;
    var thisSprite = {};
    thisSprite.scale = scale;
    thisSprite.width = sprite.width * thisSprite.scale;
    thisSprite.height = sprite.height * thisSprite.scale;
    return thisSprite;
}

function gameRender() {
    var $el = {};
    var imagesLoaded = false;
    var init = function() {
        cacheEl();
        loadSprites();
        bug("Game - Render Loaded");
    };
    var loadSprites = function() {
        bug("Game - Loading Images");
        var imagesChecker = [];
        sprites.player = new Image();
        sprites.player.src = "images/player-face.png";
        sprites.playerJaw = new Image();
        sprites.playerJaw.src = "images/player-jaw.png";
        sprites.speechYuck = new Image();
        sprites.speechYuck.src = "images/speech-yuck.png";
        sprites.speechYum = new Image();
        sprites.speechYum.src = "images/speech-yum.png";
        sprites.burger = new Image();
        sprites.burger.src = "images/burger.png";
        sprites.steak = new Image();
        sprites.steak.src = "images/steak.png";
        sprites.pretzel = new Image();
        sprites.pretzel.src = "images/pretzel.png";
        sprites.pumpkin = new Image();
        sprites.pumpkin.src = "images/pumpkin.png";
        sprites.sushi = new Image();
        sprites.sushi.src = "images/sushi.png";
        sprites.cherry = new Image();
        sprites.cherry.src = "images/cherry.png";
        sprites.bacon = new Image();
        sprites.bacon.src = "images/bacon.png";
        sprites.sausage = new Image();
        sprites.sausage.src = "images/sausage.png";
        sprites.strawberry = new Image();
        sprites.strawberry.src = "images/strawberry.png";
        sprites.spewRainbow = new Image();
        sprites.spewRainbow.src = "images/rainbow-spew.png";
        sprites.poison = new Image();
        sprites.poison.src = "images/poison.png";
        sprites.foodParticle1 = new Image();
        sprites.foodParticle1.src = "images/food-particle-01.png";
        sprites.foodParticle2 = new Image();
        sprites.foodParticle2.src = "images/food-particle-02.png";
        sprites.foodParticle3 = new Image();
        sprites.foodParticle3.src = "images/food-particle-03.png";
        sprites.foodParticle4 = new Image();
        sprites.foodParticle4.src = "images/food-particle-04.png";
        sprites.foodParticle5 = new Image();
        sprites.foodParticle5.src = "images/food-particle-05.png";
        sprites.foodParticle0 = new Image();
        sprites.foodParticle0.src = "images/food-particle-00.png";
        sprites.alarmClock = new Image();
        sprites.alarmClock.src = "images/alarm-clock.png";
        sprites.hourGlass = new Image();
        sprites.hourGlass.src = "images/hour-glass.png";
        $.each(sprites, function() {
            imagesChecker.push(this);
        });
        var imageCount = imagesChecker.length;
        var imagesTotalLoaded = 0;
        for (var i = 0; i < imageCount; i++) {
            imagesChecker[i].onload = function() {
                imagesTotalLoaded++;
                if (imagesTotalLoaded == imageCount) {
                    imagesLoaded = true;
                    postImagesLoaded();
                    siteCore.apps.gameCore.postImagesLoaded();
                    siteCore.apps.gameCore.setupGame();
                }
            };
        }
    };
    var postImagesLoaded = function() {
        sprites.player.sprite = calculateNewSprite(sprites.player, .4);
        sprites.playerJaw.sprite = calculateNewSprite(sprites.playerJaw, .4);
        sprites.playerJaw.offset = {};
        sprites.playerJaw.offset.x = 58;
        sprites.playerJaw.offset.y = 136;
        sprites.speechYuck.sprite = calculateNewSprite(sprites.speechYuck, .8);
        sprites.speechYuck.offset = {};
        sprites.speechYuck.offset.x = 130;
        sprites.speechYuck.offset.y = -20;
        sprites.speechYum.sprite = calculateNewSprite(sprites.speechYum, .8);
        sprites.speechYum.offset = {};
        sprites.speechYum.offset.x = -200;
        sprites.speechYum.offset.y = -20;
        var foodNo = 0;
        food[foodNo] = new nonPlayerObject();
        food[foodNo].name = "burger";
        food[foodNo].stats.layer = 1;
        food[foodNo].value = 1e3;
        sprites.burger.sprite = calculateNewSprite(sprites.burger, .5);
        food[foodNo].sprite = sprites.burger;
        food[foodNo].stats.maxSpeed = 750;
        foodNo++;
        food[foodNo] = new nonPlayerObject();
        food[foodNo].name = "bacon";
        food[foodNo].stats.layer = 1;
        food[foodNo].value = 5e3;
        sprites.bacon.sprite = calculateNewSprite(sprites.bacon, .5);
        food[foodNo].sprite = sprites.bacon;
        food[foodNo].stats.maxSpeed = 750;
        foodNo++;
        food[foodNo] = new nonPlayerObject();
        food[foodNo].name = "strawberry";
        food[foodNo].stats.layer = 1;
        food[foodNo].value = 500;
        sprites.strawberry.sprite = calculateNewSprite(sprites.strawberry, .5);
        food[foodNo].sprite = sprites.strawberry;
        food[foodNo].stats.maxSpeed = 500;
        foodNo++;
        food[foodNo] = new nonPlayerObject();
        food[foodNo].name = "sausage";
        food[foodNo].stats.layer = 1;
        food[foodNo].value = 3e3;
        sprites.sausage.sprite = calculateNewSprite(sprites.sausage, .5);
        food[foodNo].sprite = sprites.sausage;
        food[foodNo].stats.maxSpeed = 600;
        foodNo++;
        food[foodNo] = new nonPlayerObject();
        food[foodNo].name = "steak";
        food[foodNo].stats.layer = 1;
        food[foodNo].value = 6e3;
        sprites.steak.sprite = calculateNewSprite(sprites.steak, .5);
        food[foodNo].sprite = sprites.steak;
        foodNo++;
        food[foodNo] = new nonPlayerObject();
        food[foodNo].name = "pretzel";
        food[foodNo].stats.layer = 1;
        food[foodNo].value = 3500;
        sprites.pretzel.sprite = calculateNewSprite(sprites.pretzel, .5);
        food[foodNo].sprite = sprites.pretzel;
        food[foodNo].stats.maxSpeed = 400;
        foodNo++;
        food[foodNo] = new nonPlayerObject();
        food[foodNo].name = "pumpkin";
        food[foodNo].stats.layer = 1;
        food[foodNo].value = 300;
        sprites.pumpkin.sprite = calculateNewSprite(sprites.pumpkin, .5);
        food[foodNo].sprite = sprites.pumpkin;
        food[foodNo].stats.maxSpeed = 450;
        foodNo++;
        food[foodNo] = new nonPlayerObject();
        food[foodNo].name = "sushi";
        food[foodNo].stats.layer = 1;
        food[foodNo].value = 15e3;
        sprites.sushi.sprite = calculateNewSprite(sprites.sushi, .5);
        food[foodNo].sprite = sprites.sushi;
        food[foodNo].stats.maxSpeed = 850;
        foodNo++;
        food[foodNo] = new nonPlayerObject();
        food[foodNo].name = "cherry";
        food[foodNo].stats.layer = 1;
        food[foodNo].value = 2500;
        sprites.cherry.sprite = calculateNewSprite(sprites.cherry, .5);
        food[foodNo].sprite = sprites.cherry;
        food[foodNo].stats.maxSpeed = 575;
        foodNo++;
        var foodParticleNo = 0;
        foodParticles[foodParticleNo] = new nonPlayerObject();
        foodParticles[foodParticleNo].name = "Food Particle 1";
        foodParticles[foodParticleNo].stats.layer = 1;
        foodParticles[foodParticleNo].stats.maxSpeed = 650;
        sprites.foodParticle1.sprite = calculateNewSprite(sprites.foodParticle1, .3);
        foodParticles[foodParticleNo].sprite = sprites.foodParticle1;
        foodParticles[foodParticleNo].stats.layer = "food particle";
        foodParticles[foodParticleNo].bounds.colliderActive = false;
        foodParticleNo++;
        foodParticles[foodParticleNo] = new nonPlayerObject();
        foodParticles[foodParticleNo].name = "Food Particle 1";
        foodParticles[foodParticleNo].stats.layer = 1;
        foodParticles[foodParticleNo].stats.maxSpeed = 700;
        sprites.foodParticle2.sprite = calculateNewSprite(sprites.foodParticle2, .3);
        foodParticles[foodParticleNo].sprite = sprites.foodParticle2;
        foodParticles[foodParticleNo].stats.layer = "food particle";
        foodParticles[foodParticleNo].bounds.colliderActive = false;
        foodParticleNo++;
        foodParticles[foodParticleNo] = new nonPlayerObject();
        foodParticles[foodParticleNo].name = "Food Particle 1";
        foodParticles[foodParticleNo].stats.layer = 1;
        sprites.foodParticle3.sprite = calculateNewSprite(sprites.foodParticle3, .2);
        foodParticles[foodParticleNo].sprite = sprites.foodParticle3;
        foodParticles[foodParticleNo].stats.layer = "food particle";
        foodParticles[foodParticleNo].bounds.colliderActive = false;
        foodParticleNo++;
        foodParticles[foodParticleNo] = new nonPlayerObject();
        foodParticles[foodParticleNo].name = "Food Particle 1";
        foodParticles[foodParticleNo].stats.layer = 1;
        foodParticles[foodParticleNo].stats.maxSpeed = 550;
        sprites.foodParticle4.sprite = calculateNewSprite(sprites.foodParticle4, .3);
        foodParticles[foodParticleNo].sprite = sprites.foodParticle4;
        foodParticles[foodParticleNo].stats.layer = "food particle";
        foodParticles[foodParticleNo].bounds.colliderActive = false;
        foodParticleNo++;
        foodParticles[foodParticleNo] = new nonPlayerObject();
        foodParticles[foodParticleNo].name = "Food Particle 1";
        foodParticles[foodParticleNo].stats.layer = 1;
        sprites.foodParticle5.sprite = calculateNewSprite(sprites.foodParticle5, .15);
        foodParticles[foodParticleNo].sprite = sprites.foodParticle5;
        foodParticles[foodParticleNo].stats.layer = "food particle";
        foodParticles[foodParticleNo].bounds.colliderActive = false;
        foodParticleNo++;
        spew[0] = new nonPlayerObject();
        spew[0].name = "Rainbow Spew";
        spew[0].stats.layer = 1;
        sprites.spewRainbow.sprite = calculateNewSprite(sprites.spewRainbow, .7);
        spew[0].sprite = sprites.spewRainbow;
        spew[0].stats.layer = "spew";
        spew[0].bounds.colliderActive = false;
        poison[0] = new nonPlayerObject();
        poison[0].name = "poison";
        poison[0].stats.layer = 1;
        sprites.poison.sprite = calculateNewSprite(sprites.poison, .6);
        poison[0].sprite = sprites.poison;
        poison[0].spawnTime.last = 0;
        poison[0].spawnTime.next = 0;
        poison[0].spawnTime.min = 2e3;
        poison[0].spawnTime.max = 7e3;
        poison[0].value = -5e3;
        var timePowerup = 0;
        clock[timePowerup] = new nonPlayerObject();
        clock[timePowerup].name = "clock";
        clock[timePowerup].stats.layer = 1;
        clock[timePowerup].stats.type = "time";
        clock[timePowerup].stats.maxSpeed = 650;
        sprites.alarmClock.sprite = calculateNewSprite(sprites.alarmClock, .5);
        clock[timePowerup].sprite = sprites.alarmClock;
        clock[timePowerup].spawnTime.last = 0;
        clock[timePowerup].spawnTime.next = 7500;
        clock[timePowerup].spawnTime.min = 8e3;
        clock[timePowerup].spawnTime.max = 15e3;
        clock[timePowerup].value = 5;
        timePowerup++;
        clock[timePowerup] = new nonPlayerObject();
        clock[timePowerup].name = "clock";
        clock[timePowerup].stats.layer = 1;
        clock[timePowerup].stats.type = "time";
        clock[timePowerup].stats.maxSpeed = 800;
        sprites.hourGlass.sprite = calculateNewSprite(sprites.hourGlass, .5);
        clock[timePowerup].sprite = sprites.hourGlass;
        clock[timePowerup].spawnTime.last = 0;
        clock[timePowerup].spawnTime.next = 15e3;
        clock[timePowerup].spawnTime.min = 12e3;
        clock[timePowerup].spawnTime.max = 15e3;
        clock[timePowerup].value = 15;
        timePowerup++;
        bug("Game - Images Loaded");
    };
    var cacheEl = function() {};
    var drawSprite = function(sprite, x, y) {
        $gameCanvas.ctx.drawImage(sprite, x, y, sprite.sprite.width, sprite.sprite.height);
    };
    var drawSpriteWH = function(sprite, x, y, width, height) {
        $gameCanvas.ctx.drawImage(sprite, x, y, width, height);
    };
    var TO_RADIANS = Math.PI / 180;
    var drawRotatedImage = function(image, x, y, angle) {
        $gameCanvas.ctx.save();
        $gameCanvas.ctx.translate(x + image.sprite.width / 2, y + image.sprite.height / 2);
        $gameCanvas.ctx.rotate(angle * TO_RADIANS);
        drawSprite(image, -(image.sprite.width / 2), -(image.sprite.height / 2));
        $gameCanvas.ctx.restore();
    };
    var renderFrame = function() {
        if (!imagesLoaded) {
            bug("Game - Loading");
        } else {
            $gameCanvas.ctx.clearRect(0, 0, $gameCanvas.canvas.width, $gameCanvas.canvas.height);
            siteCore.apps.gameCore.runtime();
            siteCore.apps.gameCore.updateObjects();
            siteCore.apps.gameCore.checkCollisions();
            renderBackground();
            renderGameObjects(0);
            renderPlayer();
            renderGameObjects(1);
        }
    };
    var renderBackground = function() {
        val("player-position-percentage", player.bounds.percentageX);
    };
    var renderPlayer = function() {
        if (player.playerJaw.currentPercent > 0 && !player.playerJaw.mouthOpen) {
            player.playerJaw.currentPercent -= deltaTime(250);
        } else if (player.playerJaw.currentPercent < 100 && player.playerJaw.mouthOpen) {
            player.playerJaw.currentPercent += deltaTime(250);
        } else if (player.playerJaw.currentPercent <= 0 && !player.playerJaw.mouthOpen) {
            player.playerJaw.mouthOpen = true;
        } else if (player.playerJaw.currentPercent >= 100 && player.playerJaw.mouthOpen) {
            player.playerJaw.mouthOpen = false;
        }
        drawSprite(sprites.playerJaw, player.playerPosition.x + sprites.playerJaw.offset.x, player.playerPosition.y + sprites.playerJaw.offset.y + player.playerJaw.moveYpx * (player.playerJaw.currentPercent / 100));
        renderGameObjects("spew");
        renderGameObjects("food particle");
        drawSprite(sprites.player, player.playerPosition.x, player.playerPosition.y);
        if (player.spew.active) {
            drawSprite(sprites.speechYuck, player.playerPosition.x + sprites.speechYuck.offset.x, player.playerPosition.y + sprites.speechYuck.offset.y);
        }
        if (player.yum.active) {}
    };
    var RotationAmount = 0;
    var renderGameObjects = function($layer) {
        $.each(gameObjects, function() {
            if (this.active && this.stats.layer == $layer) {
                $gameCanvas.ctx.globalAlpha = this.opacity;
                drawRotatedImage(this.sprite, this.position.x, this.position.y, this.stats.rotation += deltaTime(this.rotationSpeed));
                $gameCanvas.ctx.globalAlpha = 1;
            }
        });
        if ($layer == 1) {
            $.each(game.score.sprite, function() {
                if (this.size < 100) {} else {
                    this.opacity -= deltaTime(2);
                    if (this.opacity > 0) {} else {
                        this.opacity = 0;
                    }
                }
                this.size += deltaTime(200);
                $gameCanvas.ctx.font = this.size + "px Verdana";
                $gameCanvas.ctx.globalAlpha = this.opacity;
                if (this.value > 0) {
                    $gameCanvas.ctx.fillStyle = "#00cc00";
                } else {
                    $gameCanvas.ctx.fillStyle = "#ff0000";
                }
                $gameCanvas.ctx.textAlign = "center";
                $gameCanvas.ctx.fillText(this.value, this.position.x, this.position.y + this.size / 2);
                $gameCanvas.ctx.globalAlpha = 1;
            });
        }
    };
    init();
    return {
        loadSprites: function() {
            loadSprites();
        },
        drawSprite: function(sprite, x, y) {
            drawSprite(sprite, x, y);
        },
        renderFrame: function() {
            renderFrame();
        }
    };
}

"use strict";

function soundCore() {
    var on = false;
    this.active = true;
    this.soundSupported = false;
    this.muted = false;
    this.el = {};
    this.el.muteBtn = $("#mute-btn");
    this.el.mutedIcon = $(".hud-sound-muted");
    this.el.unmutedIcon = $(".hud-sound-unmuted");
    var checkSoundSupport = function() {
        var fileFormat = "mp3";
        var mp3Test = new Audio();
        var canPlayMP3 = typeof mp3Test.canPlayType === "function" && mp3Test.canPlayType("audio/mpeg") !== "";
        if (!canPlayMP3) {
            this.soundSupported = false;
        } else {
            this.soundSupported = true;
        }
        bug("Checking Sound Support = " + this.soundSupported);
    };
    var audioContext = {};
    function audioContextCheck() {
        if (typeof AudioContext !== "undefined") {
            return new window.AudioContext();
            audioContext.supported = true;
        } else if (typeof webkitAudioContext !== "undefined") {
            return new window.webkitAudioContext();
            audioContext.supported = true;
        } else if (typeof mozAudioContext !== "undefined") {
            return new mozAudioContext();
            audioContext.supported = true;
        } else {
            audioContext.supported = false;
        }
        bug("Audio Context Support = " + audioContext.supported);
    }
    var bufferAudioData = function($sound) {
        if (audioContext.audioCtx) {
            var source;
            var songLength;
            var playBackRate = 1;
            var loopStart = 0;
            var loopEnd = 3;
            source = audioContext.audioCtx.createBufferSource();
            source.type = "audio/mpeg";
            var request = new XMLHttpRequest();
            request.open("GET", $sound.src, true);
            request.responseType = "arraybuffer";
            request.onload = function() {
                var audioData = request.response;
                audioContext.audioCtx.decodeAudioData(audioData, function(buffer) {
                    var myBuffer = buffer;
                    songLength = buffer.duration;
                    source.buffer = myBuffer;
                    source.playbackRate.value = playBackRate;
                    source.connect(audioContext.audioCtx.destination);
                    source.loop = true;
                    source.loopStart = loopStart;
                    source.loopEnd = loopEnd;
                }, function(e) {
                    bug("Audio Context ERROR!!");
                });
            };
            request.send();
        } else {
            bug("Audio Context not supported");
        }
    };
    var fx = {};
    var loadSounds = function() {
        if (this.soundSupported) {
            fx.eat = loadSound($("#audio-eat source"));
            fx.alarm = loadSound($("#audio-alarm source"));
            fx.spew = loadSound($("#audio-spew source"));
            fx.burp = loadSound($("#audio-burp source"));
            fx.beep = loadSound($("#audio-beep source"));
            bug("All Sounds Loaded");
            this.active = true;
            bug("Sound Active");
        }
    };
    var loadSound = function($el_source) {
        var src = $el_source.attr("src");
        var thisAudio = new Audio(src);
        bug("Sound Loaded - " + thisAudio.src);
        return thisAudio;
    };
    var play = function($sound) {
        if (on) {
            if (!this.muted && this.active) {
                if ($sound.duration > 0 && !$sound.paused) {
                    $sound.pause();
                }
                $sound.currentTime = 0;
                $sound.play();
            }
        }
    };
    var playOnShot = function($sound) {
        if (on) {
            if (!this.muted && this.active) {
                if ($sound.duration > 0 && !$sound.paused) {} else {
                    $sound.pause();
                    $sound.currentTime = 0;
                    $sound.play();
                }
            }
        }
    };
    var playForced = function($sound) {
        $sound.pause();
        $sound.currentTime = 0;
        $sound.play();
    };
    var pause = function($sound) {
        $sound.pause();
    };
    var stop = function($sound) {
        $sound.pause();
        $sound.currentTime = 0;
    };
    var startSounds = function() {
        this.active = true;
    };
    var stopSounds = function() {
        this.active = false;
    };
    var muteSound = function() {
        if (!this.muted) {
            this.muted = true;
        }
        this.el.mutedIcon.css({
            visibility: "visible"
        });
        this.el.unmutedIcon.css({
            visibility: "hidden"
        });
    };
    var unMuteSound = function() {
        if (this.muted) {
            this.muted = true;
        }
        this.el.mutedIcon.css({
            visibility: "hidden"
        });
        this.el.unmutedIcon.css({
            visibility: "visible"
        });
    };
    var init = function() {
        checkSoundSupport();
        audioContext.audioCtx = audioContextCheck();
        loadSounds();
    };
    init();
    return {
        init: function() {
            init();
        },
        play: function($sound) {
            play($sound);
        },
        playOnShot: function($sound) {
            playOnShot($sound);
        },
        playForced: function($sound) {
            playForced($sound);
        },
        stop: function($sound) {
            stop($sound);
        },
        pause: function($sound) {
            pause($sound);
        },
        muteSound: function() {
            muteSound();
        },
        unMuteSound: function() {
            unMuteSound();
        },
        on: on,
        active: this.active,
        muted: this.muted,
        muteBtnEl: this.muteBtnEl,
        soundSupported: this.soundSupported,
        fx: fx
    };
}

var fps = 0, fpsMin = 1e3, fpsMax = 0;

var Stats = function() {
    var startTime = Date.now(), prevTime = startTime;
    var ms = 0, msMin = 1e3, msMax = 0;
    var frames = 0, mode = 0;
    mode;
    var container = document.createElement("div");
    container.id = "stats";
    container.addEventListener("mousedown", function(event) {
        event.preventDefault();
        setMode(++mode % 2);
    }, false);
    container.style.cssText = "width:80px;opacity:0.9;cursor:pointer";
    var fpsDiv = document.createElement("div");
    fpsDiv.id = "fps";
    fpsDiv.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#002";
    container.appendChild(fpsDiv);
    var fpsText = document.createElement("div");
    fpsText.id = "fpsText";
    fpsText.style.cssText = "color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:bold;line-height:15px";
    fpsText.innerHTML = "FPS";
    fpsDiv.appendChild(fpsText);
    var fpsGraph = document.createElement("div");
    fpsGraph.id = "fpsGraph";
    fpsGraph.style.cssText = "position:relative;width:74px;height:30px;background-color:#0ff";
    fpsDiv.appendChild(fpsGraph);
    while (fpsGraph.children.length < 74) {
        var bar = document.createElement("span");
        bar.style.cssText = "width:1px;height:30px;float:left;background-color:#113";
        fpsGraph.appendChild(bar);
    }
    var msDiv = document.createElement("div");
    msDiv.id = "ms";
    msDiv.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";
    container.appendChild(msDiv);
    var msText = document.createElement("div");
    msText.id = "msText";
    msText.style.cssText = "color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
    msText.innerHTML = "MS";
    msDiv.appendChild(msText);
    var msGraph = document.createElement("div");
    msGraph.id = "msGraph";
    msGraph.style.cssText = "position:relative;width:74px;height:30px;background-color:#0f0";
    msDiv.appendChild(msGraph);
    while (msGraph.children.length < 74) {
        var bar = document.createElement("span");
        bar.style.cssText = "width:1px;height:30px;float:left;background-color:#131";
        msGraph.appendChild(bar);
    }
    var setMode = function(value) {
        mode = value;
        switch (mode) {
          case 0:
            fpsDiv.style.display = "block";
            msDiv.style.display = "none";
            break;

          case 1:
            fpsDiv.style.display = "none";
            msDiv.style.display = "block";
            break;
        }
    };
    var updateGraph = function(dom, value) {
        var child = dom.appendChild(dom.firstChild);
        child.style.height = value + "px";
    };
    return {
        domElement: container,
        setMode: setMode,
        current: function() {
            return fps;
        },
        begin: function() {
            startTime = Date.now();
        },
        end: function() {
            var time = Date.now();
            ms = time - startTime;
            msMin = Math.min(msMin, ms);
            msMax = Math.max(msMax, ms);
            msText.textContent = ms + " MS (" + msMin + "-" + msMax + ")";
            updateGraph(msGraph, Math.min(30, 30 - ms / 200 * 30));
            frames++;
            if (time > prevTime + 1e3) {
                fps = Math.round(frames * 1e3 / (time - prevTime));
                fpsMin = Math.min(fpsMin, fps);
                fpsMax = Math.max(fpsMax, fps);
                fpsText.textContent = fps + " FPS (" + fpsMin + "-" + fpsMax + ")";
                updateGraph(fpsGraph, Math.min(30, 30 - fps / 100 * 30));
                prevTime = time;
                frames = 0;
            }
            return time;
        },
        update: function() {
            startTime = this.end();
        }
    };
};

var currentFrame = 0;

var $gameCanvas = {};

$gameCanvas.canvas = document.getElementById("game-canvas");

$gameCanvas.ctx = $gameCanvas.canvas.getContext("2d");

var stats;

var currentTime = 0;

var delta;

function deltaTime(number) {
    var value = number * delta / 1e3;
    return value;
}

var msToTime = function(s) {
    var ms = s % 1e3;
    s = (s - ms) / 1e3;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    return mins + ":" + secs;
};

var msToTime = function(s) {
    var ms = s % 1e3;
    s = (s - ms) / 1e3;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    return mins + ":" + secs;
};

function gameSystem() {
    var $el = {};
    var init = function() {
        cacheEl();
        canvasStats();
    };
    var cacheEl = function() {};
    var gameRun = function() {
        bug("gameRun(): Start Frames");
        runFrame();
    };
    var canvasStats = function() {
        if (debug) {
            stats = new Stats();
            $("#fps").append(stats.domElement);
        }
    };
    var runFrame = function() {
        gameTime();
        siteCore.apps.gameRender.renderFrame();
        if (debug) {
            val("frame", currentFrame);
            currentFrame++;
            stats.update();
        }
        animationFrame = window.requestAnimationFrame(runFrame, $gameCanvas.canvas);
    };
    var gameKill = function() {
        bug("gameKill() - Stop Frames");
        window.cancelAnimationFrame(animationFrame);
    };
    var setupRequestAnimationFallBack = function() {
        bug("Request Animation Browser Fallback Loaded.");
        var lastTime = 0;
        var vendors = [ "webkit", "moz" ];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
            window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
        }
        if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
        if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    };
    var startTime = Date.now();
    var lastTs = Date.now();
    var getTime = function() {
        var time = Date.now();
        currentTime = time - startTime;
        delta = time - lastTs;
        lastTs = Date.now();
        return currentTime;
    };
    var gameTime = function() {
        getTime();
        val("game-time", msToTime(currentTime));
    };
    init();
    return {
        gameRun: function() {
            gameRun();
        },
        gameKill: function() {
            gameKill();
        }
    };
}

var listenerActive = false;

var cameraActive = false;

var cameraAvailable = false;

var motionTrackingActive = false;

var motionControllerOutputValue;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

if (navigator.getUserMedia) {
    cameraAvailable = true;
} else {
    cameraAvailable = false;
}

function checkCameraStatus() {
    if (cameraAvailable) {
        startMotionTracking();
    }
}

var videoInput = document.getElementById("outputVideo");

var canvasInput = document.getElementById("inputVideo");

var canvasOverlay = document.getElementById("motion-track-overlay");

var overlayContext = canvasOverlay.getContext("2d");

var htracker;

var canvasWidth = 1070;

var canvasHeight = 800;

var percentWidth = 1 / canvasInput.width;

var percentHeight = 1 / canvasInput.height;

var trackingWidth = canvasWidth;

var centerLeft = 65;

var centerRight = 95;

var difference = 0;

var minMoveDistance = 1;

var trackFaceHeight = false;

$right = $("#right-motion-area");

$center = $("#center-motion-area");

$left = $("#left-motion-area");

$motionLine = $("#motion-line");

$motionControlHelper = $("#motion-control-helper");

function headTrackMotion(event) {
    overlayContext.clearRect(0, 0, canvasWidth, canvasHeight);
    if (event.detection == "CS") {
        var posX = event.x * percentWidth * canvasWidth;
        var posY = event.y * percentHeight * canvasHeight;
        var height = event.height * percentHeight * canvasHeight;
        var width = event.width * percentWidth * canvasWidth;
        overlayContext.translate(posX, posY);
        if (trackFaceHeight) {
            player.stats.faceWidth = width;
            player.stats.faceHeight = height;
        } else {}
        player.playerPosition.x = canvasWidth - posX - sprites.player.sprite.width / 2;
        player.playerPosition.y = posY - sprites.player.sprite.height / 2;
        val("player-position-x", player.playerPosition.x);
        val("player-position-y", player.playerPosition.y);
        overlayContext.rotate(event.angle - Math.PI / 2);
        overlayContext.strokeStyle = "#00CC00";
        overlayContext.strokeRect(-(event.width * percentWidth * canvasWidth / 2) >> 0, -(event.height * percentHeight * canvasHeight / 2) >> 0, event.width * percentWidth * canvasWidth, event.height * percentHeight * canvasHeight);
        overlayContext.rotate(Math.PI / 2 - event.angle);
        overlayContext.translate(-posX, -posY);
    }
    if (motionTrackingActive) {
        var trackedPoint = event.x;
        val("motion-controller-input", trackedPoint);
        $motionLine.css({
            left: trackingWidth - trackedPoint
        });
        if (trackedPoint > centerRight) {
            motionControllerOutputValue = (trackedPoint - centerRight) / centerLeft;
            $right.css({
                opacity: .5
            });
            $center.css({
                opacity: .5
            });
            $left.css({
                opacity: .75
            });
        } else if (trackedPoint < centerLeft) {
            motionControllerOutputValue = (centerLeft - trackedPoint) / centerLeft;
            $right.css({
                opacity: .75
            });
            $center.css({
                opacity: .5
            });
            $left.css({
                opacity: .5
            });
        } else {
            $right.css({
                opacity: .5
            });
            $center.css({
                opacity: .75
            });
            $left.css({
                opacity: .5
            });
            motionControllerOutputValue = 0;
        }
        val("motion-controller-output", motionControllerOutputValue);
    } else {
        val("motion-controller-output", "no-data");
        $right.css({
            opacity: .5
        });
        $center.css({
            opacity: .75
        });
        $left.css({
            opacity: .5
        });
    }
}

function startMotionTracking() {
    if (cameraActive && cameraStopped || !cameraActive) {
        htracker = new headtrackr.Tracker({
            ui: false,
            headPosition: true
        });
        htracker.init(videoInput, canvasInput);
        htracker.start();
        motionTrackingActive = true;
    } else {
        if (viewStatus == "instructions") {
            startCamera();
        }
    }
    if (!listenerActive) {
        listenerActive = true;
        document.addEventListener("facetrackingEvent", headTrackMotion);
    }
}

(function(root, factory) {
    if (typeof exports === "object") {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.headtrackr = factory();
    }
})(this, function() {
    var headtrackr = {};
    headtrackr.rev = 2;
    headtrackr.Tracker = function(params) {
        if (!params) params = {};
        if (params.smoothing === undefined) params.smoothing = true;
        if (params.retryDetection === undefined) params.retryDetection = true;
        if (params.ui === undefined) params.ui = true;
        if (params.debug === undefined) {
            params.debug = false;
        } else {
            if (params.debug.tagName != "CANVAS") {
                params.debug = false;
            } else {
                var debugContext = params.debug.getContext("2d");
            }
        }
        if (params.detectionInterval === undefined) params.detectionInterval = 20;
        if (params.fadeVideo === undefined) params.fadeVideo = false;
        if (params.cameraOffset === undefined) params.cameraOffset = 11.5;
        if (params.calcAngles === undefined) params.calcAngles = false;
        if (params.headPosition === undefined) params.headPosition = true;
        var ui, smoother, facetracker, headposition, canvasContext, videoElement, detector;
        var detectionTimer;
        var fov = 0;
        var initialized = true;
        var run = false;
        var faceFound = false;
        var firstRun = true;
        var videoFaded = false;
        var headDiagonal = [];
        this.status = "";
        this.stream = undefined;
        var statusEvent = document.createEvent("Event");
        statusEvent.initEvent("headtrackrStatus", true, true);
        var headtrackerStatus = function(message) {
            statusEvent.status = message;
            document.dispatchEvent(statusEvent);
            this.status = message;
        }.bind(this);
        var insertAltVideo = function(video) {
            if (params.altVideo !== undefined) {
                if (supports_video()) {
                    if (params.altVideo.ogv && supports_ogg_theora_video()) {
                        video.src = params.altVideo.ogv;
                    } else if (params.altVideo.mp4 && supports_h264_baseline_video()) {
                        video.src = params.altVideo.mp4;
                    } else if (params.altVideo.webm && supports_webm_video()) {
                        video.src = params.altVideo.webm;
                    } else {
                        return false;
                    }
                    video.play();
                    return true;
                }
            } else {
                return false;
            }
        };
        this.init = function(video, canvas, setupVideo) {
            if (setupVideo === undefined || setupVideo == true) {
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
                if (navigator.getUserMedia) {
                    headtrackerStatus("getUserMedia");
                    var videoSelector = {
                        video: true
                    };
                    if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
                        var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
                        if (chromeVersion < 20) {
                            videoSelector = "video";
                        }
                    }
                    if (window.opera) {
                        window.URL = window.URL || {};
                        if (!window.URL.createObjectURL) window.URL.createObjectURL = function(obj) {
                            return obj;
                        };
                    }
                    navigator.getUserMedia(videoSelector, function(stream) {
                        headtrackerStatus("camera found");
                        this.stream = stream;
                        video.srcObject = stream;  // Use srcObject to attach the stream to the video element.
                        /* video.play();
                        if (video.mozCaptureStream) {
                            video.mozSrcObject = stream;
                        } else {
                            video.src = window.URL && window.URL.createObjectURL(stream) || stream;
                        } */
                        video.play();
                    }.bind(this), function() {
                        headtrackerStatus("no camera");
                        insertAltVideo(video);
                    });
                } else {
                    headtrackerStatus("no getUserMedia");
                    if (!insertAltVideo(video)) {
                        return false;
                    }
                }
                video.addEventListener("playing", function() {
                    if (video.width > video.height) {
                        video.width = 1070;
                    } else {
                        video.height = 800;
                    }
                }, false);
            }
            videoElement = video;
            canvasElement = canvas;
            canvasContext = canvas.getContext("2d");
            if (params.ui) {
                ui = new headtrackr.Ui();
            }
            smoother = new headtrackr.Smoother(.35, params.detectionInterval + 15);
            this.initialized = true;
        };
        var track = function() {
            canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            if (facetracker === undefined) {
                facetracker = new headtrackr.facetrackr.Tracker({
                    debug: params.debug,
                    calcAngles: params.calcAngles
                });
                facetracker.init(canvasElement);
            }
            facetracker.track();
            var faceObj = facetracker.getTrackingObject({
                debug: params.debug
            });
            if (faceObj.detection == "WB") headtrackerStatus("whitebalance");
            if (firstRun && faceObj.detection == "VJ") headtrackerStatus("detecting");
            if (!(faceObj.confidence == 0)) {
                if (faceObj.detection == "VJ") {
                    if (detectionTimer === undefined) {
                        detectionTimer = new Date().getTime();
                    }
                    if (new Date().getTime() - detectionTimer > 5e3) {
                        headtrackerStatus("hints");
                    }
                    var x = faceObj.x + faceObj.width / 2;
                    var y = faceObj.y + faceObj.height / 2;
                    if (params.debug) {
                        debugContext.strokeStyle = "#0000CC";
                        debugContext.strokeRect(faceObj.x, faceObj.y, faceObj.width, faceObj.height);
                    }
                }
                if (faceObj.detection == "CS") {
                    var x = faceObj.x;
                    var y = faceObj.y;
                    if (detectionTimer !== undefined) detectionTimer = undefined;
                    if (params.debug) {
                        debugContext.translate(faceObj.x, faceObj.y);
                        debugContext.rotate(faceObj.angle - Math.PI / 2);
                        debugContext.strokeStyle = "#00CC00";
                        debugContext.strokeRect(-(faceObj.width / 2) >> 0, -(faceObj.height / 2) >> 0, faceObj.width, faceObj.height);
                        debugContext.rotate(Math.PI / 2 - faceObj.angle);
                        debugContext.translate(-faceObj.x, -faceObj.y);
                    }
                    if (!videoFaded && params.fadeVideo) {
                        fadeVideo();
                        videoFaded = true;
                    }
                    this.status = "tracking";
                    if (faceObj.width == 0 || faceObj.height == 0) {
                        if (params.retryDetection) {
                            headtrackerStatus("redetecting");
                            facetracker = new headtrackr.facetrackr.Tracker({
                                whitebalancing: false,
                                debug: params.debug,
                                calcAngles: params.calcAngles
                            });
                            facetracker.init(canvasElement);
                            faceFound = false;
                            headposition = undefined;
                            if (videoFaded) {
                                videoElement.style.opacity = 1;
                                videoFaded = false;
                            }
                        } else {
                            headtrackerStatus("lost");
                            this.stop();
                        }
                    } else {
                        if (!faceFound) {
                            headtrackerStatus("found");
                            faceFound = true;
                        }
                        if (params.smoothing) {
                            if (!smoother.initialized) {
                                smoother.init(faceObj);
                            }
                            faceObj = smoother.smooth(faceObj);
                        }
                        if (headposition === undefined && params.headPosition) {
                            var stable = false;
                            var headdiag = Math.sqrt(faceObj.width * faceObj.width + faceObj.height * faceObj.height);
                            if (headDiagonal.length < 6) {
                                headDiagonal.push(headdiag);
                            } else {
                                headDiagonal.splice(0, 1);
                                headDiagonal.push(headdiag);
                                if (Math.max.apply(null, headDiagonal) - Math.min.apply(null, headDiagonal) < 5) {
                                    stable = true;
                                }
                            }
                            if (stable) {
                                if (firstRun) {
                                    if (params.fov === undefined) {
                                        headposition = new headtrackr.headposition.Tracker(faceObj, canvasElement.width, canvasElement.height, {
                                            distance_from_camera_to_screen: params.cameraOffset
                                        });
                                    } else {
                                        headposition = new headtrackr.headposition.Tracker(faceObj, canvasElement.width, canvasElement.height, {
                                            fov: params.fov,
                                            distance_from_camera_to_screen: params.cameraOffset
                                        });
                                    }
                                    fov = headposition.getFOV();
                                    firstRun = false;
                                } else {
                                    headposition = new headtrackr.headposition.Tracker(faceObj, canvasElement.width, canvasElement.height, {
                                        fov: fov,
                                        distance_from_camera_to_screen: params.cameraOffset
                                    });
                                }
                                headposition.track(faceObj);
                            }
                        } else if (params.headPosition) {
                            headposition.track(faceObj);
                        }
                    }
                }
            }
            if (run) {
                detector = window.setTimeout(track, params.detectionInterval);
            }
        }.bind(this);
        var starter = function() {
            try {
                canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                var canvasContent = headtrackr.getWhitebalance(canvasElement);
                if (canvasContent > 0) {
                    run = true;
                    track();
                } else {
                    window.setTimeout(starter, 100);
                }
            } catch (err) {
                window.setTimeout(starter, 100);
            }
        };
        this.start = function() {
            if (!this.initialized) return false;
            if (!(videoElement.currentTime > 0 && !videoElement.paused && !videoElement.ended)) {
                run = true;
                videoElement.addEventListener("playing", starter, false);
                return true;
            } else {
                starter();
            }
            return true;
        };
        this.stop = function() {
            window.clearTimeout(detector);
            run = false;
            headtrackerStatus("stopped");
            facetracker = undefined;
            faceFound = false;
            return true;
        };
        this.stopStream = function() {
            if (this.stream !== undefined) {
                if (this.stream.stop !== undefined) {
                    this.stream.stop();
                } else if (this.stream.getVideoTracks !== undefined) {
                    this.stream.getVideoTracks().forEach(function(t) {
                        t.stop();
                    });
                }
            }
        };
        this.getFOV = function() {
            return fov;
        };
        var fadeVideo = function() {
            if (videoElement.style.opacity == "") {
                videoElement.style.opacity = .98;
                window.setTimeout(fadeVideo, 50);
            } else if (videoElement.style.opacity > .3) {
                videoElement.style.opacity -= .02;
                window.setTimeout(fadeVideo, 50);
            } else {
                videoElement.style.opacity = .3;
            }
        };
    };
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }
            var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {}, fBound = function() {
                return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
            };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }
    function supports_video() {
        return !!document.createElement("video").canPlayType;
    }
    function supports_h264_baseline_video() {
        if (!supports_video()) {
            return false;
        }
        var v = document.createElement("video");
        return v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
    }
    function supports_ogg_theora_video() {
        if (!supports_video()) {
            return false;
        }
        var v = document.createElement("video");
        return v.canPlayType('video/ogg; codecs="theora, vorbis"');
    }
    function supports_webm_video() {
        if (!supports_video()) {
            return false;
        }
        var v = document.createElement("video");
        return v.canPlayType('video/webm; codecs="vp8, vorbis"');
    }
    headtrackr.ccv = {};
    headtrackr.ccv.grayscale = function(canvas) {
        var ctx = canvas.getContext("2d");
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        var pix1, pix2, pix = canvas.width * canvas.height * 4;
        while (pix > 0) data[pix -= 4] = data[pix1 = pix + 1] = data[pix2 = pix + 2] = data[pix] * .3 + data[pix1] * .59 + data[pix2] * .11;
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    };
    headtrackr.ccv.array_group = function(seq, gfunc) {
        var i, j;
        var node = new Array(seq.length);
        for (i = 0; i < seq.length; i++) node[i] = {
            parent: -1,
            element: seq[i],
            rank: 0
        };
        for (i = 0; i < seq.length; i++) {
            if (!node[i].element) continue;
            var root = i;
            while (node[root].parent != -1) root = node[root].parent;
            for (j = 0; j < seq.length; j++) {
                if (i != j && node[j].element && gfunc(node[i].element, node[j].element)) {
                    var root2 = j;
                    while (node[root2].parent != -1) root2 = node[root2].parent;
                    if (root2 != root) {
                        if (node[root].rank > node[root2].rank) node[root2].parent = root; else {
                            node[root].parent = root2;
                            if (node[root].rank == node[root2].rank) node[root2].rank++;
                            root = root2;
                        }
                        var temp, node2 = j;
                        while (node[node2].parent != -1) {
                            temp = node2;
                            node2 = node[node2].parent;
                            node[temp].parent = root;
                        }
                        node2 = i;
                        while (node[node2].parent != -1) {
                            temp = node2;
                            node2 = node[node2].parent;
                            node[temp].parent = root;
                        }
                    }
                }
            }
        }
        var idx = new Array(seq.length);
        var class_idx = 0;
        for (i = 0; i < seq.length; i++) {
            j = -1;
            var node1 = i;
            if (node[node1].element) {
                while (node[node1].parent != -1) node1 = node[node1].parent;
                if (node[node1].rank >= 0) node[node1].rank = ~class_idx++;
                j = ~node[node1].rank;
            }
            idx[i] = j;
        }
        return {
            index: idx,
            cat: class_idx
        };
    };
    headtrackr.ccv.detect_objects = function(canvas, cascade, interval, min_neighbors) {
        var scale = Math.pow(2, 1 / (interval + 1));
        var next = interval + 1;
        var scale_upto = Math.floor(Math.log(Math.min(cascade.width, cascade.height)) / Math.log(scale));
        var pyr = new Array((scale_upto + next * 2) * 4);
        pyr[0] = canvas;
        pyr[0].data = pyr[0].getContext("2d", { willReadFrequently: true }).getImageData(0, 0, pyr[0].width, pyr[0].height).data;
        var i, j, k, x, y, q;
        for (i = 1; i <= interval; i++) {
            pyr[i * 4] = document.createElement("canvas");
            pyr[i * 4].width = Math.floor(pyr[0].width / Math.pow(scale, i));
            pyr[i * 4].height = Math.floor(pyr[0].height / Math.pow(scale, i));
            pyr[i * 4].getContext("2d").drawImage(pyr[0], 0, 0, pyr[0].width, pyr[0].height, 0, 0, pyr[i * 4].width, pyr[i * 4].height);
            pyr[i * 4].data = pyr[i * 4].getContext("2d").getImageData(0, 0, pyr[i * 4].width, pyr[i * 4].height).data;
        }
        for (i = next; i < scale_upto + next * 2; i++) {
            pyr[i * 4] = document.createElement("canvas");
            pyr[i * 4].width = Math.floor(pyr[i * 4 - next * 4].width / 2);
            pyr[i * 4].height = Math.floor(pyr[i * 4 - next * 4].height / 2);
            pyr[i * 4].getContext("2d").drawImage(pyr[i * 4 - next * 4], 0, 0, pyr[i * 4 - next * 4].width, pyr[i * 4 - next * 4].height, 0, 0, pyr[i * 4].width, pyr[i * 4].height);
            pyr[i * 4].data = pyr[i * 4].getContext("2d").getImageData(0, 0, pyr[i * 4].width, pyr[i * 4].height).data;
        }
        for (i = next * 2; i < scale_upto + next * 2; i++) {
            pyr[i * 4 + 1] = document.createElement("canvas");
            pyr[i * 4 + 1].width = Math.floor(pyr[i * 4 - next * 4].width / 2);
            pyr[i * 4 + 1].height = Math.floor(pyr[i * 4 - next * 4].height / 2);
            pyr[i * 4 + 1].getContext("2d").drawImage(pyr[i * 4 - next * 4], 1, 0, pyr[i * 4 - next * 4].width - 1, pyr[i * 4 - next * 4].height, 0, 0, pyr[i * 4 + 1].width - 2, pyr[i * 4 + 1].height);
            pyr[i * 4 + 1].data = pyr[i * 4 + 1].getContext("2d").getImageData(0, 0, pyr[i * 4 + 1].width, pyr[i * 4 + 1].height).data;
            pyr[i * 4 + 2] = document.createElement("canvas");
            pyr[i * 4 + 2].width = Math.floor(pyr[i * 4 - next * 4].width / 2);
            pyr[i * 4 + 2].height = Math.floor(pyr[i * 4 - next * 4].height / 2);
            pyr[i * 4 + 2].getContext("2d").drawImage(pyr[i * 4 - next * 4], 0, 1, pyr[i * 4 - next * 4].width, pyr[i * 4 - next * 4].height - 1, 0, 0, pyr[i * 4 + 2].width, pyr[i * 4 + 2].height - 2);
            pyr[i * 4 + 2].data = pyr[i * 4 + 2].getContext("2d").getImageData(0, 0, pyr[i * 4 + 2].width, pyr[i * 4 + 2].height).data;
            pyr[i * 4 + 3] = document.createElement("canvas");
            pyr[i * 4 + 3].width = Math.floor(pyr[i * 4 - next * 4].width / 2);
            pyr[i * 4 + 3].height = Math.floor(pyr[i * 4 - next * 4].height / 2);
            pyr[i * 4 + 3].getContext("2d").drawImage(pyr[i * 4 - next * 4], 1, 1, pyr[i * 4 - next * 4].width - 1, pyr[i * 4 - next * 4].height - 1, 0, 0, pyr[i * 4 + 3].width - 2, pyr[i * 4 + 3].height - 2);
            pyr[i * 4 + 3].data = pyr[i * 4 + 3].getContext("2d").getImageData(0, 0, pyr[i * 4 + 3].width, pyr[i * 4 + 3].height).data;
        }
        for (j = 0; j < cascade.stage_classifier.length; j++) cascade.stage_classifier[j].orig_feature = cascade.stage_classifier[j].feature;
        var scale_x = 1, scale_y = 1;
        var dx = [ 0, 1, 0, 1 ];
        var dy = [ 0, 0, 1, 1 ];
        var seq = [];
        for (i = 0; i < scale_upto; i++) {
            var qw = pyr[i * 4 + next * 8].width - Math.floor(cascade.width / 4);
            var qh = pyr[i * 4 + next * 8].height - Math.floor(cascade.height / 4);
            var step = [ pyr[i * 4].width * 4, pyr[i * 4 + next * 4].width * 4, pyr[i * 4 + next * 8].width * 4 ];
            var paddings = [ pyr[i * 4].width * 16 - qw * 16, pyr[i * 4 + next * 4].width * 8 - qw * 8, pyr[i * 4 + next * 8].width * 4 - qw * 4 ];
            for (j = 0; j < cascade.stage_classifier.length; j++) {
                var orig_feature = cascade.stage_classifier[j].orig_feature;
                var feature = cascade.stage_classifier[j].feature = new Array(cascade.stage_classifier[j].count);
                for (k = 0; k < cascade.stage_classifier[j].count; k++) {
                    feature[k] = {
                        size: orig_feature[k].size,
                        px: new Array(orig_feature[k].size),
                        pz: new Array(orig_feature[k].size),
                        nx: new Array(orig_feature[k].size),
                        nz: new Array(orig_feature[k].size)
                    };
                    for (q = 0; q < orig_feature[k].size; q++) {
                        feature[k].px[q] = orig_feature[k].px[q] * 4 + orig_feature[k].py[q] * step[orig_feature[k].pz[q]];
                        feature[k].pz[q] = orig_feature[k].pz[q];
                        feature[k].nx[q] = orig_feature[k].nx[q] * 4 + orig_feature[k].ny[q] * step[orig_feature[k].nz[q]];
                        feature[k].nz[q] = orig_feature[k].nz[q];
                    }
                }
            }
            for (q = 0; q < 4; q++) {
                var u8 = [ pyr[i * 4].data, pyr[i * 4 + next * 4].data, pyr[i * 4 + next * 8 + q].data ];
                var u8o = [ dx[q] * 8 + dy[q] * pyr[i * 4].width * 8, dx[q] * 4 + dy[q] * pyr[i * 4 + next * 4].width * 4, 0 ];
                for (y = 0; y < qh; y++) {
                    for (x = 0; x < qw; x++) {
                        var sum = 0;
                        var flag = true;
                        for (j = 0; j < cascade.stage_classifier.length; j++) {
                            sum = 0;
                            var alpha = cascade.stage_classifier[j].alpha;
                            var feature = cascade.stage_classifier[j].feature;
                            for (k = 0; k < cascade.stage_classifier[j].count; k++) {
                                var feature_k = feature[k];
                                var p, pmin = u8[feature_k.pz[0]][u8o[feature_k.pz[0]] + feature_k.px[0]];
                                var n, nmax = u8[feature_k.nz[0]][u8o[feature_k.nz[0]] + feature_k.nx[0]];
                                if (pmin <= nmax) {
                                    sum += alpha[k * 2];
                                } else {
                                    var f, shortcut = true;
                                    for (f = 0; f < feature_k.size; f++) {
                                        if (feature_k.pz[f] >= 0) {
                                            p = u8[feature_k.pz[f]][u8o[feature_k.pz[f]] + feature_k.px[f]];
                                            if (p < pmin) {
                                                if (p <= nmax) {
                                                    shortcut = false;
                                                    break;
                                                }
                                                pmin = p;
                                            }
                                        }
                                        if (feature_k.nz[f] >= 0) {
                                            n = u8[feature_k.nz[f]][u8o[feature_k.nz[f]] + feature_k.nx[f]];
                                            if (n > nmax) {
                                                if (pmin <= n) {
                                                    shortcut = false;
                                                    break;
                                                }
                                                nmax = n;
                                            }
                                        }
                                    }
                                    sum += shortcut ? alpha[k * 2 + 1] : alpha[k * 2];
                                }
                            }
                            if (sum < cascade.stage_classifier[j].threshold) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag) {
                            seq.push({
                                x: (x * 4 + dx[q] * 2) * scale_x,
                                y: (y * 4 + dy[q] * 2) * scale_y,
                                width: cascade.width * scale_x,
                                height: cascade.height * scale_y,
                                neighbor: 1,
                                confidence: sum
                            });
                        }
                        u8o[0] += 16;
                        u8o[1] += 8;
                        u8o[2] += 4;
                    }
                    u8o[0] += paddings[0];
                    u8o[1] += paddings[1];
                    u8o[2] += paddings[2];
                }
            }
            scale_x *= scale;
            scale_y *= scale;
        }
        for (j = 0; j < cascade.stage_classifier.length; j++) cascade.stage_classifier[j].feature = cascade.stage_classifier[j].orig_feature;
        if (!(min_neighbors > 0)) return seq; else {
            var result = headtrackr.ccv.array_group(seq, function(r1, r2) {
                var distance = Math.floor(r1.width * .25 + .5);
                return r2.x <= r1.x + distance && r2.x >= r1.x - distance && r2.y <= r1.y + distance && r2.y >= r1.y - distance && r2.width <= Math.floor(r1.width * 1.5 + .5) && Math.floor(r2.width * 1.5 + .5) >= r1.width;
            });
            var ncomp = result.cat;
            var idx_seq = result.index;
            var comps = new Array(ncomp + 1);
            for (i = 0; i < comps.length; i++) comps[i] = {
                neighbors: 0,
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                confidence: 0
            };
            for (i = 0; i < seq.length; i++) {
                var r1 = seq[i];
                var idx = idx_seq[i];
                if (comps[idx].neighbors == 0) comps[idx].confidence = r1.confidence;
                ++comps[idx].neighbors;
                comps[idx].x += r1.x;
                comps[idx].y += r1.y;
                comps[idx].width += r1.width;
                comps[idx].height += r1.height;
                comps[idx].confidence = Math.max(comps[idx].confidence, r1.confidence);
            }
            var seq2 = [];
            for (i = 0; i < ncomp; i++) {
                var n = comps[i].neighbors;
                if (n >= min_neighbors) seq2.push({
                    x: (comps[i].x * 2 + n) / (2 * n),
                    y: (comps[i].y * 2 + n) / (2 * n),
                    width: (comps[i].width * 2 + n) / (2 * n),
                    height: (comps[i].height * 2 + n) / (2 * n),
                    neighbors: comps[i].neighbors,
                    confidence: comps[i].confidence
                });
            }
            var result_seq = [];
            for (i = 0; i < seq2.length; i++) {
                var r1 = seq2[i];
                var flag = true;
                for (j = 0; j < seq2.length; j++) {
                    var r2 = seq2[j];
                    var distance = Math.floor(r2.width * .25 + .5);
                    if (i != j && r1.x >= r2.x - distance && r1.y >= r2.y - distance && r1.x + r1.width <= r2.x + r2.width + distance && r1.y + r1.height <= r2.y + r2.height + distance && (r2.neighbors > Math.max(3, r1.neighbors) || r1.neighbors < 3)) {
                        flag = false;
                        break;
                    }
                }
                if (flag) result_seq.push(r1);
            }
            return result_seq;
        }
    };
    headtrackr.cascade = {
        count: 16,
        width: 24,
        height: 24,
        stage_classifier: [ {
            count: 4,
            threshold: -4.57753,
            feature: [ {
                size: 4,
                px: [ 3, 5, 8, 11 ],
                py: [ 2, 2, 6, 3 ],
                pz: [ 2, 1, 1, 0 ],
                nx: [ 8, 4, 0, 0 ],
                ny: [ 4, 4, 0, 0 ],
                nz: [ 1, 1, -1, -1 ]
            }, {
                size: 3,
                px: [ 3, 6, 7 ],
                py: [ 7, 13, 0 ],
                pz: [ 1, 0, -1 ],
                nx: [ 2, 3, 4 ],
                ny: [ 5, 4, 4 ],
                nz: [ 2, 1, 1 ]
            }, {
                size: 5,
                px: [ 5, 3, 10, 13, 11 ],
                py: [ 1, 0, 3, 2, 2 ],
                pz: [ 1, 2, 0, 0, 0 ],
                nx: [ 0, 11, 0, 11, 11 ],
                ny: [ 0, 2, 3, 1, 1 ],
                nz: [ 1, 1, 0, 1, -1 ]
            }, {
                size: 5,
                px: [ 6, 12, 12, 9, 12 ],
                py: [ 4, 13, 12, 7, 11 ],
                pz: [ 1, 0, 0, 1, 0 ],
                nx: [ 8, 0, 8, 2, 11 ],
                ny: [ 4, 0, 8, 5, 1 ],
                nz: [ 1, -1, -1, -1, -1 ]
            } ],
            alpha: [ -2.879683, 2.879683, -1.569341, 1.569341, -1.286131, 1.286131, -1.157626, 1.157626 ]
        }, {
            count: 4,
            threshold: -4.339908,
            feature: [ {
                size: 5,
                px: [ 13, 12, 3, 11, 17 ],
                py: [ 3, 3, 1, 4, 13 ],
                pz: [ 0, 0, 2, 0, 0 ],
                nx: [ 4, 3, 8, 15, 15 ],
                ny: [ 4, 5, 4, 8, 8 ],
                nz: [ 1, 2, 1, 0, -1 ]
            }, {
                size: 5,
                px: [ 6, 7, 6, 3, 3 ],
                py: [ 13, 13, 4, 2, 7 ],
                pz: [ 0, 0, 1, 2, 1 ],
                nx: [ 4, 8, 3, 0, 15 ],
                ny: [ 4, 4, 4, 3, 8 ],
                nz: [ 1, 1, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 2, 2, 11 ],
                py: [ 3, 2, 5 ],
                pz: [ 2, 2, 0 ],
                nx: [ 3, 8, 3 ],
                ny: [ 4, 4, 4 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 5,
                px: [ 15, 13, 9, 11, 7 ],
                py: [ 2, 1, 2, 1, 0 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 23, 11, 23, 22, 23 ],
                ny: [ 1, 0, 2, 0, 0 ],
                nz: [ 0, 1, 0, 0, 0 ]
            } ],
            alpha: [ -2.466029, 2.466029, -1.83951, 1.83951, -1.060559, 1.060559, -1.094927, 1.094927 ]
        }, {
            count: 7,
            threshold: -5.052474,
            feature: [ {
                size: 5,
                px: [ 17, 13, 3, 11, 10 ],
                py: [ 13, 2, 1, 4, 3 ],
                pz: [ 0, 0, 2, 0, 0 ],
                nx: [ 4, 8, 8, 3, 7 ],
                ny: [ 2, 8, 4, 5, 4 ],
                nz: [ 2, 0, 1, 2, 1 ]
            }, {
                size: 5,
                px: [ 6, 7, 3, 6, 6 ],
                py: [ 4, 12, 2, 13, 14 ],
                pz: [ 1, 0, 2, 0, 0 ],
                nx: [ 8, 3, 4, 4, 3 ],
                ny: [ 4, 4, 2, 0, 2 ],
                nz: [ 1, 1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 7, 4, 5, 3, 3 ],
                py: [ 2, 1, 3, 1, 1 ],
                pz: [ 0, 1, 0, 1, -1 ],
                nx: [ 1, 0, 1, 1, 0 ],
                ny: [ 1, 3, 2, 0, 4 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 11, 11, 11, 3, 2 ],
                py: [ 11, 13, 10, 7, 2 ],
                pz: [ 0, 0, 0, 1, 2 ],
                nx: [ 4, 1, 8, 2, 0 ],
                ny: [ 4, 1, 12, 0, 4 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 9, 13, 1 ],
                py: [ 7, 19, 4 ],
                pz: [ 1, -1, -1 ],
                nx: [ 4, 7, 4 ],
                ny: [ 5, 8, 2 ],
                nz: [ 2, 1, 2 ]
            }, {
                size: 5,
                px: [ 12, 8, 16, 4, 4 ],
                py: [ 12, 1, 2, 0, 0 ],
                pz: [ 0, 1, 0, 2, -1 ],
                nx: [ 11, 22, 11, 23, 23 ],
                ny: [ 2, 0, 1, 1, 5 ],
                nz: [ 1, 0, 1, 0, 0 ]
            }, {
                size: 3,
                px: [ 11, 17, 17 ],
                py: [ 6, 11, 12 ],
                pz: [ 0, 0, 0 ],
                nx: [ 15, 1, 11 ],
                ny: [ 9, 1, 1 ],
                nz: [ 0, -1, -1 ]
            } ],
            alpha: [ -2.15689, 2.15689, -1.718246, 1.718246, -.9651329, .9651329, -.994809, .994809, -.8802466, .8802466, -.8486741, .8486741, -.8141777, .8141777 ]
        }, {
            count: 13,
            threshold: -5.7744,
            feature: [ {
                size: 5,
                px: [ 6, 10, 3, 12, 14 ],
                py: [ 5, 3, 1, 2, 2 ],
                pz: [ 1, 0, 2, 0, 0 ],
                nx: [ 3, 4, 14, 8, 4 ],
                ny: [ 5, 4, 8, 4, 2 ],
                nz: [ 2, 1, 0, 1, 2 ]
            }, {
                size: 5,
                px: [ 10, 6, 11, 5, 12 ],
                py: [ 4, 13, 4, 2, 4 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 1, 4, 8, 1, 1 ],
                ny: [ 2, 4, 4, 4, 3 ],
                nz: [ 0, 1, 1, 0, 0 ]
            }, {
                size: 3,
                px: [ 18, 6, 12 ],
                py: [ 12, 4, 8 ],
                pz: [ 0, 1, 0 ],
                nx: [ 7, 4, 8 ],
                ny: [ 4, 2, 4 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 5,
                px: [ 7, 5, 6, 3, 17 ],
                py: [ 13, 12, 3, 8, 13 ],
                pz: [ 0, 0, 1, 1, 0 ],
                nx: [ 3, 3, 0, 1, 8 ],
                ny: [ 4, 5, 5, 10, 4 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 16, 7, 16, 7, 7 ],
                py: [ 1, 1, 2, 0, 0 ],
                pz: [ 0, 1, 0, 1, -1 ],
                nx: [ 23, 23, 23, 11, 5 ],
                ny: [ 2, 14, 1, 2, 1 ],
                nz: [ 0, 0, 0, 1, 2 ]
            }, {
                size: 3,
                px: [ 9, 18, 16 ],
                py: [ 7, 14, 2 ],
                pz: [ 1, 0, -1 ],
                nx: [ 8, 4, 9 ],
                ny: [ 10, 2, 4 ],
                nz: [ 1, 2, 1 ]
            }, {
                size: 4,
                px: [ 3, 16, 1, 22 ],
                py: [ 7, 4, 5, 11 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 3, 9, 4, 2 ],
                ny: [ 4, 9, 7, 5 ],
                nz: [ 1, 0, 1, 2 ]
            }, {
                size: 5,
                px: [ 4, 7, 8, 8, 9 ],
                py: [ 0, 2, 2, 1, 1 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 0, 0, 1, 0, 0 ],
                ny: [ 15, 16, 19, 0, 14 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 4, 4, 7, 8, 12 ],
                py: [ 2, 5, 6, 7, 10 ],
                pz: [ 2, 2, 1, 1, 0 ],
                nx: [ 8, 5, 10, 0, 0 ],
                ny: [ 4, 2, 5, 3, 14 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 0 ],
                py: [ 13, 4 ],
                pz: [ 0, -1 ],
                nx: [ 3, 14 ],
                ny: [ 4, 16 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 17, 8, 18, 4, 4 ],
                py: [ 3, 1, 3, 0, 0 ],
                pz: [ 0, 1, 0, 2, -1 ],
                nx: [ 21, 22, 5, 11, 22 ],
                ny: [ 0, 1, 0, 1, 2 ],
                nz: [ 0, 0, 2, 1, 0 ]
            }, {
                size: 4,
                px: [ 7, 8, 2, 11 ],
                py: [ 13, 12, 2, 7 ],
                pz: [ 0, 0, 2, 0 ],
                nx: [ 4, 0, 23, 3 ],
                ny: [ 4, 1, 1, 11 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 4, 18, 8, 9, 15 ],
                py: [ 4, 16, 7, 7, 23 ],
                pz: [ 2, 0, 1, 1, 0 ],
                nx: [ 0, 1, 1, 1, 1 ],
                ny: [ 10, 21, 23, 22, 22 ],
                nz: [ 1, 0, 0, 0, -1 ]
            } ],
            alpha: [ -1.956565, 1.956565, -1.262438, 1.262438, -1.056941, 1.056941, -.9712509, .9712509, -.8261028, .8261028, -.8456506, .8456506, -.6652113, .6652113, -.6026287, .6026287, -.6915425, .6915425, -.5539286, .5539286, -.5515072, .5515072, -.6685884, .6685884, -.465607, .465607 ]
        }, {
            count: 20,
            threshold: -5.606853,
            feature: [ {
                size: 5,
                px: [ 17, 11, 6, 14, 9 ],
                py: [ 13, 4, 4, 3, 3 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 14, 4, 8, 7, 8 ],
                ny: [ 8, 4, 4, 4, 8 ],
                nz: [ 0, 1, 1, 1, 0 ]
            }, {
                size: 5,
                px: [ 3, 9, 10, 11, 11 ],
                py: [ 7, 2, 2, 3, 3 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 3, 8, 4, 2, 5 ],
                ny: [ 4, 4, 10, 2, 8 ],
                nz: [ 1, 1, 1, 2, 1 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 5, 12 ],
                py: [ 12, 9, 10, 12, 11 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 2, 1, 3, 0, 0 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 9, 18, 9, 9, 12 ],
                py: [ 7, 14, 19, 5, 11 ],
                pz: [ 1, -1, -1, -1, -1 ],
                nx: [ 23, 4, 23, 23, 8 ],
                ny: [ 13, 5, 14, 16, 4 ],
                nz: [ 0, 2, 0, 0, 1 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 6, 1 ],
                py: [ 13, 11, 12, 6, 5 ],
                pz: [ 0, 0, 0, -1, -1 ],
                nx: [ 4, 6, 8, 4, 9 ],
                ny: [ 2, 8, 4, 4, 4 ],
                nz: [ 2, 1, 1, 1, 1 ]
            }, {
                size: 4,
                px: [ 12, 11, 11, 6 ],
                py: [ 5, 5, 6, 13 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 8, 3, 2, 8 ],
                ny: [ 4, 4, 17, 2 ],
                nz: [ 1, 1, -1, -1 ]
            }, {
                size: 5,
                px: [ 3, 14, 12, 15, 13 ],
                py: [ 0, 2, 2, 2, 2 ],
                pz: [ 2, 0, 0, 0, 0 ],
                nx: [ 22, 23, 22, 23, 7 ],
                ny: [ 0, 3, 1, 2, 4 ],
                nz: [ 0, 0, 0, 0, 1 ]
            }, {
                size: 5,
                px: [ 16, 15, 18, 19, 9 ],
                py: [ 12, 11, 12, 12, 9 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 8, 2, 22, 23, 21 ],
                ny: [ 4, 1, 1, 2, 20 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 4, 7, 7 ],
                py: [ 0, 2, 2 ],
                pz: [ 1, 0, -1 ],
                nx: [ 1, 2, 2 ],
                ny: [ 2, 0, 2 ],
                nz: [ 1, 0, 0 ]
            }, {
                size: 3,
                px: [ 4, 11, 11 ],
                py: [ 6, 9, 8 ],
                pz: [ 1, 0, 0 ],
                nx: [ 9, 2, 8 ],
                ny: [ 9, 4, 5 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 4,
                px: [ 2, 7, 6, 6 ],
                py: [ 4, 23, 21, 22 ],
                pz: [ 2, 0, 0, 0 ],
                nx: [ 9, 3, 8, 17 ],
                ny: [ 21, 2, 5, 1 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 2, 8 ],
                py: [ 4, 12 ],
                pz: [ 2, 0 ],
                nx: [ 3, 0 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 4, 5, 1, 8, 4 ],
                py: [ 15, 12, 3, 23, 12 ],
                pz: [ 0, 0, 2, 0, 0 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 23, 10, 22, 21, 11 ],
                nz: [ 0, 1, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 21, 5 ],
                py: [ 13, 4 ],
                pz: [ 0, 2 ],
                nx: [ 23, 4 ],
                ny: [ 23, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 15, 17 ],
                py: [ 2, 3 ],
                pz: [ 0, 0 ],
                nx: [ 19, 20 ],
                ny: [ 2, 1 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 12, 1, 8, 17, 4 ],
                py: [ 14, 2, 13, 6, 12 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 8, 13, 15, 15, 7 ],
                ny: [ 10, 9, 15, 14, 8 ],
                nz: [ 1, 0, 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 8, 5 ],
                py: [ 7, 4 ],
                pz: [ 1, -1 ],
                nx: [ 4, 13 ],
                ny: [ 2, 21 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 3, 4 ],
                py: [ 7, 0 ],
                pz: [ 1, -1 ],
                nx: [ 4, 2 ],
                ny: [ 7, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 4,
                px: [ 4, 14, 3, 11 ],
                py: [ 3, 23, 2, 5 ],
                pz: [ 2, 0, 2, 0 ],
                nx: [ 7, 8, 2, 16 ],
                ny: [ 8, 0, 1, 15 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 9, 8 ],
                py: [ 0, 0 ],
                pz: [ 0, 0 ],
                nx: [ 2, 2 ],
                ny: [ 3, 5 ],
                nz: [ 2, 2 ]
            } ],
            alpha: [ -1.95797, 1.95797, -1.225984, 1.225984, -.8310246, .8310246, -.8315741, .8315741, -.7973616, .7973616, -.7661959, .7661959, -.6042118, .6042118, -.6506833, .6506833, -.4808219, .4808219, -.6079504, .6079504, -.5163994, .5163994, -.5268142, .5268142, -.4935685, .4935685, -.4427544, .4427544, -.4053949, .4053949, -.4701274, .4701274, -.4387648, .4387648, -.4305499, .4305499, -.4042607, .4042607, -.4372088, .4372088 ]
        }, {
            count: 22,
            threshold: -5.679317,
            feature: [ {
                size: 5,
                px: [ 11, 3, 17, 14, 13 ],
                py: [ 4, 0, 13, 2, 3 ],
                pz: [ 0, 2, 0, 0, 0 ],
                nx: [ 7, 4, 14, 23, 11 ],
                ny: [ 8, 4, 8, 4, 0 ],
                nz: [ 1, 1, 0, 0, 1 ]
            }, {
                size: 5,
                px: [ 7, 12, 6, 12, 12 ],
                py: [ 12, 8, 3, 10, 9 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 4, 9, 8, 15, 15 ],
                ny: [ 4, 8, 4, 8, 8 ],
                nz: [ 1, 0, 1, 0, -1 ]
            }, {
                size: 3,
                px: [ 4, 2, 10 ],
                py: [ 1, 4, 1 ],
                pz: [ 1, 2, 0 ],
                nx: [ 2, 3, 8 ],
                ny: [ 5, 4, 4 ],
                nz: [ 2, 1, -1 ]
            }, {
                size: 5,
                px: [ 3, 17, 6, 6, 16 ],
                py: [ 2, 12, 4, 14, 12 ],
                pz: [ 2, 0, 1, 0, 0 ],
                nx: [ 8, 3, 7, 5, 15 ],
                ny: [ 4, 4, 4, 4, 8 ],
                nz: [ 1, 1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 5, 6, 7, 4, 8 ],
                py: [ 3, 3, 3, 1, 3 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 0, 0, 0, 0, 1 ],
                ny: [ 5, 4, 3, 2, 0 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 3,
                px: [ 18, 9, 0 ],
                py: [ 14, 7, 0 ],
                pz: [ 0, 1, -1 ],
                nx: [ 8, 14, 8 ],
                ny: [ 10, 9, 4 ],
                nz: [ 1, 0, 1 ]
            }, {
                size: 2,
                px: [ 9, 5 ],
                py: [ 18, 13 ],
                pz: [ 0, 0 ],
                nx: [ 10, 3 ],
                ny: [ 16, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 11, 11, 11, 11, 6 ],
                py: [ 10, 12, 11, 13, 6 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 5, 21, 22, 22, 22 ],
                ny: [ 4, 22, 17, 19, 18 ],
                nz: [ 2, 0, 0, 0, 0 ]
            }, {
                size: 4,
                px: [ 8, 9, 15, 4 ],
                py: [ 7, 7, 23, 4 ],
                pz: [ 1, 1, 0, 2 ],
                nx: [ 8, 5, 0, 3 ],
                ny: [ 4, 18, 4, 9 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 11, 10, 12, 11, 11 ],
                py: [ 4, 4, 4, 5, 5 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 4, 6, 8, 2, 8 ],
                ny: [ 4, 9, 9, 2, 4 ],
                nz: [ 1, 1, 0, 2, 1 ]
            }, {
                size: 5,
                px: [ 2, 2, 3, 3, 4 ],
                py: [ 10, 9, 14, 13, 15 ],
                pz: [ 1, 1, 0, 0, 0 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 5, 9, 10, 19, 18 ],
                nz: [ 2, 1, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 13, 12 ],
                pz: [ 0, 0 ],
                nx: [ 9, 2 ],
                ny: [ 15, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 2, 4, 3, 3, 4 ],
                py: [ 5, 11, 6, 9, 12 ],
                pz: [ 1, 0, 1, 0, 0 ],
                nx: [ 6, 2, 11, 11, 0 ],
                ny: [ 9, 1, 5, 20, 18 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 18, 9, 17, 19, 16 ],
                py: [ 2, 0, 2, 2, 1 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 22, 23, 11, 23, 23 ],
                ny: [ 0, 2, 0, 1, 1 ],
                nz: [ 0, 0, 1, 0, -1 ]
            }, {
                size: 5,
                px: [ 5, 5, 6, 7, 6 ],
                py: [ 17, 16, 15, 23, 22 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 7, 6, 2, 5, 23 ],
                ny: [ 8, 1, 2, 3, 1 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 12, 12, 11, 10, 6 ],
                py: [ 14, 13, 18, 4, 22 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 3, 2, 4, 1, 2 ],
                ny: [ 19, 4, 23, 13, 16 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 4,
                px: [ 11, 16, 11, 17 ],
                py: [ 7, 11, 8, 12 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 7, 14, 10, 4 ],
                ny: [ 4, 7, 10, 4 ],
                nz: [ 1, 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 8, 7 ],
                pz: [ 1, 1 ],
                nx: [ 4, 2 ],
                ny: [ 10, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 9 ],
                py: [ 0, 1 ],
                pz: [ 1, 0 ],
                nx: [ 4, 5 ],
                ny: [ 1, 0 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 14, 16 ],
                py: [ 3, 3 ],
                pz: [ 0, 0 ],
                nx: [ 9, 14 ],
                ny: [ 4, 21 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 9, 1 ],
                py: [ 7, 1 ],
                pz: [ 1, -1 ],
                nx: [ 8, 9 ],
                ny: [ 7, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 1, 0 ],
                py: [ 8, 3 ],
                pz: [ 0, 2 ],
                nx: [ 20, 0 ],
                ny: [ 3, 3 ],
                nz: [ 0, -1 ]
            } ],
            alpha: [ -1.581077, 1.581077, -1.389689, 1.389689, -.8733094, .8733094, -.8525177, .8525177, -.7416304, .7416304, -.6609002, .6609002, -.7119043, .7119043, -.6204438, .6204438, -.6638519, .6638519, -.5518876, .5518876, -.4898991, .4898991, -.5508243, .5508243, -.4635525, .4635525, -.5163159, .5163159, -.4495338, .4495338, -.4515036, .4515036, -.5130473, .5130473, -.4694233, .4694233, -.4022514, .4022514, -.405569, .405569, -.4151817, .4151817, -.3352302, .3352302 ]
        }, {
            count: 32,
            threshold: -5.363782,
            feature: [ {
                size: 5,
                px: [ 12, 9, 6, 8, 14 ],
                py: [ 4, 2, 13, 3, 3 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 0, 15, 0, 9, 5 ],
                ny: [ 2, 7, 3, 8, 8 ],
                nz: [ 0, 0, 0, 0, 1 ]
            }, {
                size: 5,
                px: [ 13, 16, 3, 6, 11 ],
                py: [ 3, 13, 1, 4, 3 ],
                pz: [ 0, 0, 2, 1, 0 ],
                nx: [ 7, 4, 8, 14, 14 ],
                ny: [ 4, 4, 4, 8, 8 ],
                nz: [ 1, 1, 1, 0, -1 ]
            }, {
                size: 5,
                px: [ 10, 19, 18, 19, 19 ],
                py: [ 6, 13, 13, 12, 12 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 23, 5, 23, 23, 11 ],
                ny: [ 12, 2, 13, 14, 8 ],
                nz: [ 0, 2, 0, 0, 1 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 12, 6 ],
                py: [ 11, 13, 12, 10, 6 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 6, 8, 3, 9, 9 ],
                ny: [ 8, 4, 4, 4, 4 ],
                nz: [ 1, 1, 1, 1, -1 ]
            }, {
                size: 5,
                px: [ 5, 3, 5, 8, 11 ],
                py: [ 12, 8, 3, 11, 8 ],
                pz: [ 0, 1, 1, 0, 0 ],
                nx: [ 4, 0, 1, 1, 9 ],
                ny: [ 4, 3, 4, 3, 4 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 13, 3, 12, 14, 12 ],
                py: [ 1, 0, 1, 2, 3 ],
                pz: [ 0, 2, 0, 0, 0 ],
                nx: [ 7, 9, 8, 4, 4 ],
                ny: [ 5, 4, 10, 2, 2 ],
                nz: [ 1, 1, 1, 2, -1 ]
            }, {
                size: 5,
                px: [ 18, 16, 12, 15, 8 ],
                py: [ 12, 23, 7, 11, 8 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 8, 6, 10, 12, 4 ],
                ny: [ 4, 4, 10, 6, 3 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 4, 4, 5, 2, 2 ],
                py: [ 13, 14, 14, 7, 7 ],
                pz: [ 0, 0, 0, 1, -1 ],
                nx: [ 0, 0, 0, 0, 1 ],
                ny: [ 15, 4, 14, 13, 17 ],
                nz: [ 0, 2, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 7, 7 ],
                pz: [ 1, -1 ],
                nx: [ 4, 7 ],
                ny: [ 5, 8 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 3, 4, 6, 5, 4 ],
                py: [ 2, 2, 14, 6, 9 ],
                pz: [ 1, 1, 0, 1, 1 ],
                nx: [ 23, 23, 23, 23, 11 ],
                ny: [ 0, 3, 2, 1, 0 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 3,
                px: [ 10, 2, 3 ],
                py: [ 23, 4, 7 ],
                pz: [ 0, 2, 1 ],
                nx: [ 10, 21, 23 ],
                ny: [ 21, 9, 2 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 5,
                px: [ 20, 21, 21, 10, 12 ],
                py: [ 13, 12, 8, 8, 12 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 8, 16, 3, 3, 11 ],
                ny: [ 4, 8, 4, 3, 0 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 2, 21 ],
                py: [ 4, 12 ],
                pz: [ 2, -1 ],
                nx: [ 2, 3 ],
                ny: [ 5, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 8, 5, 6, 8, 7 ],
                py: [ 0, 2, 1, 1, 1 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 3, 2, 2, 2, 2 ],
                ny: [ 0, 0, 1, 2, 2 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 11, 2, 2, 11, 10 ],
                py: [ 10, 12, 8, 11, 12 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 3, 5, 2, 4, 2 ],
                ny: [ 4, 1, 4, 2, 2 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 4,
                px: [ 15, 16, 8, 17 ],
                py: [ 2, 1, 0, 2 ],
                pz: [ 0, 0, 1, 0 ],
                nx: [ 19, 20, 0, 8 ],
                ny: [ 1, 2, 11, 10 ],
                nz: [ 0, 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 17, 16 ],
                py: [ 12, 12 ],
                pz: [ 0, 0 ],
                nx: [ 8, 9 ],
                ny: [ 5, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 11, 11, 0, 0 ],
                py: [ 12, 13, 0, 0 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 10, 10, 9, 10 ],
                ny: [ 10, 12, 13, 11 ],
                nz: [ 0, 0, 0, 0 ]
            }, {
                size: 3,
                px: [ 11, 10, 8 ],
                py: [ 5, 2, 6 ],
                pz: [ 0, -1, -1 ],
                nx: [ 8, 12, 4 ],
                ny: [ 4, 17, 4 ],
                nz: [ 1, 0, 1 ]
            }, {
                size: 5,
                px: [ 10, 21, 10, 20, 20 ],
                py: [ 11, 13, 7, 13, 14 ],
                pz: [ 1, 0, 1, 0, 0 ],
                nx: [ 23, 23, 11, 23, 17 ],
                ny: [ 23, 22, 11, 21, 21 ],
                nz: [ 0, 0, 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 4, 7 ],
                py: [ 3, 9 ],
                pz: [ 2, 1 ],
                nx: [ 9, 23 ],
                ny: [ 4, 22 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 3, 2, 2, 5 ],
                py: [ 11, 5, 4, 20 ],
                pz: [ 1, 2, 2, 0 ],
                nx: [ 4, 23, 11, 23 ],
                ny: [ 10, 22, 11, 21 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 7, 5 ],
                py: [ 13, 4 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 8, 6 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 2, 5 ],
                py: [ 4, 9 ],
                pz: [ 2, 1 ],
                nx: [ 10, 10 ],
                ny: [ 16, 16 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 3, 0 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 7, 3, 12, 13, 6 ],
                py: [ 11, 5, 23, 23, 7 ],
                pz: [ 1, 2, 0, 0, 1 ],
                nx: [ 1, 0, 0, 0, 0 ],
                ny: [ 23, 20, 19, 21, 21 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 0, 0 ],
                py: [ 10, 9, 6, 13, 13 ],
                pz: [ 0, 0, 1, 0, -1 ],
                nx: [ 8, 8, 4, 4, 9 ],
                ny: [ 4, 11, 5, 4, 5 ],
                nz: [ 1, 1, 2, 2, 1 ]
            }, {
                size: 2,
                px: [ 9, 18 ],
                py: [ 8, 15 ],
                pz: [ 1, 0 ],
                nx: [ 15, 4 ],
                ny: [ 15, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 13 ],
                py: [ 6, 17 ],
                pz: [ 1, -1 ],
                nx: [ 1, 2 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 19, 10, 20, 18, 18 ],
                py: [ 2, 0, 2, 2, 2 ],
                pz: [ 0, 1, 0, 0, -1 ],
                nx: [ 22, 23, 22, 11, 23 ],
                ny: [ 1, 3, 0, 1, 2 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 4, 2, 2, 2, 6 ],
                py: [ 7, 2, 5, 4, 14 ],
                pz: [ 1, 2, 2, 2, 0 ],
                nx: [ 16, 7, 9, 15, 23 ],
                ny: [ 8, 0, 3, 11, 2 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 10, 10, 9, 9, 5 ],
                py: [ 2, 0, 0, 1, 0 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 3, 2, 3, 2, 2 ],
                ny: [ 11, 3, 9, 5, 5 ],
                nz: [ 1, 2, 1, 2, -1 ]
            } ],
            alpha: [ -1.490426, 1.490426, -1.21428, 1.21428, -.8124863, .8124863, -.7307594, .7307594, -.7377259, .7377259, -.5982859, .5982859, -.6451736, .6451736, -.6117417, .6117417, -.5438949, .5438949, -.4563701, .4563701, -.4975362, .4975362, -.4707373, .4707373, -.5013868, .5013868, -.5139018, .5139018, -.4728007, .4728007, -.4839748, .4839748, -.4852528, .4852528, -.5768956, .5768956, -.3635091, .3635091, -.419009, .419009, -.3854715, .3854715, -.3409591, .3409591, -.3440222, .3440222, -.3375895, .3375895, -.3367032, .3367032, -.3708106, .3708106, -.3260956, .3260956, -.3657681, .3657681, -.35188, .35188, -.3845758, .3845758, -.2832236, .2832236, -.2865156, .2865156 ]
        }, {
            count: 45,
            threshold: -5.479836,
            feature: [ {
                size: 5,
                px: [ 15, 6, 17, 6, 9 ],
                py: [ 2, 13, 13, 4, 3 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 3, 9, 4, 8, 14 ],
                ny: [ 5, 8, 4, 4, 8 ],
                nz: [ 2, 0, 1, 1, 0 ]
            }, {
                size: 5,
                px: [ 9, 8, 11, 6, 7 ],
                py: [ 1, 2, 3, 14, 2 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 0, 0, 4, 0, 0 ],
                ny: [ 4, 2, 4, 1, 0 ],
                nz: [ 0, 0, 1, 0, 0 ]
            }, {
                size: 5,
                px: [ 2, 2, 11, 11, 11 ],
                py: [ 2, 4, 10, 8, 6 ],
                pz: [ 2, 2, 0, 0, 0 ],
                nx: [ 8, 4, 3, 23, 23 ],
                ny: [ 4, 4, 4, 16, 18 ],
                nz: [ 1, 1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 18, 16, 17, 15, 9 ],
                py: [ 2, 2, 2, 2, 1 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 22, 22, 21, 23, 23 ],
                ny: [ 1, 2, 0, 5, 4 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 15, 3, 17, 18, 6 ],
                py: [ 11, 2, 11, 11, 4 ],
                pz: [ 0, 2, 0, 0, 1 ],
                nx: [ 3, 8, 1, 4, 23 ],
                ny: [ 4, 4, 3, 9, 4 ],
                nz: [ 1, 1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 4, 5 ],
                py: [ 4, 0 ],
                pz: [ 2, -1 ],
                nx: [ 7, 4 ],
                ny: [ 8, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 12, 5 ],
                pz: [ 0, -1 ],
                nx: [ 4, 9 ],
                ny: [ 10, 15 ],
                nz: [ 1, 0 ]
            }, {
                size: 4,
                px: [ 2, 2, 7, 1 ],
                py: [ 7, 7, 3, 4 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 0, 2, 1, 2 ],
                ny: [ 6, 20, 14, 16 ],
                nz: [ 1, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 14, 12, 12, 13, 9 ],
                py: [ 23, 5, 6, 5, 7 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 8, 18, 2, 8, 14 ],
                ny: [ 4, 9, 0, 12, 7 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 3, 10, 13, 11, 9 ],
                py: [ 0, 3, 2, 3, 2 ],
                pz: [ 2, 0, 0, 0, 0 ],
                nx: [ 3, 11, 22, 22, 22 ],
                ny: [ 2, 6, 15, 2, 0 ],
                nz: [ 2, 1, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 8, 7, 5, 8, 5 ],
                py: [ 23, 12, 12, 12, 13 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 3, 18, 3, 1, 22 ],
                ny: [ 4, 4, 4, 2, 0 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 22, 22, 22, 21, 22 ],
                py: [ 9, 11, 10, 14, 12 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 23, 23, 11, 1, 22 ],
                ny: [ 23, 23, 11, 2, 0 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 9, 3 ],
                py: [ 18, 7 ],
                pz: [ 0, 1 ],
                nx: [ 10, 8 ],
                ny: [ 16, 19 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 10, 12, 11, 6, 6 ],
                py: [ 4, 4, 4, 2, 2 ],
                pz: [ 0, 0, 0, 1, -1 ],
                nx: [ 3, 8, 7, 8, 4 ],
                ny: [ 5, 4, 4, 10, 4 ],
                nz: [ 2, 1, 1, 0, 1 ]
            }, {
                size: 4,
                px: [ 12, 12, 4, 15 ],
                py: [ 13, 12, 0, 11 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 13, 14, 13, 14 ],
                ny: [ 9, 12, 10, 13 ],
                nz: [ 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 4 ],
                py: [ 3, 3 ],
                pz: [ 2, -1 ],
                nx: [ 9, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 3,
                px: [ 9, 7, 0 ],
                py: [ 7, 5, 5 ],
                pz: [ 1, -1, -1 ],
                nx: [ 4, 15, 9 ],
                ny: [ 5, 14, 9 ],
                nz: [ 2, 0, 1 ]
            }, {
                size: 5,
                px: [ 15, 20, 7, 10, 16 ],
                py: [ 17, 12, 6, 4, 23 ],
                pz: [ 0, 0, 1, 1, 0 ],
                nx: [ 1, 2, 2, 1, 1 ],
                ny: [ 3, 0, 1, 2, 2 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 2, 1, 1, 11, 2 ],
                py: [ 16, 4, 5, 12, 14 ],
                pz: [ 0, 1, 1, 0, 0 ],
                nx: [ 4, 6, 3, 19, 1 ],
                ny: [ 4, 2, 5, 19, 2 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 15, 14, 14 ],
                py: [ 1, 1, 0 ],
                pz: [ 0, 0, 0 ],
                nx: [ 4, 8, 4 ],
                ny: [ 3, 4, 2 ],
                nz: [ 2, 1, 2 ]
            }, {
                size: 5,
                px: [ 2, 3, 1, 2, 7 ],
                py: [ 8, 12, 4, 9, 13 ],
                pz: [ 1, 0, 2, 1, 0 ],
                nx: [ 1, 1, 0, 0, 0 ],
                ny: [ 21, 20, 18, 17, 9 ],
                nz: [ 0, 0, 0, 0, 1 ]
            }, {
                size: 5,
                px: [ 17, 15, 17, 16, 16 ],
                py: [ 12, 12, 22, 23, 12 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 7, 3, 16, 1, 0 ],
                ny: [ 8, 6, 8, 3, 9 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 9, 17, 18, 18, 18 ],
                py: [ 6, 12, 12, 13, 13 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 23, 23, 20, 11, 11 ],
                ny: [ 12, 13, 23, 7, 8 ],
                nz: [ 0, 0, 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 4, 7 ],
                pz: [ 2, 1 ],
                nx: [ 4, 4 ],
                ny: [ 10, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 4, 22, 19, 12 ],
                py: [ 5, 8, 14, 9 ],
                pz: [ 2, 0, 0, 0 ],
                nx: [ 8, 4, 4, 2 ],
                ny: [ 4, 4, 1, 2 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 3, 21 ],
                py: [ 7, 14 ],
                pz: [ 1, -1 ],
                nx: [ 4, 2 ],
                ny: [ 7, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 3,
                px: [ 7, 4, 17 ],
                py: [ 3, 1, 6 ],
                pz: [ 0, 1, -1 ],
                nx: [ 3, 4, 5 ],
                ny: [ 0, 2, 1 ],
                nz: [ 1, 0, 0 ]
            }, {
                size: 4,
                px: [ 15, 7, 14, 0 ],
                py: [ 3, 1, 3, 7 ],
                pz: [ 0, 1, 0, -1 ],
                nx: [ 8, 18, 17, 18 ],
                ny: [ 0, 1, 1, 2 ],
                nz: [ 1, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 12, 6 ],
                py: [ 10, 11, 12, 13, 6 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 8, 15, 15, 4, 8 ],
                ny: [ 10, 10, 9, 2, 4 ],
                nz: [ 0, 0, 0, 2, 1 ]
            }, {
                size: 2,
                px: [ 17, 12 ],
                py: [ 13, 11 ],
                pz: [ 0, -1 ],
                nx: [ 9, 8 ],
                ny: [ 4, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 0, 0 ],
                py: [ 10, 9, 12, 11, 4 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 8, 9, 8, 9, 9 ],
                ny: [ 10, 4, 4, 5, 5 ],
                nz: [ 1, 1, 1, 1, -1 ]
            }, {
                size: 3,
                px: [ 7, 0, 1 ],
                py: [ 1, 9, 8 ],
                pz: [ 0, -1, -1 ],
                nx: [ 4, 3, 3 ],
                ny: [ 7, 15, 16 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 7 ],
                py: [ 15, 23 ],
                pz: [ 0, 0 ],
                nx: [ 9, 18 ],
                ny: [ 21, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 17, 4, 19, 18, 8 ],
                py: [ 12, 3, 12, 17, 6 ],
                pz: [ 0, 2, 0, 0, 1 ],
                nx: [ 23, 23, 11, 22, 16 ],
                ny: [ 0, 1, 0, 21, -1 ],
                nz: [ 0, 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 7, 4 ],
                py: [ 13, 5 ],
                pz: [ 0, -1 ],
                nx: [ 4, 2 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 21, 20, 10, 10, 21 ],
                py: [ 13, 14, 10, 7, 11 ],
                pz: [ 0, 0, 1, 1, 0 ],
                nx: [ 4, 4, 4, 5, 5 ],
                ny: [ 18, 17, 19, 20, 20 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 3 ],
                py: [ 11, 13 ],
                pz: [ 1, 0 ],
                nx: [ 12, 4 ],
                ny: [ 17, 17 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 13, 1 ],
                pz: [ 0, -1 ],
                nx: [ 1, 2 ],
                ny: [ 1, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 15, 7 ],
                py: [ 17, 7 ],
                pz: [ 0, 1 ],
                nx: [ 14, 4 ],
                ny: [ 15, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 11 ],
                py: [ 3, 8 ],
                pz: [ 2, 0 ],
                nx: [ 13, 13 ],
                ny: [ 9, 8 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 3 ],
                py: [ 11, 2 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 9, 5 ],
                nz: [ 0, 1 ]
            }, {
                size: 3,
                px: [ 12, 6, 9 ],
                py: [ 9, 10, 11 ],
                pz: [ 0, -1, -1 ],
                nx: [ 2, 1, 5 ],
                ny: [ 2, 1, 6 ],
                nz: [ 2, 2, 1 ]
            }, {
                size: 4,
                px: [ 4, 5, 5, 1 ],
                py: [ 11, 11, 11, 3 ],
                pz: [ 1, 0, 1, 2 ],
                nx: [ 0, 0, 5, 4 ],
                ny: [ 23, 22, 0, 0 ],
                nz: [ 0, 0, -1, -1 ]
            }, {
                size: 5,
                px: [ 15, 7, 17, 15, 16 ],
                py: [ 1, 0, 2, 2, 0 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 7, 4, 7, 4, 8 ],
                ny: [ 5, 2, 4, 3, 4 ],
                nz: [ 1, 2, 1, 2, -1 ]
            }, {
                size: 2,
                px: [ 6, 12 ],
                py: [ 11, 23 ],
                pz: [ 1, 0 ],
                nx: [ 12, 4 ],
                ny: [ 21, 2 ],
                nz: [ 0, -1 ]
            } ],
            alpha: [ -1.5358, 1.5358, -.8580514, .8580514, -.862521, .862521, -.71775, .71775, -.6832222, .6832222, -.5736298, .5736298, -.5028217, .5028217, -.5091788, .5091788, -.579194, .579194, -.4924942, .4924942, -.5489055, .5489055, -.452819, .452819, -.4748324, .4748324, -.4150403, .4150403, -.4820464, .4820464, -.4840212, .4840212, -.3941872, .3941872, -.3663507, .3663507, -.3814835, .3814835, -.3936426, .3936426, -.304997, .304997, -.3604256, .3604256, -.3974041, .3974041, -.4203486, .4203486, -.3174435, .3174435, -.3426336, .3426336, -.449215, .449215, -.3538784, .3538784, -.3679703, .3679703, -.3985452, .3985452, -.2884028, .2884028, -.2797264, .2797264, -.2664214, .2664214, -.2484857, .2484857, -.2581492, .2581492, -.2943778, .2943778, -.2315507, .2315507, -.2979337, .2979337, -.2976173, .2976173, -.2847965, .2847965, -.2814763, .2814763, -.2489068, .2489068, -.2632427, .2632427, -.3308292, .3308292, -.279017, .279017 ]
        }, {
            count: 61,
            threshold: -5.239104,
            feature: [ {
                size: 5,
                px: [ 8, 8, 11, 15, 6 ],
                py: [ 3, 6, 5, 3, 4 ],
                pz: [ 0, 1, 0, 0, 1 ],
                nx: [ 3, 9, 14, 8, 4 ],
                ny: [ 4, 8, 8, 7, 2 ],
                nz: [ 1, 0, 0, 0, 2 ]
            }, {
                size: 5,
                px: [ 11, 12, 10, 6, 9 ],
                py: [ 3, 3, 2, 13, 2 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 0, 0, 5, 2, 2 ],
                ny: [ 13, 1, 8, 5, 2 ],
                nz: [ 0, 1, 1, 2, 2 ]
            }, {
                size: 5,
                px: [ 11, 5, 11, 11, 4 ],
                py: [ 9, 13, 10, 11, 6 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 4, 15, 9, 3, 3 ],
                ny: [ 5, 8, 9, 4, 4 ],
                nz: [ 1, 0, 0, 1, -1 ]
            }, {
                size: 5,
                px: [ 15, 16, 8, 17, 17 ],
                py: [ 1, 2, 0, 2, 2 ],
                pz: [ 0, 0, 1, 0, -1 ],
                nx: [ 23, 23, 23, 23, 23 ],
                ny: [ 4, 0, 2, 3, 1 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 4,
                px: [ 9, 18, 17, 18 ],
                py: [ 7, 13, 13, 14 ],
                pz: [ 1, 0, 0, 0 ],
                nx: [ 9, 7, 4, 8 ],
                ny: [ 4, 10, 2, 4 ],
                nz: [ 1, 1, 2, 1 ]
            }, {
                size: 5,
                px: [ 12, 11, 12, 12, 6 ],
                py: [ 6, 5, 14, 5, 3 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 13, 8, 14, 7, 7 ],
                ny: [ 16, 4, 7, 4, 4 ],
                nz: [ 0, 1, 0, 1, -1 ]
            }, {
                size: 5,
                px: [ 12, 6, 3, 7, 12 ],
                py: [ 7, 12, 7, 11, 8 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 16, 4, 4, 4, 7 ],
                ny: [ 8, 4, 4, 4, 4 ],
                nz: [ 0, 1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 6, 4, 5, 3, 3 ],
                py: [ 2, 3, 2, 0, 0 ],
                pz: [ 0, 0, 0, 1, -1 ],
                nx: [ 1, 0, 1, 0, 0 ],
                ny: [ 0, 3, 1, 1, 2 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 15, 9 ],
                py: [ 11, 6 ],
                pz: [ 0, 1 ],
                nx: [ 14, 5 ],
                ny: [ 9, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 10, 19, 19, 10, 20 ],
                py: [ 7, 20, 14, 6, 12 ],
                pz: [ 1, 0, 0, 1, 0 ],
                nx: [ 23, 22, 11, 23, 23 ],
                ny: [ 21, 23, 9, 20, 20 ],
                nz: [ 0, 0, 1, 0, -1 ]
            }, {
                size: 5,
                px: [ 1, 1, 5, 1, 1 ],
                py: [ 8, 6, 6, 9, 4 ],
                pz: [ 0, 1, 1, 0, 2 ],
                nx: [ 3, 3, 3, 2, 5 ],
                ny: [ 4, 4, 2, 5, 4 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 13, 12, 3, 11, 11 ],
                py: [ 2, 2, 0, 1, 2 ],
                pz: [ 0, 0, 2, 0, 0 ],
                nx: [ 3, 6, 8, 4, 3 ],
                ny: [ 2, 9, 4, 4, 5 ],
                nz: [ 2, 1, 1, 1, -1 ]
            }, {
                size: 3,
                px: [ 12, 12, 6 ],
                py: [ 11, 12, 9 ],
                pz: [ 0, 0, -1 ],
                nx: [ 2, 1, 9 ],
                ny: [ 6, 1, 14 ],
                nz: [ 0, 2, 0 ]
            }, {
                size: 5,
                px: [ 6, 3, 17, 16, 16 ],
                py: [ 4, 2, 14, 23, 13 ],
                pz: [ 1, 2, 0, 0, 0 ],
                nx: [ 8, 10, 21, 5, 1 ],
                ny: [ 4, 10, 11, 0, 0 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 5, 6, 1, 3, 3 ],
                py: [ 15, 14, 4, 7, 7 ],
                pz: [ 0, 0, 2, 1, -1 ],
                nx: [ 1, 0, 0, 1, 1 ],
                ny: [ 5, 8, 7, 18, 17 ],
                nz: [ 2, 1, 1, 0, 0 ]
            }, {
                size: 4,
                px: [ 6, 12, 5, 3 ],
                py: [ 6, 12, 2, 7 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 14, 13, 13, 7 ],
                ny: [ 12, 10, 9, 8 ],
                nz: [ 0, 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 7, 15 ],
                pz: [ 1, 0 ],
                nx: [ 3, 3 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 11, 10, 12, 2 ],
                py: [ 18, 18, 18, 3 ],
                pz: [ 0, 0, 0, 2 ],
                nx: [ 11, 17, 4, 16 ],
                ny: [ 16, 4, 4, 21 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 9, 8, 8, 5, 2 ],
                py: [ 4, 4, 4, 2, 3 ],
                pz: [ 0, 0, -1, -1, -1 ],
                nx: [ 2, 2, 4, 4, 2 ],
                ny: [ 1, 2, 10, 5, 4 ],
                nz: [ 2, 2, 1, 1, 2 ]
            }, {
                size: 4,
                px: [ 8, 18, 14, 18 ],
                py: [ 7, 16, 23, 15 ],
                pz: [ 1, 0, 0, 0 ],
                nx: [ 14, 3, 1, 0 ],
                ny: [ 21, 1, 9, 3 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 12, 3 ],
                py: [ 9, 5 ],
                pz: [ 0, 2 ],
                nx: [ 8, 1 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 1, 1 ],
                pz: [ 1, -1 ],
                nx: [ 19, 20 ],
                ny: [ 1, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 10, 10, 10 ],
                py: [ 6, 6, 8 ],
                pz: [ 1, -1, -1 ],
                nx: [ 22, 21, 22 ],
                ny: [ 13, 18, 12 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 4, 1 ],
                pz: [ 2, -1 ],
                nx: [ 2, 4 ],
                ny: [ 5, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 21, 21, 21, 21, 21 ],
                py: [ 19, 17, 18, 15, 16 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 11, 21, 6, 1, 21 ],
                ny: [ 17, 1, 10, 0, 2 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 7, 3, 4, 4, 4 ],
                py: [ 23, 13, 14, 16, 13 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 21, 22, 22, 22, 22 ],
                ny: [ 23, 21, 20, 19, 19 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 8 ],
                py: [ 6, 6 ],
                pz: [ 0, 1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 23, 23, 11, 23, 23 ],
                py: [ 8, 12, 6, 11, 10 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 4, 4, 3, 8, 8 ],
                ny: [ 3, 8, 4, 4, 4 ],
                nz: [ 1, 1, 1, 1, -1 ]
            }, {
                size: 5,
                px: [ 8, 9, 4, 7, 10 ],
                py: [ 2, 1, 0, 2, 1 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 5, 5, 6, 4, 4 ],
                ny: [ 1, 0, 0, 2, 1 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 12, 2 ],
                py: [ 13, 6 ],
                pz: [ 0, -1 ],
                nx: [ 15, 9 ],
                ny: [ 15, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 4, 9 ],
                pz: [ 2, 1 ],
                nx: [ 3, 13 ],
                ny: [ 4, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 3, 6, 2 ],
                py: [ 10, 22, 4 ],
                pz: [ 1, 0, 2 ],
                nx: [ 4, 2, 1 ],
                ny: [ 10, 4, 3 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 1, 0 ],
                py: [ 9, 7 ],
                pz: [ 0, 1 ],
                nx: [ 0, 0 ],
                ny: [ 23, 22 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 7 ],
                py: [ 0, 1 ],
                pz: [ 0, 0 ],
                nx: [ 4, 4 ],
                ny: [ 8, 8 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 7, 4, 4, 6, 3 ],
                py: [ 8, 4, 5, 5, 3 ],
                pz: [ 1, 2, 2, 1, 2 ],
                nx: [ 1, 0, 2, 0, 0 ],
                ny: [ 1, 0, 0, 2, 4 ],
                nz: [ 0, 2, 0, 1, -1 ]
            }, {
                size: 3,
                px: [ 10, 4, 4 ],
                py: [ 6, 1, 5 ],
                pz: [ 1, -1, -1 ],
                nx: [ 5, 23, 22 ],
                ny: [ 4, 13, 7 ],
                nz: [ 2, 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 6, 5 ],
                pz: [ 1, 1 ],
                nx: [ 6, 0 ],
                ny: [ 9, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 0, 1, 1, 0, 0 ],
                py: [ 5, 18, 19, 16, 6 ],
                pz: [ 2, 0, 0, 0, 1 ],
                nx: [ 5, 9, 4, 8, 8 ],
                ny: [ 8, 7, 3, 7, 7 ],
                nz: [ 1, 0, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 12 ],
                py: [ 23, 23 ],
                pz: [ 0, 0 ],
                nx: [ 7, 6 ],
                ny: [ 8, 10 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 14, 19 ],
                py: [ 12, 8 ],
                pz: [ 0, 0 ],
                nx: [ 18, 5 ],
                ny: [ 8, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 2, 8, 6, 4, 4 ],
                py: [ 3, 23, 14, 6, 9 ],
                pz: [ 2, 0, 0, 1, 1 ],
                nx: [ 0, 0, 0, 0, 1 ],
                ny: [ 21, 20, 5, 19, 23 ],
                nz: [ 0, 0, 2, 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 22 ],
                py: [ 4, 14 ],
                pz: [ 0, -1 ],
                nx: [ 3, 8 ],
                ny: [ 1, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 1, 1, 0, 1, 1 ],
                py: [ 6, 8, 3, 12, 7 ],
                pz: [ 1, 1, 2, 0, 1 ],
                nx: [ 21, 21, 19, 10, 10 ],
                ny: [ 14, 16, 23, 9, 9 ],
                nz: [ 0, 0, 0, 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 3 ],
                py: [ 23, 2 ],
                pz: [ 0, 2 ],
                nx: [ 10, 3 ],
                ny: [ 21, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 7, 0 ],
                pz: [ 1, -1 ],
                nx: [ 9, 9 ],
                ny: [ 11, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 23, 11, 23, 23, 23 ],
                py: [ 18, 10, 19, 20, 16 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 3, 3, 2, 3, 2 ],
                ny: [ 15, 16, 10, 17, 9 ],
                nz: [ 0, 0, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 14 ],
                py: [ 7, 18 ],
                pz: [ 1, 0 ],
                nx: [ 7, 10 ],
                ny: [ 8, 8 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 12, 5 ],
                py: [ 6, 4 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 4, 5 ],
                py: [ 13, 4 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 17, 19 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 2, 3, 3 ],
                py: [ 11, 17, 19 ],
                pz: [ 1, 0, 0 ],
                nx: [ 7, 7, 4 ],
                ny: [ 8, 8, 5 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 6, 6 ],
                py: [ 6, 5 ],
                pz: [ 1, -1 ],
                nx: [ 2, 9 ],
                ny: [ 4, 12 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 8, 8, 9, 2, 2 ],
                py: [ 18, 13, 12, 3, 3 ],
                pz: [ 0, 0, 0, 2, -1 ],
                nx: [ 23, 11, 23, 11, 11 ],
                ny: [ 13, 6, 14, 7, 8 ],
                nz: [ 0, 1, 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 9, 11 ],
                py: [ 6, 13 ],
                pz: [ 1, -1 ],
                nx: [ 4, 8 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 8, 10 ],
                py: [ 0, 6 ],
                pz: [ 1, 1 ],
                nx: [ 9, 4 ],
                ny: [ 6, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 3, 10, 9 ],
                py: [ 8, 6, 0 ],
                pz: [ 1, -1, -1 ],
                nx: [ 2, 2, 2 ],
                ny: [ 15, 16, 9 ],
                nz: [ 0, 0, 1 ]
            }, {
                size: 3,
                px: [ 14, 15, 0 ],
                py: [ 2, 2, 5 ],
                pz: [ 0, 0, -1 ],
                nx: [ 17, 17, 18 ],
                ny: [ 0, 1, 2 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 14, 1 ],
                pz: [ 0, -1 ],
                nx: [ 10, 9 ],
                ny: [ 12, 14 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 8 ],
                py: [ 7, 8 ],
                pz: [ 1, 1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 0, 0 ],
                py: [ 19, 18, 10, 5, 20 ],
                pz: [ 0, 0, 1, 2, 0 ],
                nx: [ 4, 8, 2, 4, 4 ],
                ny: [ 4, 15, 5, 10, 10 ],
                nz: [ 1, 0, 2, 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 0 ],
                py: [ 13, 18 ],
                pz: [ 0, -1 ],
                nx: [ 4, 3 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 23, 22, 22, 11, 22 ],
                py: [ 16, 13, 7, 6, 14 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 13, 7, 15, 14, 14 ],
                ny: [ 6, 3, 7, 6, 6 ],
                nz: [ 0, 1, 0, 0, -1 ]
            } ],
            alpha: [ -1.428861, 1.428861, -.8591837, .8591837, -.7734305, .7734305, -.653446, .653446, -.6262547, .6262547, -.5231782, .5231782, -.4984303, .4984303, -.4913187, .4913187, -.4852198, .4852198, -.4906681, .4906681, -.4126248, .4126248, -.4590814, .4590814, -.4653825, .4653825, -.41796, .41796, -.4357392, .4357392, -.4087982, .4087982, -.4594812, .4594812, -.4858794, .4858794, -.371358, .371358, -.3894534, .3894534, -.3127168, .3127168, -.4012654, .4012654, -.3370552, .3370552, -.3534712, .3534712, -.384345, .384345, -.2688805, .2688805, -.3500203, .3500203, -.282712, .282712, -.3742119, .3742119, -.3219074, .3219074, -.2544953, .2544953, -.3355513, .3355513, -.267267, .267267, -.2932047, .2932047, -.2404618, .2404618, -.2354372, .2354372, -.2657955, .2657955, -.2293701, .2293701, -.2708918, .2708918, -.2340181, .2340181, -.2464815, .2464815, -.2944239, .2944239, -.240796, .240796, -.3029642, .3029642, -.2684602, .2684602, -.2495078, .2495078, -.2539708, .2539708, -.2989293, .2989293, -.2391309, .2391309, -.2531372, .2531372, -.250039, .250039, -.2295077, .2295077, -.2526125, .2526125, -.2337182, .2337182, -.1984756, .1984756, -.3089996, .3089996, -.2589053, .2589053, -.296249, .296249, -.245866, .245866, -.2515206, .2515206, -.2637299, .2637299 ]
        }, {
            count: 80,
            threshold: -5.185898,
            feature: [ {
                size: 5,
                px: [ 12, 17, 13, 10, 15 ],
                py: [ 9, 13, 3, 3, 2 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 8, 14, 6, 9, 4 ],
                ny: [ 10, 9, 8, 8, 2 ],
                nz: [ 1, 0, 1, 0, 2 ]
            }, {
                size: 5,
                px: [ 3, 11, 8, 10, 9 ],
                py: [ 7, 4, 3, 3, 3 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 2, 1, 5, 0, 0 ],
                ny: [ 2, 15, 8, 4, 13 ],
                nz: [ 2, 0, 1, 0, 0 ]
            }, {
                size: 5,
                px: [ 11, 11, 11, 4, 17 ],
                py: [ 7, 9, 8, 6, 11 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 8, 8, 8, 3, 0 ],
                ny: [ 4, 8, 8, 8, 13 ],
                nz: [ 1, 0, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 14, 15, 7, 16, 16 ],
                py: [ 3, 3, 1, 3, 3 ],
                pz: [ 0, 0, 1, 0, -1 ],
                nx: [ 23, 22, 23, 22, 22 ],
                ny: [ 6, 2, 14, 3, 4 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 4,
                px: [ 6, 4, 7, 15 ],
                py: [ 4, 2, 6, 17 ],
                pz: [ 1, 2, 1, 0 ],
                nx: [ 3, 8, 3, 14 ],
                ny: [ 4, 4, 10, 22 ],
                nz: [ 1, 1, -1, -1 ]
            }, {
                size: 3,
                px: [ 3, 5, 22 ],
                py: [ 7, 7, 5 ],
                pz: [ 1, -1, -1 ],
                nx: [ 2, 2, 4 ],
                ny: [ 5, 2, 7 ],
                nz: [ 2, 2, 1 ]
            }, {
                size: 5,
                px: [ 7, 6, 5, 6, 3 ],
                py: [ 0, 1, 2, 2, 0 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 0, 1, 1, 0, 1 ],
                ny: [ 0, 2, 1, 2, 0 ],
                nz: [ 2, 0, 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 11, 11, 11, 11, 5 ],
                py: [ 11, 10, 13, 12, 6 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 15, 14, 5, 2, 8 ],
                ny: [ 9, 8, 10, 2, 10 ],
                nz: [ 0, 0, 1, 2, 0 ]
            }, {
                size: 5,
                px: [ 8, 5, 6, 8, 7 ],
                py: [ 12, 12, 12, 23, 12 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 3, 17, 5, 2, 8 ],
                ny: [ 4, 0, 10, 2, 10 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 10, 10, 10, 19, 20 ],
                py: [ 8, 10, 9, 15, 13 ],
                pz: [ 1, 1, 1, 0, 0 ],
                nx: [ 23, 11, 5, 23, 23 ],
                ny: [ 20, 10, 5, 19, 19 ],
                nz: [ 0, 1, 2, 0, -1 ]
            }, {
                size: 5,
                px: [ 9, 13, 3, 10, 12 ],
                py: [ 2, 0, 0, 1, 1 ],
                pz: [ 0, 0, 2, 0, 0 ],
                nx: [ 3, 3, 6, 7, 7 ],
                ny: [ 5, 2, 11, 4, 4 ],
                nz: [ 2, 2, 1, 1, -1 ]
            }, {
                size: 2,
                px: [ 15, 7 ],
                py: [ 17, 6 ],
                pz: [ 0, 1 ],
                nx: [ 14, 0 ],
                ny: [ 16, 10 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 17, 15, 18, 12, 19 ],
                py: [ 22, 12, 13, 7, 15 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 8, 15, 6, 1, 7 ],
                ny: [ 4, 8, 22, 5, 4 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 10, 9, 18, 19, 8 ],
                py: [ 2, 1, 3, 3, 1 ],
                pz: [ 1, 1, 0, 0, 1 ],
                nx: [ 23, 23, 23, 11, 11 ],
                ny: [ 0, 1, 2, 0, 1 ],
                nz: [ 0, 0, 0, 1, -1 ]
            }, {
                size: 5,
                px: [ 12, 23, 0, 1, 8 ],
                py: [ 14, 5, 0, 17, 1 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 8, 14, 15, 18, 14 ],
                ny: [ 10, 11, 14, 19, 10 ],
                nz: [ 1, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 6 ],
                py: [ 6, 13 ],
                pz: [ 1, 0 ],
                nx: [ 4, 12 ],
                ny: [ 10, 14 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 5, 23, 11, 23, 13 ],
                py: [ 3, 10, 4, 11, 12 ],
                pz: [ 2, 0, 1, 0, 0 ],
                nx: [ 7, 4, 9, 8, 8 ],
                ny: [ 4, 2, 4, 4, 4 ],
                nz: [ 1, 2, 1, 1, -1 ]
            }, {
                size: 3,
                px: [ 9, 5, 11 ],
                py: [ 4, 2, 4 ],
                pz: [ 0, 1, -1 ],
                nx: [ 5, 2, 4 ],
                ny: [ 0, 1, 2 ],
                nz: [ 0, 2, 0 ]
            }, {
                size: 5,
                px: [ 5, 2, 2, 5, 8 ],
                py: [ 12, 4, 4, 6, 13 ],
                pz: [ 0, 2, 1, 1, 0 ],
                nx: [ 3, 9, 4, 4, 8 ],
                ny: [ 4, 0, 2, 2, 4 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 9, 5, 22 ],
                py: [ 7, 4, 20 ],
                pz: [ 1, -1, -1 ],
                nx: [ 8, 19, 4 ],
                ny: [ 4, 18, 5 ],
                nz: [ 1, 0, 2 ]
            }, {
                size: 5,
                px: [ 2, 3, 3, 3, 3 ],
                py: [ 10, 16, 15, 14, 13 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 0, 0, 0, 1, 0 ],
                ny: [ 10, 20, 5, 23, 21 ],
                nz: [ 1, 0, 2, 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 11 ],
                py: [ 4, 18 ],
                pz: [ 0, 0 ],
                nx: [ 11, 23 ],
                ny: [ 17, 13 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 17, 8 ],
                py: [ 16, 7 ],
                pz: [ 0, 1 ],
                nx: [ 8, 3 ],
                ny: [ 4, 6 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 13, 5, 14, 12, 3 ],
                py: [ 4, 7, 4, 5, 3 ],
                pz: [ 0, 1, 0, 0, 1 ],
                nx: [ 21, 20, 21, 21, 21 ],
                ny: [ 2, 0, 4, 3, 3 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 4,
                px: [ 20, 20, 20, 10 ],
                py: [ 21, 19, 20, 8 ],
                pz: [ 0, 0, 0, 1 ],
                nx: [ 8, 11, 0, 2 ],
                ny: [ 10, 8, 1, 3 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 4,
                px: [ 6, 7, 12, 8 ],
                py: [ 12, 12, 8, 11 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 9, 5, 5, 18 ],
                ny: [ 9, 2, 0, 20 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 11, 5, 9 ],
                py: [ 0, 0, 0 ],
                pz: [ 0, 1, 0 ],
                nx: [ 2, 6, 3 ],
                ny: [ 3, 7, 4 ],
                nz: [ 2, 0, 1 ]
            }, {
                size: 5,
                px: [ 18, 18, 9, 17, 17 ],
                py: [ 15, 14, 7, 14, 14 ],
                pz: [ 0, 0, 1, 0, -1 ],
                nx: [ 21, 21, 21, 22, 20 ],
                ny: [ 15, 21, 17, 14, 23 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 9, 12, 12, 7, 4 ],
                py: [ 4, 11, 12, 6, 5 ],
                pz: [ 1, 0, 0, 1, 2 ],
                nx: [ 16, 11, 9, 6, 20 ],
                ny: [ 8, 4, 11, 10, 23 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 12, 11, 10, 11, 11 ],
                py: [ 23, 4, 4, 5, 23 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 11, 11, 7, 3, 20 ],
                ny: [ 21, 21, 11, 1, 23 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 12, 1 ],
                py: [ 12, 3 ],
                pz: [ 0, -1 ],
                nx: [ 10, 10 ],
                ny: [ 3, 2 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 9, 4, 15, 9, 9 ],
                py: [ 8, 4, 23, 7, 7 ],
                pz: [ 1, 2, 0, 1, -1 ],
                nx: [ 5, 3, 3, 3, 2 ],
                ny: [ 23, 19, 17, 18, 15 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 0 ],
                py: [ 16, 3 ],
                pz: [ 0, 2 ],
                nx: [ 9, 4 ],
                ny: [ 15, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 3 ],
                py: [ 3, 7 ],
                pz: [ 2, 1 ],
                nx: [ 3, 8 ],
                ny: [ 4, 10 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 9, 4, 3 ],
                py: [ 18, 0, 14 ],
                pz: [ 0, -1, -1 ],
                nx: [ 3, 5, 2 ],
                ny: [ 5, 8, 5 ],
                nz: [ 2, 1, 2 ]
            }, {
                size: 3,
                px: [ 1, 1, 10 ],
                py: [ 2, 1, 7 ],
                pz: [ 1, -1, -1 ],
                nx: [ 0, 0, 0 ],
                ny: [ 3, 5, 1 ],
                nz: [ 0, 0, 1 ]
            }, {
                size: 4,
                px: [ 11, 11, 5, 2 ],
                py: [ 12, 13, 7, 3 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 5, 10, 10, 9 ],
                ny: [ 6, 9, 10, 13 ],
                nz: [ 1, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 8 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 9, 1 ],
                ny: [ 4, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 0, 0, 1, 1, 0 ],
                py: [ 4, 10, 12, 13, 5 ],
                pz: [ 1, 0, 0, 0, 1 ],
                nx: [ 4, 4, 8, 7, 7 ],
                ny: [ 3, 2, 10, 4, 4 ],
                nz: [ 2, 2, 1, 1, -1 ]
            }, {
                size: 3,
                px: [ 3, 4, 3 ],
                py: [ 1, 1, 2 ],
                pz: [ 1, -1, -1 ],
                nx: [ 4, 5, 3 ],
                ny: [ 1, 0, 2 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 9, 2 ],
                py: [ 6, 4 ],
                pz: [ 1, -1 ],
                nx: [ 8, 4 ],
                ny: [ 6, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 12, 13, 15, 16, 7 ],
                py: [ 1, 1, 2, 2, 1 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 4, 4, 4, 3, 7 ],
                ny: [ 2, 2, 4, 2, 4 ],
                nz: [ 2, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 9, 3, 2, 11, 5 ],
                py: [ 23, 7, 4, 10, 6 ],
                pz: [ 0, 1, 2, 0, 1 ],
                nx: [ 21, 20, 11, 21, 21 ],
                ny: [ 21, 23, 8, 20, 20 ],
                nz: [ 0, 0, 1, 0, -1 ]
            }, {
                size: 4,
                px: [ 12, 6, 13, 12 ],
                py: [ 7, 3, 5, 6 ],
                pz: [ 0, 1, 0, 0 ],
                nx: [ 3, 0, 5, 10 ],
                ny: [ 4, 6, 5, 1 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 10, 4 ],
                py: [ 4, 0 ],
                pz: [ 0, -1 ],
                nx: [ 12, 11 ],
                ny: [ 2, 1 ],
                nz: [ 0, 0 ]
            }, {
                size: 4,
                px: [ 2, 3, 22, 5 ],
                py: [ 6, 1, 18, 5 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 0, 0, 0, 3 ],
                ny: [ 14, 3, 12, 18 ],
                nz: [ 0, 2, 0, 0 ]
            }, {
                size: 3,
                px: [ 10, 20, 21 ],
                py: [ 10, 18, 15 ],
                pz: [ 1, 0, 0 ],
                nx: [ 15, 1, 2 ],
                ny: [ 7, 0, 8 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 0, 0 ],
                py: [ 4, 7, 13, 4, 6 ],
                pz: [ 1, 1, 0, 2, 1 ],
                nx: [ 5, 9, 8, 4, 4 ],
                ny: [ 3, 7, 7, 3, 3 ],
                nz: [ 1, 0, 0, 1, -1 ]
            }, {
                size: 3,
                px: [ 13, 12, 14 ],
                py: [ 2, 2, 2 ],
                pz: [ 0, 0, 0 ],
                nx: [ 4, 4, 4 ],
                ny: [ 2, 2, 5 ],
                nz: [ 2, -1, -1 ]
            }, {
                size: 5,
                px: [ 5, 4, 6, 2, 12 ],
                py: [ 7, 9, 7, 4, 10 ],
                pz: [ 0, 1, 0, 2, 0 ],
                nx: [ 6, 1, 2, 5, 2 ],
                ny: [ 9, 2, 4, 13, 4 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 1 ],
                py: [ 12, 5 ],
                pz: [ 0, -1 ],
                nx: [ 1, 0 ],
                ny: [ 7, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 5,
                px: [ 8, 8, 1, 16, 6 ],
                py: [ 6, 6, 4, 8, 11 ],
                pz: [ 1, -1, -1, -1, -1 ],
                nx: [ 13, 5, 4, 4, 13 ],
                ny: [ 12, 1, 2, 5, 11 ],
                nz: [ 0, 2, 2, 2, 0 ]
            }, {
                size: 2,
                px: [ 5, 6 ],
                py: [ 4, 14 ],
                pz: [ 1, 0 ],
                nx: [ 9, 5 ],
                ny: [ 7, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 6 ],
                py: [ 4, 14 ],
                pz: [ 2, 0 ],
                nx: [ 9, 2 ],
                ny: [ 15, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 10, 19, 20, 10, 9 ],
                py: [ 1, 2, 3, 0, 0 ],
                pz: [ 1, 0, 0, 1, -1 ],
                nx: [ 11, 23, 23, 11, 23 ],
                ny: [ 0, 3, 1, 1, 2 ],
                nz: [ 1, 0, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 2, 9 ],
                py: [ 3, 12 ],
                pz: [ 2, 0 ],
                nx: [ 2, 6 ],
                ny: [ 4, 6 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 0, 0 ],
                py: [ 4, 10, 11, 9, 9 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 16, 2, 17, 8, 4 ],
                ny: [ 10, 2, 9, 4, 4 ],
                nz: [ 0, 2, 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 12, 0 ],
                py: [ 5, 4 ],
                pz: [ 0, -1 ],
                nx: [ 7, 8 ],
                ny: [ 4, 8 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 21, 21 ],
                py: [ 9, 10 ],
                pz: [ 0, 0 ],
                nx: [ 11, 8 ],
                ny: [ 18, 8 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 14, 7 ],
                py: [ 23, 9 ],
                pz: [ 0, 1 ],
                nx: [ 7, 13 ],
                ny: [ 10, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 6, 2 ],
                py: [ 11, 13, 12, 6, 4 ],
                pz: [ 0, 0, 0, -1, -1 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 14, 13, 6, 12, 11 ],
                nz: [ 0, 0, 1, 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 9 ],
                py: [ 6, 11 ],
                pz: [ 1, -1 ],
                nx: [ 15, 15 ],
                ny: [ 11, 10 ],
                nz: [ 0, 0 ]
            }, {
                size: 4,
                px: [ 4, 6, 7, 2 ],
                py: [ 8, 4, 23, 7 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 4, 20, 19, 17 ],
                ny: [ 0, 3, 1, 1 ],
                nz: [ 2, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 7, 0 ],
                py: [ 6, 0 ],
                pz: [ 1, -1 ],
                nx: [ 7, 4 ],
                ny: [ 8, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 10, 0 ],
                py: [ 7, 0 ],
                pz: [ 1, -1 ],
                nx: [ 15, 15 ],
                ny: [ 15, 14 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 6, 2, 5, 2, 4 ],
                py: [ 23, 7, 21, 8, 16 ],
                pz: [ 0, 1, 0, 1, 0 ],
                nx: [ 18, 2, 10, 0, 11 ],
                ny: [ 9, 3, 23, 5, 3 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 9, 9, 8, 10, 4 ],
                py: [ 0, 2, 2, 1, 1 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 4, 3, 2, 2, 5 ],
                ny: [ 7, 3, 4, 2, 17 ],
                nz: [ 0, 1, 2, 2, 0 ]
            }, {
                size: 2,
                px: [ 10, 7 ],
                py: [ 5, 6 ],
                pz: [ 1, -1 ],
                nx: [ 11, 11 ],
                ny: [ 6, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 11, 11, 5, 6, 11 ],
                py: [ 8, 10, 5, 5, 9 ],
                pz: [ 0, 0, 1, 1, 0 ],
                nx: [ 13, 16, 11, 14, 4 ],
                ny: [ 9, 13, 11, 20, 23 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 7, 14 ],
                py: [ 14, 22 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 4, 11 ],
                py: [ 4, 5 ],
                pz: [ 2, -1 ],
                nx: [ 2, 4 ],
                ny: [ 5, 7 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 1, 0 ],
                py: [ 0, 0 ],
                pz: [ 0, 1 ],
                nx: [ 0, 4 ],
                ny: [ 0, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 11, 11, 11, 4, 9 ],
                py: [ 5, 5, 2, 9, 23 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 11, 12, 10, 9, 5 ],
                ny: [ 2, 2, 2, 2, 1 ],
                nz: [ 0, 0, 0, 0, 1 ]
            }, {
                size: 3,
                px: [ 16, 14, 15 ],
                py: [ 1, 1, 0 ],
                pz: [ 0, 0, 0 ],
                nx: [ 4, 7, 4 ],
                ny: [ 2, 4, 4 ],
                nz: [ 2, 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 0 ],
                py: [ 14, 5 ],
                pz: [ 0, -1 ],
                nx: [ 2, 4 ],
                ny: [ 5, 17 ],
                nz: [ 2, 0 ]
            }, {
                size: 5,
                px: [ 18, 7, 16, 19, 4 ],
                py: [ 13, 6, 23, 13, 3 ],
                pz: [ 0, 1, 0, 0, 2 ],
                nx: [ 5, 2, 3, 4, 4 ],
                ny: [ 1, 1, 4, 1, 3 ],
                nz: [ 0, 1, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 8 ],
                py: [ 7, 6 ],
                pz: [ 1, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 2, 1 ],
                py: [ 10, 4 ],
                pz: [ 1, 2 ],
                nx: [ 4, 4 ],
                ny: [ 3, 3 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 19, 1 ],
                pz: [ 0, -1 ],
                nx: [ 4, 12 ],
                ny: [ 10, 17 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 12, 6, 2, 4, 11 ],
                py: [ 14, 4, 2, 1, 5 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 3, 4, 3, 4, 3 ],
                ny: [ 13, 17, 14, 16, 15 ],
                nz: [ 0, 0, 0, 0, 0 ]
            } ],
            alpha: [ -1.368326, 1.368326, -.7706897, .7706897, -.8378147, .8378147, -.6120624, .6120624, -.5139189, .5139189, -.475913, .475913, -.5161374, .5161374, -.5407743, .5407743, -.4216105, .4216105, -.4418693, .4418693, -.4435335, .4435335, -.4052076, .4052076, -.429305, .429305, -.3431154, .3431154, -.4231203, .4231203, -.39171, .39171, -.362345, .362345, -.320267, .320267, -.3331602, .3331602, -.3552034, .3552034, -.3784556, .3784556, -.3295428, .3295428, -.3587038, .3587038, -.2861332, .2861332, -.3403258, .3403258, -.3989002, .3989002, -.2631159, .2631159, -.3272156, .3272156, -.2816567, .2816567, -.3125926, .3125926, -.3146982, .3146982, -.2521825, .2521825, -.2434554, .2434554, -.3435378, .3435378, -.3161172, .3161172, -.2805027, .2805027, -.3303579, .3303579, -.2725089, .2725089, -.2575051, .2575051, -.3210646, .3210646, -.2986997, .2986997, -.2408925, .2408925, -.2456291, .2456291, -.283655, .283655, -.246986, .246986, -.29159, .29159, -.2513559, .2513559, -.2433728, .2433728, -.2377905, .2377905, -.2089327, .2089327, -.1978434, .1978434, -.3017699, .3017699, -.2339661, .2339661, -.193256, .193256, -.2278285, .2278285, -.24382, .24382, -.2216769, .2216769, -.1941995, .1941995, -.2129081, .2129081, -.2270319, .2270319, -.2393942, .2393942, -.2132518, .2132518, -.1867741, .1867741, -.2394237, .2394237, -.2005917, .2005917, -.2445217, .2445217, -.2229078, .2229078, -.2342967, .2342967, -.2481784, .2481784, -.2735603, .2735603, -.2187604, .2187604, -.1677239, .1677239, -.2248867, .2248867, -.2505358, .2505358, -.1867706, .1867706, -.1904305, .1904305, -.1939881, .1939881, -.2249474, .2249474, -.1762483, .1762483, -.2299974, .2299974 ]
        }, {
            count: 115,
            threshold: -5.15192,
            feature: [ {
                size: 5,
                px: [ 7, 14, 7, 10, 6 ],
                py: [ 3, 3, 12, 4, 4 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 14, 3, 14, 9, 3 ],
                ny: [ 7, 4, 8, 8, 5 ],
                nz: [ 0, 1, 0, 0, 2 ]
            }, {
                size: 5,
                px: [ 13, 18, 16, 17, 15 ],
                py: [ 1, 13, 1, 2, 0 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 23, 23, 8, 11, 22 ],
                ny: [ 3, 4, 4, 8, 0 ],
                nz: [ 0, 0, 1, 1, 0 ]
            }, {
                size: 5,
                px: [ 16, 6, 6, 7, 12 ],
                py: [ 12, 13, 4, 12, 5 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 0, 0, 8, 4, 0 ],
                ny: [ 0, 2, 4, 4, 2 ],
                nz: [ 0, 0, 1, 1, -1 ]
            }, {
                size: 3,
                px: [ 12, 13, 7 ],
                py: [ 13, 18, 6 ],
                pz: [ 0, 0, 1 ],
                nx: [ 13, 5, 6 ],
                ny: [ 16, 3, 8 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 5,
                px: [ 10, 12, 9, 13, 11 ],
                py: [ 3, 3, 3, 3, 3 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 3, 4, 15, 4, 4 ],
                ny: [ 2, 5, 10, 4, 4 ],
                nz: [ 2, 1, 0, 1, -1 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 3, 12 ],
                py: [ 7, 9, 8, 3, 10 ],
                pz: [ 0, 0, 0, 2, 0 ],
                nx: [ 4, 8, 15, 9, 9 ],
                ny: [ 4, 4, 8, 8, 8 ],
                nz: [ 1, 1, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 6, 3, 4, 4, 2 ],
                py: [ 22, 12, 13, 14, 7 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 2, 0, 1, 1, 1 ],
                ny: [ 23, 5, 22, 21, 21 ],
                nz: [ 0, 2, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 8, 8 ],
                pz: [ 1, -1 ],
                nx: [ 3, 4 ],
                ny: [ 4, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 11, 11, 11, 11, 0 ],
                py: [ 10, 12, 11, 13, 2 ],
                pz: [ 0, 0, 0, -1, -1 ],
                nx: [ 8, 13, 13, 13, 13 ],
                ny: [ 10, 8, 9, 11, 10 ],
                nz: [ 1, 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 16, 16, 15, 17, 18 ],
                py: [ 12, 23, 11, 12, 12 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 8, 8, 9, 3, 13 ],
                ny: [ 4, 4, 12, 3, 10 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 4,
                px: [ 17, 16, 6, 5 ],
                py: [ 14, 13, 4, 5 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 8, 15, 4, 7 ],
                ny: [ 10, 14, 4, 8 ],
                nz: [ 1, 0, 2, 1 ]
            }, {
                size: 5,
                px: [ 20, 10, 20, 21, 19 ],
                py: [ 14, 7, 13, 12, 22 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 22, 23, 11, 23, 23 ],
                ny: [ 23, 22, 11, 21, 20 ],
                nz: [ 0, 0, 1, 0, -1 ]
            }, {
                size: 4,
                px: [ 12, 13, 1, 18 ],
                py: [ 14, 23, 3, 5 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 2, 10, 5, 9 ],
                ny: [ 2, 9, 8, 14 ],
                nz: [ 2, 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 10, 4, 7, 9, 8 ],
                py: [ 1, 0, 2, 0, 1 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 2, 3, 5, 3, 3 ],
                ny: [ 2, 4, 8, 3, 3 ],
                nz: [ 2, 1, 1, 1, -1 ]
            }, {
                size: 4,
                px: [ 11, 2, 2, 11 ],
                py: [ 6, 4, 5, 7 ],
                pz: [ 0, 2, 2, 0 ],
                nx: [ 3, 0, 5, 3 ],
                ny: [ 4, 9, 8, 3 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 12, 10, 9, 12, 12 ],
                py: [ 11, 2, 1, 10, 10 ],
                pz: [ 0, 1, 1, 0, -1 ],
                nx: [ 22, 11, 5, 22, 23 ],
                ny: [ 1, 1, 0, 0, 3 ],
                nz: [ 0, 1, 2, 0, 0 ]
            }, {
                size: 4,
                px: [ 5, 10, 7, 11 ],
                py: [ 14, 3, 0, 4 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 4, 4, 4, 4 ],
                ny: [ 17, 18, 15, 16 ],
                nz: [ 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 2, 2, 3, 2, 2 ],
                py: [ 16, 12, 20, 15, 17 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 12, 8, 4, 15, 15 ],
                ny: [ 17, 4, 4, 8, 8 ],
                nz: [ 0, 1, 1, 0, -1 ]
            }, {
                size: 5,
                px: [ 12, 12, 1, 6, 12 ],
                py: [ 11, 10, 3, 6, 10 ],
                pz: [ 0, 0, -1, -1, -1 ],
                nx: [ 0, 0, 1, 0, 2 ],
                ny: [ 4, 0, 2, 1, 0 ],
                nz: [ 0, 2, 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 21, 20, 21, 21, 14 ],
                py: [ 9, 16, 11, 8, 12 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 17, 6, 15, 0, 2 ],
                ny: [ 8, 23, 13, 2, 0 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 4,
                px: [ 6, 9, 9, 5 ],
                py: [ 14, 18, 23, 14 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 9, 5, 5, 12 ],
                ny: [ 21, 5, 3, 1 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 12, 13 ],
                py: [ 4, 4 ],
                pz: [ 0, 0 ],
                nx: [ 4, 3 ],
                ny: [ 4, 1 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 7, 8, 11, 4, 10 ],
                py: [ 3, 3, 2, 1, 2 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 19, 20, 19, 20, 20 ],
                ny: [ 0, 3, 1, 2, 2 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 1 ],
                py: [ 7, 4 ],
                pz: [ 1, -1 ],
                nx: [ 4, 7 ],
                ny: [ 5, 9 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 11, 10, 1, 5, 1 ],
                py: [ 10, 12, 6, 6, 5 ],
                pz: [ 0, 0, 1, 1, 1 ],
                nx: [ 16, 3, 2, 4, 4 ],
                ny: [ 10, 4, 2, 4, 4 ],
                nz: [ 0, 1, 2, 1, -1 ]
            }, {
                size: 2,
                px: [ 15, 0 ],
                py: [ 17, 0 ],
                pz: [ 0, -1 ],
                nx: [ 7, 4 ],
                ny: [ 8, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 8, 10, 9, 9, 9 ],
                py: [ 2, 2, 2, 1, 1 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 4, 2, 3, 3, 2 ],
                ny: [ 0, 3, 2, 1, 4 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 4,
                px: [ 11, 15, 17, 16 ],
                py: [ 8, 10, 11, 11 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 14, 1, 1, 2 ],
                ny: [ 9, 5, 7, 0 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 3, 5, 9 ],
                py: [ 8, 6, 12 ],
                pz: [ 0, 1, 0 ],
                nx: [ 3, 4, 18 ],
                ny: [ 4, 2, 22 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 5,
                px: [ 6, 1, 7, 3, 3 ],
                py: [ 13, 4, 13, 7, 7 ],
                pz: [ 0, 2, 0, 1, -1 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 16, 15, 8, 13, 14 ],
                nz: [ 0, 0, 1, 0, 0 ]
            }, {
                size: 2,
                px: [ 5, 16 ],
                py: [ 13, 10 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 4, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 5, 23, 11, 23, 23 ],
                py: [ 5, 12, 4, 16, 15 ],
                pz: [ 2, 0, 1, 0, 0 ],
                nx: [ 3, 2, 4, 5, 5 ],
                ny: [ 4, 2, 4, 11, 11 ],
                nz: [ 1, 2, 1, 1, -1 ]
            }, {
                size: 4,
                px: [ 10, 10, 3, 23 ],
                py: [ 7, 7, 3, 16 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 5, 23, 11, 22 ],
                ny: [ 4, 13, 7, 16 ],
                nz: [ 2, 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 15, 14, 13, 15, 16 ],
                py: [ 1, 0, 0, 0, 1 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 4, 9, 8, 8, 8 ],
                ny: [ 2, 4, 9, 4, 4 ],
                nz: [ 2, 1, 1, 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 4 ],
                py: [ 5, 5 ],
                pz: [ 0, -1 ],
                nx: [ 3, 15 ],
                ny: [ 1, 8 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 6, 12 ],
                py: [ 6, 9 ],
                pz: [ 1, 0 ],
                nx: [ 10, 10 ],
                ny: [ 10, 10 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 1, 0, 0, 0, 0 ],
                py: [ 5, 4, 11, 9, 12 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 9, 8, 2, 4, 7 ],
                ny: [ 7, 7, 2, 4, 7 ],
                nz: [ 0, 0, 2, 1, 0 ]
            }, {
                size: 2,
                px: [ 4, 8 ],
                py: [ 4, 7 ],
                pz: [ 2, 1 ],
                nx: [ 9, 8 ],
                ny: [ 4, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 6 ],
                py: [ 4, 1 ],
                pz: [ 2, -1 ],
                nx: [ 8, 6 ],
                ny: [ 7, 3 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 8, 5, 7, 6, 11 ],
                py: [ 12, 5, 13, 13, 22 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 23, 23, 23, 22, 22 ],
                ny: [ 20, 19, 21, 23, 23 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 17 ],
                py: [ 6, 9 ],
                pz: [ 1, -1 ],
                nx: [ 3, 3 ],
                ny: [ 10, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 14, 11 ],
                py: [ 23, 5 ],
                pz: [ 0, 0 ],
                nx: [ 7, 3 ],
                ny: [ 10, 20 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 4 ],
                py: [ 8, 8 ],
                pz: [ 1, 1 ],
                nx: [ 9, 4 ],
                ny: [ 15, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 4, 7 ],
                pz: [ 2, 1 ],
                nx: [ 2, 4 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 23, 11 ],
                py: [ 21, 10 ],
                pz: [ 0, 1 ],
                nx: [ 2, 3 ],
                ny: [ 11, 14 ],
                nz: [ 1, 0 ]
            }, {
                size: 4,
                px: [ 11, 11, 11, 3 ],
                py: [ 13, 12, 11, 4 ],
                pz: [ 0, 0, 0, -1 ],
                nx: [ 14, 13, 13, 6 ],
                ny: [ 13, 11, 10, 5 ],
                nz: [ 0, 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 4, 7 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 9, 19 ],
                ny: [ 4, 14 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 10, 5, 7 ],
                py: [ 5, 0, 6 ],
                pz: [ 1, -1, -1 ],
                nx: [ 10, 21, 5 ],
                ny: [ 0, 5, 3 ],
                nz: [ 1, 0, 2 ]
            }, {
                size: 2,
                px: [ 16, 13 ],
                py: [ 3, 15 ],
                pz: [ 0, -1 ],
                nx: [ 17, 7 ],
                ny: [ 23, 8 ],
                nz: [ 0, 1 ]
            }, {
                size: 3,
                px: [ 4, 2, 2 ],
                py: [ 15, 7, 19 ],
                pz: [ 0, 1, -1 ],
                nx: [ 2, 8, 4 ],
                ny: [ 5, 14, 9 ],
                nz: [ 2, 0, 1 ]
            }, {
                size: 3,
                px: [ 8, 3, 6 ],
                py: [ 10, 2, 4 ],
                pz: [ 0, 2, 1 ],
                nx: [ 3, 8, 4 ],
                ny: [ 4, 14, 9 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 14, 3 ],
                py: [ 18, 3 ],
                pz: [ 0, -1 ],
                nx: [ 12, 14 ],
                ny: [ 17, 9 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 7, 1, 10 ],
                py: [ 14, 10, 10 ],
                pz: [ 0, -1, -1 ],
                nx: [ 9, 6, 2 ],
                ny: [ 13, 18, 2 ],
                nz: [ 0, 0, 2 ]
            }, {
                size: 2,
                px: [ 11, 8 ],
                py: [ 13, 11 ],
                pz: [ 0, -1 ],
                nx: [ 2, 4 ],
                ny: [ 7, 18 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 5, 4 ],
                py: [ 21, 17 ],
                pz: [ 0, 0 ],
                nx: [ 9, 3 ],
                ny: [ 5, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 6 ],
                py: [ 4, 0 ],
                pz: [ 0, -1 ],
                nx: [ 4, 3 ],
                ny: [ 2, 0 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 2, 1 ],
                py: [ 1, 5 ],
                pz: [ 0, -1 ],
                nx: [ 0, 1 ],
                ny: [ 1, 0 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 18, 1 ],
                py: [ 13, 5 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 0, 1 ],
                py: [ 4, 3, 2, 12, 15 ],
                pz: [ 1, 1, 2, 0, 0 ],
                nx: [ 5, 9, 4, 8, 8 ],
                ny: [ 3, 6, 3, 6, 6 ],
                nz: [ 1, 0, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 5 ],
                py: [ 0, 2 ],
                pz: [ 1, -1 ],
                nx: [ 2, 1 ],
                ny: [ 0, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 4,
                px: [ 7, 15, 4, 20 ],
                py: [ 8, 23, 4, 8 ],
                pz: [ 1, 0, 2, 0 ],
                nx: [ 6, 0, 3, 4 ],
                ny: [ 9, 2, 13, 6 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 4,
                px: [ 11, 11, 10, 20 ],
                py: [ 10, 9, 11, 8 ],
                pz: [ 0, 0, 0, -1 ],
                nx: [ 21, 20, 21, 21 ],
                ny: [ 18, 23, 19, 17 ],
                nz: [ 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 8 ],
                py: [ 7, 5 ],
                pz: [ 1, -1 ],
                nx: [ 3, 4 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 5, 11 ],
                py: [ 3, 4 ],
                pz: [ 2, 1 ],
                nx: [ 8, 7 ],
                ny: [ 5, 12 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 4, 1 ],
                py: [ 1, 3 ],
                pz: [ 1, -1 ],
                nx: [ 3, 6 ],
                ny: [ 0, 0 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 19, 9 ],
                py: [ 16, 8 ],
                pz: [ 0, 1 ],
                nx: [ 14, 6 ],
                ny: [ 15, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 12, 6 ],
                py: [ 13, 5 ],
                pz: [ 0, -1 ],
                nx: [ 5, 5 ],
                ny: [ 1, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 5,
                px: [ 16, 14, 4, 15, 12 ],
                py: [ 1, 1, 1, 2, 1 ],
                pz: [ 0, 0, 2, 0, 0 ],
                nx: [ 6, 4, 3, 2, 10 ],
                ny: [ 22, 8, 2, 1, 7 ],
                nz: [ 0, 1, 1, 2, 0 ]
            }, {
                size: 5,
                px: [ 6, 8, 6, 5, 5 ],
                py: [ 1, 0, 0, 1, 0 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 4, 4, 4, 4, 8 ],
                ny: [ 4, 3, 2, 5, 10 ],
                nz: [ 2, 2, 2, 2, 1 ]
            }, {
                size: 2,
                px: [ 9, 8 ],
                py: [ 17, 0 ],
                pz: [ 0, -1 ],
                nx: [ 2, 5 ],
                ny: [ 5, 8 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 8, 0 ],
                py: [ 7, 3 ],
                pz: [ 1, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 10, 21 ],
                py: [ 11, 20 ],
                pz: [ 1, 0 ],
                nx: [ 11, 4 ],
                ny: [ 17, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 5, 10, 4, 17, 10 ],
                py: [ 3, 6, 3, 11, 5 ],
                pz: [ 1, 0, 1, 0, 0 ],
                nx: [ 21, 20, 9, 19, 10 ],
                ny: [ 4, 3, 0, 2, 1 ],
                nz: [ 0, 0, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 23, 23 ],
                py: [ 10, 10 ],
                pz: [ 0, -1 ],
                nx: [ 23, 23 ],
                ny: [ 21, 22 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 9, 20, 19, 20, 20 ],
                py: [ 0, 3, 1, 2, 2 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 11, 23, 11, 23, 5 ],
                ny: [ 1, 2, 0, 1, 0 ],
                nz: [ 1, 0, 1, 0, 2 ]
            }, {
                size: 3,
                px: [ 6, 8, 7 ],
                py: [ 4, 10, 11 ],
                pz: [ 1, 0, 0 ],
                nx: [ 8, 3, 4 ],
                ny: [ 9, 4, 4 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 4,
                px: [ 13, 13, 10, 4 ],
                py: [ 14, 23, 1, 5 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 15, 14, 8, 8 ],
                ny: [ 13, 12, 8, 9 ],
                nz: [ 0, 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 11, 9 ],
                py: [ 5, 8 ],
                pz: [ 0, -1 ],
                nx: [ 7, 8 ],
                ny: [ 7, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 5,
                px: [ 4, 8, 4, 7, 7 ],
                py: [ 2, 3, 3, 11, 11 ],
                pz: [ 2, 1, 2, 1, -1 ],
                nx: [ 0, 0, 1, 0, 0 ],
                ny: [ 4, 6, 15, 3, 2 ],
                nz: [ 1, 1, 0, 2, 2 ]
            }, {
                size: 2,
                px: [ 6, 1 ],
                py: [ 12, 1 ],
                pz: [ 0, -1 ],
                nx: [ 1, 10 ],
                ny: [ 2, 11 ],
                nz: [ 2, 0 ]
            }, {
                size: 5,
                px: [ 0, 0, 2, 3, 7 ],
                py: [ 0, 1, 4, 3, 11 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 9, 11, 9, 6, 12 ],
                ny: [ 2, 1, 1, 0, 2 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 10, 11 ],
                py: [ 4, 4 ],
                pz: [ 0, 0 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 1, 1, 1, 1, 1 ],
                py: [ 15, 10, 19, 16, 18 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 4, 5, 3, 5, 6 ],
                ny: [ 4, 19, 9, 18, 19 ],
                nz: [ 1, 0, 1, 0, -1 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 12, 20 ],
                py: [ 11, 12, 13, 13, 18 ],
                pz: [ 0, 0, 0, -1, -1 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 4, 2, 7, 6, 12 ],
                nz: [ 1, 2, 1, 1, 0 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 9, 11 ],
                pz: [ 0, 0 ],
                nx: [ 10, 4 ],
                ny: [ 5, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 8 ],
                py: [ 9, 6 ],
                pz: [ 0, 1 ],
                nx: [ 13, 13 ],
                ny: [ 10, 10 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 5, 3 ],
                pz: [ 1, 2 ],
                nx: [ 3, 3 ],
                ny: [ 5, 5 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 19, 9 ],
                py: [ 10, 6 ],
                pz: [ 0, 1 ],
                nx: [ 4, 1 ],
                ny: [ 2, 2 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 14, 4 ],
                py: [ 19, 12 ],
                pz: [ 0, -1 ],
                nx: [ 14, 8 ],
                ny: [ 17, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 4,
                px: [ 4, 2, 13, 2 ],
                py: [ 12, 6, 9, 3 ],
                pz: [ 0, 1, -1, -1 ],
                nx: [ 1, 0, 1, 0 ],
                ny: [ 16, 14, 11, 15 ],
                nz: [ 0, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 8, 7 ],
                pz: [ 1, 1 ],
                nx: [ 4, 4 ],
                ny: [ 4, 8 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 9, 11, 12, 6, 10 ],
                py: [ 2, 1, 2, 1, 2 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 4, 6, 4, 6, 2 ],
                ny: [ 4, 0, 9, 1, 8 ],
                nz: [ 0, 0, 1, 0, 1 ]
            }, {
                size: 5,
                px: [ 4, 4, 7, 2, 2 ],
                py: [ 19, 20, 23, 8, 9 ],
                pz: [ 0, 0, 0, 1, 1 ],
                nx: [ 7, 0, 5, 6, 2 ],
                ny: [ 10, 5, 4, 1, 8 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 18, 18, 17, 18, 18 ],
                py: [ 15, 16, 14, 20, 17 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 15, 2, 2, 5, 2 ],
                ny: [ 8, 0, 2, 9, 4 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 4,
                px: [ 13, 13, 13, 18 ],
                py: [ 11, 12, 12, 20 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 1, 3, 10, 10 ],
                ny: [ 1, 6, 12, 11 ],
                nz: [ 2, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 9 ],
                py: [ 0, 1 ],
                pz: [ 1, 1 ],
                nx: [ 19, 4 ],
                ny: [ 2, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 4, 2 ],
                pz: [ 1, 2 ],
                nx: [ 8, 4 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 23, 11, 22, 13, 13 ],
                py: [ 8, 3, 3, 12, 12 ],
                pz: [ 0, 1, 0, 0, -1 ],
                nx: [ 15, 7, 14, 13, 8 ],
                ny: [ 7, 3, 6, 6, 3 ],
                nz: [ 0, 1, 0, 0, 1 ]
            }, {
                size: 3,
                px: [ 9, 11, 19 ],
                py: [ 7, 3, 0 ],
                pz: [ 1, -1, -1 ],
                nx: [ 23, 23, 11 ],
                ny: [ 16, 12, 7 ],
                nz: [ 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 15, 8 ],
                py: [ 23, 7 ],
                pz: [ 0, -1 ],
                nx: [ 4, 3 ],
                ny: [ 5, 4 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 4, 10 ],
                py: [ 6, 13 ],
                pz: [ 1, -1 ],
                nx: [ 2, 3 ],
                ny: [ 4, 10 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 4, 1 ],
                py: [ 11, 2 ],
                pz: [ 1, 2 ],
                nx: [ 9, 2 ],
                ny: [ 5, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 22, 22 ],
                py: [ 22, 21 ],
                pz: [ 0, 0 ],
                nx: [ 3, 0 ],
                ny: [ 5, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 20, 10 ],
                py: [ 12, 6 ],
                pz: [ 0, 1 ],
                nx: [ 20, 10 ],
                ny: [ 23, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 10, 3, 3, 4 ],
                py: [ 5, 3, 4, 9 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 14, 4, 3, 11 ],
                ny: [ 2, 1, 1, 3 ],
                nz: [ 0, 2, 2, 0 ]
            }, {
                size: 3,
                px: [ 15, 15, 3 ],
                py: [ 1, 1, 4 ],
                pz: [ 0, -1, -1 ],
                nx: [ 7, 4, 4 ],
                ny: [ 8, 2, 3 ],
                nz: [ 1, 2, 2 ]
            }, {
                size: 3,
                px: [ 0, 0, 0 ],
                py: [ 3, 4, 6 ],
                pz: [ 2, 2, 1 ],
                nx: [ 0, 21, 4 ],
                ny: [ 23, 14, 3 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 5,
                px: [ 4, 4, 5, 3, 4 ],
                py: [ 9, 11, 8, 4, 8 ],
                pz: [ 1, 1, 1, 2, 1 ],
                nx: [ 21, 21, 10, 19, 19 ],
                ny: [ 3, 4, 1, 0, 0 ],
                nz: [ 0, 0, 1, 0, -1 ]
            }, {
                size: 4,
                px: [ 21, 20, 20, 21 ],
                py: [ 18, 21, 20, 17 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 8, 1, 4, 2 ],
                ny: [ 10, 0, 2, 4 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 7, 14 ],
                pz: [ 1, 0 ],
                nx: [ 3, 5 ],
                ny: [ 4, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 12, 0, 23 ],
                py: [ 20, 2, 13 ],
                pz: [ 0, -1, -1 ],
                nx: [ 12, 2, 9 ],
                ny: [ 19, 2, 7 ],
                nz: [ 0, 2, 0 ]
            }, {
                size: 2,
                px: [ 0, 6 ],
                py: [ 22, 11 ],
                pz: [ 0, -1 ],
                nx: [ 20, 18 ],
                ny: [ 12, 23 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 9, 15, 15, 16, 8 ],
                py: [ 2, 1, 2, 2, 1 ],
                pz: [ 1, 0, 0, 0, 1 ],
                nx: [ 1, 1, 1, 1, 1 ],
                ny: [ 16, 10, 17, 18, 18 ],
                nz: [ 0, 1, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 10, 5, 3, 5, 8 ],
                py: [ 14, 2, 1, 4, 1 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 23, 23, 23, 23, 23 ],
                ny: [ 18, 15, 16, 14, 17 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 2, 2, 2, 3, 2 ],
                py: [ 16, 17, 15, 20, 11 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 8, 22, 2, 1, 23 ],
                ny: [ 20, 11, 5, 0, 17 ],
                nz: [ 0, -1, -1, -1, -1 ]
            } ],
            alpha: [ -1.299972, 1.299972, -.7630804, .7630804, -.5530378, .5530378, -.5444703, .5444703, -.5207701, .5207701, -.5035143, .5035143, -.4514416, .4514416, -.4897723, .4897723, -.5006264, .5006264, -.4626049, .4626049, -.4375402, .4375402, -.3742565, .3742565, -.3873996, .3873996, -.3715484, .3715484, -.356248, .356248, -.3216189, .3216189, -.3983409, .3983409, -.3191891, .3191891, -.3242173, .3242173, -.352804, .352804, -.3562318, .3562318, -.3592398, .3592398, -.2557584, .2557584, -.2747951, .2747951, -.2747554, .2747554, -.2980481, .2980481, -.288767, .288767, -.3895318, .3895318, -.2786896, .2786896, -.2763841, .2763841, -.2704816, .2704816, -.2075489, .2075489, -.3104773, .3104773, -.2580337, .2580337, -.2448334, .2448334, -.3054279, .3054279, -.2335804, .2335804, -.2972322, .2972322, -.2270521, .2270521, -.2134621, .2134621, -.2261655, .2261655, -.2091024, .2091024, -.2478928, .2478928, -.2468972, .2468972, -.1919746, .1919746, -.2756623, .2756623, -.2629717, .2629717, -.2198653, .2198653, -.2174434, .2174434, -.2193626, .2193626, -.1956262, .1956262, -.1720459, .1720459, -.1781067, .1781067, -.1773484, .1773484, -.1793871, .1793871, -.1973396, .1973396, -.2397262, .2397262, -.2164685, .2164685, -.2214348, .2214348, -.2265941, .2265941, -.2075436, .2075436, -.224407, .224407, -.2291992, .2291992, -.2223506, .2223506, -.1639398, .1639398, -.1732374, .1732374, -.1808631, .1808631, -.1860962, .1860962, -.1781604, .1781604, -.2108322, .2108322, -.238639, .238639, -.1942083, .1942083, -.1949161, .1949161, -.1953729, .1953729, -.2317591, .2317591, -.2335136, .2335136, -.2282835, .2282835, -.2148716, .2148716, -.1588127, .1588127, -.1566765, .1566765, -.1644839, .1644839, -.2386947, .2386947, -.1704126, .1704126, -.2213945, .2213945, -.1740398, .1740398, -.2451678, .2451678, -.2120524, .2120524, -.1886646, .1886646, -.2824447, .2824447, -.1900364, .1900364, -.2179183, .2179183, -.2257696, .2257696, -.2023404, .2023404, -.1886901, .1886901, -.1850663, .1850663, -.2035414, .2035414, -.1930174, .1930174, -.1898282, .1898282, -.166664, .166664, -.1646143, .1646143, -.1543475, .1543475, -.1366289, .1366289, -.1636837, .1636837, -.2547716, .2547716, -.1281869, .1281869, -.1509159, .1509159, -.1447827, .1447827, -.1626126, .1626126, -.2387014, .2387014, -.257116, .257116, -.1719175, .1719175, -.1646742, .1646742, -.1717041, .1717041, -.2039217, .2039217, -.1796907, .1796907 ]
        }, {
            count: 153,
            threshold: -4.971032,
            feature: [ {
                size: 5,
                px: [ 14, 13, 18, 10, 16 ],
                py: [ 2, 2, 13, 3, 12 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 21, 7, 14, 23, 23 ],
                ny: [ 16, 7, 8, 3, 13 ],
                nz: [ 0, 1, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 15, 14 ],
                py: [ 9, 10, 11, 3, 3 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 9, 9, 8, 14, 3 ],
                ny: [ 9, 8, 5, 9, 5 ],
                nz: [ 0, 0, 1, 0, 2 ]
            }, {
                size: 5,
                px: [ 5, 11, 7, 6, 8 ],
                py: [ 12, 8, 12, 12, 11 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 8, 4, 3, 9, 9 ],
                ny: [ 4, 4, 4, 9, 9 ],
                nz: [ 1, 1, 1, 0, -1 ]
            }, {
                size: 5,
                px: [ 9, 8, 4, 10, 6 ],
                py: [ 2, 2, 1, 3, 13 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 1, 1, 5, 1, 1 ],
                ny: [ 2, 3, 8, 4, 16 ],
                nz: [ 0, 0, 1, 0, 0 ]
            }, {
                size: 5,
                px: [ 3, 16, 6, 17, 15 ],
                py: [ 2, 17, 4, 12, 12 ],
                pz: [ 2, 0, 1, 0, 0 ],
                nx: [ 4, 8, 15, 1, 1 ],
                ny: [ 4, 4, 8, 16, 16 ],
                nz: [ 1, 1, -1, -1, -1 ]
            }, {
                size: 4,
                px: [ 18, 15, 8, 17 ],
                py: [ 12, 23, 6, 12 ],
                pz: [ 0, 0, 1, 0 ],
                nx: [ 15, 4, 10, 5 ],
                ny: [ 21, 8, 14, 3 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 18, 17, 9, 19, 19 ],
                py: [ 3, 1, 0, 3, 3 ],
                pz: [ 0, 0, 1, 0, -1 ],
                nx: [ 22, 11, 23, 23, 23 ],
                ny: [ 0, 1, 2, 3, 4 ],
                nz: [ 0, 1, 0, 0, 0 ]
            }, {
                size: 4,
                px: [ 9, 5, 5, 10 ],
                py: [ 18, 15, 14, 18 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 10, 11, 2, 0 ],
                ny: [ 16, 7, 12, 7 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 2, 12 ],
                py: [ 4, 6 ],
                pz: [ 2, 0 ],
                nx: [ 3, 12 ],
                ny: [ 4, 19 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 3, 4, 5, 2, 2 ],
                py: [ 3, 3, 3, 1, 1 ],
                pz: [ 0, 0, 0, 1, -1 ],
                nx: [ 0, 0, 1, 0, 0 ],
                ny: [ 3, 4, 0, 1, 2 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 8, 10 ],
                py: [ 13, 12, 12, 1, 18 ],
                pz: [ 0, 0, -1, -1, -1 ],
                nx: [ 13, 8, 7, 14, 9 ],
                ny: [ 10, 10, 7, 13, 4 ],
                nz: [ 0, 1, 1, 0, 1 ]
            }, {
                size: 5,
                px: [ 15, 4, 12, 14, 12 ],
                py: [ 12, 3, 9, 10, 8 ],
                pz: [ 0, 2, 0, 0, 0 ],
                nx: [ 14, 7, 11, 2, 9 ],
                ny: [ 8, 4, 7, 5, 4 ],
                nz: [ 0, 1, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 3, 9, 7 ],
                py: [ 7, 23, 15 ],
                pz: [ 1, -1, -1 ],
                nx: [ 4, 4, 2 ],
                ny: [ 9, 7, 5 ],
                nz: [ 1, 1, 2 ]
            }, {
                size: 3,
                px: [ 5, 17, 5 ],
                py: [ 3, 23, 4 ],
                pz: [ 2, 0, 2 ],
                nx: [ 23, 2, 4 ],
                ny: [ 23, 16, 4 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 5,
                px: [ 4, 9, 9, 10, 8 ],
                py: [ 1, 0, 1, 0, 2 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 2, 5, 4, 2, 2 ],
                ny: [ 2, 19, 11, 4, 1 ],
                nz: [ 2, 0, 1, 2, 2 ]
            }, {
                size: 5,
                px: [ 8, 3, 8, 4, 7 ],
                py: [ 23, 9, 13, 8, 16 ],
                pz: [ 0, 1, 0, 1, 0 ],
                nx: [ 8, 2, 5, 3, 2 ],
                ny: [ 8, 15, 1, 1, 1 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 14, 5 ],
                pz: [ 0, -1 ],
                nx: [ 1, 9 ],
                ny: [ 3, 13 ],
                nz: [ 2, 0 ]
            }, {
                size: 5,
                px: [ 5, 8, 1, 8, 6 ],
                py: [ 12, 12, 3, 23, 12 ],
                pz: [ 0, 0, 2, 0, 0 ],
                nx: [ 1, 1, 2, 1, 1 ],
                ny: [ 22, 21, 23, 20, 20 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 14, 21, 19, 21, 20 ],
                py: [ 13, 8, 20, 10, 7 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 16, 0, 14, 23, 1 ],
                ny: [ 8, 1, 23, 10, 20 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 15, 16, 13, 14, 14 ],
                py: [ 3, 3, 3, 3, 3 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 18, 19, 18, 9, 17 ],
                ny: [ 2, 2, 1, 1, 0 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 17, 9 ],
                py: [ 14, 4 ],
                pz: [ 0, -1 ],
                nx: [ 9, 18 ],
                ny: [ 4, 18 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 21, 20 ],
                py: [ 17, 21 ],
                pz: [ 0, 0 ],
                nx: [ 12, 3 ],
                ny: [ 17, 10 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 1 ],
                py: [ 10, 4 ],
                pz: [ 1, 2 ],
                nx: [ 4, 1 ],
                ny: [ 10, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 7, 8, 4, 9, 9 ],
                py: [ 2, 2, 0, 2, 2 ],
                pz: [ 0, 0, 1, 0, -1 ],
                nx: [ 5, 5, 4, 6, 3 ],
                ny: [ 0, 1, 2, 0, 0 ],
                nz: [ 0, 0, 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 2, 5 ],
                py: [ 3, 5 ],
                pz: [ 2, -1 ],
                nx: [ 3, 2 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 0, 0 ],
                py: [ 0, 1, 3, 4, 4 ],
                pz: [ 2, 2, 1, 1, -1 ],
                nx: [ 20, 20, 19, 20, 19 ],
                ny: [ 21, 20, 23, 19, 22 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 9, 18 ],
                py: [ 8, 16 ],
                pz: [ 1, 0 ],
                nx: [ 14, 6 ],
                ny: [ 15, 16 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 3, 4, 7 ],
                py: [ 3, 3, 9 ],
                pz: [ 2, 2, 1 ],
                nx: [ 8, 9, 7 ],
                ny: [ 4, 11, 4 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 5,
                px: [ 6, 14, 4, 7, 7 ],
                py: [ 4, 23, 3, 6, 6 ],
                pz: [ 1, 0, 2, 1, -1 ],
                nx: [ 2, 0, 2, 1, 3 ],
                ny: [ 20, 4, 21, 10, 23 ],
                nz: [ 0, 2, 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 2, 4, 8, 9, 10 ],
                py: [ 3, 8, 13, 23, 23 ],
                pz: [ 2, 1, 0, 0, 0 ],
                nx: [ 10, 4, 0, 3, 3 ],
                ny: [ 21, 3, 0, 3, 23 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 11, 10, 11 ],
                py: [ 6, 5, 5 ],
                pz: [ 0, 0, 0 ],
                nx: [ 14, 6, 1 ],
                ny: [ 7, 9, 5 ],
                nz: [ 0, 1, -1 ]
            }, {
                size: 5,
                px: [ 11, 11, 11, 11, 6 ],
                py: [ 11, 12, 10, 13, 6 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 9, 13, 13, 13, 4 ],
                ny: [ 4, 9, 10, 11, 2 ],
                nz: [ 1, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 3, 11 ],
                ny: [ 4, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 1, 2 ],
                py: [ 4, 11 ],
                pz: [ 2, 0 ],
                nx: [ 8, 8 ],
                ny: [ 15, 15 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 12, 12, 13, 12, 12 ],
                py: [ 10, 11, 13, 12, 12 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 0, 0, 0, 1, 0 ],
                ny: [ 13, 2, 12, 5, 14 ],
                nz: [ 0, 2, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 1, 1 ],
                py: [ 4, 3, 11, 15, 13 ],
                pz: [ 1, 2, 0, 0, 0 ],
                nx: [ 2, 3, 3, 1, 0 ],
                ny: [ 2, 4, 4, 5, 14 ],
                nz: [ 2, 1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 4, 11 ],
                py: [ 12, 10 ],
                pz: [ 0, -1 ],
                nx: [ 1, 2 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 18, 8, 9, 9, 9 ],
                py: [ 15, 7, 8, 10, 7 ],
                pz: [ 0, 1, 1, 1, 1 ],
                nx: [ 22, 23, 21, 22, 11 ],
                ny: [ 20, 16, 23, 19, 9 ],
                nz: [ 0, 0, 0, 0, 1 ]
            }, {
                size: 5,
                px: [ 14, 12, 13, 14, 15 ],
                py: [ 1, 0, 0, 0, 1 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 4, 9, 4, 7, 7 ],
                ny: [ 2, 3, 1, 8, 8 ],
                nz: [ 2, 1, 2, 1, -1 ]
            }, {
                size: 2,
                px: [ 13, 9 ],
                py: [ 14, 19 ],
                pz: [ 0, -1 ],
                nx: [ 6, 10 ],
                ny: [ 0, 2 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 13, 12 ],
                py: [ 4, 4 ],
                pz: [ 0, 0 ],
                nx: [ 3, 3 ],
                ny: [ 1, 1 ],
                nz: [ 2, -1 ]
            }, {
                size: 3,
                px: [ 14, 5, 5 ],
                py: [ 18, 3, 4 ],
                pz: [ 0, -1, -1 ],
                nx: [ 8, 7, 8 ],
                ny: [ 4, 8, 10 ],
                nz: [ 1, 1, 1 ]
            }, {
                size: 2,
                px: [ 8, 18 ],
                py: [ 6, 11 ],
                pz: [ 1, 0 ],
                nx: [ 9, 1 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 16, 11 ],
                py: [ 9, 7 ],
                pz: [ 0, 0 ],
                nx: [ 7, 7 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 23, 11, 23, 11, 23 ],
                py: [ 13, 4, 12, 7, 10 ],
                pz: [ 0, 1, 0, 1, 0 ],
                nx: [ 7, 4, 8, 15, 15 ],
                ny: [ 9, 2, 4, 8, 8 ],
                nz: [ 0, 2, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 1, 0 ],
                pz: [ 0, 1 ],
                nx: [ 4, 1 ],
                ny: [ 1, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 5 ],
                py: [ 7, 6 ],
                pz: [ 0, 1 ],
                nx: [ 6, 4 ],
                ny: [ 9, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 5, 6, 5, 5 ],
                py: [ 8, 6, 11, 6 ],
                pz: [ 1, 1, 1, 0 ],
                nx: [ 23, 0, 4, 5 ],
                ny: [ 0, 2, 2, 1 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 18, 4 ],
                py: [ 13, 3 ],
                pz: [ 0, -1 ],
                nx: [ 15, 4 ],
                ny: [ 11, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 4, 0 ],
                py: [ 8, 0 ],
                pz: [ 1, -1 ],
                nx: [ 9, 2 ],
                ny: [ 15, 5 ],
                nz: [ 0, 2 ]
            }, {
                size: 5,
                px: [ 15, 15, 16, 14, 14 ],
                py: [ 0, 1, 1, 0, 0 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 4, 4, 8, 8, 15 ],
                ny: [ 4, 5, 4, 11, 23 ],
                nz: [ 2, 2, 1, 1, 0 ]
            }, {
                size: 4,
                px: [ 12, 11, 3, 14 ],
                py: [ 14, 22, 1, 0 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 8, 15, 7, 16 ],
                ny: [ 2, 3, 1, 3 ],
                nz: [ 1, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 5, 12 ],
                py: [ 6, 17 ],
                pz: [ 1, -1 ],
                nx: [ 2, 1 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 13, 12, 12, 7, 7 ],
                py: [ 5, 6, 5, 14, 14 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 10, 3, 10, 1, 10 ],
                ny: [ 13, 8, 11, 3, 10 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 4, 4 ],
                py: [ 15, 0 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 16, 17 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 1, 4, 2, 1, 2 ],
                py: [ 4, 0, 1, 1, 0 ],
                pz: [ 1, 1, 1, 2, 1 ],
                nx: [ 4, 9, 1, 5, 1 ],
                ny: [ 3, 4, 4, 5, 5 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 10, 3 ],
                py: [ 3, 1 ],
                pz: [ 0, 2 ],
                nx: [ 8, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 16, 0 ],
                py: [ 21, 0 ],
                pz: [ 0, -1 ],
                nx: [ 6, 8 ],
                ny: [ 8, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 7, 11 ],
                py: [ 4, 18 ],
                pz: [ 0, -1 ],
                nx: [ 5, 7 ],
                ny: [ 0, 2 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 9, 7 ],
                py: [ 0, 3 ],
                pz: [ 1, -1 ],
                nx: [ 20, 10 ],
                ny: [ 0, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 4,
                px: [ 10, 4, 1, 5 ],
                py: [ 0, 6, 8, 4 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 6, 15, 4, 14 ],
                ny: [ 3, 5, 1, 5 ],
                nz: [ 1, 0, 2, 0 ]
            }, {
                size: 2,
                px: [ 4, 4 ],
                py: [ 3, 4 ],
                pz: [ 2, 2 ],
                nx: [ 9, 2 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 3, 4 ],
                pz: [ 0, -1 ],
                nx: [ 8, 6 ],
                ny: [ 2, 1 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 0 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 0, 7 ],
                ny: [ 7, 8 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 0 ],
                py: [ 7, 3 ],
                pz: [ 1, -1 ],
                nx: [ 15, 4 ],
                ny: [ 14, 4 ],
                nz: [ 0, 2 ]
            }, {
                size: 4,
                px: [ 3, 1, 2, 2 ],
                py: [ 20, 7, 18, 17 ],
                pz: [ 0, 1, 0, 0 ],
                nx: [ 9, 5, 5, 4 ],
                ny: [ 5, 4, 18, 4 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 5, 4 ],
                py: [ 3, 1 ],
                pz: [ 2, -1 ],
                nx: [ 23, 23 ],
                ny: [ 14, 13 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 4 ],
                py: [ 6, 1 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 22, 22, 11, 11, 11 ],
                py: [ 12, 13, 4, 6, 6 ],
                pz: [ 0, 0, 1, 1, -1 ],
                nx: [ 4, 4, 4, 4, 3 ],
                ny: [ 16, 15, 18, 14, 11 ],
                nz: [ 0, 0, 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 4, 10 ],
                py: [ 0, 1 ],
                pz: [ 1, 0 ],
                nx: [ 2, 2 ],
                ny: [ 2, 2 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 15, 6 ],
                py: [ 4, 4 ],
                pz: [ 0, -1 ],
                nx: [ 15, 4 ],
                ny: [ 2, 1 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 11, 2 ],
                py: [ 10, 20 ],
                pz: [ 0, -1 ],
                nx: [ 4, 9 ],
                ny: [ 1, 2 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 4, 19 ],
                py: [ 3, 8 ],
                pz: [ 2, 0 ],
                nx: [ 8, 21 ],
                ny: [ 4, 20 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 4, 6, 7, 6, 2 ],
                py: [ 6, 15, 13, 14, 3 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 21, 22, 19, 21, 10 ],
                ny: [ 6, 12, 0, 3, 2 ],
                nz: [ 0, 0, 0, 0, 1 ]
            }, {
                size: 5,
                px: [ 8, 12, 15, 14, 13 ],
                py: [ 0, 0, 0, 0, 0 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 4, 3, 1, 3, 4 ],
                ny: [ 19, 16, 3, 15, 4 ],
                nz: [ 0, 0, 2, 0, 1 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 2, 3 ],
                pz: [ 2, 2 ],
                nx: [ 8, 4 ],
                ny: [ 4, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 0, 0, 0, 5 ],
                py: [ 10, 9, 11, 21 ],
                pz: [ 1, 1, -1, -1 ],
                nx: [ 12, 4, 3, 11 ],
                ny: [ 3, 1, 1, 3 ],
                nz: [ 0, 2, 2, 0 ]
            }, {
                size: 2,
                px: [ 3, 1 ],
                py: [ 0, 0 ],
                pz: [ 1, 2 ],
                nx: [ 1, 4 ],
                ny: [ 2, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 2, 5, 1, 0, 1 ],
                py: [ 14, 23, 7, 5, 9 ],
                pz: [ 0, 0, 1, 1, 1 ],
                nx: [ 0, 0, 7, 9, 11 ],
                ny: [ 23, 22, 4, 9, 3 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 8, 9 ],
                py: [ 7, 1 ],
                pz: [ 1, -1 ],
                nx: [ 8, 8 ],
                ny: [ 8, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 11, 9 ],
                py: [ 11, 3 ],
                pz: [ 1, -1 ],
                nx: [ 3, 2 ],
                ny: [ 14, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 4,
                px: [ 2, 4, 5, 4 ],
                py: [ 8, 20, 22, 16 ],
                pz: [ 1, 0, 0, 0 ],
                nx: [ 8, 2, 11, 3 ],
                ny: [ 7, 4, 15, 4 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 1, 2, 3 ],
                py: [ 2, 1, 0 ],
                pz: [ 0, 0, 0 ],
                nx: [ 0, 0, 15 ],
                ny: [ 1, 0, 11 ],
                nz: [ 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 12, 22 ],
                py: [ 6, 7 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 3,
                px: [ 13, 0, 5 ],
                py: [ 19, 10, 2 ],
                pz: [ 0, -1, -1 ],
                nx: [ 3, 4, 6 ],
                ny: [ 5, 5, 9 ],
                nz: [ 2, 2, 1 ]
            }, {
                size: 2,
                px: [ 8, 15 ],
                py: [ 8, 22 ],
                pz: [ 1, 0 ],
                nx: [ 7, 4 ],
                ny: [ 10, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 7, 6 ],
                pz: [ 1, 1 ],
                nx: [ 10, 1 ],
                ny: [ 9, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 11 ],
                py: [ 4, 3 ],
                pz: [ 0, -1 ],
                nx: [ 5, 9 ],
                ny: [ 0, 1 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 14, 13, 14, 12, 15 ],
                py: [ 1, 2, 2, 2, 2 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 4, 8, 4, 7, 4 ],
                ny: [ 2, 4, 3, 4, 4 ],
                nz: [ 2, 1, 2, 1, -1 ]
            }, {
                size: 3,
                px: [ 13, 8, 2 ],
                py: [ 14, 5, 8 ],
                pz: [ 0, -1, -1 ],
                nx: [ 6, 8, 9 ],
                ny: [ 3, 2, 2 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 3,
                px: [ 3, 6, 8 ],
                py: [ 7, 4, 12 ],
                pz: [ 1, 1, 0 ],
                nx: [ 3, 8, 9 ],
                ny: [ 5, 2, 2 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 13, 4 ],
                py: [ 16, 3 ],
                pz: [ 0, 2 ],
                nx: [ 13, 7 ],
                ny: [ 15, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 0 ],
                py: [ 7, 9 ],
                pz: [ 1, -1 ],
                nx: [ 2, 8 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 3, 6, 8, 7, 7 ],
                py: [ 0, 1, 0, 0, 0 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 7, 9, 4, 3, 4 ],
                ny: [ 9, 7, 4, 2, 2 ],
                nz: [ 1, 1, 1, 2, 2 ]
            }, {
                size: 3,
                px: [ 3, 4, 16 ],
                py: [ 4, 4, 6 ],
                pz: [ 1, 2, 0 ],
                nx: [ 2, 2, 2 ],
                ny: [ 0, 0, 1 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 1, 0 ],
                pz: [ 2, 2 ],
                nx: [ 5, 5 ],
                ny: [ 2, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 3 ],
                py: [ 7, 20 ],
                pz: [ 1, -1 ],
                nx: [ 4, 8 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 8, 21 ],
                py: [ 10, 18 ],
                pz: [ 0, -1 ],
                nx: [ 9, 4 ],
                ny: [ 10, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 6, 13 ],
                py: [ 6, 23 ],
                pz: [ 1, -1 ],
                nx: [ 10, 10 ],
                ny: [ 11, 12 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 10, 9, 5, 10, 10 ],
                py: [ 9, 13, 6, 10, 10 ],
                pz: [ 0, 0, 1, 0, -1 ],
                nx: [ 21, 21, 21, 10, 21 ],
                ny: [ 18, 20, 19, 11, 17 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 8, 8 ],
                py: [ 7, 6 ],
                pz: [ 1, 1 ],
                nx: [ 8, 1 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 4 ],
                py: [ 14, 7 ],
                pz: [ 0, -1 ],
                nx: [ 13, 13 ],
                ny: [ 13, 11 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 4 ],
                py: [ 4, 5 ],
                pz: [ 2, 2 ],
                nx: [ 12, 5 ],
                ny: [ 16, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 1, 3, 20 ],
                py: [ 3, 9, 2 ],
                pz: [ 2, -1, -1 ],
                nx: [ 0, 0, 0 ],
                ny: [ 7, 4, 13 ],
                nz: [ 1, 2, 0 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 4, 2 ],
                pz: [ 1, 2 ],
                nx: [ 1, 0 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 8, 9, 11 ],
                py: [ 2, 1, 2 ],
                pz: [ 0, 0, 0 ],
                nx: [ 2, 2, 0 ],
                ny: [ 2, 2, 13 ],
                nz: [ 2, -1, -1 ]
            }, {
                size: 2,
                px: [ 1, 10 ],
                py: [ 23, 5 ],
                pz: [ 0, -1 ],
                nx: [ 3, 6 ],
                ny: [ 1, 1 ],
                nz: [ 2, 1 ]
            }, {
                size: 4,
                px: [ 13, 6, 3, 4 ],
                py: [ 8, 6, 4, 2 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 1, 1, 1, 4 ],
                ny: [ 9, 7, 8, 20 ],
                nz: [ 1, 1, 1, 0 ]
            }, {
                size: 5,
                px: [ 11, 4, 4, 10, 3 ],
                py: [ 9, 16, 13, 12, 7 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 7, 11, 3, 17, 4 ],
                ny: [ 8, 11, 9, 0, 4 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 6, 6 ],
                py: [ 6, 8 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 1, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 7, 2 ],
                pz: [ 0, -1 ],
                nx: [ 4, 13 ],
                ny: [ 5, 9 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 8, 2 ],
                pz: [ 1, -1 ],
                nx: [ 16, 4 ],
                ny: [ 14, 5 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 16, 15 ],
                pz: [ 0, 0 ],
                nx: [ 1, 20 ],
                ny: [ 23, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 3 ],
                py: [ 4, 7 ],
                pz: [ 2, 1 ],
                nx: [ 2, 3 ],
                ny: [ 5, 4 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 19, 8 ],
                py: [ 5, 4 ],
                pz: [ 0, -1 ],
                nx: [ 10, 10 ],
                ny: [ 1, 3 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 21, 21 ],
                py: [ 18, 16 ],
                pz: [ 0, 0 ],
                nx: [ 10, 3 ],
                ny: [ 17, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 2 ],
                py: [ 23, 4 ],
                pz: [ 0, 2 ],
                nx: [ 5, 11 ],
                ny: [ 3, 7 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 7, 0 ],
                py: [ 3, 2 ],
                pz: [ 0, -1 ],
                nx: [ 3, 6 ],
                ny: [ 1, 1 ],
                nz: [ 1, 0 ]
            }, {
                size: 4,
                px: [ 5, 9, 8, 9 ],
                py: [ 8, 12, 13, 18 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 6, 5, 2, 5 ],
                ny: [ 8, 4, 7, 11 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 7, 2 ],
                py: [ 0, 0 ],
                pz: [ 0, 2 ],
                nx: [ 5, 5 ],
                ny: [ 3, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 12, 13 ],
                pz: [ 0, 0 ],
                nx: [ 9, 1 ],
                ny: [ 14, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 8, 16, 9, 4, 15 ],
                py: [ 11, 13, 8, 4, 12 ],
                pz: [ 1, 0, 1, 2, 0 ],
                nx: [ 3, 3, 3, 3, 4 ],
                ny: [ 4, 2, 1, 3, 0 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 9, 5 ],
                py: [ 7, 6 ],
                pz: [ 1, -1 ],
                nx: [ 19, 8 ],
                ny: [ 17, 11 ],
                nz: [ 0, 1 ]
            }, {
                size: 5,
                px: [ 14, 15, 12, 13, 13 ],
                py: [ 2, 2, 2, 2, 2 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 20, 9, 19, 20, 4 ],
                ny: [ 14, 2, 5, 15, 1 ],
                nz: [ 0, 1, 0, 0, 2 ]
            }, {
                size: 2,
                px: [ 18, 8 ],
                py: [ 20, 7 ],
                pz: [ 0, 1 ],
                nx: [ 4, 9 ],
                ny: [ 2, 2 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 11, 5 ],
                pz: [ 1, 2 ],
                nx: [ 13, 19 ],
                ny: [ 20, 20 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 12, 11, 3 ],
                py: [ 20, 20, 5 ],
                pz: [ 0, 0, -1 ],
                nx: [ 11, 12, 6 ],
                ny: [ 21, 21, 10 ],
                nz: [ 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 7, 14 ],
                pz: [ 1, 0 ],
                nx: [ 3, 13 ],
                ny: [ 4, 8 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 5, 9 ],
                pz: [ 2, 1 ],
                nx: [ 2, 11 ],
                ny: [ 8, 6 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 5, 5 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 6, 3 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 11, 23 ],
                py: [ 5, 9 ],
                pz: [ 1, 0 ],
                nx: [ 8, 2 ],
                ny: [ 11, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 23 ],
                py: [ 12, 9 ],
                pz: [ 0, -1 ],
                nx: [ 11, 22 ],
                ny: [ 10, 21 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 12, 12 ],
                py: [ 7, 7 ],
                pz: [ 0, -1 ],
                nx: [ 5, 4 ],
                ny: [ 7, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 9, 8 ],
                py: [ 18, 1 ],
                pz: [ 0, -1 ],
                nx: [ 5, 4 ],
                ny: [ 8, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 16, 17 ],
                py: [ 11, 11 ],
                pz: [ 0, 0 ],
                nx: [ 15, 2 ],
                ny: [ 9, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 0, 1 ],
                py: [ 3, 0 ],
                pz: [ 2, -1 ],
                nx: [ 9, 10 ],
                ny: [ 6, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 13, 13 ],
                py: [ 20, 21 ],
                pz: [ 0, -1 ],
                nx: [ 2, 2 ],
                ny: [ 6, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 20, 20, 4, 18, 19 ],
                py: [ 17, 16, 5, 22, 20 ],
                pz: [ 0, 0, 2, 0, 0 ],
                nx: [ 8, 11, 5, 6, 2 ],
                ny: [ 10, 15, 11, 10, 1 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 4, 4 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 3,
                px: [ 6, 5, 6 ],
                py: [ 8, 10, 10 ],
                pz: [ 1, 1, 1 ],
                nx: [ 11, 8, 22 ],
                ny: [ 19, 2, 15 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 3,
                px: [ 5, 2, 13 ],
                py: [ 7, 10, 10 ],
                pz: [ 1, -1, -1 ],
                nx: [ 11, 11, 23 ],
                ny: [ 8, 9, 14 ],
                nz: [ 1, 1, 0 ]
            }, {
                size: 5,
                px: [ 3, 6, 1, 5, 10 ],
                py: [ 7, 14, 1, 9, 2 ],
                pz: [ 1, -1, -1, -1, -1 ],
                nx: [ 11, 0, 1, 5, 1 ],
                ny: [ 14, 12, 18, 5, 19 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 3,
                px: [ 21, 21, 10 ],
                py: [ 16, 17, 10 ],
                pz: [ 0, 0, 1 ],
                nx: [ 5, 5, 1 ],
                ny: [ 9, 9, 18 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 6, 21 ],
                py: [ 6, 17 ],
                pz: [ 1, -1 ],
                nx: [ 20, 10 ],
                ny: [ 7, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 10, 11 ],
                py: [ 0, 0 ],
                pz: [ 1, -1 ],
                nx: [ 6, 13 ],
                ny: [ 2, 4 ],
                nz: [ 1, 0 ]
            }, {
                size: 4,
                px: [ 4, 4, 7, 9 ],
                py: [ 3, 4, 10, 3 ],
                pz: [ 2, 2, 1, 1 ],
                nx: [ 21, 2, 15, 5 ],
                ny: [ 0, 0, 0, 2 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 11, 11, 11 ],
                py: [ 7, 6, 9 ],
                pz: [ 1, 1, 1 ],
                nx: [ 23, 4, 9 ],
                ny: [ 23, 5, 6 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 14, 15 ],
                py: [ 1, 1 ],
                pz: [ 0, 0 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 11, 23, 11, 23, 23 ],
                py: [ 11, 22, 10, 21, 20 ],
                pz: [ 1, 0, 1, 0, 0 ],
                nx: [ 10, 9, 19, 10, 10 ],
                ny: [ 10, 11, 20, 9, 9 ],
                nz: [ 1, 1, 0, 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 23 ],
                py: [ 13, 22 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 12, 1 ],
                py: [ 19, 0 ],
                pz: [ 0, -1 ],
                nx: [ 11, 12 ],
                ny: [ 22, 17 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 10, 8 ],
                py: [ 4, 3 ],
                pz: [ 1, -1 ],
                nx: [ 5, 23 ],
                ny: [ 2, 7 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 9, 10 ],
                py: [ 6, 20 ],
                pz: [ 1, -1 ],
                nx: [ 8, 8 ],
                ny: [ 4, 6 ],
                nz: [ 1, 1 ]
            } ],
            alpha: [ -1.135386, 1.135386, -.90908, .90908, -.591378, .591378, -.5556534, .5556534, -.508415, .508415, -.4464489, .4464489, -.4463241, .4463241, -.4985226, .4985226, -.4424638, .4424638, -.4300093, .4300093, -.4231341, .4231341, -.4087428, .4087428, -.337448, .337448, -.3230151, .3230151, -.3084427, .3084427, -.3235494, .3235494, -.2589281, .2589281, -.2970292, .2970292, -.2957065, .2957065, -.3997619, .3997619, -.3535901, .3535901, -.2725396, .2725396, -.2649725, .2649725, -.3103888, .3103888, -.3117775, .3117775, -.258962, .258962, -.2689202, .2689202, -.2127024, .2127024, -.2436322, .2436322, -.3120574, .3120574, -.278601, .278601, -.2649072, .2649072, -.2766509, .2766509, -.2367237, .2367237, -.2658049, .2658049, -.2103463, .2103463, -.1911522, .1911522, -.2535425, .2535425, -.2434696, .2434696, -.2180788, .2180788, -.2496873, .2496873, -.2700969, .2700969, -.2565479, .2565479, -.2737741, .2737741, -.1675507, .1675507, -.2551417, .2551417, -.2067648, .2067648, -.1636834, .1636834, -.2129306, .2129306, -.1656758, .1656758, -.1919369, .1919369, -.2031763, .2031763, -.2062327, .2062327, -.257795, .257795, -.2951823, .2951823, -.202316, .202316, -.2022234, .2022234, -.2132906, .2132906, -.1653278, .1653278, -.1648474, .1648474, -.1593352, .1593352, -.173565, .173565, -.1688778, .1688778, -.1519705, .1519705, -.1812202, .1812202, -.1967481, .1967481, -.1852954, .1852954, -.231778, .231778, -.2036251, .2036251, -.1609324, .1609324, -.2160205, .2160205, -.202619, .202619, -.1854761, .1854761, -.1832038, .1832038, -.2001141, .2001141, -.1418333, .1418333, -.1704773, .1704773, -.1586261, .1586261, -.1587582, .1587582, -.1899489, .1899489, -.147716, .147716, -.2260467, .2260467, -.2393598, .2393598, -.1582373, .1582373, -.1702498, .1702498, -.1737398, .1737398, -.1462529, .1462529, -.1396517, .1396517, -.1629625, .1629625, -.1446933, .1446933, -.1811657, .1811657, -.1336427, .1336427, -.1924813, .1924813, -.145752, .145752, -.1600259, .1600259, -.1297, .1297, -.2076199, .2076199, -.151006, .151006, -.1914568, .1914568, -.2138162, .2138162, -.1856916, .1856916, -.1843047, .1843047, -.1526846, .1526846, -.132832, .132832, -.1751311, .1751311, -.1643908, .1643908, -.1482706, .1482706, -.1622298, .1622298, -.1884979, .1884979, -.1633604, .1633604, -.1554166, .1554166, -.1405332, .1405332, -.1772398, .1772398, -.1410008, .1410008, -.1362301, .1362301, -.1709087, .1709087, -.1584613, .1584613, -.1188814, .1188814, -.1423888, .1423888, -.1345565, .1345565, -.1835986, .1835986, -.1445329, .1445329, -.1385826, .1385826, -.1558917, .1558917, -.1476053, .1476053, -.1370722, .1370722, -.2362666, .2362666, -.2907774, .2907774, -.165636, .165636, -.1644407, .1644407, -.1443394, .1443394, -.1438823, .1438823, -.1476964, .1476964, -.1956593, .1956593, -.2417519, .2417519, -.1659315, .1659315, -.1466254, .1466254, -.2034909, .2034909, -.2128771, .2128771, -.1665429, .1665429, -.1387131, .1387131, -.1298823, .1298823, -.1329495, .1329495, -.1769587, .1769587, -.136653, .136653, -.1254359, .1254359, -.1673022, .1673022, -.1602519, .1602519, -.1897245, .1897245, -.1893579, .1893579, -.157935, .157935, -.1472589, .1472589, -.1614193, .1614193 ]
        }, {
            count: 203,
            threshold: -4.769677,
            feature: [ {
                size: 5,
                px: [ 12, 5, 14, 9, 7 ],
                py: [ 9, 13, 3, 1, 3 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 1, 0, 5, 14, 9 ],
                ny: [ 5, 3, 8, 8, 9 ],
                nz: [ 2, 0, 1, 0, 0 ]
            }, {
                size: 5,
                px: [ 14, 13, 11, 17, 12 ],
                py: [ 2, 2, 4, 13, 3 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 7, 22, 8, 23, 22 ],
                ny: [ 8, 15, 11, 12, 3 ],
                nz: [ 1, 0, 1, 0, 0 ]
            }, {
                size: 5,
                px: [ 9, 11, 11, 11, 16 ],
                py: [ 4, 8, 7, 9, 12 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 4, 8, 14, 9, 9 ],
                ny: [ 4, 4, 8, 8, 8 ],
                nz: [ 1, 1, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 6, 12, 12, 8, 3 ],
                py: [ 11, 7, 8, 10, 2 ],
                pz: [ 0, 0, 0, 0, 2 ],
                nx: [ 8, 4, 4, 4, 0 ],
                ny: [ 4, 4, 4, 11, 0 ],
                nz: [ 1, 1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 19, 17, 18, 9, 9 ],
                py: [ 3, 2, 3, 1, 1 ],
                pz: [ 0, 0, 0, 1, -1 ],
                nx: [ 21, 21, 10, 22, 22 ],
                ny: [ 1, 2, 0, 4, 3 ],
                nz: [ 0, 0, 1, 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 7 ],
                py: [ 4, 6 ],
                pz: [ 2, 1 ],
                nx: [ 8, 7 ],
                ny: [ 4, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 14, 17, 17, 13, 12 ],
                py: [ 18, 15, 16, 18, 18 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 13, 19, 5, 20, 6 ],
                ny: [ 16, 4, 1, 19, 0 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 6, 7, 4, 5, 5 ],
                py: [ 15, 23, 6, 12, 16 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 3, 14, 14, 6, 6 ],
                ny: [ 4, 11, 11, 9, 0 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 16, 9, 6, 3, 11 ],
                py: [ 2, 2, 5, 3, 2 ],
                pz: [ 0, 0, 1, 2, 0 ],
                nx: [ 3, 4, 2, 5, 5 ],
                ny: [ 4, 11, 2, 8, 8 ],
                nz: [ 1, 1, 2, 1, -1 ]
            }, {
                size: 5,
                px: [ 6, 1, 5, 3, 3 ],
                py: [ 14, 4, 15, 7, 7 ],
                pz: [ 0, 2, 0, 1, -1 ],
                nx: [ 0, 0, 1, 1, 1 ],
                ny: [ 7, 8, 18, 17, 5 ],
                nz: [ 1, 1, 0, 0, 2 ]
            }, {
                size: 5,
                px: [ 12, 12, 9, 5, 3 ],
                py: [ 14, 14, 0, 3, 7 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 7, 7, 14, 8, 13 ],
                ny: [ 7, 8, 13, 10, 10 ],
                nz: [ 1, 1, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 3, 4 ],
                py: [ 7, 9 ],
                pz: [ 1, -1 ],
                nx: [ 2, 4 ],
                ny: [ 5, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 3,
                px: [ 10, 21, 17 ],
                py: [ 7, 11, 23 ],
                pz: [ 1, 0, 0 ],
                nx: [ 21, 9, 3 ],
                ny: [ 23, 5, 5 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 5,
                px: [ 8, 11, 9, 10, 11 ],
                py: [ 2, 0, 1, 1, 2 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 4, 5, 6, 4, 3 ],
                ny: [ 8, 4, 18, 7, 4 ],
                nz: [ 1, 1, 0, 1, -1 ]
            }, {
                size: 5,
                px: [ 20, 22, 3, 19, 10 ],
                py: [ 20, 9, 4, 22, 3 ],
                pz: [ 0, 0, 2, 0, 1 ],
                nx: [ 8, 20, 8, 3, 2 ],
                ny: [ 4, 3, 6, 4, 3 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 4, 4 ],
                py: [ 8, 7 ],
                pz: [ 1, 1 ],
                nx: [ 9, 2 ],
                ny: [ 15, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 13 ],
                py: [ 13, 4 ],
                pz: [ 0, -1 ],
                nx: [ 20, 21 ],
                ny: [ 1, 4 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 1, 2, 7, 6, 8 ],
                py: [ 0, 2, 3, 3, 3 ],
                pz: [ 2, 1, 0, 0, 0 ],
                nx: [ 1, 2, 1, 1, 1 ],
                ny: [ 0, 0, 4, 3, 3 ],
                nz: [ 1, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 10 ],
                py: [ 9, 11 ],
                pz: [ 0, 0 ],
                nx: [ 6, 3 ],
                ny: [ 9, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 12, 6 ],
                py: [ 10, 11, 13, 12, 6 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 10, 2, 1, 10, 10 ],
                ny: [ 10, 4, 2, 11, 9 ],
                nz: [ 0, 1, 2, 0, 0 ]
            }, {
                size: 5,
                px: [ 16, 18, 11, 17, 15 ],
                py: [ 11, 12, 8, 12, 11 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 14, 0, 19, 0, 10 ],
                ny: [ 9, 3, 14, 8, 9 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 4,
                px: [ 5, 9, 5, 8 ],
                py: [ 21, 18, 20, 23 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 8, 4, 3, 1 ],
                ny: [ 20, 3, 4, 3 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 2, 3 ],
                py: [ 3, 2 ],
                pz: [ 2, 2 ],
                nx: [ 3, 12 ],
                ny: [ 4, 23 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 0, 1, 1, 1, 1 ],
                py: [ 2, 16, 14, 13, 12 ],
                pz: [ 2, 0, 0, 0, 0 ],
                nx: [ 8, 4, 9, 4, 7 ],
                ny: [ 9, 3, 4, 2, 9 ],
                nz: [ 1, 2, 1, 2, 1 ]
            }, {
                size: 2,
                px: [ 4, 9 ],
                py: [ 3, 7 ],
                pz: [ 2, -1 ],
                nx: [ 4, 9 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 15, 16, 17, 15, 8 ],
                py: [ 3, 3, 3, 18, 1 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 1, 2, 2, 1, 3 ],
                ny: [ 5, 3, 2, 6, 0 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 17 ],
                py: [ 4, 14 ],
                pz: [ 2, 0 ],
                nx: [ 15, 7 ],
                ny: [ 15, 10 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 14, 12, 3 ],
                py: [ 3, 13, 3 ],
                pz: [ 0, -1, -1 ],
                nx: [ 4, 17, 4 ],
                ny: [ 3, 19, 4 ],
                nz: [ 2, 0, 2 ]
            }, {
                size: 4,
                px: [ 4, 5, 12, 2 ],
                py: [ 9, 6, 19, 4 ],
                pz: [ 1, 1, 0, 2 ],
                nx: [ 12, 17, 4, 4 ],
                ny: [ 18, 19, 4, 4 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 10, 19, 20, 20, 19 ],
                py: [ 7, 14, 13, 14, 13 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 11, 23, 23, 23, 23 ],
                ny: [ 9, 15, 13, 16, 14 ],
                nz: [ 1, 0, 0, 0, 0 ]
            }, {
                size: 4,
                px: [ 0, 0, 0, 2 ],
                py: [ 5, 6, 5, 14 ],
                pz: [ 1, 1, 2, 0 ],
                nx: [ 0, 3, 3, 17 ],
                ny: [ 23, 5, 5, 9 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 15, 4 ],
                py: [ 23, 5 ],
                pz: [ 0, 2 ],
                nx: [ 9, 3 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 6, 5, 10, 12 ],
                py: [ 3, 3, 23, 23 ],
                pz: [ 1, 1, 0, 0 ],
                nx: [ 11, 1, 1, 4 ],
                ny: [ 21, 3, 5, 5 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 5, 2 ],
                py: [ 9, 4 ],
                pz: [ 1, 2 ],
                nx: [ 4, 9 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 23, 23, 23, 23, 23 ],
                py: [ 14, 9, 13, 11, 12 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 6, 13, 7, 8, 8 ],
                ny: [ 9, 6, 3, 3, 3 ],
                nz: [ 1, 0, 1, 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 3 ],
                py: [ 4, 5 ],
                pz: [ 0, -1 ],
                nx: [ 3, 8 ],
                ny: [ 1, 3 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 3, 12 ],
                py: [ 4, 18 ],
                pz: [ 2, 0 ],
                nx: [ 12, 0 ],
                ny: [ 16, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 16, 2 ],
                py: [ 4, 4 ],
                pz: [ 0, -1 ],
                nx: [ 16, 4 ],
                ny: [ 1, 0 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 3, 4 ],
                py: [ 7, 1 ],
                pz: [ 1, -1 ],
                nx: [ 5, 3 ],
                ny: [ 19, 9 ],
                nz: [ 0, 1 ]
            }, {
                size: 4,
                px: [ 20, 19, 20, 21 ],
                py: [ 2, 0, 1, 3 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 11, 5, 23, 11 ],
                ny: [ 0, 0, 1, 1 ],
                nz: [ 1, 2, 0, 1 ]
            }, {
                size: 2,
                px: [ 12, 13 ],
                py: [ 7, 5 ],
                pz: [ 0, 0 ],
                nx: [ 8, 5 ],
                ny: [ 3, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 22, 21, 22, 22, 22 ],
                py: [ 20, 22, 18, 19, 16 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 2, 3, 3, 15, 15 ],
                ny: [ 4, 5, 4, 7, 7 ],
                nz: [ 1, 2, 1, 0, -1 ]
            }, {
                size: 3,
                px: [ 15, 14, 14 ],
                py: [ 1, 1, 1 ],
                pz: [ 0, 0, -1 ],
                nx: [ 17, 18, 16 ],
                ny: [ 1, 2, 1 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 4,
                px: [ 17, 16, 16, 15 ],
                py: [ 2, 1, 0, 0 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 7, 4, 2, 11 ],
                ny: [ 11, 2, 1, 4 ],
                nz: [ 1, 2, -1, -1 ]
            }, {
                size: 4,
                px: [ 18, 0, 0, 0 ],
                py: [ 14, 6, 5, 4 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 19, 19, 19, 19 ],
                ny: [ 16, 19, 17, 18 ],
                nz: [ 0, 0, 0, 0 ]
            }, {
                size: 4,
                px: [ 11, 5, 5, 0 ],
                py: [ 14, 1, 4, 4 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 11, 8, 2, 15 ],
                ny: [ 17, 14, 1, 9 ],
                nz: [ 0, 0, 2, 0 ]
            }, {
                size: 2,
                px: [ 4, 5 ],
                py: [ 19, 21 ],
                pz: [ 0, 0 ],
                nx: [ 10, 2 ],
                ny: [ 15, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 4 ],
                py: [ 4, 6 ],
                pz: [ 1, 1 ],
                nx: [ 3, 3 ],
                ny: [ 4, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 2, 7 ],
                py: [ 1, 13 ],
                pz: [ 2, 0 ],
                nx: [ 7, 2 ],
                ny: [ 1, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 15, 10, 4, 7 ],
                py: [ 23, 3, 1, 7 ],
                pz: [ 0, 1, 2, 1 ],
                nx: [ 0, 4, 1, 1 ],
                ny: [ 0, 2, 0, -1900147915 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 7, 2 ],
                py: [ 12, 11 ],
                pz: [ 0, -1 ],
                nx: [ 2, 4 ],
                ny: [ 2, 5 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 1, 0 ],
                py: [ 9, 4, 3, 2, 6 ],
                pz: [ 0, 1, 2, 1, 1 ],
                nx: [ 9, 4, 2, 16, 16 ],
                ny: [ 7, 4, 2, 8, 8 ],
                nz: [ 0, 1, 2, 0, -1 ]
            }, {
                size: 5,
                px: [ 18, 4, 9, 4, 4 ],
                py: [ 12, 5, 6, 3, 4 ],
                pz: [ 0, 2, 1, 2, -1 ],
                nx: [ 4, 3, 3, 2, 3 ],
                ny: [ 23, 19, 21, 16, 18 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 6 ],
                py: [ 14, 13 ],
                pz: [ 0, 0 ],
                nx: [ 3, 10 ],
                ny: [ 4, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 3, 4, 4, 2, 2 ],
                py: [ 8, 11, 7, 4, 4 ],
                pz: [ 1, 1, 1, 2, -1 ],
                nx: [ 20, 18, 19, 20, 19 ],
                ny: [ 4, 0, 2, 3, 1 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 17, 12, 14, 8, 16 ],
                py: [ 2, 0, 0, 0, 0 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 3, 15, 3, 2, 2 ],
                ny: [ 2, 9, 7, 2, 2 ],
                nz: [ 2, 0, 1, 2, -1 ]
            }, {
                size: 5,
                px: [ 11, 10, 11, 11, 11 ],
                py: [ 10, 12, 11, 12, 12 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 13, 13, 20, 10, 13 ],
                ny: [ 9, 11, 8, 4, 10 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 8, 16 ],
                py: [ 7, 13 ],
                pz: [ 1, 0 ],
                nx: [ 8, 13 ],
                ny: [ 4, 11 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 7 ],
                py: [ 20, 3 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 10, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 3,
                px: [ 13, 10, 17 ],
                py: [ 9, 3, 5 ],
                pz: [ 0, -1, -1 ],
                nx: [ 1, 3, 1 ],
                ny: [ 5, 16, 6 ],
                nz: [ 2, 0, 1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 5, 5 ],
                pz: [ 2, -1 ],
                nx: [ 8, 3 ],
                ny: [ 14, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 4,
                px: [ 11, 9, 12, 10 ],
                py: [ 2, 2, 2, 2 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 4, 4, 4, 10 ],
                ny: [ 5, 5, 0, 16 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 7, 9, 12 ],
                py: [ 2, 2, 2 ],
                pz: [ 1, -1, -1 ],
                nx: [ 4, 7, 2 ],
                ny: [ 3, 1, 0 ],
                nz: [ 0, 0, 2 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 3, 12 ],
                pz: [ 2, 0 ],
                nx: [ 7, 4 ],
                ny: [ 6, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 4,
                px: [ 12, 12, 6, 3 ],
                py: [ 12, 11, 21, 7 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 1, 0, 0, 0 ],
                ny: [ 13, 3, 6, 5 ],
                nz: [ 0, 2, 1, 1 ]
            }, {
                size: 3,
                px: [ 3, 1, 3 ],
                py: [ 21, 8, 18 ],
                pz: [ 0, 1, 0 ],
                nx: [ 11, 20, 0 ],
                ny: [ 17, 17, 6 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 2, 8 ],
                py: [ 3, 12 ],
                pz: [ 2, 0 ],
                nx: [ 2, 20 ],
                ny: [ 4, 17 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 2, 3, 4, 3, 2 ],
                py: [ 10, 14, 14, 15, 13 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 0, 0, 1, 0, 0 ],
                ny: [ 21, 20, 23, 19, 19 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 15 ],
                py: [ 7, 4 ],
                pz: [ 1, -1 ],
                nx: [ 3, 8 ],
                ny: [ 4, 14 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 19, 14, 12, 15, 4 ],
                py: [ 8, 12, 10, 16, 2 ],
                pz: [ 0, 0, 0, 0, 2 ],
                nx: [ 8, 0, 12, 4, 0 ],
                ny: [ 4, 1, 12, 2, 19 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 18, 9 ],
                py: [ 15, 3 ],
                pz: [ 0, -1 ],
                nx: [ 8, 15 ],
                ny: [ 9, 14 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 4, 2, 3, 4, 9 ],
                py: [ 9, 4, 3, 8, 23 ],
                pz: [ 1, 2, 1, 1, 0 ],
                nx: [ 11, 23, 23, 11, 11 ],
                ny: [ 0, 2, 3, 1, 1 ],
                nz: [ 1, 0, 0, 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 7 ],
                py: [ 1, 1 ],
                pz: [ 0, 0 ],
                nx: [ 3, 4 ],
                ny: [ 10, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 11, 9, 8, 5 ],
                py: [ 12, 15, 13, 3 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 3, 12, 14, 13 ],
                ny: [ 0, 3, 3, 3 ],
                nz: [ 2, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 6, 5 ],
                pz: [ 0, 0 ],
                nx: [ 8, 11 ],
                ny: [ 4, 20 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 21, 20, 21, 21, 21 ],
                py: [ 18, 21, 17, 19, 19 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 2, 5, 4, 4, 5 ],
                ny: [ 5, 12, 11, 10, 10 ],
                nz: [ 1, 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 1, 1, 1, 1, 1 ],
                py: [ 10, 11, 7, 9, 8 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 11, 23, 23, 23, 23 ],
                ny: [ 10, 20, 21, 19, 19 ],
                nz: [ 1, 0, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 7, 8, 7, 3, 1 ],
                py: [ 14, 13, 13, 2, 2 ],
                pz: [ 0, 0, -1, -1, -1 ],
                nx: [ 1, 10, 2, 2, 10 ],
                ny: [ 2, 13, 4, 16, 12 ],
                nz: [ 2, 0, 1, 0, 0 ]
            }, {
                size: 2,
                px: [ 17, 18 ],
                py: [ 12, 12 ],
                pz: [ 0, 0 ],
                nx: [ 8, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 17, 0 ],
                py: [ 5, 20 ],
                pz: [ 0, -1 ],
                nx: [ 4, 9 ],
                ny: [ 0, 2 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 22, 22, 22, 11, 23 ],
                py: [ 16, 15, 14, 6, 13 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 16, 15, 7, 9, 9 ],
                ny: [ 15, 8, 4, 10, 10 ],
                nz: [ 0, 0, 1, 1, -1 ]
            }, {
                size: 2,
                px: [ 13, 3 ],
                py: [ 3, 1 ],
                pz: [ 0, 2 ],
                nx: [ 8, 3 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 6 ],
                py: [ 4, 1 ],
                pz: [ 1, -1 ],
                nx: [ 6, 3 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 3,
                px: [ 4, 2, 6 ],
                py: [ 6, 3, 4 ],
                pz: [ 1, 2, 1 ],
                nx: [ 10, 0, 4 ],
                ny: [ 9, 4, 3 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 4,
                px: [ 2, 8, 4, 10 ],
                py: [ 4, 23, 7, 23 ],
                pz: [ 2, 0, 1, 0 ],
                nx: [ 9, 4, 11, 9 ],
                ny: [ 21, 5, 16, 0 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 13, 0 ],
                pz: [ 0, -1 ],
                nx: [ 8, 2 ],
                ny: [ 11, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 1, 4 ],
                pz: [ 1, -1 ],
                nx: [ 3, 5 ],
                ny: [ 0, 1 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 7, 2 ],
                py: [ 0, 0 ],
                pz: [ 0, 2 ],
                nx: [ 2, 10 ],
                ny: [ 1, 6 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 10, 2 ],
                py: [ 7, 0 ],
                pz: [ 1, -1 ],
                nx: [ 21, 5 ],
                ny: [ 15, 4 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 10, 9 ],
                pz: [ 0, 0 ],
                nx: [ 0, 3 ],
                ny: [ 13, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 9 ],
                py: [ 13, 0 ],
                pz: [ 0, -1 ],
                nx: [ 3, 3 ],
                ny: [ 4, 3 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 14, 13, 13, 14, 14 ],
                py: [ 12, 10, 11, 13, 13 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 9, 8, 4, 5, 7 ],
                ny: [ 4, 4, 2, 2, 4 ],
                nz: [ 0, 0, 1, 1, 0 ]
            }, {
                size: 3,
                px: [ 2, 4, 1 ],
                py: [ 2, 0, 0 ],
                pz: [ 0, 0, 1 ],
                nx: [ 0, 7, 4 ],
                ny: [ 0, 3, 2 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 4 ],
                py: [ 5, 0 ],
                pz: [ 0, -1 ],
                nx: [ 8, 6 ],
                ny: [ 4, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 3,
                px: [ 0, 0, 0 ],
                py: [ 20, 2, 4 ],
                pz: [ 0, -1, -1 ],
                nx: [ 12, 3, 10 ],
                ny: [ 3, 1, 3 ],
                nz: [ 0, 2, 0 ]
            }, {
                size: 5,
                px: [ 5, 11, 10, 13, 13 ],
                py: [ 0, 0, 0, 2, 2 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 4, 5, 5, 4, 5 ],
                ny: [ 14, 0, 2, 6, 1 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 3, 11 ],
                ny: [ 4, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 14, -1715597992 ],
                py: [ 19, 9 ],
                pz: [ 0, -1 ],
                nx: [ 7, 14 ],
                ny: [ 10, 17 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 11, 1 ],
                py: [ 9, 0 ],
                pz: [ 0, -1 ],
                nx: [ 1, 12 ],
                ny: [ 2, 10 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 17, 9 ],
                py: [ 13, 17 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 0, 7 ],
                py: [ 1, 9 ],
                pz: [ 1, -1 ],
                nx: [ 18, 4 ],
                ny: [ 14, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 14, 7 ],
                py: [ 23, 9 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 5, 10 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 8, 7 ],
                py: [ 17, 9 ],
                pz: [ 0, -1 ],
                nx: [ 3, 2 ],
                ny: [ 0, 3 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 13, 4 ],
                py: [ 20, 1 ],
                pz: [ 0, -1 ],
                nx: [ 5, 3 ],
                ny: [ 21, 17 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 0, 0, 1 ],
                py: [ 3, 6, 15 ],
                pz: [ 2, 1, 0 ],
                nx: [ 10, 8, 3 ],
                ny: [ 6, 4, 2 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 8, 8 ],
                py: [ 18, 8 ],
                pz: [ 0, -1 ],
                nx: [ 5, 4 ],
                ny: [ 8, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 6, 5 ],
                py: [ 2, 2 ],
                pz: [ 1, 1 ],
                nx: [ 8, 9 ],
                ny: [ 4, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 11, 5 ],
                pz: [ 1, 2 ],
                nx: [ 13, 3 ],
                ny: [ 19, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 6 ],
                py: [ 1, 11 ],
                pz: [ 2, -1 ],
                nx: [ 3, 2 ],
                ny: [ 1, 0 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 9, 4 ],
                py: [ 10, 5 ],
                pz: [ 1, 2 ],
                nx: [ 8, 4 ],
                ny: [ 10, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 12, 12 ],
                py: [ 11, 20 ],
                pz: [ 0, -1 ],
                nx: [ 0, 0 ],
                ny: [ 6, 10 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 7, 12 ],
                py: [ 2, 20 ],
                pz: [ 0, -1 ],
                nx: [ 2, 2 ],
                ny: [ 2, 3 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 0, 15 ],
                py: [ 5, 21 ],
                pz: [ 1, -1 ],
                nx: [ 10, 9 ],
                ny: [ 3, 3 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 15, 9 ],
                py: [ 1, 0 ],
                pz: [ 0, 1 ],
                nx: [ 19, 3 ],
                ny: [ 0, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 21, 5 ],
                py: [ 13, 5 ],
                pz: [ 0, 2 ],
                nx: [ 23, 6 ],
                ny: [ 23, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 8 ],
                py: [ 3, 1 ],
                pz: [ 2, -1 ],
                nx: [ 9, 9 ],
                ny: [ 6, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 7, 7 ],
                pz: [ 1, -1 ],
                nx: [ 5, 3 ],
                ny: [ 23, 17 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 3 ],
                py: [ 6, 4 ],
                pz: [ 0, -1 ],
                nx: [ 2, 4 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 3,
                px: [ 14, 0, 17 ],
                py: [ 20, 3, 21 ],
                pz: [ 0, -1, -1 ],
                nx: [ 11, 11, 11 ],
                ny: [ 7, 9, 10 ],
                nz: [ 1, 1, 1 ]
            }, {
                size: 5,
                px: [ 11, 11, 23, 23, 12 ],
                py: [ 10, 11, 21, 20, 12 ],
                pz: [ 1, 1, 0, 0, 0 ],
                nx: [ 8, 3, 6, 7, 7 ],
                ny: [ 4, 5, 11, 11, 11 ],
                nz: [ 1, 2, 1, 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 11, 10 ],
                pz: [ 0, 0 ],
                nx: [ 9, 3 ],
                ny: [ 2, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 12, 14 ],
                py: [ 19, 19 ],
                pz: [ 0, 0 ],
                nx: [ 12, 13 ],
                ny: [ 18, 17 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 13, 14, 12, 15, 14 ],
                py: [ 0, 0, 1, 1, 1 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 4, 8, 4, 7, 7 ],
                ny: [ 3, 4, 2, 5, 5 ],
                nz: [ 2, 1, 2, 1, -1 ]
            }, {
                size: 2,
                px: [ 17, 5 ],
                py: [ 10, 2 ],
                pz: [ 0, -1 ],
                nx: [ 4, 9 ],
                ny: [ 2, 3 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 18, 10 ],
                py: [ 6, 10 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 8, 18, 8, 4, 16 ],
                py: [ 6, 12, 9, 4, 13 ],
                pz: [ 1, 0, 1, 2, 0 ],
                nx: [ 3, 4, 3, 5, 5 ],
                ny: [ 0, 2, 3, 1, 1 ],
                nz: [ 1, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 2, 4 ],
                pz: [ 2, 1 ],
                nx: [ 8, 0 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 4, 5 ],
                pz: [ 2, -1 ],
                nx: [ 4, 2 ],
                ny: [ 14, 7 ],
                nz: [ 0, 1 ]
            }, {
                size: 4,
                px: [ 3, 4, 4, 3 ],
                py: [ 11, 12, 12, 2 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 1, 2, 1, 2 ],
                ny: [ 11, 14, 12, 16 ],
                nz: [ 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 0 ],
                py: [ 11, 0 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 4, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 3, 2 ],
                py: [ 21, 11 ],
                pz: [ 0, 1 ],
                nx: [ 3, 2 ],
                ny: [ 10, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 10, 3, 13 ],
                py: [ 2, 0, 2 ],
                pz: [ 0, 2, 0 ],
                nx: [ 7, 16, 1 ],
                ny: [ 10, 4, 1 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 6, 12 ],
                py: [ 2, 5 ],
                pz: [ 1, 0 ],
                nx: [ 6, 18 ],
                ny: [ 1, 19 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 16 ],
                py: [ 0, 16 ],
                pz: [ 1, -1 ],
                nx: [ 11, 2 ],
                ny: [ 5, 1 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 11, 10 ],
                py: [ 13, 1 ],
                pz: [ 0, -1 ],
                nx: [ 1, 1 ],
                ny: [ 22, 21 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 10 ],
                py: [ 18, 18 ],
                pz: [ 0, 0 ],
                nx: [ 5, 8 ],
                ny: [ 9, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 2 ],
                py: [ 20, 18 ],
                pz: [ 0, 0 ],
                nx: [ 8, 3 ],
                ny: [ 5, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 14, 2 ],
                py: [ 17, 1 ],
                pz: [ 0, -1 ],
                nx: [ 14, 13 ],
                ny: [ 15, 15 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 4 ],
                py: [ 2, 3 ],
                pz: [ 2, 2 ],
                nx: [ 8, 3 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 8, 18, 18, 8, 7 ],
                py: [ 6, 11, 11, 7, 9 ],
                pz: [ 1, 0, -1, -1, -1 ],
                nx: [ 5, 13, 5, 11, 5 ],
                ny: [ 3, 11, 0, 8, 2 ],
                nz: [ 2, 0, 2, 1, 2 ]
            }, {
                size: 5,
                px: [ 12, 0, 5, 4, 7 ],
                py: [ 15, 0, 4, 0, 9 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 8, 7, 4, 16, 6 ],
                ny: [ 17, 12, 9, 10, 12 ],
                nz: [ 0, 0, 1, 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 7 ],
                py: [ 14, 1 ],
                pz: [ 0, -1 ],
                nx: [ 5, 4 ],
                ny: [ 9, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 4,
                px: [ 8, 0, 22, 4 ],
                py: [ 4, 4, 23, 0 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 2, 4, 2, 5 ],
                ny: [ 0, 1, 2, 9 ],
                nz: [ 2, 1, 2, 1 ]
            }, {
                size: 5,
                px: [ 9, 9, 10, 10, 8 ],
                py: [ 0, 1, 1, 2, 0 ],
                pz: [ 1, 1, 1, 1, 1 ],
                nx: [ 4, 16, 16, 16, 6 ],
                ny: [ 2, 11, 11, 11, 12 ],
                nz: [ 2, 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 6, 6 ],
                py: [ 6, 5 ],
                pz: [ 1, 1 ],
                nx: [ 0, 4 ],
                ny: [ 3, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 10, 3, 4 ],
                py: [ 5, 9, 8 ],
                pz: [ 1, -1, -1 ],
                nx: [ 11, 23, 23 ],
                ny: [ 7, 12, 11 ],
                nz: [ 1, 0, 0 ]
            }, {
                size: 3,
                px: [ 13, 12, 7 ],
                py: [ 19, 19, 10 ],
                pz: [ 0, 0, 1 ],
                nx: [ 13, 5, 19 ],
                ny: [ 20, 15, 22 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 12, 12 ],
                py: [ 12, 13 ],
                pz: [ 0, 0 ],
                nx: [ 9, 10 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 12 ],
                py: [ 1, 13 ],
                pz: [ 2, -1 ],
                nx: [ 2, 7 ],
                ny: [ 2, 13 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 8, 9 ],
                pz: [ 1, 1 ],
                nx: [ 19, 7 ],
                ny: [ 23, 13 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 8, 7, 23, 15 ],
                py: [ 11, 12, 4, 21 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 2, 5, 1, 10 ],
                ny: [ 6, 6, 2, 13 ],
                nz: [ 0, 1, 1, 0 ]
            }, {
                size: 2,
                px: [ 10, 9 ],
                py: [ 3, 3 ],
                pz: [ 0, 0 ],
                nx: [ 2, 3 ],
                ny: [ 2, 4 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 5, 2 ],
                py: [ 3, 4 ],
                pz: [ 2, -1 ],
                nx: [ 3, 6 ],
                ny: [ 1, 2 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 7, 11 ],
                py: [ 20, 16 ],
                pz: [ 0, -1 ],
                nx: [ 2, 4 ],
                ny: [ 5, 20 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 9, 7 ],
                py: [ 7, 5 ],
                pz: [ 1, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 11, 3 ],
                pz: [ 1, 2 ],
                nx: [ 5, 5 ],
                ny: [ 3, 5 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 11, 3 ],
                py: [ 11, 5 ],
                pz: [ 1, -1 ],
                nx: [ 4, 1 ],
                ny: [ 12, 3 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 9, 11 ],
                py: [ 6, 4 ],
                pz: [ 1, -1 ],
                nx: [ 10, 20 ],
                ny: [ 9, 18 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 2, 2, 2, 2, 1 ],
                py: [ 15, 13, 16, 14, 7 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 15, 8, 9, 8, 4 ],
                ny: [ 11, 6, 5, 5, 4 ],
                nz: [ 0, 1, 1, 1, -1 ]
            }, {
                size: 2,
                px: [ 12, 2 ],
                py: [ 5, 5 ],
                pz: [ 0, -1 ],
                nx: [ 3, 2 ],
                ny: [ 7, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 5, 11 ],
                py: [ 1, 3 ],
                pz: [ 2, 1 ],
                nx: [ 10, 10 ],
                ny: [ 3, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 17, 11 ],
                py: [ 13, 18 ],
                pz: [ 0, -1 ],
                nx: [ 6, 9 ],
                ny: [ 9, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 5, 1, 2, 5, 6 ],
                py: [ 14, 4, 9, 15, 23 ],
                pz: [ 0, 2, 1, 0, 0 ],
                nx: [ 4, 9, 18, 16, 17 ],
                ny: [ 0, 1, 1, 0, 0 ],
                nz: [ 2, 1, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 16, 17 ],
                py: [ 0, 0 ],
                pz: [ 0, 0 ],
                nx: [ 23, 23 ],
                ny: [ 5, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 8 ],
                py: [ 20, 6 ],
                pz: [ 0, -1 ],
                nx: [ 5, 6 ],
                ny: [ 12, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 6, 15 ],
                py: [ 15, 0 ],
                pz: [ 0, -1 ],
                nx: [ 6, 3 ],
                ny: [ 16, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 18, 20 ],
                py: [ 7, 8 ],
                pz: [ 0, 0 ],
                nx: [ 18, 11 ],
                ny: [ 9, 14 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 4 ],
                py: [ 12, 6 ],
                pz: [ 0, 1 ],
                nx: [ 3, 15 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 5, 2 ],
                pz: [ 1, 2 ],
                nx: [ 5, 5 ],
                ny: [ 2, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 20 ],
                py: [ 1, 20 ],
                pz: [ 1, -1 ],
                nx: [ 15, 17 ],
                ny: [ 1, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 7, 2 ],
                py: [ 16, 4 ],
                pz: [ 0, 2 ],
                nx: [ 4, 0 ],
                ny: [ 10, 6 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 8 ],
                py: [ 5, 0 ],
                pz: [ 1, -1 ],
                nx: [ 1, 1 ],
                ny: [ 10, 18 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 22, 0 ],
                py: [ 3, 0 ],
                pz: [ 0, -1 ],
                nx: [ 23, 11 ],
                ny: [ 4, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 3,
                px: [ 19, 10, 20 ],
                py: [ 21, 8, 18 ],
                pz: [ 0, 1, 0 ],
                nx: [ 3, 6, 20 ],
                ny: [ 5, 11, 14 ],
                nz: [ 2, -1, -1 ]
            }, {
                size: 4,
                px: [ 2, 1, 6, 5 ],
                py: [ 7, 4, 23, 22 ],
                pz: [ 1, 2, 0, 0 ],
                nx: [ 9, 19, 20, 4 ],
                ny: [ 8, 11, 9, 2 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 2, 11 ],
                pz: [ 2, 1 ],
                nx: [ 12, 10 ],
                ny: [ 21, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 6, 0, 2, 2 ],
                py: [ 6, 1, 4, 1 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 0, 0, 0, 0 ],
                ny: [ 5, 8, 9, 4 ],
                nz: [ 1, 0, 0, 1 ]
            }, {
                size: 5,
                px: [ 3, 13, 6, 11, 9 ],
                py: [ 0, 3, 1, 1, 2 ],
                pz: [ 2, 0, 1, 0, 0 ],
                nx: [ 7, 20, 16, 4, 7 ],
                ny: [ 7, 2, 19, 2, 6 ],
                nz: [ 1, 0, 0, 2, 1 ]
            }, {
                size: 4,
                px: [ 7, 5, 2, 6 ],
                py: [ 7, 7, 4, 11 ],
                pz: [ 0, 0, 2, 1 ],
                nx: [ 7, 1, 21, 0 ],
                ny: [ 8, 4, 11, 3 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 3, 2 ],
                pz: [ 2, 2 ],
                nx: [ 8, 9 ],
                ny: [ 3, 11 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 13 ],
                py: [ 3, 5 ],
                pz: [ 1, 0 ],
                nx: [ 4, 3 ],
                ny: [ 2, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 3, 12, 13, 11 ],
                py: [ 0, 1, 1, 1 ],
                pz: [ 2, 0, 0, 0 ],
                nx: [ 8, 9, 13, 0 ],
                ny: [ 4, 1, 16, 3 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 10, 1 ],
                py: [ 4, 14 ],
                pz: [ 0, -1 ],
                nx: [ 5, 10 ],
                ny: [ 1, 2 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 11, 12 ],
                py: [ 21, 21 ],
                pz: [ 0, 0 ],
                nx: [ 10, 11 ],
                ny: [ 19, 19 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 12 ],
                py: [ 6, 21 ],
                pz: [ 1, -1 ],
                nx: [ 4, 8 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 11, 7 ],
                py: [ 19, 0 ],
                pz: [ 0, -1 ],
                nx: [ 6, 5 ],
                ny: [ 9, 11 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 11, 11, 11, 10, 10 ],
                py: [ 10, 12, 11, 13, 13 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 7, 13, 6, 12, 7 ],
                ny: [ 10, 6, 3, 6, 11 ],
                nz: [ 0, 0, 1, 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 11 ],
                py: [ 6, 12 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 16, 15, 16, 15, 17 ],
                py: [ 1, 0, 0, 1, 1 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 13, 7, 6, 12, 12 ],
                ny: [ 5, 4, 3, 6, 6 ],
                nz: [ 0, 1, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 3 ],
                py: [ 1, 3 ],
                pz: [ 2, 1 ],
                nx: [ 1, 5 ],
                ny: [ 1, 3 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 13, 6 ],
                pz: [ 0, 1 ],
                nx: [ 4, 9 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 3 ],
                py: [ 4, 3 ],
                pz: [ 1, -1 ],
                nx: [ 4, 8 ],
                ny: [ 3, 6 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 2, 1 ],
                pz: [ 0, 1 ],
                nx: [ 5, 5 ],
                ny: [ 7, 21 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 0, 0 ],
                pz: [ 1, -1 ],
                nx: [ 19, 17 ],
                ny: [ 1, 0 ],
                nz: [ 0, 0 ]
            }, {
                size: 4,
                px: [ 8, 11, 5, 0 ],
                py: [ 6, 1, 1, 22 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 0, 10, 10, 1 ],
                ny: [ 6, 12, 13, 4 ],
                nz: [ 1, 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 8, 17 ],
                py: [ 6, 13 ],
                pz: [ 1, 0 ],
                nx: [ 14, 17 ],
                ny: [ 9, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 8 ],
                py: [ 0, 4 ],
                pz: [ 2, -1 ],
                nx: [ 9, 8 ],
                ny: [ 1, 1 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 14 ],
                py: [ 13, 9 ],
                pz: [ 0, -1 ],
                nx: [ 23, 23 ],
                ny: [ 21, 19 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 10, 9 ],
                py: [ 9, 3 ],
                pz: [ 0, -1 ],
                nx: [ 6, 3 ],
                ny: [ 2, 1 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 11, 1 ],
                py: [ 4, 4 ],
                pz: [ 0, -1 ],
                nx: [ 2, 4 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 5, 9 ],
                py: [ 3, 3 ],
                pz: [ 2, -1 ],
                nx: [ 17, 9 ],
                ny: [ 12, 5 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 9, 7 ],
                py: [ 18, 16 ],
                pz: [ 0, -1 ],
                nx: [ 5, 2 ],
                ny: [ 9, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 0, 1 ],
                pz: [ 1, -1 ],
                nx: [ 4, 5 ],
                ny: [ 1, 0 ],
                nz: [ 0, 0 ]
            } ],
            alpha: [ -1.149973, 1.149973, -.6844773, .6844773, -.6635048, .6635048, -.4888349, .4888349, -.4267976, .4267976, -.42581, .42581, -.4815853, .4815853, -.4091859, .4091859, -.3137414, .3137414, -.333986, .333986, -.3891196, .3891196, -.4167691, .4167691, -.3186609, .3186609, -.2957171, .2957171, -.3210062, .3210062, -.2725684, .2725684, -.2452176, .2452176, -.2812662, .2812662, -.3029622, .3029622, -.3293745, .3293745, -.3441536, .3441536, -.2946918, .2946918, -.2890545, .2890545, -.1949205, .1949205, -.2176102, .2176102, -.259519, .259519, -.2690931, .2690931, -.2130294, .2130294, -.2316308, .2316308, -.2798562, .2798562, -.2146988, .2146988, -.2332089, .2332089, -.2470614, .2470614, -.22043, .22043, -.2272045, .2272045, -.2583686, .2583686, -.2072299, .2072299, -.1834971, .1834971, -.2332656, .2332656, -.3271297, .3271297, -.2401937, .2401937, -.2006316, .2006316, -.2401947, .2401947, -.2475346, .2475346, -.2579532, .2579532, -.2466235, .2466235, -.1787582, .1787582, -.2036892, .2036892, -.1665028, .1665028, -.157651, .157651, -.2036997, .2036997, -.2040734, .2040734, -.1792532, .1792532, -.2174767, .2174767, -.1876948, .1876948, -.1883137, .1883137, -.1923872, .1923872, -.2620218, .2620218, -.1659873, .1659873, -.1475948, .1475948, -.1731607, .1731607, -.2059256, .2059256, -.1586309, .1586309, -.1607668, .1607668, -.1975101, .1975101, -.2130745, .2130745, -.1898872, .1898872, -.2052598, .2052598, -.1599397, .1599397, -.1770134, .1770134, -.1888249, .1888249, -.1515406, .1515406, -.1907771, .1907771, -.1698406, .1698406, -.2079535, .2079535, -.1966967, .1966967, -.1631391, .1631391, -.2158666, .2158666, -.2891774, .2891774, -.1581556, .1581556, -.1475359, .1475359, -.1806169, .1806169, -.1782238, .1782238, -.166044, .166044, -.1576919, .1576919, -.1741775, .1741775, -.1427265, .1427265, -.169588, .169588, -.1486712, .1486712, -.1533565, .1533565, -.1601464, .1601464, -.1978414, .1978414, -.1746566, .1746566, -.1794736, .1794736, -.1896567, .1896567, -.1666197, .1666197, -.1969351, .1969351, -.2321735, .2321735, -.1592485, .1592485, -.1671464, .1671464, -.1688885, .1688885, -.1868042, .1868042, -.1301138, .1301138, -.1330094, .1330094, -.1268423, .1268423, -.1820868, .1820868, -.188102, .188102, -.1580814, .1580814, -.1302653, .1302653, -.1787262, .1787262, -.1658453, .1658453, -.1240772, .1240772, -.1315621, .1315621, -.1756341, .1756341, -.1429438, .1429438, -.1351775, .1351775, -.2035692, .2035692, -.126767, .126767, -.128847, .128847, -.1393648, .1393648, -.1755962, .1755962, -.1308445, .1308445, -.1703894, .1703894, -.1461334, .1461334, -.1368683, .1368683, -.1244085, .1244085, -.1718163, .1718163, -.1415624, .1415624, -.1752024, .1752024, -.1666463, .1666463, -.1407325, .1407325, -.1258317, .1258317, -.1416511, .1416511, -.1420816, .1420816, -.1562547, .1562547, -.1542952, .1542952, -.1158829, .1158829, -.1392875, .1392875, -.1610095, .1610095, -.154644, .154644, -.1416235, .1416235, -.2028817, .2028817, -.1106779, .1106779, -.0923166, .0923166, -.116446, .116446, -.1701578, .1701578, -.1277995, .1277995, -.1946177, .1946177, -.1394509, .1394509, -.1370145, .1370145, -.1446031, .1446031, -.1665215, .1665215, -.1435822, .1435822, -.1559354, .1559354, -.159186, .159186, -.1193338, .1193338, -.1236954, .1236954, -.1209139, .1209139, -.1267385, .1267385, -.1232397, .1232397, -.1299632, .1299632, -.130202, .130202, -.1202975, .1202975, -.1525378, .1525378, -.1123073, .1123073, -.1605678, .1605678, -.1406867, .1406867, -.1354273, .1354273, -.1393192, .1393192, -.1278263, .1278263, -.1172073, .1172073, -.1153493, .1153493, -.1356318, .1356318, -.1316614, .1316614, -.1374489, .1374489, -.1018254, .1018254, -.1473336, .1473336, -.1289687, .1289687, -.1299183, .1299183, -.1178391, .1178391, -.1619059, .1619059, -.1842569, .1842569, -.1829095, .1829095, -.1939918, .1939918, -.1395362, .1395362, -.1774673, .1774673, -.1688216, .1688216, -.1671747, .1671747, -.1850178, .1850178, -.1106695, .1106695, -.1258323, .1258323, -.1246819, .1246819, -.09892193, .09892193, -.1399638, .1399638, -.1228375, .1228375, -.1756236, .1756236, -.1360307, .1360307, -.1266574, .1266574, -.1372135, .1372135, -.1175947, .1175947, -.1330075, .1330075, -.1396152, .1396152, -.2088443, .2088443 ]
        }, {
            count: 301,
            threshold: -4.887516,
            feature: [ {
                size: 5,
                px: [ 8, 11, 8, 14, 10 ],
                py: [ 6, 9, 3, 3, 4 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 8, 7, 19, 7, 13 ],
                ny: [ 11, 8, 8, 5, 8 ],
                nz: [ 1, 1, 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 14, 3, 13, 12, 12 ],
                py: [ 4, 6, 4, 4, 8 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 2, 5, 2, 10, 10 ],
                ny: [ 2, 8, 5, 8, 8 ],
                nz: [ 2, 1, 2, 0, -1 ]
            }, {
                size: 5,
                px: [ 6, 5, 3, 7, 7 ],
                py: [ 2, 3, 1, 2, 2 ],
                pz: [ 0, 0, 1, 0, -1 ],
                nx: [ 2, 2, 1, 2, 1 ],
                ny: [ 3, 1, 2, 2, 2 ],
                nz: [ 0, 0, 2, 0, 1 ]
            }, {
                size: 5,
                px: [ 3, 3, 6, 12, 8 ],
                py: [ 4, 2, 4, 10, 17 ],
                pz: [ 2, 2, 1, 0, 0 ],
                nx: [ 4, 8, 8, 2, 1 ],
                ny: [ 4, 4, 4, 2, 2 ],
                nz: [ 1, 1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 18, 19, 17, 9, 16 ],
                py: [ 1, 2, 2, 0, 2 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 23, 23, 22, 22, 22 ],
                ny: [ 4, 3, 1, 0, 2 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 3,
                px: [ 15, 4, 14 ],
                py: [ 23, 4, 18 ],
                pz: [ 0, 2, 0 ],
                nx: [ 7, 0, 5 ],
                ny: [ 10, 4, 9 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 5,
                px: [ 11, 11, 16, 11, 17 ],
                py: [ 8, 6, 11, 7, 11 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 8, 4, 14, 14, 1 ],
                ny: [ 4, 4, 8, 8, 5 ],
                nz: [ 1, 1, 0, -1, -1 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 12, 12 ],
                py: [ 13, 10, 11, 12, 12 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 4, 4, 1, 2, 9 ],
                ny: [ 8, 10, 2, 4, 15 ],
                nz: [ 0, 1, 2, 1, 0 ]
            }, {
                size: 2,
                px: [ 19, 0 ],
                py: [ 14, 17 ],
                pz: [ 0, -1 ],
                nx: [ 20, 19 ],
                ny: [ 15, 22 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 3, 3, 1, 3, 5 ],
                py: [ 13, 15, 6, 14, 22 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 0, 0, 1, 0, 0 ],
                ny: [ 11, 21, 23, 5, 5 ],
                nz: [ 1, 0, 0, 2, -1 ]
            }, {
                size: 5,
                px: [ 4, 2, 10, 4, 3 ],
                py: [ 19, 4, 13, 16, 13 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 3, 20, 7, 4, 0 ],
                ny: [ 4, 19, 5, 1, 5 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 4, 4 ],
                pz: [ 0, -1 ],
                nx: [ 15, 3 ],
                ny: [ 15, 1 ],
                nz: [ 0, 2 ]
            }, {
                size: 4,
                px: [ 17, 17, 12, 11 ],
                py: [ 14, 15, 18, 18 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 11, 4, 1, 0 ],
                ny: [ 17, 20, 8, 5 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 6, 2, 1, 2, 11 ],
                py: [ 14, 4, 1, 1, 18 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 5, 5, 3, 5, 2 ],
                ny: [ 18, 17, 7, 9, 2 ],
                nz: [ 0, 0, 1, 1, 2 ]
            }, {
                size: 5,
                px: [ 20, 19, 20, 15, 20 ],
                py: [ 17, 20, 12, 12, 8 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 17, 0, 5, 2, 2 ],
                ny: [ 8, 4, 9, 2, 2 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 6, 8 ],
                py: [ 7, 11 ],
                pz: [ 1, -1 ],
                nx: [ 7, 8 ],
                ny: [ 7, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 15, 16, 14, 8, 8 ],
                py: [ 2, 2, 2, 0, 0 ],
                pz: [ 0, 0, 0, 1, -1 ],
                nx: [ 20, 11, 21, 18, 19 ],
                ny: [ 3, 6, 5, 1, 2 ],
                nz: [ 0, 1, 0, 0, 0 ]
            }, {
                size: 4,
                px: [ 17, 18, 9, 8 ],
                py: [ 23, 21, 7, 8 ],
                pz: [ 0, 0, 1, 1 ],
                nx: [ 8, 17, 10, 18 ],
                ny: [ 4, 12, 2, 1 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 2, 2, 9, 4, 8 ],
                py: [ 7, 3, 12, 12, 23 ],
                pz: [ 1, 1, 0, 0, 0 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 3, 1, 2, 4, 4 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 3,
                px: [ 7, 8, 5 ],
                py: [ 22, 23, 9 ],
                pz: [ 0, 0, 1 ],
                nx: [ 9, 4, 2 ],
                ny: [ 21, 4, 0 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 7, 7 ],
                pz: [ 1, -1 ],
                nx: [ 3, 2 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 15, 11, 10, 3, 17 ],
                py: [ 0, 1, 2, 3, 1 ],
                pz: [ 0, 0, 0, 2, 0 ],
                nx: [ 5, 8, 4, 3, 3 ],
                ny: [ 9, 4, 7, 10, 10 ],
                nz: [ 1, 1, 1, 1, -1 ]
            }, {
                size: 3,
                px: [ 22, 11, 22 ],
                py: [ 12, 5, 14 ],
                pz: [ 0, 1, 0 ],
                nx: [ 23, 23, 3 ],
                ny: [ 22, 23, 8 ],
                nz: [ 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 11 ],
                py: [ 7, 5 ],
                pz: [ 1, -1 ],
                nx: [ 8, 2 ],
                ny: [ 14, 5 ],
                nz: [ 0, 2 ]
            }, {
                size: 4,
                px: [ 17, 16, 2, 4 ],
                py: [ 14, 13, 5, 0 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 8, 9, 15, 8 ],
                ny: [ 8, 9, 14, 7 ],
                nz: [ 1, 1, 0, 1 ]
            }, {
                size: 2,
                px: [ 5, 16 ],
                py: [ 6, 13 ],
                pz: [ 1, -1 ],
                nx: [ 2, 1 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 1, 0, 1, 2, 1 ],
                py: [ 15, 2, 16, 19, 12 ],
                pz: [ 0, 2, 0, 0, 0 ],
                nx: [ 8, 7, 4, 9, 9 ],
                ny: [ 5, 11, 4, 5, 5 ],
                nz: [ 1, 1, 1, 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 7 ],
                py: [ 11, 12 ],
                pz: [ 0, 0 ],
                nx: [ 9, 1 ],
                ny: [ 10, 16 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 15, 13 ],
                py: [ 17, 10 ],
                pz: [ 0, -1 ],
                nx: [ 7, 4 ],
                ny: [ 8, 4 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 11, 10, 7, 8, 9 ],
                py: [ 0, 0, 1, 1, 1 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 4, 5, 4, 5, 6 ],
                ny: [ 1, 0, 2, 1, 0 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 4, 3 ],
                pz: [ 2, 2 ],
                nx: [ 3, 21 ],
                ny: [ 4, 20 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 10, 11, 5, 2, 11 ],
                py: [ 12, 10, 6, 11, 11 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 4, 15, 16, 7, 7 ],
                ny: [ 5, 10, 11, 10, 10 ],
                nz: [ 1, 0, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 13, 14, 1, 11, 11 ],
                py: [ 2, 2, 3, 2, 2 ],
                pz: [ 0, 0, 2, 0, -1 ],
                nx: [ 3, 0, 0, 1, 0 ],
                ny: [ 23, 15, 14, 9, 8 ],
                nz: [ 0, 0, 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 17, 2 ],
                py: [ 13, 5 ],
                pz: [ 0, -1 ],
                nx: [ 4, 9 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 4, 1 ],
                pz: [ 0, -1 ],
                nx: [ 11, 3 ],
                ny: [ 3, 0 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 5, 3 ],
                py: [ 3, 3 ],
                pz: [ 2, -1 ],
                nx: [ 11, 23 ],
                ny: [ 8, 14 ],
                nz: [ 1, 0 ]
            }, {
                size: 3,
                px: [ 22, 22, 22 ],
                py: [ 16, 18, 9 ],
                pz: [ 0, 0, 0 ],
                nx: [ 13, 2, 0 ],
                ny: [ 17, 3, 5 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 5,
                px: [ 13, 10, 13, 14, 11 ],
                py: [ 2, 2, 1, 2, 1 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 3, 3, 8, 6, 6 ],
                ny: [ 2, 5, 4, 11, 11 ],
                nz: [ 2, 2, 1, 1, -1 ]
            }, {
                size: 3,
                px: [ 12, 1, 1 ],
                py: [ 14, 0, 1 ],
                pz: [ 0, -1, -1 ],
                nx: [ 8, 15, 7 ],
                ny: [ 1, 2, 0 ],
                nz: [ 1, 0, 1 ]
            }, {
                size: 2,
                px: [ 4, 5 ],
                py: [ 20, 23 ],
                pz: [ 0, 0 ],
                nx: [ 3, 3 ],
                ny: [ 10, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 7, 2 ],
                pz: [ 1, -1 ],
                nx: [ 4, 3 ],
                ny: [ 23, 16 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 3, 3, 6 ],
                py: [ 5, 2, 4 ],
                pz: [ 2, 2, 1 ],
                nx: [ 3, 1, 2 ],
                ny: [ 5, 17, 0 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 14, 8 ],
                py: [ 17, 6 ],
                pz: [ 0, 1 ],
                nx: [ 13, 10 ],
                ny: [ 16, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 15, 7, 14, 13, 14 ],
                py: [ 1, 0, 0, 0, 1 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 4, 4, 4, 8, 8 ],
                ny: [ 5, 3, 2, 10, 10 ],
                nz: [ 2, 2, 2, 1, -1 ]
            }, {
                size: 5,
                px: [ 8, 9, 4, 5, 4 ],
                py: [ 13, 12, 9, 5, 7 ],
                pz: [ 0, 0, 1, 1, 1 ],
                nx: [ 22, 21, 22, 22, 22 ],
                ny: [ 4, 0, 3, 2, 2 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 17, 17 ],
                py: [ 16, 13 ],
                pz: [ 0, 0 ],
                nx: [ 14, 21 ],
                ny: [ 8, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 16, 10 ],
                py: [ 4, 9 ],
                pz: [ 0, -1 ],
                nx: [ 16, 10 ],
                ny: [ 3, 3 ],
                nz: [ 0, 1 ]
            }, {
                size: 5,
                px: [ 1, 1, 0, 1, 0 ],
                py: [ 17, 16, 7, 15, 8 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 4, 3, 8, 9, 7 ],
                ny: [ 3, 3, 6, 6, 6 ],
                nz: [ 1, 1, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 2, 3 ],
                pz: [ 2, 2 ],
                nx: [ 8, 3 ],
                ny: [ 4, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 2 ],
                py: [ 17, 4 ],
                pz: [ 0, 2 ],
                nx: [ 10, 12 ],
                ny: [ 15, 14 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 14, 12 ],
                pz: [ 0, 0 ],
                nx: [ 9, 10 ],
                ny: [ 13, 11 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 13 ],
                py: [ 5, 5 ],
                pz: [ 0, 0 ],
                nx: [ 3, 4 ],
                ny: [ 4, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 7, 10, 8, 11, 11 ],
                py: [ 13, 2, 12, 2, 2 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 10, 1, 1, 10, 1 ],
                ny: [ 12, 5, 3, 13, 1 ],
                nz: [ 0, 1, 1, 0, 2 ]
            }, {
                size: 2,
                px: [ 6, 10 ],
                py: [ 4, 2 ],
                pz: [ 1, -1 ],
                nx: [ 4, 6 ],
                ny: [ 4, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 20, 20 ],
                py: [ 21, 22 ],
                pz: [ 0, 0 ],
                nx: [ 15, 8 ],
                ny: [ 5, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 3 ],
                py: [ 3, 3 ],
                pz: [ 2, 2 ],
                nx: [ 9, 17 ],
                ny: [ 4, 15 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 2, 2, 4 ],
                py: [ 3, 3, 7 ],
                pz: [ 2, -1, -1 ],
                nx: [ 7, 4, 4 ],
                ny: [ 6, 5, 4 ],
                nz: [ 1, 2, 2 ]
            }, {
                size: 5,
                px: [ 8, 9, 16, 17, 17 ],
                py: [ 1, 2, 1, 1, 1 ],
                pz: [ 1, 1, 0, 0, -1 ],
                nx: [ 2, 2, 4, 2, 4 ],
                ny: [ 16, 14, 22, 15, 21 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 18, 0 ],
                pz: [ 0, -1 ],
                nx: [ 2, 5 ],
                ny: [ 5, 8 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 7, 8 ],
                py: [ 11, 11 ],
                pz: [ 0, 0 ],
                nx: [ 15, 5 ],
                ny: [ 8, 8 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 0, 3 ],
                py: [ 4, 3 ],
                pz: [ 2, -1 ],
                nx: [ 1, 6 ],
                ny: [ 4, 14 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 6, 12 ],
                py: [ 7, 11 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 7, 12 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 3, 7 ],
                py: [ 10, 22 ],
                pz: [ 1, 0 ],
                nx: [ 4, 3 ],
                ny: [ 10, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 19 ],
                py: [ 4, 21 ],
                pz: [ 2, -1 ],
                nx: [ 11, 11 ],
                ny: [ 8, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 8, 7 ],
                pz: [ 1, 1 ],
                nx: [ 4, 20 ],
                ny: [ 4, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 11, 23, 23, 23, 23 ],
                py: [ 7, 13, 19, 20, 21 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 4, 3, 2, 8, 8 ],
                ny: [ 11, 5, 5, 23, 23 ],
                nz: [ 1, 1, 2, 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 1 ],
                py: [ 0, 2 ],
                pz: [ 0, 0 ],
                nx: [ 0, 6 ],
                ny: [ 0, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 8 ],
                py: [ 12, 1 ],
                pz: [ 0, -1 ],
                nx: [ 23, 23 ],
                ny: [ 13, 12 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 23, 11, 23, 11, 11 ],
                py: [ 13, 7, 12, 5, 6 ],
                pz: [ 0, 1, 0, 1, 1 ],
                nx: [ 6, 3, 8, 7, 7 ],
                ny: [ 12, 4, 4, 11, 11 ],
                nz: [ 0, 1, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 20, 5 ],
                py: [ 15, 5 ],
                pz: [ 0, -1 ],
                nx: [ 10, 10 ],
                ny: [ 11, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 11, 4 ],
                py: [ 19, 8 ],
                pz: [ 0, 1 ],
                nx: [ 11, 19 ],
                ny: [ 18, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 14, 6 ],
                py: [ 3, 4 ],
                pz: [ 0, -1 ],
                nx: [ 8, 15 ],
                ny: [ 1, 0 ],
                nz: [ 1, 0 ]
            }, {
                size: 4,
                px: [ 14, 5, 13, 12 ],
                py: [ 23, 3, 23, 23 ],
                pz: [ 0, 1, 0, 0 ],
                nx: [ 12, 0, 1, 4 ],
                ny: [ 21, 3, 2, 4 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 19, 5 ],
                py: [ 12, 2 ],
                pz: [ 0, -1 ],
                nx: [ 4, 7 ],
                ny: [ 3, 5 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 0, 8 ],
                py: [ 5, 3 ],
                pz: [ 2, -1 ],
                nx: [ 5, 22 ],
                ny: [ 3, 11 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 2, 6 ],
                py: [ 3, 12 ],
                pz: [ 2, 0 ],
                nx: [ 3, 5 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 5 ],
                py: [ 0, 6 ],
                pz: [ 2, -1 ],
                nx: [ 14, 6 ],
                ny: [ 4, 2 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 16, 11 ],
                py: [ 1, 0 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 4, 10 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 9, 4 ],
                py: [ 4, 3 ],
                pz: [ 1, 1 ],
                nx: [ 5, 8 ],
                ny: [ 0, 10 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 16, 1 ],
                py: [ 22, 1 ],
                pz: [ 0, -1 ],
                nx: [ 2, 2 ],
                ny: [ 4, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 12, 2 ],
                py: [ 11, 2 ],
                pz: [ 0, -1 ],
                nx: [ 5, 5 ],
                ny: [ 1, 0 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 4, 3 ],
                pz: [ 1, 1 ],
                nx: [ 7, 5 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 2 ],
                py: [ 22, 3 ],
                pz: [ 0, 2 ],
                nx: [ 4, 9 ],
                ny: [ 10, 11 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 8, 10 ],
                pz: [ 1, -1 ],
                nx: [ 5, 3 ],
                ny: [ 23, 18 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 6 ],
                py: [ 21, 9 ],
                pz: [ 0, -1 ],
                nx: [ 11, 23 ],
                ny: [ 6, 10 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 8, 7 ],
                pz: [ 1, 1 ],
                nx: [ 18, 8 ],
                ny: [ 18, 6 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 3 ],
                py: [ 19, 0 ],
                pz: [ 0, -1 ],
                nx: [ 6, 5 ],
                ny: [ 9, 11 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 2, 10, 9, 7, 8 ],
                py: [ 0, 1, 0, 1, 0 ],
                pz: [ 2, 0, 0, 0, 0 ],
                nx: [ 3, 4, 6, 8, 8 ],
                ny: [ 2, 4, 9, 4, 4 ],
                nz: [ 2, 1, 1, 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 9, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 4 ],
                py: [ 23, 3 ],
                pz: [ 0, -1 ],
                nx: [ 12, 9 ],
                ny: [ 2, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 10, 3 ],
                pz: [ 1, 2 ],
                nx: [ 0, 2 ],
                ny: [ 23, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 12, 14 ],
                py: [ 18, 0 ],
                pz: [ 0, -1 ],
                nx: [ 12, 8 ],
                ny: [ 16, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 4,
                px: [ 10, 18, 7, 5 ],
                py: [ 14, 8, 0, 3 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 8, 6, 8, 5 ],
                ny: [ 11, 12, 5, 5 ],
                nz: [ 0, 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 6, 5 ],
                py: [ 2, 2 ],
                pz: [ 1, 1 ],
                nx: [ 8, 8 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 12, 10 ],
                py: [ 20, 20 ],
                pz: [ 0, 0 ],
                nx: [ 11, 10 ],
                ny: [ 19, 19 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 17, 10 ],
                py: [ 16, 20 ],
                pz: [ 0, -1 ],
                nx: [ 8, 7 ],
                ny: [ 4, 8 ],
                nz: [ 1, 1 ]
            }, {
                size: 3,
                px: [ 2, 1, 3 ],
                py: [ 20, 4, 21 ],
                pz: [ 0, 2, 0 ],
                nx: [ 3, 4, 0 ],
                ny: [ 10, 1, 0 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 5,
                px: [ 6, 7, 3, 6, 6 ],
                py: [ 15, 14, 7, 16, 19 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 18, 19, 16, 17, 17 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 16 ],
                py: [ 6, 12 ],
                pz: [ 1, 0 ],
                nx: [ 8, 15 ],
                ny: [ 4, 10 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 0, 0 ],
                py: [ 1, 3, 2, 0, 4 ],
                pz: [ 2, 2, 2, 2, 1 ],
                nx: [ 13, 8, 14, 4, 7 ],
                ny: [ 23, 6, 23, 3, 9 ],
                nz: [ 0, 1, 0, 2, -1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 3, 5 ],
                pz: [ 2, 1 ],
                nx: [ 10, 8 ],
                ny: [ 11, 6 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 10 ],
                py: [ 4, 4 ],
                pz: [ 0, 0 ],
                nx: [ 8, 5 ],
                ny: [ 4, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 15, 18, 9, 16, 4 ],
                py: [ 12, 13, 6, 23, 3 ],
                pz: [ 0, 0, 1, 0, 2 ],
                nx: [ 6, 3, 6, 2, 7 ],
                ny: [ 2, 3, 0, 1, 0 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 4, 18 ],
                py: [ 12, 13 ],
                pz: [ 0, -1 ],
                nx: [ 2, 8 ],
                ny: [ 3, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 10, 4 ],
                pz: [ 1, 2 ],
                nx: [ 3, 3 ],
                ny: [ 5, 0 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 9, 19 ],
                py: [ 7, 8 ],
                pz: [ 1, 0 ],
                nx: [ 8, 3 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 0 ],
                py: [ 6, 0 ],
                pz: [ 0, -1 ],
                nx: [ 0, 0 ],
                ny: [ 7, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 8, 8 ],
                py: [ 0, 0 ],
                pz: [ 1, -1 ],
                nx: [ 17, 18 ],
                ny: [ 0, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 4,
                px: [ 13, 4, 4, 1 ],
                py: [ 14, 7, 3, 5 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 3, 16, 3, 7 ],
                ny: [ 1, 15, 5, 13 ],
                nz: [ 2, 0, 2, 0 ]
            }, {
                size: 2,
                px: [ 4, 9 ],
                py: [ 6, 11 ],
                pz: [ 1, 0 ],
                nx: [ 3, 23 ],
                ny: [ 4, 8 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 9, 17, 4, 16, 16 ],
                py: [ 2, 3, 1, 3, 3 ],
                pz: [ 1, 0, 2, 0, -1 ],
                nx: [ 2, 3, 3, 2, 3 ],
                ny: [ 1, 7, 2, 3, 3 ],
                nz: [ 2, 1, 1, 1, 1 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 22, 9 ],
                pz: [ 0, 1 ],
                nx: [ 10, 3 ],
                ny: [ 21, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 6, 3 ],
                pz: [ 0, -1 ],
                nx: [ 8, 5 ],
                ny: [ 4, 3 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 8, 3 ],
                pz: [ 0, -1 ],
                nx: [ 14, 5 ],
                ny: [ 14, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 7, 8 ],
                py: [ 3, 2 ],
                pz: [ 0, -1 ],
                nx: [ 8, 2 ],
                ny: [ 18, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 19, 11 ],
                pz: [ 0, 1 ],
                nx: [ 9, 4 ],
                ny: [ 5, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 3, 3 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 7, 15, 13, 14, 4 ],
                py: [ 6, 12, 9, 11, 4 ],
                pz: [ 1, 0, 0, 0, 2 ],
                nx: [ 7, 3, 8, 4, 5 ],
                ny: [ 0, 3, 0, 2, 1 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 10, 13, 7, 8, 9 ],
                py: [ 0, 1, 1, 0, 1 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 7, 4, 4, 4, 8 ],
                ny: [ 8, 3, 4, 2, 4 ],
                nz: [ 1, 2, 2, 2, 1 ]
            }, {
                size: 2,
                px: [ 6, 1 ],
                py: [ 6, 0 ],
                pz: [ 1, -1 ],
                nx: [ 11, 7 ],
                ny: [ 3, 2 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 13, 0 ],
                py: [ 13, 2 ],
                pz: [ 0, -1 ],
                nx: [ 0, 1 ],
                ny: [ 13, 16 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 17 ],
                py: [ 6, 13 ],
                pz: [ 1, 0 ],
                nx: [ 8, 1 ],
                ny: [ 4, 16 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 12, 11, 3, 6, 17 ],
                py: [ 4, 4, 1, 2, 14 ],
                pz: [ 0, 0, 2, 1, 0 ],
                nx: [ 6, 23, 23, 6, 23 ],
                ny: [ 5, 7, 6, 6, 14 ],
                nz: [ 1, 0, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 5, 22 ],
                py: [ 4, 17 ],
                pz: [ 2, -1 ],
                nx: [ 4, 8 ],
                ny: [ 5, 7 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 15, 14 ],
                py: [ 1, 1 ],
                pz: [ 0, 0 ],
                nx: [ 4, 7 ],
                ny: [ 2, 4 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 15, 17 ],
                py: [ 12, 7 ],
                pz: [ 0, -1 ],
                nx: [ 14, 10 ],
                ny: [ 11, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 4,
                px: [ 10, 2, 9, 15 ],
                py: [ 5, 11, 1, 13 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 11, 3, 3, 13 ],
                ny: [ 1, 1, 0, 1 ],
                nz: [ 0, 2, 2, 0 ]
            }, {
                size: 2,
                px: [ 7, 21 ],
                py: [ 15, 22 ],
                pz: [ 0, -1 ],
                nx: [ 4, 9 ],
                ny: [ 8, 14 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 6, 5 ],
                py: [ 21, 2 ],
                pz: [ 0, -1 ],
                nx: [ 3, 5 ],
                ny: [ 11, 21 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 17, 7 ],
                py: [ 2, 0 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 5, 11 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 11, 8 ],
                py: [ 10, 4 ],
                pz: [ 0, -1 ],
                nx: [ 13, 12 ],
                ny: [ 3, 3 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 5 ],
                py: [ 2, 2 ],
                pz: [ 1, 1 ],
                nx: [ 7, 1 ],
                ny: [ 8, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 0, 0, 1, 0, 0 ],
                py: [ 12, 4, 14, 0, 2 ],
                pz: [ 0, 1, 0, 2, 2 ],
                nx: [ 9, 5, 8, 4, 4 ],
                ny: [ 6, 3, 6, 3, 3 ],
                nz: [ 0, 1, 0, 1, -1 ]
            }, {
                size: 5,
                px: [ 8, 0, 0, 3, 2 ],
                py: [ 6, 5, 0, 8, 2 ],
                pz: [ 1, -1, -1, -1, -1 ],
                nx: [ 23, 7, 22, 11, 4 ],
                ny: [ 12, 6, 14, 4, 3 ],
                nz: [ 0, 1, 0, 1, 2 ]
            }, {
                size: 4,
                px: [ 12, 12, 4, 8 ],
                py: [ 12, 11, 3, 10 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 0, 0, 0, 0 ],
                ny: [ 2, 1, 0, 3 ],
                nz: [ 1, 2, 2, 1 ]
            }, {
                size: 2,
                px: [ 10, 6 ],
                py: [ 7, 6 ],
                pz: [ 1, -1 ],
                nx: [ 16, 4 ],
                ny: [ 12, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 5,
                px: [ 2, 1, 3, 3, 3 ],
                py: [ 14, 8, 20, 21, 21 ],
                pz: [ 0, 1, 0, 0, -1 ],
                nx: [ 20, 10, 21, 21, 21 ],
                ny: [ 23, 11, 21, 23, 20 ],
                nz: [ 0, 1, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 13 ],
                py: [ 2, 4 ],
                pz: [ 1, 0 ],
                nx: [ 7, 21 ],
                ny: [ 8, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 12, 3 ],
                py: [ 17, 4 ],
                pz: [ 0, 2 ],
                nx: [ 11, 10 ],
                ny: [ 15, 7 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 11, 0, 19, 2 ],
                py: [ 15, 2, 23, 10 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 6, 8, 16, 2 ],
                ny: [ 13, 11, 10, 2 ],
                nz: [ 0, 0, 0, 2 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 14, 7 ],
                pz: [ 0, 1 ],
                nx: [ 3, 1 ],
                ny: [ 4, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 12, 17, 5, 10 ],
                py: [ 19, 15, 14, 3 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 4, 12, 6, 12 ],
                ny: [ 4, 18, 9, 22 ],
                nz: [ 1, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 8, 3 ],
                py: [ 13, 5 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 4, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 6, 5, 4, 5, 3 ],
                py: [ 2, 1, 2, 2, 0 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 7, 4, 9, 18, 18 ],
                ny: [ 4, 4, 7, 14, 14 ],
                nz: [ 1, 1, 1, 0, -1 ]
            }, {
                size: 4,
                px: [ 8, 3, 20, 1 ],
                py: [ 6, 3, 18, 0 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 13, 11, 5, 22 ],
                ny: [ 12, 6, 2, 17 ],
                nz: [ 0, 1, 2, 0 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 8, 5 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 21, 7 ],
                py: [ 14, 7 ],
                pz: [ 0, 1 ],
                nx: [ 16, 11 ],
                ny: [ 14, 6 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 4 ],
                py: [ 3, 1 ],
                pz: [ 0, -1 ],
                nx: [ 9, 5 ],
                ny: [ 0, 0 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 4, 10 ],
                py: [ 5, 8 ],
                pz: [ 2, 1 ],
                nx: [ 5, 14 ],
                ny: [ 9, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 2 ],
                py: [ 23, 4 ],
                pz: [ 0, 2 ],
                nx: [ 2, 2 ],
                ny: [ 5, 5 ],
                nz: [ 2, -1 ]
            }, {
                size: 5,
                px: [ 10, 9, 11, 10, 10 ],
                py: [ 2, 2, 1, 1, 1 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 2, 3, 2, 4, 5 ],
                ny: [ 4, 10, 2, 4, 3 ],
                nz: [ 2, 1, 1, 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 4 ],
                py: [ 13, 4 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 1 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 17, 5 ],
                py: [ 15, 1 ],
                pz: [ 0, -1 ],
                nx: [ 20, 19 ],
                ny: [ 14, 14 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 20, 18 ],
                pz: [ 0, 0 ],
                nx: [ 2, 1 ],
                ny: [ 23, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 1 ],
                py: [ 18, 3 ],
                pz: [ 0, 2 ],
                nx: [ 11, 3 ],
                ny: [ 16, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 8 ],
                py: [ 6, 10 ],
                pz: [ 1, 0 ],
                nx: [ 9, 0 ],
                ny: [ 9, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 20, 10 ],
                py: [ 21, 7 ],
                pz: [ 0, 1 ],
                nx: [ 7, 2 ],
                ny: [ 3, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 6 ],
                py: [ 4, 7 ],
                pz: [ 1, -1 ],
                nx: [ 23, 5 ],
                ny: [ 9, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 5,
                px: [ 2, 4, 5, 3, 4 ],
                py: [ 0, 1, 1, 2, 2 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 1, 0, 1, 1, 1 ],
                ny: [ 2, 1, 0, 1, 1 ],
                nz: [ 0, 1, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 16 ],
                py: [ 7, 13 ],
                pz: [ 1, 0 ],
                nx: [ 8, 3 ],
                ny: [ 4, 16 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 17, 15 ],
                py: [ 7, 19 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 4, 3 ],
                py: [ 11, 5 ],
                pz: [ 1, 2 ],
                nx: [ 7, 8 ],
                ny: [ 9, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 23, 11 ],
                py: [ 9, 6 ],
                pz: [ 0, 1 ],
                nx: [ 22, 22 ],
                ny: [ 23, 23 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 23, 23 ],
                py: [ 21, 20 ],
                pz: [ 0, 0 ],
                nx: [ 2, 2 ],
                ny: [ 5, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 17, 4 ],
                py: [ 12, 2 ],
                pz: [ 0, -1 ],
                nx: [ 9, 8 ],
                ny: [ 4, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 6, 14 ],
                py: [ 2, 4 ],
                pz: [ 1, 0 ],
                nx: [ 7, 18 ],
                ny: [ 1, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 20, 22 ],
                py: [ 1, 2 ],
                pz: [ 0, 0 ],
                nx: [ 23, 23 ],
                ny: [ 1, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 0, 1 ],
                py: [ 9, 10 ],
                pz: [ 1, 1 ],
                nx: [ 8, 0 ],
                ny: [ 15, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 11, 11, 6 ],
                py: [ 10, 11, 11 ],
                pz: [ 0, 0, -1 ],
                nx: [ 23, 23, 23 ],
                ny: [ 19, 21, 20 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 23, 23, 23, 6, 6 ],
                py: [ 21, 22, 22, 3, 6 ],
                pz: [ 0, 0, -1, -1, -1 ],
                nx: [ 8, 8, 8, 17, 4 ],
                ny: [ 7, 10, 8, 16, 5 ],
                nz: [ 1, 1, 1, 0, 2 ]
            }, {
                size: 2,
                px: [ 10, 23 ],
                py: [ 1, 22 ],
                pz: [ 0, -1 ],
                nx: [ 7, 2 ],
                ny: [ 11, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 7, 14 ],
                py: [ 3, 10 ],
                pz: [ 1, -1 ],
                nx: [ 5, 3 ],
                ny: [ 2, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 5, 3 ],
                py: [ 13, 7 ],
                pz: [ 0, 1 ],
                nx: [ 4, 10 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 0 ],
                py: [ 15, 6 ],
                pz: [ 0, -1 ],
                nx: [ 3, 6 ],
                ny: [ 1, 2 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 13, 4 ],
                py: [ 18, 17 ],
                pz: [ 0, -1 ],
                nx: [ 7, 6 ],
                ny: [ 10, 7 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 12, 11 ],
                py: [ 3, 8 ],
                pz: [ 0, -1 ],
                nx: [ 7, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 17, 4 ],
                py: [ 5, 7 ],
                pz: [ 0, 1 ],
                nx: [ 17, 10 ],
                ny: [ 4, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 16, 8, 16, 15, 15 ],
                py: [ 0, 0, 1, 0, 1 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 7, 4, 7, 4, 4 ],
                ny: [ 7, 5, 8, 1, 1 ],
                nz: [ 1, 2, 1, 2, -1 ]
            }, {
                size: 2,
                px: [ 13, 11 ],
                py: [ 5, 6 ],
                pz: [ 0, -1 ],
                nx: [ 4, 5 ],
                ny: [ 2, 2 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 16 ],
                py: [ 8, 10 ],
                pz: [ 0, 0 ],
                nx: [ 7, 2 ],
                ny: [ 3, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 8 ],
                py: [ 4, 11 ],
                pz: [ 1, 0 ],
                nx: [ 10, 1 ],
                ny: [ 9, 20 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 1 ],
                py: [ 4, 2 ],
                pz: [ 2, -1 ],
                nx: [ 23, 23 ],
                ny: [ 15, 16 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 9, 8, 2, 4, 9 ],
                py: [ 1, 1, 0, 1, 2 ],
                pz: [ 0, 0, 2, 1, 0 ],
                nx: [ 8, 3, 8, 4, 4 ],
                ny: [ 6, 2, 4, 2, 2 ],
                nz: [ 1, 2, 1, 2, -1 ]
            }, {
                size: 2,
                px: [ 13, 6 ],
                py: [ 10, 5 ],
                pz: [ 0, -1 ],
                nx: [ 13, 7 ],
                ny: [ 6, 3 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 10, 5 ],
                pz: [ 1, 2 ],
                nx: [ 10, 8 ],
                ny: [ 10, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 4 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 9, 14 ],
                ny: [ 4, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 5, 2, 15 ],
                py: [ 3, 1, 22 ],
                pz: [ 1, -1, -1 ],
                nx: [ 15, 9, 4 ],
                ny: [ 0, 1, 0 ],
                nz: [ 0, 1, 2 ]
            }, {
                size: 2,
                px: [ 10, 19 ],
                py: [ 9, 21 ],
                pz: [ 1, 0 ],
                nx: [ 2, 17 ],
                ny: [ 5, 14 ],
                nz: [ 2, -1 ]
            }, {
                size: 3,
                px: [ 16, 2, 1 ],
                py: [ 2, 10, 4 ],
                pz: [ 0, -1, -1 ],
                nx: [ 4, 4, 9 ],
                ny: [ 3, 2, 6 ],
                nz: [ 2, 2, 1 ]
            }, {
                size: 2,
                px: [ 10, 2 ],
                py: [ 6, 10 ],
                pz: [ 1, -1 ],
                nx: [ 21, 22 ],
                ny: [ 16, 12 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 7, 16 ],
                py: [ 4, 23 ],
                pz: [ 0, -1 ],
                nx: [ 7, 3 ],
                ny: [ 3, 3 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 13, 14 ],
                pz: [ 0, 0 ],
                nx: [ 1, 2 ],
                ny: [ 18, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 18, 5 ],
                py: [ 13, 4 ],
                pz: [ 0, -1 ],
                nx: [ 4, 13 ],
                ny: [ 2, 11 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 18, 17 ],
                py: [ 3, 3 ],
                pz: [ 0, 0 ],
                nx: [ 19, 19 ],
                ny: [ 1, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 5 ],
                py: [ 0, 5 ],
                pz: [ 1, -1 ],
                nx: [ 12, 3 ],
                ny: [ 5, 1 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 5, 3 ],
                py: [ 2, 1 ],
                pz: [ 1, 2 ],
                nx: [ 18, 4 ],
                ny: [ 4, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 13, 13, 2, 10, 15 ],
                py: [ 11, 12, 13, 17, 23 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 12, 13, 4, 3, 8 ],
                ny: [ 4, 4, 1, 0, 3 ],
                nz: [ 0, 0, 2, 2, 1 ]
            }, {
                size: 2,
                px: [ 9, 3 ],
                py: [ 2, 2 ],
                pz: [ 0, -1 ],
                nx: [ 4, 2 ],
                ny: [ 7, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 13, 4 ],
                py: [ 5, 1 ],
                pz: [ 0, -1 ],
                nx: [ 18, 4 ],
                ny: [ 12, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 19, 4 ],
                py: [ 11, 1 ],
                pz: [ 0, -1 ],
                nx: [ 4, 7 ],
                ny: [ 2, 2 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 3, 2 ],
                ny: [ 4, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 4, 0 ],
                py: [ 7, 7 ],
                pz: [ 0, -1 ],
                nx: [ 4, 9 ],
                ny: [ 0, 2 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 4, 9 ],
                py: [ 0, 2 ],
                pz: [ 2, 1 ],
                nx: [ 6, 4 ],
                ny: [ 3, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 9, 4 ],
                pz: [ 1, 2 ],
                nx: [ 13, 5 ],
                ny: [ 18, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 5, 23, 23 ],
                py: [ 2, 8, 7 ],
                pz: [ 2, 0, 0 ],
                nx: [ 10, 12, 1 ],
                ny: [ 4, 1, 0 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 13, 0 ],
                py: [ 3, 3 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 2, 3 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 6, 5 ],
                py: [ 10, 5 ],
                pz: [ 0, -1 ],
                nx: [ 0, 0 ],
                ny: [ 4, 11 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 11, 2 ],
                py: [ 14, 11 ],
                pz: [ 0, -1 ],
                nx: [ 10, 11 ],
                ny: [ 4, 13 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 5, 6 ],
                py: [ 21, 23 ],
                pz: [ 0, 0 ],
                nx: [ 7, 0 ],
                ny: [ 21, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 8, 5 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 6 ],
                py: [ 8, 8 ],
                pz: [ 0, 0 ],
                nx: [ 6, 14 ],
                ny: [ 9, 15 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 16, 6 ],
                py: [ 4, 8 ],
                pz: [ 0, -1 ],
                nx: [ 16, 8 ],
                ny: [ 0, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 4,
                px: [ 3, 6, 0, 9 ],
                py: [ 0, 8, 5, 23 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 12, 2, 6, 10 ],
                ny: [ 5, 0, 3, 5 ],
                nz: [ 0, 2, 1, 0 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 7, 13 ],
                pz: [ 1, 0 ],
                nx: [ 3, 9 ],
                ny: [ 4, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 2, 5 ],
                py: [ 8, 23 ],
                pz: [ 1, 0 ],
                nx: [ 8, 9 ],
                ny: [ 15, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 18 ],
                py: [ 8, 0 ],
                pz: [ 0, -1 ],
                nx: [ 1, 1 ],
                ny: [ 9, 8 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 2, 7 ],
                py: [ 4, 21 ],
                pz: [ 2, 0 ],
                nx: [ 13, 11 ],
                ny: [ 8, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 4 ],
                py: [ 8, 8 ],
                pz: [ 0, 0 ],
                nx: [ 6, 1 ],
                ny: [ 8, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 7, 3 ],
                py: [ 20, 7 ],
                pz: [ 0, -1 ],
                nx: [ 4, 3 ],
                ny: [ 10, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 8, 7 ],
                pz: [ 1, -1 ],
                nx: [ 1, 2 ],
                ny: [ 4, 9 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 5, 10 ],
                py: [ 5, 13 ],
                pz: [ 1, -1 ],
                nx: [ 3, 6 ],
                ny: [ 1, 2 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 12, 5 ],
                py: [ 6, 3 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 4, 4 ],
                pz: [ 1, -1 ],
                nx: [ 5, 11 ],
                ny: [ 2, 5 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 11, 23, 11, 23, 11 ],
                py: [ 4, 9, 5, 10, 6 ],
                pz: [ 1, 0, 1, 0, 1 ],
                nx: [ 7, 14, 13, 7, 3 ],
                ny: [ 9, 5, 6, 4, 4 ],
                nz: [ 0, 0, 0, 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 5 ],
                py: [ 0, 0 ],
                pz: [ 1, -1 ],
                nx: [ 9, 20 ],
                ny: [ 1, 4 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 19, 20 ],
                py: [ 0, 3 ],
                pz: [ 0, 0 ],
                nx: [ 4, 6 ],
                ny: [ 11, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 13, 5, 20, 5 ],
                py: [ 14, 3, 23, 4 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 8, 15, 7, 16 ],
                ny: [ 8, 14, 6, 15 ],
                nz: [ 1, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 10, 20 ],
                py: [ 5, 17 ],
                pz: [ 0, -1 ],
                nx: [ 7, 3 ],
                ny: [ 10, 1 ],
                nz: [ 0, 2 ]
            }, {
                size: 3,
                px: [ 1, 12, 7 ],
                py: [ 3, 7, 10 ],
                pz: [ 2, 0, 0 ],
                nx: [ 2, 2, 3 ],
                ny: [ 3, 2, 2 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 3,
                px: [ 10, 5, 7 ],
                py: [ 7, 10, 10 ],
                pz: [ 1, -1, -1 ],
                nx: [ 10, 10, 18 ],
                ny: [ 10, 9, 23 ],
                nz: [ 1, 1, 0 ]
            }, {
                size: 3,
                px: [ 14, 14, 4 ],
                py: [ 3, 3, 4 ],
                pz: [ 0, -1, -1 ],
                nx: [ 4, 4, 8 ],
                ny: [ 3, 2, 6 ],
                nz: [ 2, 2, 1 ]
            }, {
                size: 2,
                px: [ 4, 12 ],
                py: [ 4, 17 ],
                pz: [ 2, 0 ],
                nx: [ 13, 1 ],
                ny: [ 15, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 20 ],
                py: [ 9, 22 ],
                pz: [ 0, -1 ],
                nx: [ 9, 4 ],
                ny: [ 2, 0 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 11, 2 ],
                py: [ 3, 6 ],
                pz: [ 0, -1 ],
                nx: [ 2, 4 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 3,
                px: [ 15, 10, 1 ],
                py: [ 12, 2, 3 ],
                pz: [ 0, -1, -1 ],
                nx: [ 7, 5, 10 ],
                ny: [ 2, 1, 1 ],
                nz: [ 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 9, 11, 10, 12, 12 ],
                py: [ 0, 0, 0, 0, 0 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 8, 4, 16, 5, 10 ],
                ny: [ 4, 4, 10, 3, 6 ],
                nz: [ 1, 1, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 0, 10 ],
                py: [ 3, 5 ],
                pz: [ 2, -1 ],
                nx: [ 3, 6 ],
                ny: [ 0, 1 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 7, 8, 7, 2, 12 ],
                py: [ 14, 13, 13, 16, 0 ],
                pz: [ 0, 0, -1, -1, -1 ],
                nx: [ 10, 1, 10, 1, 1 ],
                ny: [ 13, 2, 12, 4, 9 ],
                nz: [ 0, 2, 0, 1, 0 ]
            }, {
                size: 3,
                px: [ 6, 14, 13 ],
                py: [ 1, 2, 1 ],
                pz: [ 1, 0, 0 ],
                nx: [ 8, 21, 10 ],
                ny: [ 4, 23, 12 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 19, 19 ],
                py: [ 22, 21 ],
                pz: [ 0, 0 ],
                nx: [ 20, 1 ],
                ny: [ 22, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 12 ],
                py: [ 19, 22 ],
                pz: [ 0, -1 ],
                nx: [ 2, 3 ],
                ny: [ 0, 1 ],
                nz: [ 2, 1 ]
            }, {
                size: 4,
                px: [ 11, 9, 21, 4 ],
                py: [ 13, 3, 19, 5 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 9, 9, 9, 5 ],
                ny: [ 13, 14, 12, 6 ],
                nz: [ 0, 0, 0, 1 ]
            }, {
                size: 4,
                px: [ 11, 12, 13, 14 ],
                py: [ 22, 22, 22, 22 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 13, 2, 4, 5 ],
                ny: [ 20, 0, 0, 6 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 3, 1 ],
                ny: [ 4, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 0, 1 ],
                pz: [ 2, 2 ],
                nx: [ 9, 4 ],
                ny: [ 6, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 17, 0 ],
                py: [ 10, 1 ],
                pz: [ 0, -1 ],
                nx: [ 9, 4 ],
                ny: [ 3, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 10, 4 ],
                py: [ 3, 1 ],
                pz: [ 1, 2 ],
                nx: [ 12, 18 ],
                ny: [ 17, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 2, 3, 4 ],
                py: [ 4, 3, 9 ],
                pz: [ 2, 2, 1 ],
                nx: [ 0, 3, 17 ],
                ny: [ 0, 1, 18 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 7, 3 ],
                py: [ 12, 6 ],
                pz: [ 0, 1 ],
                nx: [ 5, 1 ],
                ny: [ 11, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 17 ],
                py: [ 20, 6 ],
                pz: [ 0, -1 ],
                nx: [ 5, 2 ],
                ny: [ 9, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 8, 11 ],
                py: [ 18, 2 ],
                pz: [ 0, -1 ],
                nx: [ 5, 4 ],
                ny: [ 9, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 16, 15 ],
                py: [ 2, 2 ],
                pz: [ 0, 0 ],
                nx: [ 17, 12 ],
                ny: [ 2, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 18, 4 ],
                py: [ 5, 5 ],
                pz: [ 0, -1 ],
                nx: [ 7, 5 ],
                ny: [ 23, 19 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 13 ],
                py: [ 23, 23 ],
                pz: [ 0, 0 ],
                nx: [ 7, 11 ],
                ny: [ 10, 20 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 10 ],
                py: [ 3, 18 ],
                pz: [ 2, -1 ],
                nx: [ 9, 9 ],
                ny: [ 5, 6 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 5, 10 ],
                py: [ 2, 4 ],
                pz: [ 1, 0 ],
                nx: [ 4, 23 ],
                ny: [ 4, 20 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 2, 3 ],
                py: [ 8, 1 ],
                pz: [ 1, -1 ],
                nx: [ 15, 12 ],
                ny: [ 2, 1 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 7 ],
                py: [ 3, 10 ],
                pz: [ 2, 1 ],
                nx: [ 10, 1 ],
                ny: [ 20, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 10, 11 ],
                pz: [ 0, 0 ],
                nx: [ 22, 3 ],
                ny: [ 5, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 8, 17, 17, 9, 18 ],
                py: [ 0, 1, 0, 1, 0 ],
                pz: [ 1, 0, 0, 1, 0 ],
                nx: [ 11, 8, 9, 4, 4 ],
                ny: [ 23, 4, 6, 2, 2 ],
                nz: [ 0, 1, 0, 2, -1 ]
            }, {
                size: 2,
                px: [ 5, 5 ],
                py: [ 4, 4 ],
                pz: [ 1, -1 ],
                nx: [ 13, 4 ],
                ny: [ 9, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 5,
                px: [ 9, 4, 8, 7, 7 ],
                py: [ 3, 1, 3, 3, 3 ],
                pz: [ 0, 1, 0, 0, -1 ],
                nx: [ 4, 2, 5, 3, 2 ],
                ny: [ 1, 15, 1, 4, 13 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 17, 7 ],
                py: [ 13, 7 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 1, 2 ],
                py: [ 1, 12 ],
                pz: [ 2, 0 ],
                nx: [ 9, 21 ],
                ny: [ 5, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 12, 0 ],
                py: [ 14, 1 ],
                pz: [ 0, -1 ],
                nx: [ 1, 1 ],
                ny: [ 19, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 16, 1 ],
                py: [ 5, 9 ],
                pz: [ 0, -1 ],
                nx: [ 16, 15 ],
                ny: [ 3, 3 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 8 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 6 ],
                py: [ 17, 15 ],
                pz: [ 0, 0 ],
                nx: [ 11, 0 ],
                ny: [ 16, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 12, 11, 0, 3 ],
                py: [ 16, 8, 7, 1 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 10, 5, 10, 5 ],
                ny: [ 11, 9, 10, 8 ],
                nz: [ 0, 1, 0, 1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 7, 13 ],
                pz: [ 1, 0 ],
                nx: [ 4, 14 ],
                ny: [ 4, 16 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 17 ],
                py: [ 6, 13 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 4, 9 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 15, 11 ],
                py: [ 3, 2 ],
                pz: [ 0, -1 ],
                nx: [ 4, 15 ],
                ny: [ 1, 2 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 10, 11 ],
                py: [ 18, 4 ],
                pz: [ 0, -1 ],
                nx: [ 5, 5 ],
                ny: [ 8, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 7, 4 ],
                pz: [ 1, 2 ],
                nx: [ 4, 3 ],
                ny: [ 5, 7 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 12, 4 ],
                py: [ 15, 4 ],
                pz: [ 0, -1 ],
                nx: [ 11, 8 ],
                ny: [ 14, 19 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 18, 13 ],
                py: [ 13, 20 ],
                pz: [ 0, 0 ],
                nx: [ 13, 4 ],
                ny: [ 18, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 12, 4 ],
                py: [ 6, 3 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 21, 5, 11, 5, 10 ],
                py: [ 1, 1, 3, 0, 0 ],
                pz: [ 0, 2, 1, 2, 1 ],
                nx: [ 7, 14, 15, 4, 8 ],
                ny: [ 3, 6, 11, 3, 4 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 10, 6 ],
                py: [ 15, 10 ],
                pz: [ 0, -1 ],
                nx: [ 21, 22 ],
                ny: [ 14, 12 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 18, 0 ],
                py: [ 20, 0 ],
                pz: [ 0, -1 ],
                nx: [ 2, 3 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 12, 6, 13, 11, 7 ],
                py: [ 1, 1, 1, 2, 1 ],
                pz: [ 0, 1, 0, 0, 1 ],
                nx: [ 7, 6, 8, 5, 5 ],
                ny: [ 4, 15, 4, 16, 16 ],
                nz: [ 1, 0, 1, 0, -1 ]
            }, {
                size: 3,
                px: [ 22, 21, 21 ],
                py: [ 14, 15, 17 ],
                pz: [ 0, 0, 0 ],
                nx: [ 5, 9, 4 ],
                ny: [ 0, 5, 0 ],
                nz: [ 2, -1, -1 ]
            }, {
                size: 2,
                px: [ 10, 2 ],
                py: [ 14, 1 ],
                pz: [ 0, -1 ],
                nx: [ 23, 11 ],
                ny: [ 16, 8 ],
                nz: [ 0, 1 ]
            }, {
                size: 4,
                px: [ 21, 21, 0, 18 ],
                py: [ 14, 15, 5, 4 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 8, 8, 9, 4 ],
                ny: [ 7, 8, 10, 5 ],
                nz: [ 1, 1, 1, 2 ]
            }, {
                size: 2,
                px: [ 15, 5 ],
                py: [ 18, 1 ],
                pz: [ 0, -1 ],
                nx: [ 23, 23 ],
                ny: [ 16, 18 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 15, 14 ],
                py: [ 1, 1 ],
                pz: [ 0, 0 ],
                nx: [ 4, 4 ],
                ny: [ 2, 3 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 2, 6 ],
                py: [ 6, 5 ],
                pz: [ 1, -1 ],
                nx: [ 14, 11 ],
                ny: [ 1, 1 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 17 ],
                py: [ 2, 8 ],
                pz: [ 2, 0 ],
                nx: [ 8, 3 ],
                ny: [ 4, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 17, 8 ],
                py: [ 13, 10 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 8, 3 ],
                pz: [ 0, 1 ],
                nx: [ 1, 11 ],
                ny: [ 4, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 8 ],
                py: [ 5, 0 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 3, 1 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 5, 3 ],
                pz: [ 1, 2 ],
                nx: [ 1, 18 ],
                ny: [ 5, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 3 ],
                py: [ 6, 6 ],
                pz: [ 0, 1 ],
                nx: [ 7, 12 ],
                ny: [ 5, 20 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 1 ],
                py: [ 0, 5 ],
                pz: [ 0, -1 ],
                nx: [ 4, 2 ],
                ny: [ 9, 3 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 10, 11 ],
                pz: [ 0, 0 ],
                nx: [ 0, 5 ],
                ny: [ 5, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 1 ],
                py: [ 23, 4 ],
                pz: [ 0, 2 ],
                nx: [ 0, 0 ],
                ny: [ 13, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 1 ],
                py: [ 6, 4 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 4, 5 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 7, 6 ],
                py: [ 6, 5 ],
                pz: [ 1, 1 ],
                nx: [ 3, 9 ],
                ny: [ 4, 16 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 3 ],
                py: [ 9, 13 ],
                pz: [ 0, -1 ],
                nx: [ 4, 10 ],
                ny: [ 3, 7 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 13, 9, 6, 10, 10 ],
                py: [ 2, 2, 1, 2, 2 ],
                pz: [ 0, 0, 1, 0, -1 ],
                nx: [ 7, 5, 6, 5, 6 ],
                ny: [ 0, 2, 2, 1, 1 ],
                nz: [ 0, 0, 0, 0, 0 ]
            } ],
            alpha: [ -1.119615, 1.119615, -.8169953, .8169953, -.5291213, .5291213, -.4904488, .4904488, -.4930982, .4930982, -.4106179, .4106179, -.4246842, .4246842, -.3802383, .3802383, -.3364358, .3364358, -.3214186, .3214186, -.3210798, .3210798, -.2993167, .2993167, -.3426336, .3426336, -.3199184, .3199184, -.3061071, .3061071, -.2758972, .2758972, -.307559, .307559, -.3009565, .3009565, -.2015739, .2015739, -.2603266, .2603266, -.2772993, .2772993, -.2184913, .2184913, -.2306681, .2306681, -.1983223, .1983223, -.219476, .219476, -.2528421, .2528421, -.2436416, .2436416, -.3032886, .3032886, -.2556071, .2556071, -.256217, .256217, -.1930298, .1930298, -.2735898, .2735898, -.1814703, .1814703, -.2054824, .2054824, -.1986146, .1986146, -.1769226, .1769226, -.1775257, .1775257, -.2167927, .2167927, -.1823633, .1823633, -.158428, .158428, -.1778321, .1778321, -.1826777, .1826777, -.1979903, .1979903, -.1898326, .1898326, -.1835506, .1835506, -.196786, .196786, -.1871528, .1871528, -.1772414, .1772414, -.1985514, .1985514, -.2144078, .2144078, -.2742303, .2742303, -.224055, .224055, -.2132534, .2132534, -.1552127, .1552127, -.1568276, .1568276, -.1630086, .1630086, -.1458232, .1458232, -.1559541, .1559541, -.1720131, .1720131, -.1708434, .1708434, -.1624431, .1624431, -.1814161, .1814161, -.1552639, .1552639, -.1242354, .1242354, -.1552139, .1552139, -.1694359, .1694359, -.1801481, .1801481, -.1387182, .1387182, -.1409679, .1409679, -.1486724, .1486724, -.1779553, .1779553, -.1524595, .1524595, -.1788086, .1788086, -.1671479, .1671479, -.1376197, .1376197, -.1511808, .1511808, -.1524632, .1524632, -.1198986, .1198986, -.1382641, .1382641, -.1148901, .1148901, -.1131803, .1131803, -.1273508, .1273508, -.1405125, .1405125, -.1322132, .1322132, -.1386966, .1386966, -.1275621, .1275621, -.1180573, .1180573, -.1238803, .1238803, -.1428389, .1428389, -.1694437, .1694437, -.1290855, .1290855, -.152026, .152026, -.1398282, .1398282, -.1890736, .1890736, -.2280428, .2280428, -.1325099, .1325099, -.1342873, .1342873, -.1463841, .1463841, -.1983567, .1983567, -.1585711, .1585711, -.1260154, .1260154, -.1426774, .1426774, -.1554278, .1554278, -.1361201, .1361201, -.1181856, .1181856, -.1255941, .1255941, -.1113275, .1113275, -.1506576, .1506576, -.1202859, .1202859, -.2159751, .2159751, -.144315, .144315, -.1379194, .1379194, -.1805758, .1805758, -.1465612, .1465612, -.1328856, .1328856, -.1532173, .1532173, -.1590635, .1590635, -.1462229, .1462229, -.1350012, .1350012, -.1195634, .1195634, -.1173221, .1173221, -.1192867, .1192867, -.1595013, .1595013, -.1209751, .1209751, -.157129, .157129, -.1527274, .1527274, -.1373708, .1373708, -.1318313, .1318313, -.1273391, .1273391, -.1271365, .1271365, -.1528693, .1528693, -.1590476, .1590476, -.1581911, .1581911, -.1183023, .1183023, -.1559822, .1559822, -.1214999, .1214999, -.1283378, .1283378, -.1542583, .1542583, -.1336377, .1336377, -.1800416, .1800416, -.1710931, .1710931, -.1621737, .1621737, -.1239002, .1239002, -.1432928, .1432928, -.1392447, .1392447, -.1383938, .1383938, -.1357633, .1357633, -.1175842, .1175842, -.1085318, .1085318, -.1148885, .1148885, -.1320396, .1320396, -.1351204, .1351204, -.1581518, .1581518, -.1459574, .1459574, -.1180068, .1180068, -.1464196, .1464196, -.1179543, .1179543, -.1004204, .1004204, -.129466, .129466, -.1534244, .1534244, -.137897, .137897, -.1226545, .1226545, -.1281182, .1281182, -.1201471, .1201471, -.1448701, .1448701, -.129098, .129098, -.1388764, .1388764, -.09605773, .09605773, -.1411021, .1411021, -.1295693, .1295693, -.1371739, .1371739, -.1167579, .1167579, -.1400486, .1400486, -.1214224, .1214224, -.1287835, .1287835, -.1197646, .1197646, -.1192358, .1192358, -.1218651, .1218651, -.1564816, .1564816, -.1172391, .1172391, -.1342268, .1342268, -.1492471, .1492471, -.1157299, .1157299, -.1046703, .1046703, -.1255571, .1255571, -.1100135, .1100135, -.1501592, .1501592, -.1155712, .1155712, -.1145563, .1145563, -.1013425, .1013425, -.1145783, .1145783, -.1328031, .1328031, -.1077413, .1077413, -.1064996, .1064996, -.119117, .119117, -.1213217, .1213217, -.1260969, .1260969, -.1156494, .1156494, -.1268126, .1268126, -.1070999, .1070999, -.1112365, .1112365, -.1243916, .1243916, -.1283152, .1283152, -.1166925, .1166925, -.08997633, .08997633, -.158384, .158384, -.1211178, .1211178, -.109083, .109083, -.1030818, .1030818, -.14406, .14406, -.1458713, .1458713, -.1559082, .1559082, -.1058868, .1058868, -.101013, .101013, -.1642301, .1642301, -.123685, .123685, -.1467589, .1467589, -.1109359, .1109359, -.1673655, .1673655, -.1239984, .1239984, -.1039509, .1039509, -.1089378, .1089378, -.1545085, .1545085, -.1200862, .1200862, -.1105608, .1105608, -.1235262, .1235262, -.08496153, .08496153, -.1181372, .1181372, -.1139467, .1139467, -.1189317, .1189317, -.1266519, .1266519, -.09470736, .09470736, -.1336735, .1336735, -.08726601, .08726601, -.1304782, .1304782, -.1186529, .1186529, -.1355944, .1355944, -.09568801, .09568801, -.1282618, .1282618, -.1625632, .1625632, -.1167652, .1167652, -.1001301, .1001301, -.1292419, .1292419, -.1904213, .1904213, -.1511542, .1511542, -.09814394, .09814394, -.1171564, .1171564, -.09806486, .09806486, -.09217615, .09217615, -.08505645, .08505645, -.1573637, .1573637, -.1419174, .1419174, -.1298601, .1298601, -.1120613, .1120613, -.1158363, .1158363, -.1090957, .1090957, -.1204516, .1204516, -.1139852, .1139852, -.09642479, .09642479, -.1410872, .1410872, -.1142779, .1142779, -.1043991, .1043991, -.09736463, .09736463, -.1451046, .1451046, -.1205668, .1205668, -.09881445, .09881445, -.1612822, .1612822, -.1175681, .1175681, -.1522528, .1522528, -.161752, .161752, -.1582938, .1582938, -.1208202, .1208202, -.1016003, .1016003, -.1232059, .1232059, -.09583025, .09583025, -.101399, .101399, -.1178752, .1178752, -.1215972, .1215972, -.1294932, .1294932, -.115827, .115827, -.1008645, .1008645, -.0969919, .0969919, -.1022144, .1022144, -.09878768, .09878768, -.1339052, .1339052, -.09279961, .09279961, -.1047606, .1047606, -.1141163, .1141163, -.12676, .12676, -.1252763, .1252763, -.09775003, .09775003, -.09169116, .09169116, -.1006496, .1006496, -.09493293, .09493293, -.1213694, .1213694, -.1109243, .1109243, -.1115973, .1115973, -.07979327, .07979327, -.09220953, .09220953, -.1028913, .1028913, -.125351, .125351 ]
        }, {
            count: 391,
            threshold: -4.665692,
            feature: [ {
                size: 5,
                px: [ 14, 9, 11, 17, 12 ],
                py: [ 2, 3, 9, 13, 3 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 21, 8, 7, 20, 13 ],
                ny: [ 16, 10, 7, 7, 9 ],
                nz: [ 0, 1, 1, 0, 0 ]
            }, {
                size: 5,
                px: [ 12, 10, 6, 11, 13 ],
                py: [ 9, 3, 13, 3, 4 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 10, 4, 5, 10, 2 ],
                ny: [ 9, 10, 8, 8, 2 ],
                nz: [ 0, 1, 1, 0, 2 ]
            }, {
                size: 5,
                px: [ 6, 9, 7, 8, 8 ],
                py: [ 3, 3, 3, 3, 3 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 0, 0, 0, 4, 9 ],
                ny: [ 4, 2, 3, 10, 8 ],
                nz: [ 0, 0, 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 6, 2, 16, 6, 8 ],
                py: [ 16, 2, 11, 4, 11 ],
                pz: [ 0, 2, 0, 1, 0 ],
                nx: [ 3, 8, 4, 1, 1 ],
                ny: [ 4, 4, 4, 5, 13 ],
                nz: [ 1, 1, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 16, 13, 9 ],
                py: [ 23, 18, 10 ],
                pz: [ 0, 0, 1 ],
                nx: [ 14, 15, 8 ],
                ny: [ 21, 22, 3 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 5,
                px: [ 9, 16, 19, 17, 17 ],
                py: [ 1, 2, 3, 2, 2 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 23, 23, 23, 23, 23 ],
                ny: [ 6, 2, 1, 3, 5 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 12, 12 ],
                py: [ 10, 11, 12, 13, 13 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 4, 8, 14, 4, 6 ],
                ny: [ 2, 4, 7, 4, 8 ],
                nz: [ 2, 1, 0, 1, 1 ]
            }, {
                size: 5,
                px: [ 1, 2, 3, 6, 4 ],
                py: [ 6, 10, 12, 23, 13 ],
                pz: [ 1, 1, 0, 0, 0 ],
                nx: [ 2, 0, 0, 1, 1 ],
                ny: [ 23, 5, 10, 21, 21 ],
                nz: [ 0, 2, 1, 0, -1 ]
            }, {
                size: 5,
                px: [ 12, 16, 12, 4, 12 ],
                py: [ 6, 17, 7, 2, 8 ],
                pz: [ 0, 0, 0, 2, 0 ],
                nx: [ 8, 8, 12, 0, 6 ],
                ny: [ 4, 4, 16, 0, 8 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 9, 2 ],
                py: [ 18, 4 ],
                pz: [ 0, -1 ],
                nx: [ 4, 9 ],
                ny: [ 10, 16 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 9, 9, 2, 0, 12 ],
                py: [ 6, 6, 21, 4, 8 ],
                pz: [ 1, -1, -1, -1, -1 ],
                nx: [ 8, 4, 9, 7, 7 ],
                ny: [ 10, 2, 4, 5, 8 ],
                nz: [ 1, 2, 1, 1, 1 ]
            }, {
                size: 5,
                px: [ 10, 10, 10, 18, 19 ],
                py: [ 10, 8, 7, 14, 14 ],
                pz: [ 1, 1, 1, 0, 0 ],
                nx: [ 21, 23, 22, 22, 11 ],
                ny: [ 23, 19, 21, 22, 10 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 12, 3, 15, 4, 19 ],
                py: [ 14, 0, 5, 5, 14 ],
                pz: [ 0, -1, -1, -1, -1 ],
                nx: [ 12, 17, 15, 3, 8 ],
                ny: [ 18, 18, 14, 2, 10 ],
                nz: [ 0, 0, 0, 2, 0 ]
            }, {
                size: 5,
                px: [ 8, 11, 3, 11, 4 ],
                py: [ 23, 7, 9, 8, 8 ],
                pz: [ 0, 0, 1, 0, 1 ],
                nx: [ 8, 0, 10, 0, 8 ],
                ny: [ 8, 2, 8, 4, 10 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 10, 11, 12, 8, 4 ],
                py: [ 3, 0, 0, 1, 1 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 2, 3, 4, 3, 3 ],
                ny: [ 14, 5, 0, 1, 2 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 11 ],
                py: [ 7, 0 ],
                pz: [ 1, -1 ],
                nx: [ 5, 2 ],
                ny: [ 9, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 7, 1, 0, 10, 1 ],
                py: [ 0, 0, 2, 12, 6 ],
                pz: [ 0, 2, 2, 0, 1 ],
                nx: [ 4, 6, 2, 8, 8 ],
                ny: [ 4, 11, 2, 4, 4 ],
                nz: [ 1, 1, 2, 1, -1 ]
            }, {
                size: 2,
                px: [ 4, 15 ],
                py: [ 4, 12 ],
                pz: [ 2, 0 ],
                nx: [ 4, 6 ],
                ny: [ 5, 11 ],
                nz: [ 2, -1 ]
            }, {
                size: 5,
                px: [ 9, 4, 16, 14, 14 ],
                py: [ 8, 4, 23, 18, 18 ],
                pz: [ 1, 2, 0, 0, -1 ],
                nx: [ 0, 2, 1, 1, 0 ],
                ny: [ 2, 0, 3, 2, 3 ],
                nz: [ 1, 0, 0, 0, 1 ]
            }, {
                size: 5,
                px: [ 17, 7, 7, 18, 19 ],
                py: [ 7, 11, 8, 7, 7 ],
                pz: [ 0, 1, 1, 0, 0 ],
                nx: [ 17, 5, 8, 2, 0 ],
                ny: [ 8, 0, 7, 5, 3 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 5, 14 ],
                py: [ 12, 3 ],
                pz: [ 0, -1 ],
                nx: [ 4, 3 ],
                ny: [ 5, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 10, 8, 16, 11, 11 ],
                py: [ 5, 6, 12, 4, 4 ],
                pz: [ 0, 1, 0, 0, -1 ],
                nx: [ 14, 13, 5, 9, 5 ],
                ny: [ 13, 10, 1, 4, 2 ],
                nz: [ 0, 0, 2, 1, 2 ]
            }, {
                size: 5,
                px: [ 15, 14, 16, 8, 8 ],
                py: [ 2, 2, 2, 0, 0 ],
                pz: [ 0, 0, 0, 1, -1 ],
                nx: [ 9, 18, 19, 18, 17 ],
                ny: [ 0, 0, 2, 1, 0 ],
                nz: [ 1, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 17, 15 ],
                py: [ 12, 11 ],
                pz: [ 0, 0 ],
                nx: [ 14, 4 ],
                ny: [ 9, 15 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 5, 11, 11 ],
                py: [ 3, 4, 5 ],
                pz: [ 2, 1, 1 ],
                nx: [ 14, 3, 18 ],
                ny: [ 6, 5, 0 ],
                nz: [ 0, 1, -1 ]
            }, {
                size: 5,
                px: [ 16, 14, 17, 15, 9 ],
                py: [ 2, 2, 2, 2, 1 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 21, 20, 11, 21, 21 ],
                ny: [ 2, 0, 7, 3, 3 ],
                nz: [ 0, 0, 1, 0, -1 ]
            }, {
                size: 5,
                px: [ 2, 1, 1, 1, 5 ],
                py: [ 12, 9, 7, 3, 6 ],
                pz: [ 0, 0, 1, 1, 1 ],
                nx: [ 4, 8, 3, 4, 17 ],
                ny: [ 4, 4, 0, 8, 0 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 9, 2 ],
                ny: [ 4, 17 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 5 ],
                py: [ 16, 9 ],
                pz: [ 0, 1 ],
                nx: [ 10, 17 ],
                ny: [ 16, 8 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 11, 5, 9, 15 ],
                py: [ 14, 9, 11, 5 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 10, 1, 9, 4 ],
                ny: [ 9, 2, 13, 7 ],
                nz: [ 0, 2, 0, 1 ]
            }, {
                size: 5,
                px: [ 2, 5, 10, 7, 10 ],
                py: [ 7, 12, 2, 13, 3 ],
                pz: [ 1, -1, -1, -1, -1 ],
                nx: [ 5, 2, 3, 3, 2 ],
                ny: [ 23, 15, 17, 16, 14 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 7 ],
                py: [ 8, 10 ],
                pz: [ 0, -1 ],
                nx: [ 7, 14 ],
                ny: [ 5, 8 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 9, 16 ],
                py: [ 7, 23 ],
                pz: [ 1, 0 ],
                nx: [ 4, 4 ],
                ny: [ 2, 1 ],
                nz: [ 2, -1 ]
            }, {
                size: 5,
                px: [ 16, 14, 18, 4, 17 ],
                py: [ 0, 0, 4, 0, 1 ],
                pz: [ 0, 0, 0, 2, 0 ],
                nx: [ 8, 8, 16, 9, 9 ],
                ny: [ 5, 4, 11, 7, 7 ],
                nz: [ 1, 1, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 12, 13, 7, 8, 4 ],
                py: [ 9, 12, 6, 11, 5 ],
                pz: [ 0, 0, 1, 1, 2 ],
                nx: [ 23, 23, 16, 9, 9 ],
                ny: [ 0, 1, 11, 7, 7 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 6, 7, 2 ],
                py: [ 21, 23, 4 ],
                pz: [ 0, 0, 2 ],
                nx: [ 4, 1, 16 ],
                ny: [ 10, 5, 11 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 3, 4 ],
                pz: [ 2, 2 ],
                nx: [ 3, 1 ],
                ny: [ 4, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 1, 2, 1, 0, 1 ],
                py: [ 7, 13, 12, 4, 13 ],
                pz: [ 0, 0, 0, 2, 0 ],
                nx: [ 18, 9, 9, 19, 19 ],
                ny: [ 23, 5, 11, 19, 19 ],
                nz: [ 0, 1, 1, 0, -1 ]
            }, {
                size: 3,
                px: [ 4, 10, 12 ],
                py: [ 6, 2, 5 ],
                pz: [ 1, -1, -1 ],
                nx: [ 10, 0, 0 ],
                ny: [ 12, 1, 3 ],
                nz: [ 0, 2, 2 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 3, 0 ],
                ny: [ 4, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 19, 17, 10, 14, 18 ],
                py: [ 2, 1, 7, 0, 1 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 3, 3, 3, 7, 5 ],
                ny: [ 9, 10, 7, 23, 18 ],
                nz: [ 1, 1, 1, 0, 0 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 8, 7 ],
                pz: [ 1, 1 ],
                nx: [ 14, 4 ],
                ny: [ 15, 6 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 7, 15 ],
                py: [ 1, 3 ],
                pz: [ 1, 0 ],
                nx: [ 16, 19 ],
                ny: [ 1, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 11, 11, 1, 2, 11 ],
                py: [ 11, 12, 1, 13, 12 ],
                pz: [ 0, 0, -1, -1, -1 ],
                nx: [ 12, 17, 8, 16, 8 ],
                ny: [ 7, 12, 11, 16, 6 ],
                nz: [ 0, 0, 0, 0, 1 ]
            }, {
                size: 5,
                px: [ 13, 11, 10, 12, 5 ],
                py: [ 0, 0, 0, 0, 0 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 8, 4, 3, 4, 4 ],
                ny: [ 4, 5, 2, 4, 4 ],
                nz: [ 1, 1, 2, 1, -1 ]
            }, {
                size: 5,
                px: [ 6, 1, 3, 2, 3 ],
                py: [ 13, 3, 3, 4, 10 ],
                pz: [ 0, 2, 1, 1, 1 ],
                nx: [ 0, 1, 0, 0, 0 ],
                ny: [ 2, 0, 5, 4, 4 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 15, 1 ],
                py: [ 4, 3 ],
                pz: [ 0, -1 ],
                nx: [ 16, 15 ],
                ny: [ 2, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 7 ],
                py: [ 7, 13 ],
                pz: [ 1, 0 ],
                nx: [ 3, 0 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 14, 15 ],
                py: [ 18, 14 ],
                pz: [ 0, -1 ],
                nx: [ 4, 14 ],
                ny: [ 4, 16 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 4, 6 ],
                py: [ 3, 4 ],
                pz: [ 2, 1 ],
                nx: [ 9, 5 ],
                ny: [ 14, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 16, 6 ],
                py: [ 1, 5 ],
                pz: [ 0, -1 ],
                nx: [ 4, 9 ],
                ny: [ 0, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 9, 0 ],
                py: [ 4, 2 ],
                pz: [ 0, -1 ],
                nx: [ 5, 3 ],
                ny: [ 1, 0 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 1, 1, 1, 0, 0 ],
                py: [ 16, 15, 17, 6, 9 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 9, 5, 4, 9, 8 ],
                ny: [ 7, 3, 3, 6, 7 ],
                nz: [ 0, 1, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 1 ],
                py: [ 8, 15 ],
                pz: [ 1, -1 ],
                nx: [ 9, 8 ],
                ny: [ 9, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 20, 19 ],
                py: [ 19, 22 ],
                pz: [ 0, 0 ],
                nx: [ 7, 0 ],
                ny: [ 3, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 8, 4, 2, 5, 5 ],
                py: [ 12, 6, 3, 5, 5 ],
                pz: [ 0, 1, 2, 1, -1 ],
                nx: [ 22, 21, 20, 21, 22 ],
                ny: [ 17, 20, 22, 19, 16 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 12 ],
                py: [ 2, 6 ],
                pz: [ 1, 0 ],
                nx: [ 8, 3 ],
                ny: [ 3, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 9, 4 ],
                pz: [ 1, 1 ],
                nx: [ 12, 4 ],
                ny: [ 17, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 0, 1, 0 ],
                py: [ 5, 13, 3 ],
                pz: [ 2, 0, 2 ],
                nx: [ 0, 4, 11 ],
                ny: [ 23, 5, 1 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 6, 3 ],
                pz: [ 0, 1 ],
                nx: [ 4, 4 ],
                ny: [ 3, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 5 ],
                py: [ 7, 3 ],
                pz: [ 0, -1 ],
                nx: [ 0, 1 ],
                ny: [ 4, 10 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 12, 13, 12, 12, 12 ],
                py: [ 12, 13, 11, 10, 10 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 10, 8, 8, 16, 15 ],
                ny: [ 7, 4, 10, 11, 10 ],
                nz: [ 0, 1, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 8 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 4, 2 ],
                ny: [ 5, 5 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 9, 17 ],
                py: [ 17, 7 ],
                pz: [ 0, -1 ],
                nx: [ 5, 2 ],
                ny: [ 9, 4 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 4, 4 ],
                py: [ 3, 5 ],
                pz: [ 2, 2 ],
                nx: [ 12, 8 ],
                ny: [ 16, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 2, 0 ],
                pz: [ 1, 1 ],
                nx: [ 0, 4 ],
                ny: [ 0, 1 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 11, 1 ],
                py: [ 5, 0 ],
                pz: [ 0, -1 ],
                nx: [ 2, 3 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 4,
                px: [ 0, 6, 4, 22 ],
                py: [ 23, 2, 4, 12 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 7, 6, 8, 5 ],
                ny: [ 1, 1, 2, 1 ],
                nz: [ 1, 1, 1, 1 ]
            }, {
                size: 2,
                px: [ 4, 10 ],
                py: [ 0, 9 ],
                pz: [ 1, -1 ],
                nx: [ 2, 4 ],
                ny: [ 3, 10 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 11, 8 ],
                py: [ 15, 13 ],
                pz: [ 0, -1 ],
                nx: [ 23, 11 ],
                ny: [ 13, 5 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 18, 4 ],
                py: [ 5, 4 ],
                pz: [ 0, -1 ],
                nx: [ 18, 20 ],
                ny: [ 4, 7 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 21, 20, 20, 10, 20 ],
                py: [ 17, 22, 19, 10, 21 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 5, 5, 3, 14, 7 ],
                ny: [ 9, 9, 0, 8, 4 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 3, 7, 13, 7, 3 ],
                py: [ 6, 12, 3, 0, 3 ],
                pz: [ 1, -1, -1, -1, -1 ],
                nx: [ 1, 5, 0, 0, 2 ],
                ny: [ 16, 6, 13, 5, 4 ],
                nz: [ 0, 1, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 7, 4 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 9, 5 ],
                ny: [ 4, 6 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 14, 9, 13 ],
                py: [ 19, 22, 8 ],
                pz: [ 0, -1, -1 ],
                nx: [ 13, 4, 4 ],
                ny: [ 17, 2, 5 ],
                nz: [ 0, 2, 2 ]
            }, {
                size: 2,
                px: [ 16, 4 ],
                py: [ 9, 3 ],
                pz: [ 0, 2 ],
                nx: [ 7, 4 ],
                ny: [ 4, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 10, 2, 4, 2 ],
                py: [ 23, 4, 8, 3 ],
                pz: [ 0, 2, 1, 2 ],
                nx: [ 14, 0, 4, 11 ],
                ny: [ 19, 3, 5, 3 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 9, 10, 8, 7, 11 ],
                py: [ 2, 2, 2, 2, 2 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 6, 5, 3, 4, 4 ],
                ny: [ 0, 1, 0, 2, 2 ],
                nz: [ 0, 0, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 4 ],
                py: [ 13, 6 ],
                pz: [ 0, -1 ],
                nx: [ 15, 4 ],
                ny: [ 8, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 0, 8 ],
                py: [ 1, 2 ],
                pz: [ 2, -1 ],
                nx: [ 5, 4 ],
                ny: [ 2, 2 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 16, 13, 14, 15, 15 ],
                py: [ 1, 0, 0, 0, 0 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 4, 9, 4, 18, 8 ],
                ny: [ 5, 9, 4, 18, 11 ],
                nz: [ 2, 1, 2, 0, 1 ]
            }, {
                size: 2,
                px: [ 5, 6 ],
                py: [ 2, 6 ],
                pz: [ 2, 1 ],
                nx: [ 22, 9 ],
                ny: [ 23, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 19, 19 ],
                py: [ 5, 5 ],
                pz: [ 0, -1 ],
                nx: [ 21, 22 ],
                ny: [ 2, 4 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 5 ],
                py: [ 8, 6 ],
                pz: [ 0, 1 ],
                nx: [ 3, 4 ],
                ny: [ 4, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 18, 14 ],
                py: [ 13, 17 ],
                pz: [ 0, 0 ],
                nx: [ 14, 4 ],
                ny: [ 16, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 6 ],
                py: [ 6, 3 ],
                pz: [ 1, -1 ],
                nx: [ 1, 0 ],
                ny: [ 2, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 23, 21 ],
                py: [ 21, 14 ],
                pz: [ 0, -1 ],
                nx: [ 7, 5 ],
                ny: [ 0, 0 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 15, 10 ],
                py: [ 23, 7 ],
                pz: [ 0, -1 ],
                nx: [ 9, 4 ],
                ny: [ 4, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 4, 18 ],
                py: [ 3, 8 ],
                pz: [ 2, 0 ],
                nx: [ 8, 4 ],
                ny: [ 4, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 13, 7 ],
                py: [ 2, 11 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 2, 3, 5, 6, 1 ],
                py: [ 7, 14, 2, 2, 4 ],
                pz: [ 1, 0, 0, 0, 2 ],
                nx: [ 8, 4, 4, 7, 7 ],
                ny: [ 7, 5, 4, 9, 9 ],
                nz: [ 1, 2, 2, 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 3 ],
                py: [ 6, 3 ],
                pz: [ 1, -1 ],
                nx: [ 1, 2 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 7, 20, 4, 10, 10 ],
                py: [ 9, 16, 4, 10, 8 ],
                pz: [ 1, 0, 2, 1, 1 ],
                nx: [ 4, 2, 3, 5, 3 ],
                ny: [ 11, 5, 6, 12, 5 ],
                nz: [ 0, 1, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 11 ],
                py: [ 4, 18 ],
                pz: [ 1, -1 ],
                nx: [ 8, 6 ],
                ny: [ 4, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 2, 8 ],
                py: [ 5, 23 ],
                pz: [ 2, 0 ],
                nx: [ 9, 4 ],
                ny: [ 0, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 3, 1, 2, 2, 2 ],
                py: [ 12, 6, 12, 11, 11 ],
                pz: [ 0, 1, 0, 0, -1 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 13, 12, 11, 14, 7 ],
                nz: [ 0, 0, 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 1, 2 ],
                pz: [ 2, 1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 14 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 11, 23, 23, 22, 22 ],
                py: [ 8, 12, 6, 13, 14 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 13, 8, 7, 6, 6 ],
                ny: [ 6, 3, 3, 9, 9 ],
                nz: [ 0, 1, 1, 0, -1 ]
            }, {
                size: 4,
                px: [ 9, 23, 23, 22 ],
                py: [ 7, 12, 6, 13 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 11, 23, 23, 23 ],
                ny: [ 6, 13, 17, 10 ],
                nz: [ 1, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 0, 0 ],
                py: [ 19, 5, 9, 16, 10 ],
                pz: [ 0, 2, 1, 0, 1 ],
                nx: [ 5, 2, 1, 2, 2 ],
                ny: [ 18, 10, 5, 9, 9 ],
                nz: [ 0, 1, 2, 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 10, 4 ],
                pz: [ 1, 2 ],
                nx: [ 23, 14 ],
                ny: [ 23, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 3, 1 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 10 ],
                py: [ 4, 8 ],
                pz: [ 0, -1 ],
                nx: [ 8, 8 ],
                ny: [ 2, 3 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 7, 10, 11 ],
                py: [ 1, 6, 13 ],
                pz: [ 0, -1, -1 ],
                nx: [ 4, 4, 2 ],
                ny: [ 3, 8, 2 ],
                nz: [ 1, 1, 2 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 8, 2 ],
                pz: [ 1, 2 ],
                nx: [ 10, 5 ],
                ny: [ 10, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 7, 16 ],
                py: [ 20, 21 ],
                pz: [ 0, -1 ],
                nx: [ 2, 4 ],
                ny: [ 5, 10 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 3, 10 ],
                py: [ 7, 8 ],
                pz: [ 1, -1 ],
                nx: [ 7, 4 ],
                ny: [ 20, 7 ],
                nz: [ 0, 1 ]
            }, {
                size: 5,
                px: [ 11, 11, 11, 11, 11 ],
                py: [ 10, 12, 13, 11, 11 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 11, 12, 16, 3, 8 ],
                ny: [ 6, 6, 10, 1, 8 ],
                nz: [ 0, 0, 0, 2, 0 ]
            }, {
                size: 2,
                px: [ 12, 6 ],
                py: [ 4, 2 ],
                pz: [ 0, 1 ],
                nx: [ 7, 7 ],
                ny: [ 8, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 23, 23, 23, 23, 23 ],
                py: [ 22, 20, 21, 19, 19 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 4, 6, 3, 4, 3 ],
                ny: [ 19, 23, 15, 20, 16 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 3,
                px: [ 8, 4, 14 ],
                py: [ 12, 3, 8 ],
                pz: [ 0, -1, -1 ],
                nx: [ 4, 2, 10 ],
                ny: [ 10, 3, 13 ],
                nz: [ 1, 2, 0 ]
            }, {
                size: 2,
                px: [ 11, 18 ],
                py: [ 13, 23 ],
                pz: [ 0, -1 ],
                nx: [ 5, 5 ],
                ny: [ 1, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 3,
                px: [ 11, 2, 10 ],
                py: [ 17, 4, 17 ],
                pz: [ 0, 2, 0 ],
                nx: [ 11, 0, 22 ],
                ny: [ 15, 2, 4 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 3,
                px: [ 11, 3, 0 ],
                py: [ 15, 4, 8 ],
                pz: [ 0, -1, -1 ],
                nx: [ 14, 11, 4 ],
                ny: [ 9, 17, 7 ],
                nz: [ 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 17, 16 ],
                py: [ 2, 1 ],
                pz: [ 0, 0 ],
                nx: [ 9, 11 ],
                ny: [ 4, 6 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 4 ],
                py: [ 21, 23 ],
                pz: [ 0, 0 ],
                nx: [ 4, 0 ],
                ny: [ 3, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 18, 2 ],
                py: [ 20, 0 ],
                pz: [ 0, -1 ],
                nx: [ 4, 9 ],
                ny: [ 5, 10 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 9, 1 ],
                py: [ 19, 3 ],
                pz: [ 0, -1 ],
                nx: [ 0, 0 ],
                ny: [ 9, 21 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 19, 19 ],
                py: [ 21, 22 ],
                pz: [ 0, 0 ],
                nx: [ 19, 0 ],
                ny: [ 23, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 11, 2, 3, 2 ],
                py: [ 6, 6, 9, 4 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 4, 9, 19, 19 ],
                ny: [ 5, 10, 17, 18 ],
                nz: [ 2, 1, 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 4, 8 ],
                pz: [ 2, 1 ],
                nx: [ 4, 9 ],
                ny: [ 10, 10 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 23, 22 ],
                py: [ 8, 12 ],
                pz: [ 0, -1 ],
                nx: [ 7, 4 ],
                ny: [ 11, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 12, 1 ],
                py: [ 5, 2 ],
                pz: [ 0, -1 ],
                nx: [ 9, 11 ],
                ny: [ 2, 1 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 4 ],
                py: [ 2, 2 ],
                pz: [ 0, -1 ],
                nx: [ 3, 2 ],
                ny: [ 1, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 17, 9 ],
                py: [ 13, 7 ],
                pz: [ 0, 1 ],
                nx: [ 9, 5 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 0, 0, 9, 13 ],
                py: [ 3, 3, 7, 3 ],
                pz: [ 2, -1, -1, -1 ],
                nx: [ 2, 4, 4, 11 ],
                ny: [ 1, 2, 8, 5 ],
                nz: [ 2, 1, 1, 0 ]
            }, {
                size: 5,
                px: [ 3, 6, 5, 6, 6 ],
                py: [ 0, 0, 2, 1, 1 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 2, 2, 2, 1, 1 ],
                ny: [ 21, 19, 20, 16, 17 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 13, 3 ],
                py: [ 22, 10 ],
                pz: [ 0, -1 ],
                nx: [ 7, 4 ],
                ny: [ 10, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 3, 2 ],
                py: [ 7, 3 ],
                pz: [ 1, 2 ],
                nx: [ 8, 4 ],
                ny: [ 4, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 17, 8, 15, 7, 15 ],
                py: [ 13, 6, 16, 5, 12 ],
                pz: [ 0, 1, 0, 1, 0 ],
                nx: [ 5, 4, 6, 3, 4 ],
                ny: [ 1, 2, 1, 0, 3 ],
                nz: [ 0, 0, 0, 1, -1 ]
            }, {
                size: 5,
                px: [ 12, 9, 11, 12, 10 ],
                py: [ 0, 1, 2, 2, 0 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 8, 16, 7, 4, 4 ],
                ny: [ 9, 23, 9, 3, 2 ],
                nz: [ 1, 0, 1, 2, -1 ]
            }, {
                size: 2,
                px: [ 4, 11 ],
                py: [ 1, 4 ],
                pz: [ 2, -1 ],
                nx: [ 8, 7 ],
                ny: [ 4, 4 ],
                nz: [ 0, 0 ]
            }, {
                size: 4,
                px: [ 7, 4, 5, 8 ],
                py: [ 13, 2, 1, 3 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 9, 4, 9, 9 ],
                ny: [ 9, 5, 10, 11 ],
                nz: [ 0, 1, 0, 0 ]
            }, {
                size: 2,
                px: [ 10, 11 ],
                py: [ 10, 11 ],
                pz: [ 0, -1 ],
                nx: [ 2, 6 ],
                ny: [ 2, 2 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 21, 3 ],
                py: [ 11, 2 ],
                pz: [ 0, -1 ],
                nx: [ 22, 22 ],
                ny: [ 20, 18 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 7, 6 ],
                py: [ 1, 2 ],
                pz: [ 0, 0 ],
                nx: [ 5, 10 ],
                ny: [ 1, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 21, 3 ],
                py: [ 18, 1 ],
                pz: [ 0, -1 ],
                nx: [ 16, 15 ],
                ny: [ 4, 4 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 7 ],
                py: [ 4, 1 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 13, 11 ],
                py: [ 23, 17 ],
                pz: [ 0, 0 ],
                nx: [ 11, 21 ],
                ny: [ 16, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 1, 2 ],
                py: [ 0, 6 ],
                pz: [ 1, -1 ],
                nx: [ 16, 16 ],
                ny: [ 9, 11 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 13 ],
                py: [ 20, 20 ],
                pz: [ 0, 0 ],
                nx: [ 11, 3 ],
                ny: [ 21, 7 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 19, 20, 9 ],
                py: [ 21, 18, 11 ],
                pz: [ 0, 0, 1 ],
                nx: [ 17, 4, 11 ],
                ny: [ 19, 2, 0 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 12, 5 ],
                py: [ 5, 2 ],
                pz: [ 0, 1 ],
                nx: [ 7, 9 ],
                ny: [ 7, 8 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 8, 4, 4, 8, 4 ],
                py: [ 4, 4, 5, 10, 3 ],
                pz: [ 1, 1, 2, 0, 2 ],
                nx: [ 11, 22, 11, 23, 23 ],
                ny: [ 0, 0, 1, 3, 3 ],
                nz: [ 1, 0, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 14 ],
                py: [ 10, 23 ],
                pz: [ 1, 0 ],
                nx: [ 7, 2 ],
                ny: [ 10, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 14 ],
                py: [ 6, 23 ],
                pz: [ 1, -1 ],
                nx: [ 1, 2 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 11, 2 ],
                py: [ 19, 3 ],
                pz: [ 0, -1 ],
                nx: [ 10, 12 ],
                ny: [ 18, 18 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 3 ],
                py: [ 4, 1 ],
                pz: [ 0, 2 ],
                nx: [ 6, 6 ],
                ny: [ 11, 11 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 0, 0 ],
                py: [ 18, 10, 20, 19, 19 ],
                pz: [ 0, 1, 0, 0, -1 ],
                nx: [ 11, 10, 14, 12, 13 ],
                ny: [ 2, 2, 2, 2, 2 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 3,
                px: [ 12, 2, 9 ],
                py: [ 14, 5, 10 ],
                pz: [ 0, -1, -1 ],
                nx: [ 11, 10, 5 ],
                ny: [ 10, 13, 5 ],
                nz: [ 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 2, 3 ],
                py: [ 3, 7 ],
                pz: [ 2, 1 ],
                nx: [ 3, 10 ],
                ny: [ 4, 13 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 3 ],
                py: [ 21, 7 ],
                pz: [ 0, -1 ],
                nx: [ 10, 21 ],
                ny: [ 7, 15 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 21, 10 ],
                py: [ 16, 8 ],
                pz: [ 0, 1 ],
                nx: [ 8, 2 ],
                ny: [ 10, 8 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 8 ],
                py: [ 6, 7 ],
                pz: [ 1, -1 ],
                nx: [ 12, 11 ],
                ny: [ 11, 7 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 3, 11 ],
                py: [ 4, 20 ],
                pz: [ 2, 0 ],
                nx: [ 11, 10 ],
                ny: [ 19, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 17, 5 ],
                py: [ 13, 3 ],
                pz: [ 0, -1 ],
                nx: [ 7, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 7, 1 ],
                py: [ 23, 3 ],
                pz: [ 0, 2 ],
                nx: [ 14, 6 ],
                ny: [ 12, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 12, 5 ],
                py: [ 11, 2 ],
                pz: [ 0, -1 ],
                nx: [ 11, 7 ],
                ny: [ 3, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 9, 6 ],
                py: [ 2, 17 ],
                pz: [ 0, -1 ],
                nx: [ 4, 6 ],
                ny: [ 4, 12 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 14, 19 ],
                py: [ 5, 6 ],
                pz: [ 0, -1 ],
                nx: [ 9, 3 ],
                ny: [ 9, 1 ],
                nz: [ 0, 2 ]
            }, {
                size: 5,
                px: [ 12, 13, 13, 13, 12 ],
                py: [ 9, 11, 12, 13, 10 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 2, 4, 4, 4, 4 ],
                ny: [ 7, 18, 17, 14, 14 ],
                nz: [ 1, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 6, 6 ],
                pz: [ 1, -1 ],
                nx: [ 20, 18 ],
                ny: [ 18, 23 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 5, 6 ],
                py: [ 4, 14 ],
                pz: [ 1, -1 ],
                nx: [ 9, 4 ],
                ny: [ 2, 1 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 11, 9 ],
                py: [ 4, 18 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 15, 0 ],
                py: [ 18, 4 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 5, 4 ],
                nz: [ 2, 2 ]
            }, {
                size: 4,
                px: [ 7, 3, 6, 6 ],
                py: [ 8, 4, 6, 5 ],
                pz: [ 1, 2, 1, 1 ],
                nx: [ 10, 4, 13, 0 ],
                ny: [ 10, 4, 9, 22 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 10, 8 ],
                py: [ 18, 11 ],
                pz: [ 0, -1 ],
                nx: [ 5, 4 ],
                ny: [ 8, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 4,
                px: [ 17, 2, 10, 2 ],
                py: [ 14, 1, 10, 3 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 8, 8, 17, 8 ],
                ny: [ 4, 5, 12, 6 ],
                nz: [ 1, 1, 0, 1 ]
            }, {
                size: 5,
                px: [ 9, 11, 9, 4, 10 ],
                py: [ 1, 1, 0, 0, 1 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 8, 4, 7, 15, 15 ],
                ny: [ 7, 2, 4, 17, 17 ],
                nz: [ 1, 2, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 3 ],
                py: [ 11, 8 ],
                pz: [ 0, -1 ],
                nx: [ 2, 2 ],
                ny: [ 1, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 11, 3 ],
                py: [ 13, 8 ],
                pz: [ 0, -1 ],
                nx: [ 1, 1 ],
                ny: [ 5, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 6, 2 ],
                py: [ 8, 3 ],
                pz: [ 0, 2 ],
                nx: [ 3, 1 ],
                ny: [ 5, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 10, 5, 7, 8, 6 ],
                py: [ 9, 7, 7, 7, 7 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 7, 3, 0, 2, 15 ],
                ny: [ 8, 0, 1, 18, 17 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 17, 8 ],
                py: [ 12, 6 ],
                pz: [ 0, 1 ],
                nx: [ 8, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 3, 11, 8, 10, 12 ],
                py: [ 0, 2, 10, 2, 3 ],
                pz: [ 2, 0, 0, 0, 0 ],
                nx: [ 3, 2, 10, 2, 2 ],
                ny: [ 6, 4, 11, 3, 3 ],
                nz: [ 0, 1, 0, 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 2, 4 ],
                pz: [ 2, 1 ],
                nx: [ 8, 19 ],
                ny: [ 4, 16 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 1, 1 ],
                pz: [ 2, -1 ],
                nx: [ 7, 17 ],
                ny: [ 1, 2 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 16, 15, 14, 13, 7 ],
                py: [ 0, 0, 0, 0, 0 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 6, 4, 8, 3, 11 ],
                ny: [ 3, 4, 4, 1, 6 ],
                nz: [ 1, 1, 1, 2, 0 ]
            }, {
                size: 2,
                px: [ 11, 1 ],
                py: [ 8, 5 ],
                pz: [ 0, -1 ],
                nx: [ 13, 4 ],
                ny: [ 10, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 4, 9 ],
                py: [ 0, 2 ],
                pz: [ 2, 1 ],
                nx: [ 4, 11 ],
                ny: [ 0, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 15, 15 ],
                py: [ 2, 2 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 8, 17 ],
                py: [ 9, 22 ],
                pz: [ 1, 0 ],
                nx: [ 8, 20 ],
                ny: [ 10, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 14, 22 ],
                pz: [ 0, -1 ],
                nx: [ 3, 11 ],
                ny: [ 3, 3 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 1, 0 ],
                pz: [ 1, 2 ],
                nx: [ 5, 8 ],
                ny: [ 3, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 3 ],
                py: [ 4, 8 ],
                pz: [ 2, 1 ],
                nx: [ 9, 5 ],
                ny: [ 15, 19 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 2 ],
                py: [ 1, 1 ],
                pz: [ 0, 1 ],
                nx: [ 10, 10 ],
                ny: [ 6, 6 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 17, 6 ],
                py: [ 10, 2 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 3,
                px: [ 13, 7, 3 ],
                py: [ 5, 2, 6 ],
                pz: [ 0, 1, -1 ],
                nx: [ 17, 16, 17 ],
                ny: [ 1, 1, 2 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 10 ],
                py: [ 3, 3 ],
                pz: [ 0, 0 ],
                nx: [ 8, 4 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 4, 8 ],
                py: [ 0, 8 ],
                pz: [ 2, -1 ],
                nx: [ 3, 4 ],
                ny: [ 0, 0 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 9, 2, 4, 1, 2 ],
                py: [ 13, 3, 9, 2, 5 ],
                pz: [ 0, 2, 1, 2, 2 ],
                nx: [ 9, 5, 10, 4, 10 ],
                ny: [ 5, 1, 3, 0, 0 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 6, 12 ],
                py: [ 5, 9 ],
                pz: [ 1, 0 ],
                nx: [ 0, 2 ],
                ny: [ 23, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 22, 11 ],
                py: [ 21, 8 ],
                pz: [ 0, 1 ],
                nx: [ 10, 0 ],
                ny: [ 17, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 1 ],
                py: [ 22, 9 ],
                pz: [ 0, 1 ],
                nx: [ 22, 5 ],
                ny: [ 11, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 5, 6 ],
                ny: [ 10, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 7, 3, 17, 7 ],
                py: [ 8, 2, 10, 11 ],
                pz: [ 0, 2, 0, 1 ],
                nx: [ 6, 10, 5, 23 ],
                ny: [ 9, 21, 1, 23 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 8, 3 ],
                py: [ 7, 2 ],
                pz: [ 1, 2 ],
                nx: [ 8, 9 ],
                ny: [ 4, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 5 ],
                py: [ 14, 6 ],
                pz: [ 0, 1 ],
                nx: [ 8, 8 ],
                ny: [ 13, 13 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 11, 6, 8 ],
                py: [ 20, 3, 20 ],
                pz: [ 0, -1, -1 ],
                nx: [ 5, 3, 12 ],
                ny: [ 9, 5, 18 ],
                nz: [ 1, 2, 0 ]
            }, {
                size: 2,
                px: [ 3, 9 ],
                py: [ 1, 3 ],
                pz: [ 1, 0 ],
                nx: [ 2, 8 ],
                ny: [ 5, 8 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 15, 9 ],
                py: [ 21, 3 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 5, 5 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 2, 9 ],
                py: [ 7, 11 ],
                pz: [ 1, -1 ],
                nx: [ 2, 2 ],
                ny: [ 8, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 4,
                px: [ 3, 4, 3, 1 ],
                py: [ 14, 21, 19, 6 ],
                pz: [ 0, 0, 0, 1 ],
                nx: [ 10, 16, 4, 5 ],
                ny: [ 8, 1, 7, 6 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 4,
                px: [ 10, 4, 3, 1 ],
                py: [ 5, 21, 19, 6 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 21, 10, 5, 11 ],
                ny: [ 4, 2, 3, 4 ],
                nz: [ 0, 1, 2, 1 ]
            }, {
                size: 2,
                px: [ 4, 17 ],
                py: [ 3, 8 ],
                pz: [ 2, 0 ],
                nx: [ 17, 2 ],
                ny: [ 9, 22 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 17, 12 ],
                py: [ 14, 20 ],
                pz: [ 0, -1 ],
                nx: [ 7, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 10, 12 ],
                py: [ 9, 20 ],
                pz: [ 0, -1 ],
                nx: [ 11, 23 ],
                ny: [ 8, 18 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 5, 11 ],
                py: [ 4, 7 ],
                pz: [ 2, 1 ],
                nx: [ 8, 15 ],
                ny: [ 7, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 15 ],
                py: [ 13, 8 ],
                pz: [ 0, -1 ],
                nx: [ 11, 11 ],
                ny: [ 6, 7 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 6, 15 ],
                py: [ 14, 8 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 12, 13 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 5, 5 ],
                py: [ 0, 1 ],
                pz: [ 2, 2 ],
                nx: [ 15, 4 ],
                ny: [ 5, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 16, 17 ],
                py: [ 2, 2 ],
                pz: [ 0, 0 ],
                nx: [ 20, 8 ],
                ny: [ 3, 7 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 6, 3, 2 ],
                py: [ 10, 6, 1 ],
                pz: [ 0, -1, -1 ],
                nx: [ 4, 3, 2 ],
                ny: [ 3, 4, 2 ],
                nz: [ 1, 1, 2 ]
            }, {
                size: 2,
                px: [ 10, 6 ],
                py: [ 4, 6 ],
                pz: [ 0, -1 ],
                nx: [ 6, 13 ],
                ny: [ 0, 1 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 8, 7 ],
                pz: [ 1, 1 ],
                nx: [ 8, 2 ],
                ny: [ 7, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 1 ],
                py: [ 12, 4 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 5, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 11, 15 ],
                py: [ 15, 14 ],
                pz: [ 0, -1 ],
                nx: [ 3, 11 ],
                ny: [ 4, 13 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 13, 9, 11, 14, 12 ],
                py: [ 0, 2, 0, 0, 2 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 5, 4, 4, 3, 4 ],
                ny: [ 4, 4, 18, 7, 17 ],
                nz: [ 1, 1, 0, 1, 0 ]
            }, {
                size: 3,
                px: [ 13, 12, 11 ],
                py: [ 22, 22, 22 ],
                pz: [ 0, 0, 0 ],
                nx: [ 11, 12, 13 ],
                ny: [ 20, 20, 20 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 13 ],
                py: [ 2, 4 ],
                pz: [ 1, 0 ],
                nx: [ 7, 6 ],
                ny: [ 8, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 23, 4 ],
                pz: [ 0, -1 ],
                nx: [ 5, 9 ],
                ny: [ 1, 1 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 14, 14 ],
                py: [ 19, 19 ],
                pz: [ 0, -1 ],
                nx: [ 11, 11 ],
                ny: [ 10, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 23, 23 ],
                py: [ 11, 9 ],
                pz: [ 0, 0 ],
                nx: [ 23, 23 ],
                ny: [ 0, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 23, 3 ],
                py: [ 23, 5 ],
                pz: [ 0, -1 ],
                nx: [ 4, 1 ],
                ny: [ 23, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 9, 1 ],
                py: [ 7, 4 ],
                pz: [ 1, -1 ],
                nx: [ 19, 10 ],
                ny: [ 20, 9 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 16, 1 ],
                py: [ 9, 4 ],
                pz: [ 0, -1 ],
                nx: [ 7, 8 ],
                ny: [ 3, 3 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 7, 6 ],
                py: [ 13, 13 ],
                pz: [ 0, 0 ],
                nx: [ 4, 5 ],
                ny: [ 4, 11 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 19, 20, 20, 10, 10 ],
                py: [ 0, 0, 2, 0, 1 ],
                pz: [ 0, 0, 0, 1, 1 ],
                nx: [ 7, 7, 15, 4, 4 ],
                ny: [ 4, 13, 7, 4, 4 ],
                nz: [ 1, 0, 0, 1, -1 ]
            }, {
                size: 2,
                px: [ 12, 23 ],
                py: [ 6, 5 ],
                pz: [ 0, -1 ],
                nx: [ 18, 18 ],
                ny: [ 17, 16 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 9, 2 ],
                pz: [ 1, 2 ],
                nx: [ 14, 18 ],
                ny: [ 9, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 13 ],
                py: [ 16, 5 ],
                pz: [ 0, -1 ],
                nx: [ 5, 4 ],
                ny: [ 7, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 8, 10 ],
                pz: [ 1, 1 ],
                nx: [ 4, 1 ],
                ny: [ 5, 3 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 12, 11 ],
                py: [ 13, 4 ],
                pz: [ 0, -1 ],
                nx: [ 0, 0 ],
                ny: [ 14, 15 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 1 ],
                py: [ 20, 17 ],
                pz: [ 0, 0 ],
                nx: [ 12, 12 ],
                ny: [ 22, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 3 ],
                py: [ 6, 7 ],
                pz: [ 1, -1 ],
                nx: [ 21, 21 ],
                ny: [ 13, 12 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 10 ],
                py: [ 4, 23 ],
                pz: [ 2, 0 ],
                nx: [ 10, 2 ],
                ny: [ 21, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 12 ],
                py: [ 3, 6 ],
                pz: [ 1, 0 ],
                nx: [ 11, 0 ],
                ny: [ 17, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 4 ],
                py: [ 21, 9 ],
                pz: [ 0, -1 ],
                nx: [ 2, 3 ],
                ny: [ 18, 22 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 13, 5 ],
                py: [ 18, 9 ],
                pz: [ 0, -1 ],
                nx: [ 6, 7 ],
                ny: [ 8, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 21, 4 ],
                py: [ 16, 3 ],
                pz: [ 0, -1 ],
                nx: [ 23, 23 ],
                ny: [ 16, 15 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 0 ],
                py: [ 7, 4 ],
                pz: [ 1, -1 ],
                nx: [ 3, 8 ],
                ny: [ 7, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 15, 16 ],
                py: [ 11, 12 ],
                pz: [ 0, 0 ],
                nx: [ 8, 5 ],
                ny: [ 4, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 7, 5 ],
                pz: [ 0, 0 ],
                nx: [ 17, 17 ],
                ny: [ 11, 10 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 8, 13, 12, 3, 3 ],
                py: [ 6, 23, 23, 3, 3 ],
                pz: [ 1, 0, 0, 2, -1 ],
                nx: [ 0, 1, 0, 0, 0 ],
                ny: [ 2, 13, 4, 5, 6 ],
                nz: [ 2, 0, 1, 1, 1 ]
            }, {
                size: 2,
                px: [ 0, 1 ],
                py: [ 7, 8 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 1, 0 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 2, 12 ],
                py: [ 1, 7 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 12, 14 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 5, 1 ],
                py: [ 7, 4 ],
                pz: [ 1, 2 ],
                nx: [ 8, 0 ],
                ny: [ 15, 14 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 7, 4 ],
                py: [ 14, 8 ],
                pz: [ 0, -1 ],
                nx: [ 2, 4 ],
                ny: [ 1, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 5, 3 ],
                py: [ 3, 1 ],
                pz: [ 2, -1 ],
                nx: [ 9, 9 ],
                ny: [ 5, 6 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 4, 5 ],
                py: [ 2, 3 ],
                pz: [ 1, -1 ],
                nx: [ 11, 12 ],
                ny: [ 23, 23 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 7, 0 ],
                pz: [ 1, -1 ],
                nx: [ 22, 22 ],
                ny: [ 19, 18 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 10, 2, 9 ],
                py: [ 20, 9, 4 ],
                pz: [ 0, -1, -1 ],
                nx: [ 1, 10, 11 ],
                ny: [ 2, 11, 9 ],
                nz: [ 2, 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 8 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 9, 3 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 17, 6 ],
                py: [ 7, 16 ],
                pz: [ 0, -1 ],
                nx: [ 17, 17 ],
                ny: [ 9, 6 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 8, 1, 9 ],
                py: [ 6, 3, 4 ],
                pz: [ 1, -1, -1 ],
                nx: [ 2, 9, 2 ],
                ny: [ 5, 13, 3 ],
                nz: [ 2, 0, 2 ]
            }, {
                size: 4,
                px: [ 10, 10, 9, 2 ],
                py: [ 12, 11, 2, 10 ],
                pz: [ 0, 0, -1, -1 ],
                nx: [ 6, 11, 3, 13 ],
                ny: [ 2, 4, 1, 4 ],
                nz: [ 1, 0, 2, 0 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 7, 1 ],
                pz: [ 1, -1 ],
                nx: [ 4, 3 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 4, 8 ],
                pz: [ 2, 1 ],
                nx: [ 4, 4 ],
                ny: [ 15, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 0 ],
                py: [ 4, 8 ],
                pz: [ 1, -1 ],
                nx: [ 13, 13 ],
                ny: [ 9, 10 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 2, 1 ],
                pz: [ 1, 2 ],
                nx: [ 8, 17 ],
                ny: [ 4, 12 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 15, 16 ],
                py: [ 11, 6 ],
                pz: [ 0, 0 ],
                nx: [ 16, 17 ],
                ny: [ 5, 12 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 11 ],
                py: [ 9, 7 ],
                pz: [ 0, -1 ],
                nx: [ 0, 1 ],
                ny: [ 9, 20 ],
                nz: [ 1, 0 ]
            }, {
                size: 3,
                px: [ 16, 11, 20 ],
                py: [ 4, 7, 23 ],
                pz: [ 0, -1, -1 ],
                nx: [ 8, 9, 4 ],
                ny: [ 4, 6, 4 ],
                nz: [ 1, 1, 2 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 18, 17 ],
                pz: [ 0, 0 ],
                nx: [ 9, 6 ],
                ny: [ 7, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 4, 4, 19 ],
                py: [ 3, 2, 9 ],
                pz: [ 2, 2, 0 ],
                nx: [ 2, 14, 11 ],
                ny: [ 5, 3, 9 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 19 ],
                py: [ 13, 9 ],
                pz: [ 0, -1 ],
                nx: [ 11, 11 ],
                ny: [ 4, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 13, 7 ],
                py: [ 19, 2 ],
                pz: [ 0, -1 ],
                nx: [ 3, 5 ],
                ny: [ 6, 12 ],
                nz: [ 1, 0 ]
            }, {
                size: 4,
                px: [ 9, 4, 4, 2 ],
                py: [ 13, 9, 8, 4 ],
                pz: [ 0, 1, 1, 2 ],
                nx: [ 13, 0, 0, 14 ],
                ny: [ 18, 11, 6, 1 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 15 ],
                py: [ 8, 10 ],
                pz: [ 0, 0 ],
                nx: [ 14, 11 ],
                ny: [ 9, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 2 ],
                py: [ 8, 5 ],
                pz: [ 1, 2 ],
                nx: [ 4, 4 ],
                ny: [ 10, 10 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 4, 6, 16, 14 ],
                py: [ 1, 1, 1, 7 ],
                pz: [ 2, 1, 0, 0 ],
                nx: [ 10, 1, 1, 2 ],
                ny: [ 8, 5, 10, 3 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 4,
                px: [ 2, 3, 1, 2 ],
                py: [ 3, 1, 0, 2 ],
                pz: [ 0, 0, 1, 0 ],
                nx: [ 0, 0, 0, 0 ],
                ny: [ 1, 1, 2, 0 ],
                nz: [ 0, 1, 0, 1 ]
            }, {
                size: 2,
                px: [ 8, 8 ],
                py: [ 6, 7 ],
                pz: [ 1, 1 ],
                nx: [ 8, 0 ],
                ny: [ 4, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 3, 0 ],
                pz: [ 0, 1 ],
                nx: [ 2, 2 ],
                ny: [ 1, 16 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 6 ],
                py: [ 19, 18 ],
                pz: [ 0, 0 ],
                nx: [ 2, 10 ],
                ny: [ 5, 8 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 8, 5 ],
                py: [ 21, 11 ],
                pz: [ 0, -1 ],
                nx: [ 3, 2 ],
                ny: [ 11, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 4, 9 ],
                py: [ 4, 7 ],
                pz: [ 2, 1 ],
                nx: [ 8, 7 ],
                ny: [ 10, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 4, 18, 19, 16, 19 ],
                py: [ 3, 12, 12, 23, 13 ],
                pz: [ 2, 0, 0, 0, 0 ],
                nx: [ 2, 8, 3, 2, 2 ],
                ny: [ 4, 23, 10, 5, 5 ],
                nz: [ 2, 0, 1, 2, -1 ]
            }, {
                size: 2,
                px: [ 4, 8 ],
                py: [ 6, 11 ],
                pz: [ 1, 0 ],
                nx: [ 8, 3 ],
                ny: [ 4, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 12 ],
                py: [ 4, 13 ],
                pz: [ 2, 0 ],
                nx: [ 10, 5 ],
                ny: [ 15, 21 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 9 ],
                py: [ 4, 23 ],
                pz: [ 2, 0 ],
                nx: [ 19, 4 ],
                ny: [ 9, 3 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 8, 15 ],
                pz: [ 1, 0 ],
                nx: [ 6, 1 ],
                ny: [ 18, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 0 ],
                py: [ 20, 3 ],
                pz: [ 0, -1 ],
                nx: [ 2, 10 ],
                ny: [ 5, 17 ],
                nz: [ 2, 0 ]
            }, {
                size: 3,
                px: [ 10, 6, 3 ],
                py: [ 2, 7, 3 ],
                pz: [ 0, -1, -1 ],
                nx: [ 5, 4, 2 ],
                ny: [ 9, 7, 2 ],
                nz: [ 1, 1, 2 ]
            }, {
                size: 2,
                px: [ 14, 6 ],
                py: [ 12, 7 ],
                pz: [ 0, -1 ],
                nx: [ 2, 10 ],
                ny: [ 0, 1 ],
                nz: [ 2, 0 ]
            }, {
                size: 3,
                px: [ 10, 5, 1 ],
                py: [ 15, 5, 4 ],
                pz: [ 0, -1, -1 ],
                nx: [ 9, 4, 18 ],
                ny: [ 2, 0, 4 ],
                nz: [ 1, 2, 0 ]
            }, {
                size: 2,
                px: [ 17, 2 ],
                py: [ 12, 6 ],
                pz: [ 0, -1 ],
                nx: [ 8, 16 ],
                ny: [ 4, 11 ],
                nz: [ 1, 0 ]
            }, {
                size: 3,
                px: [ 7, 13, 4 ],
                py: [ 0, 0, 1 ],
                pz: [ 1, 0, -1 ],
                nx: [ 18, 4, 4 ],
                ny: [ 13, 2, 3 ],
                nz: [ 0, 2, 2 ]
            }, {
                size: 2,
                px: [ 1, 11 ],
                py: [ 10, 6 ],
                pz: [ 0, -1 ],
                nx: [ 0, 1 ],
                ny: [ 15, 17 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 9, 12, 8 ],
                py: [ 8, 17, 11 ],
                pz: [ 1, 0, 1 ],
                nx: [ 12, 0, 20 ],
                ny: [ 16, 9, 13 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 4 ],
                py: [ 5, 8 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 16, 3 ],
                py: [ 9, 8 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 11, 5 ],
                pz: [ 1, 2 ],
                nx: [ 11, 5 ],
                ny: [ 21, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 13 ],
                py: [ 1, 1 ],
                pz: [ 0, 0 ],
                nx: [ 4, 4 ],
                ny: [ 5, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 14, 4 ],
                py: [ 4, 3 ],
                pz: [ 0, -1 ],
                nx: [ 12, 10 ],
                ny: [ 2, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 2, 4 ],
                pz: [ 2, 1 ],
                nx: [ 9, 7 ],
                ny: [ 9, 7 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 5, 6, 6 ],
                py: [ 4, 4, 4 ],
                pz: [ 1, -1, -1 ],
                nx: [ 13, 8, 7 ],
                ny: [ 8, 3, 4 ],
                nz: [ 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 5, 5 ],
                py: [ 2, 11 ],
                pz: [ 1, 1 ],
                nx: [ 10, 11 ],
                ny: [ 22, 22 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 16, 9 ],
                py: [ 13, 7 ],
                pz: [ 0, 1 ],
                nx: [ 8, 14 ],
                ny: [ 4, 12 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 13, 5 ],
                py: [ 13, 3 ],
                pz: [ 0, 2 ],
                nx: [ 16, 22 ],
                ny: [ 13, 6 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 4, 4, 3, 4 ],
                py: [ 4, 3, 4, 5 ],
                pz: [ 2, 2, 2, 2 ],
                nx: [ 21, 5, 17, 7 ],
                ny: [ 0, 2, 5, 23 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 4, 16 ],
                py: [ 0, 1 ],
                pz: [ 2, 0 ],
                nx: [ 15, 1 ],
                ny: [ 23, 10 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 6 ],
                py: [ 11, 2 ],
                pz: [ 0, -1 ],
                nx: [ 15, 6 ],
                ny: [ 2, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 2, 1 ],
                pz: [ 1, 2 ],
                nx: [ 8, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 13, 14, 5 ],
                py: [ 9, 15, 2 ],
                pz: [ 0, -1, -1 ],
                nx: [ 11, 1, 11 ],
                ny: [ 10, 3, 11 ],
                nz: [ 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 5, 1 ],
                py: [ 6, 2 ],
                pz: [ 1, -1 ],
                nx: [ 1, 1 ],
                ny: [ 2, 5 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 1, 0 ],
                pz: [ 1, 2 ],
                nx: [ 10, 4 ],
                ny: [ 2, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 8, 9 ],
                pz: [ 1, 1 ],
                nx: [ 23, 4 ],
                ny: [ 23, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 2 ],
                py: [ 10, 2 ],
                pz: [ 0, -1 ],
                nx: [ 18, 10 ],
                ny: [ 0, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 20, 4 ],
                py: [ 7, 3 ],
                pz: [ 0, 2 ],
                nx: [ 8, 4 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 4 ],
                py: [ 5, 4 ],
                pz: [ 1, -1 ],
                nx: [ 11, 11 ],
                ny: [ 5, 6 ],
                nz: [ 1, 1 ]
            }, {
                size: 3,
                px: [ 14, 15, 16 ],
                py: [ 0, 0, 1 ],
                pz: [ 0, 0, 0 ],
                nx: [ 8, 5, 15 ],
                ny: [ 7, 2, 10 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 1, 1 ],
                pz: [ 2, -1 ],
                nx: [ 17, 18 ],
                ny: [ 2, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 13, 8 ],
                py: [ 15, 7 ],
                pz: [ 0, -1 ],
                nx: [ 9, 4 ],
                ny: [ 5, 2 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 4, 0 ],
                py: [ 6, 17 ],
                pz: [ 1, -1 ],
                nx: [ 3, 2 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 14, 8 ],
                py: [ 17, 9 ],
                pz: [ 0, -1 ],
                nx: [ 7, 6 ],
                ny: [ 8, 8 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 10, 4 ],
                py: [ 7, 1 ],
                pz: [ 1, -1 ],
                nx: [ 15, 6 ],
                ny: [ 14, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 3, 12 ],
                py: [ 8, 19 ],
                pz: [ 1, 0 ],
                nx: [ 13, 10 ],
                ny: [ 17, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 7, 12 ],
                py: [ 2, 4 ],
                pz: [ 1, 0 ],
                nx: [ 6, 11 ],
                ny: [ 3, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 2, 1, 6, 1 ],
                py: [ 10, 3, 23, 8 ],
                pz: [ 1, 2, 0, 1 ],
                nx: [ 17, 10, 23, 0 ],
                ny: [ 9, 2, 20, 3 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 2, 8 ],
                pz: [ 0, -1 ],
                nx: [ 2, 2 ],
                ny: [ 4, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 3, 16 ],
                py: [ 1, 6 ],
                pz: [ 2, 0 ],
                nx: [ 8, 4 ],
                ny: [ 2, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 1, 2 ],
                pz: [ 2, 1 ],
                nx: [ 8, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 6 ],
                py: [ 3, 0 ],
                pz: [ 2, -1 ],
                nx: [ 9, 5 ],
                ny: [ 2, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 3, 16 ],
                py: [ 5, 23 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 6, 3 ],
                nz: [ 1, 2 ]
            }, {
                size: 4,
                px: [ 0, 0, 0, 0 ],
                py: [ 3, 2, 12, 5 ],
                pz: [ 2, 2, 0, 1 ],
                nx: [ 2, 3, 2, 13 ],
                ny: [ 5, 5, 2, 19 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 10, 11 ],
                pz: [ 0, 0 ],
                nx: [ 5, 5 ],
                ny: [ 1, 1 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 5, 2 ],
                py: [ 0, 4 ],
                pz: [ 2, -1 ],
                nx: [ 2, 2 ],
                ny: [ 10, 8 ],
                nz: [ 1, 1 ]
            }, {
                size: 4,
                px: [ 16, 2, 8, 4 ],
                py: [ 14, 0, 11, 5 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 18, 14, 7, 7 ],
                ny: [ 13, 14, 8, 6 ],
                nz: [ 0, 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 8, 9 ],
                py: [ 2, 2 ],
                pz: [ 0, 0 ],
                nx: [ 5, 14 ],
                ny: [ 4, 14 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 5 ],
                py: [ 11, 20 ],
                pz: [ 1, 0 ],
                nx: [ 11, 4 ],
                ny: [ 0, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 3, 4 ],
                pz: [ 2, 2 ],
                nx: [ 3, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 10, 4, 3 ],
                py: [ 5, 5, 3 ],
                pz: [ 0, -1, -1 ],
                nx: [ 11, 3, 10 ],
                ny: [ 2, 0, 2 ],
                nz: [ 0, 2, 0 ]
            }, {
                size: 2,
                px: [ 15, 15 ],
                py: [ 1, 1 ],
                pz: [ 0, -1 ],
                nx: [ 7, 4 ],
                ny: [ 5, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 4,
                px: [ 9, 5, 2, 6 ],
                py: [ 22, 8, 4, 19 ],
                pz: [ 0, 1, 2, 0 ],
                nx: [ 9, 5, 0, 3 ],
                ny: [ 20, 5, 22, 4 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 1, 4, 10 ],
                py: [ 3, 9, 12 ],
                pz: [ 2, 1, 0 ],
                nx: [ 0, 10, 0 ],
                ny: [ 0, 5, 0 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 1, 6 ],
                py: [ 0, 7 ],
                pz: [ 0, -1 ],
                nx: [ 20, 19 ],
                ny: [ 14, 14 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 13, 4 ],
                py: [ 14, 15 ],
                pz: [ 0, -1 ],
                nx: [ 2, 1 ],
                ny: [ 5, 7 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 17, 7 ],
                py: [ 9, 11 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 17, 9 ],
                py: [ 12, 6 ],
                pz: [ 0, 1 ],
                nx: [ 15, 10 ],
                ny: [ 9, 8 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 0, 1 ],
                pz: [ 2, 2 ],
                nx: [ 9, 7 ],
                ny: [ 6, 17 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 3, 3, 15 ],
                py: [ 3, 4, 6 ],
                pz: [ 2, 1, 0 ],
                nx: [ 0, 2, 22 ],
                ny: [ 5, 8, 9 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 4,
                px: [ 15, 15, 15, 1 ],
                py: [ 12, 6, 6, 1 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 4, 7, 13, 4 ],
                ny: [ 4, 7, 12, 2 ],
                nz: [ 2, 1, 0, 2 ]
            }, {
                size: 2,
                px: [ 3, 15 ],
                py: [ 12, 6 ],
                pz: [ 0, -1 ],
                nx: [ 9, 1 ],
                ny: [ 14, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 12, 12 ],
                py: [ 11, 12 ],
                pz: [ 0, 0 ],
                nx: [ 9, 5 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 23, 6, 7 ],
                py: [ 23, 3, 4 ],
                pz: [ 0, -1, -1 ],
                nx: [ 19, 16, 17 ],
                ny: [ 17, 14, 15 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 9, 5 ],
                py: [ 2, 7 ],
                pz: [ 1, -1 ],
                nx: [ 11, 23 ],
                ny: [ 10, 18 ],
                nz: [ 1, 0 ]
            }, {
                size: 3,
                px: [ 0, 0, 0 ],
                py: [ 4, 9, 2 ],
                pz: [ 1, 0, 2 ],
                nx: [ 2, 0, 0 ],
                ny: [ 9, 2, 1 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 12, 0 ],
                py: [ 11, 9 ],
                pz: [ 0, -1 ],
                nx: [ 1, 0 ],
                ny: [ 18, 5 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 5, 4 ],
                py: [ 10, 6 ],
                pz: [ 0, 1 ],
                nx: [ 10, 6 ],
                ny: [ 10, 18 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 12 ],
                py: [ 13, 13 ],
                pz: [ 0, -1 ],
                nx: [ 5, 11 ],
                ny: [ 1, 3 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 10, 19 ],
                py: [ 5, 22 ],
                pz: [ 1, -1 ],
                nx: [ 4, 12 ],
                ny: [ 1, 5 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 8, 6 ],
                py: [ 0, 0 ],
                pz: [ 0, 0 ],
                nx: [ 3, 12 ],
                ny: [ 0, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 6 ],
                py: [ 7, 0 ],
                pz: [ 1, -1 ],
                nx: [ 12, 12 ],
                ny: [ 10, 11 ],
                nz: [ 0, 0 ]
            }, {
                size: 4,
                px: [ 3, 1, 3, 2 ],
                py: [ 20, 9, 21, 19 ],
                pz: [ 0, 1, 0, 0 ],
                nx: [ 20, 20, 5, 12 ],
                ny: [ 10, 15, 2, 10 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 3, 1 ],
                ny: [ 4, 6 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 5, 11, 11 ],
                py: [ 1, 3, 4 ],
                pz: [ 2, 1, 1 ],
                nx: [ 3, 3, 7 ],
                ny: [ 5, 5, 0 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 3,
                px: [ 8, 6, 7 ],
                py: [ 10, 5, 6 ],
                pz: [ 1, 1, 1 ],
                nx: [ 23, 3, 7 ],
                ny: [ 0, 5, 0 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 2, 7 ],
                py: [ 2, 14 ],
                pz: [ 1, -1 ],
                nx: [ 7, 3 ],
                ny: [ 12, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 5, 3 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 13, 3 ],
                ny: [ 12, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 18 ],
                py: [ 11, 4 ],
                pz: [ 0, -1 ],
                nx: [ 23, 11 ],
                ny: [ 19, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 7, 2 ],
                py: [ 12, 3 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 11, 5 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 0, 11 ],
                pz: [ 1, -1 ],
                nx: [ 3, 3 ],
                ny: [ 19, 18 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 1 ],
                py: [ 11, 11 ],
                pz: [ 1, -1 ],
                nx: [ 13, 15 ],
                ny: [ 6, 5 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 8 ],
                py: [ 9, 9 ],
                pz: [ 0, -1 ],
                nx: [ 5, 11 ],
                ny: [ 1, 3 ],
                nz: [ 2, 1 ]
            }, {
                size: 4,
                px: [ 6, 4, 8, 3 ],
                py: [ 6, 2, 4, 3 ],
                pz: [ 0, 2, 1, 2 ],
                nx: [ 7, 0, 15, 8 ],
                ny: [ 8, 8, 16, 7 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 4, 3 ],
                py: [ 22, 20 ],
                pz: [ 0, 0 ],
                nx: [ 2, 8 ],
                ny: [ 5, 4 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 12, 6 ],
                py: [ 11, 0 ],
                pz: [ 0, -1 ],
                nx: [ 0, 0 ],
                ny: [ 3, 1 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 12, 7 ],
                pz: [ 0, 1 ],
                nx: [ 3, 1 ],
                ny: [ 23, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 7, 0 ],
                py: [ 11, 5 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 2, 3 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 8, 8 ],
                py: [ 10, 10 ],
                pz: [ 0, -1 ],
                nx: [ 4, 3 ],
                ny: [ 5, 4 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 13, 3 ],
                py: [ 2, 4 ],
                pz: [ 0, -1 ],
                nx: [ 4, 3 ],
                ny: [ 3, 5 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 23, 22 ],
                pz: [ 0, 0 ],
                nx: [ 9, 0 ],
                ny: [ 7, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 1, 0 ],
                py: [ 16, 15 ],
                pz: [ 0, 0 ],
                nx: [ 0, 14 ],
                ny: [ 23, 12 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 8 ],
                py: [ 22, 0 ],
                pz: [ 0, -1 ],
                nx: [ 5, 3 ],
                ny: [ 0, 1 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 13, 13 ],
                py: [ 7, 7 ],
                pz: [ 0, -1 ],
                nx: [ 3, 2 ],
                ny: [ 17, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 20, 20 ],
                py: [ 15, 16 ],
                pz: [ 0, 0 ],
                nx: [ 7, 3 ],
                ny: [ 9, 17 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 10, 12, 11, 13, 11 ],
                py: [ 2, 2, 1, 2, 2 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 10, 18, 21, 21, 19 ],
                ny: [ 3, 1, 13, 11, 2 ],
                nz: [ 1, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 16, 3 ],
                py: [ 6, 1 ],
                pz: [ 0, 2 ],
                nx: [ 15, 18 ],
                ny: [ 8, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 19, 3 ],
                py: [ 8, 1 ],
                pz: [ 0, -1 ],
                nx: [ 9, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 10, 3 ],
                py: [ 15, 18 ],
                pz: [ 0, -1 ],
                nx: [ 3, 3 ],
                ny: [ 0, 1 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 2, 3 ],
                pz: [ 2, 2 ],
                nx: [ 7, 3 ],
                ny: [ 11, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 10 ],
                py: [ 17, 9 ],
                pz: [ 0, -1 ],
                nx: [ 11, 10 ],
                ny: [ 15, 15 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 5, 10 ],
                py: [ 2, 4 ],
                pz: [ 1, 0 ],
                nx: [ 8, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 10 ],
                py: [ 3, 4 ],
                pz: [ 0, -1 ],
                nx: [ 9, 10 ],
                ny: [ 2, 1 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 23, 11 ],
                py: [ 13, 10 ],
                pz: [ 0, 1 ],
                nx: [ 14, 7 ],
                ny: [ 5, 14 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 4 ],
                py: [ 5, 4 ],
                pz: [ 2, 2 ],
                nx: [ 9, 8 ],
                ny: [ 3, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 12, 4, 15 ],
                py: [ 5, 4, 7 ],
                pz: [ 0, -1, -1 ],
                nx: [ 3, 4, 2 ],
                ny: [ 7, 11, 5 ],
                nz: [ 1, 1, 2 ]
            }, {
                size: 2,
                px: [ 11, 4 ],
                py: [ 15, 4 ],
                pz: [ 0, -1 ],
                nx: [ 5, 9 ],
                ny: [ 7, 15 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 9, 7 ],
                py: [ 0, 1 ],
                pz: [ 1, -1 ],
                nx: [ 11, 11 ],
                ny: [ 8, 7 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 1, 1, 1, 1, 1 ],
                py: [ 11, 12, 10, 9, 9 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 4, 5, 8, 16, 11 ],
                ny: [ 4, 3, 8, 8, 6 ],
                nz: [ 1, 1, 0, 0, 0 ]
            } ],
            alpha: [ -1.059083, 1.059083, -.7846122, .7846122, -.445116, .445116, -.4483277, .4483277, -.3905999, .3905999, -.378925, .378925, -.387461, .387461, -.3110541, .3110541, -.3565056, .3565056, -.3812617, .3812617, -.3325142, .3325142, -.2787282, .2787282, -.3238869, .3238869, -.2993499, .2993499, -.2807737, .2807737, -.2855285, .2855285, -.227755, .227755, -.2031261, .2031261, -.2071574, .2071574, -.2534142, .2534142, -.2266871, .2266871, -.2229078, .2229078, -.2716325, .2716325, -.3046938, .3046938, -.2271601, .2271601, -.1987651, .1987651, -.1953664, .1953664, -.2178737, .2178737, -.2285148, .2285148, -.1891073, .1891073, -.2926469, .2926469, -.2094783, .2094783, -.1478037, .1478037, -.1707579, .1707579, -.146439, .146439, -.2462321, .2462321, -.2319978, .2319978, -.1781651, .1781651, -.1471349, .1471349, -.1953006, .1953006, -.2145108, .2145108, -.1567881, .1567881, -.2024617, .2024617, -.1883198, .1883198, -.1996976, .1996976, -.129233, .129233, -.2142242, .2142242, -.2473748, .2473748, -.1880902, .1880902, -.1874572, .1874572, -.1495984, .1495984, -.1608525, .1608525, -.1698402, .1698402, -.1898871, .1898871, -.1350238, .1350238, -.1727032, .1727032, -.1593352, .1593352, -.1476968, .1476968, -.1428431, .1428431, -.1766261, .1766261, -.1453226, .1453226, -.1929885, .1929885, -.1337582, .1337582, -.1629078, .1629078, -.09973085, .09973085, -.117276, .117276, -.1399242, .1399242, -.1613189, .1613189, -.1145695, .1145695, -.1191093, .1191093, -.12259, .12259, -.1641114, .1641114, -.1419878, .1419878, -.2183465, .2183465, -.1566968, .1566968, -.1288216, .1288216, -.1422831, .1422831, -.2000107, .2000107, -.1817265, .1817265, -.1793796, .1793796, -.1428926, .1428926, -.1182032, .1182032, -.1150421, .1150421, -.1336584, .1336584, -.1656178, .1656178, -.1386549, .1386549, -.1387461, .1387461, -.1313023, .1313023, -.1360391, .1360391, -.1305505, .1305505, -.1323399, .1323399, -.1502891, .1502891, -.1488859, .1488859, -.1126628, .1126628, -.1233623, .1233623, -.1702106, .1702106, -.1629639, .1629639, -.1337706, .1337706, -.1290384, .1290384, -.1165519, .1165519, -.1412778, .1412778, -.1470204, .1470204, -.221378, .221378, -.1472619, .1472619, -.1357071, .1357071, -.1416513, .1416513, -.1050208, .1050208, -.1480033, .1480033, -.1899871, .1899871, -.1466249, .1466249, -.1076952, .1076952, -.1035096, .1035096, -.156697, .156697, -.1364115, .1364115, -.1512889, .1512889, -.1252851, .1252851, -.12063, .12063, -.1059134, .1059134, -.1140398, .1140398, -.1359912, .1359912, -.1231201, .1231201, -.1231867, .1231867, -.09789923, .09789923, -.1590213, .1590213, -.1002206, .1002206, -.1518339, .1518339, -.1055203, .1055203, -.1012579, .1012579, -.1094956, .1094956, -.1429592, .1429592, -.1108838, .1108838, -.1116475, .1116475, -.1735371, .1735371, -.1067758, .1067758, -.1290406, .1290406, -.1156822, .1156822, -.09668217, .09668217, -.1170053, .1170053, -.1252092, .1252092, -.1135158, .1135158, -.1105896, .1105896, -.1038175, .1038175, -.1210459, .1210459, -.1078878, .1078878, -.1050808, .1050808, -.1428227, .1428227, -.16646, .16646, -.1013508, .1013508, -.120693, .120693, -.1088972, .1088972, -.1381026, .1381026, -.1109115, .1109115, -.07921549, .07921549, -.1057832, .1057832, -.09385827, .09385827, -.1486035, .1486035, -.1247401, .1247401, -.09451327, .09451327, -.1272805, .1272805, -.09616206, .09616206, -.09051084, .09051084, -.1138458, .1138458, -.1047581, .1047581, -.1382394, .1382394, -.1122203, .1122203, -.1052936, .1052936, -.1239318, .1239318, -.1241439, .1241439, -.1259012, .1259012, -.1211701, .1211701, -.1344131, .1344131, -.1127778, .1127778, -.1609745, .1609745, -.1901382, .1901382, -.1618962, .1618962, -.1230398, .1230398, -.1319311, .1319311, -.143141, .143141, -.1143306, .1143306, -.09390938, .09390938, -.1154161, .1154161, -.1141205, .1141205, -.1098048, .1098048, -.08870072, .08870072, -.1122444, .1122444, -.1114147, .1114147, -.118571, .118571, -.1107775, .1107775, -.1259167, .1259167, -.1105176, .1105176, -.1020691, .1020691, -.09607863, .09607863, -.095737, .095737, -.1054349, .1054349, -.1137856, .1137856, -.1192043, .1192043, -.1113264, .1113264, -.1093137, .1093137, -.1010919, .1010919, -.09625901, .09625901, -.09338459, .09338459, -.1142944, .1142944, -.1038877, .1038877, -.09772862, .09772862, -.1375298, .1375298, -.1394776, .1394776, -.09454765, .09454765, -.1203246, .1203246, -.08684943, .08684943, -.1135622, .1135622, -.1058181, .1058181, -.1082152, .1082152, -.1411355, .1411355, -.09978846, .09978846, -.1057874, .1057874, -.1415366, .1415366, -.09981014, .09981014, -.09261151, .09261151, -.1737173, .1737173, -.1580335, .1580335, -.09594668, .09594668, -.09336013, .09336013, -.1102373, .1102373, -.08546557, .08546557, -.09945057, .09945057, -.1146358, .1146358, -.1324734, .1324734, -.1422296, .1422296, -.0993799, .0993799, -.08381049, .08381049, -.1270714, .1270714, -.1091738, .1091738, -.1314881, .1314881, -.1085159, .1085159, -.09247554, .09247554, -.08121645, .08121645, -.1059589, .1059589, -.08307793, .08307793, -.1033103, .1033103, -.1056706, .1056706, -.1032803, .1032803, -.126684, .126684, -.09341601, .09341601, -.0768357, .0768357, -.103053, .103053, -.1051872, .1051872, -.09114946, .09114946, -.1329341, .1329341, -.0927083, .0927083, -.114175, .114175, -.09889318, .09889318, -.08856485, .08856485, -.105421, .105421, -.1092704, .1092704, -.08729085, .08729085, -.1141057, .1141057, -.1530774, .1530774, -.0812972, .0812972, -.1143335, .1143335, -.1175777, .1175777, -.1371729, .1371729, -.1394356, .1394356, -.1016308, .1016308, -.1125547, .1125547, -.096726, .096726, -.1036631, .1036631, -.08702514, .08702514, -.1264807, .1264807, -.1465688, .1465688, -.08781464, .08781464, -.08552605, .08552605, -.1145072, .1145072, -.1378489, .1378489, -.1013312, .1013312, -.1020083, .1020083, -.1015816, .1015816, -.08407101, .08407101, -.08296485, .08296485, -.08033655, .08033655, -.09003615, .09003615, -.07504954, .07504954, -.1224941, .1224941, -.09347814, .09347814, -.09555575, .09555575, -.09810025, .09810025, -.1237068, .1237068, -.1283586, .1283586, -.1082763, .1082763, -.1018145, .1018145, -.1175161, .1175161, -.1252279, .1252279, -.1370559, .1370559, -.09941339, .09941339, -.08506938, .08506938, -.1260902, .1260902, -.1014152, .1014152, -.09728694, .09728694, -.0937491, .0937491, -.09587429, .09587429, -.09516036, .09516036, -.07375173, .07375173, -.09332487, .09332487, -.09020733, .09020733, -.1133381, .1133381, -.154218, .154218, -.09692168, .09692168, -.07960904, .07960904, -.08947089, .08947089, -.07830286, .07830286, -.0990005, .0990005, -.1041293, .1041293, -.09572501, .09572501, -.08230575, .08230575, -.09194901, .09194901, -.1076971, .1076971, -.1027782, .1027782, -.1028538, .1028538, -.1013992, .1013992, -.09087585, .09087585, -.1100706, .1100706, -.1094934, .1094934, -.1107879, .1107879, -.1026915, .1026915, -.1017572, .1017572, -.07984776, .07984776, -.09015413, .09015413, -.129987, .129987, -.09164982, .09164982, -.1062788, .1062788, -.1160203, .1160203, -.08858603, .08858603, -.09762964, .09762964, -.1070694, .1070694, -.09549046, .09549046, -.1533034, .1533034, -.08663316, .08663316, -.09303018, .09303018, -.09853582, .09853582, -.09733371, .09733371, -.1048555, .1048555, -.09056041, .09056041, -.07552283, .07552283, -.08780631, .08780631, -.1123953, .1123953, -.1452948, .1452948, -.1156423, .1156423, -.08701142, .08701142, -.09713334, .09713334, -.09970888, .09970888, -.08614129, .08614129, -.07459861, .07459861, -.09253517, .09253517, -.09570092, .09570092, -.09485535, .09485535, -.1148365, .1148365, -.1063193, .1063193, -.09986686, .09986686, -.07523412, .07523412, -.1005881, .1005881, -.08249716, .08249716, -.1055866, .1055866, -.134305, .134305, -.1371056, .1371056, -.09604689, .09604689, -.1224268, .1224268, -.09211478, .09211478, -.1108371, .1108371, -.1100547, .1100547, -.0893897, .0893897, -.08655951, .08655951, -.07085816, .07085816, -.08101028, .08101028, -.08338046, .08338046, -.08309588, .08309588, -.09090584, .09090584, -.08124564, .08124564, -.09367843, .09367843, -.1011747, .1011747, -.09885045, .09885045, -.08944266, .08944266, -.08453859, .08453859, -.08308847, .08308847, -.136728, .136728, -.1295144, .1295144, -.1063965, .1063965, -.07752328, .07752328, -.09681524, .09681524, -.07862345, .07862345, -.08767746, .08767746, -.09198041, .09198041, -.09686489, .09686489 ]
        }, {
            count: 564,
            threshold: -4.517456,
            feature: [ {
                size: 5,
                px: [ 15, 9, 8, 12, 11 ],
                py: [ 3, 6, 3, 0, 8 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 6, 14, 9, 22, 23 ],
                ny: [ 8, 7, 8, 17, 3 ],
                nz: [ 1, 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 12, 13, 11, 14, 12 ],
                py: [ 9, 4, 4, 4, 5 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 4, 6, 10, 4, 15 ],
                ny: [ 3, 8, 7, 10, 9 ],
                nz: [ 1, 1, 0, 1, 0 ]
            }, {
                size: 5,
                px: [ 7, 5, 6, 8, 8 ],
                py: [ 2, 13, 2, 1, 1 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 3, 0, 4, 1, 0 ],
                ny: [ 4, 3, 10, 3, 13 ],
                nz: [ 1, 1, 1, 0, 0 ]
            }, {
                size: 5,
                px: [ 11, 2, 2, 11, 16 ],
                py: [ 9, 4, 2, 7, 11 ],
                pz: [ 0, 2, 2, 0, 0 ],
                nx: [ 8, 4, 1, 14, 0 ],
                ny: [ 4, 4, 16, 5, 13 ],
                nz: [ 1, 1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 14, 14 ],
                py: [ 18, 18 ],
                pz: [ 0, -1 ],
                nx: [ 8, 13 ],
                ny: [ 10, 16 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 15, 17, 16, 8, 18 ],
                py: [ 1, 2, 1, 0, 2 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 21, 22, 22, 22, 22 ],
                ny: [ 1, 5, 3, 4, 2 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 15, 4 ],
                py: [ 23, 3 ],
                pz: [ 0, 2 ],
                nx: [ 7, 3 ],
                ny: [ 10, 6 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 3, 6, 4, 3, 11 ],
                py: [ 10, 11, 8, 3, 8 ],
                pz: [ 1, 0, 1, 1, 0 ],
                nx: [ 3, 5, 6, 3, 0 ],
                ny: [ 4, 9, 9, 9, 0 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 3,
                px: [ 11, 11, 2 ],
                py: [ 11, 13, 16 ],
                pz: [ 0, 0, -1 ],
                nx: [ 10, 10, 9 ],
                ny: [ 10, 11, 14 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 12, 6 ],
                pz: [ 0, 1 ],
                nx: [ 4, 5 ],
                ny: [ 11, 11 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 10, 11, 13, 3, 12 ],
                py: [ 3, 4, 3, 0, 1 ],
                pz: [ 0, 0, 0, 2, 0 ],
                nx: [ 14, 18, 20, 19, 15 ],
                ny: [ 13, 1, 15, 2, 18 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 20, 14, 10, 12, 12 ],
                py: [ 12, 12, 4, 10, 11 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 9, 2, 9, 9, 9 ],
                ny: [ 4, 12, 5, 9, 14 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 3, 3, 3, 4, 2 ],
                py: [ 15, 16, 14, 21, 12 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 20, 10, 5, 21, 21 ],
                nz: [ 0, 1, 2, 0, -1 ]
            }, {
                size: 2,
                px: [ 18, 8 ],
                py: [ 16, 7 ],
                pz: [ 0, 1 ],
                nx: [ 14, 0 ],
                ny: [ 8, 10 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 12, 4, 16, 1 ],
                py: [ 14, 3, 8, 3 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 14, 10, 20, 13 ],
                ny: [ 13, 5, 16, 9 ],
                nz: [ 0, 1, 0, 0 ]
            }, {
                size: 5,
                px: [ 3, 8, 2, 3, 3 ],
                py: [ 7, 2, 1, 2, 4 ],
                pz: [ 1, -1, -1, -1, -1 ],
                nx: [ 1, 9, 2, 1, 1 ],
                ny: [ 3, 14, 9, 7, 2 ],
                nz: [ 1, 0, 1, 1, 1 ]
            }, {
                size: 5,
                px: [ 4, 1, 3, 2, 3 ],
                py: [ 2, 1, 2, 4, 3 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 3, 1, 2, 0, 0 ],
                nz: [ 0, 1, 0, 2, -1 ]
            }, {
                size: 4,
                px: [ 4, 8, 7, 9 ],
                py: [ 6, 11, 11, 10 ],
                pz: [ 1, 0, 0, 0 ],
                nx: [ 3, 10, 2, 20 ],
                ny: [ 4, 4, 4, 8 ],
                nz: [ 1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 1, 8 ],
                py: [ 3, 11 ],
                pz: [ 2, -1 ],
                nx: [ 8, 2 ],
                ny: [ 15, 5 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 17, 0 ],
                py: [ 13, 10 ],
                pz: [ 0, -1 ],
                nx: [ 14, 14 ],
                ny: [ 11, 10 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 22, 22, 22, 5, 22 ],
                py: [ 16, 18, 17, 2, 15 ],
                pz: [ 0, 0, 0, 2, 0 ],
                nx: [ 8, 4, 15, 6, 6 ],
                ny: [ 4, 2, 7, 11, 11 ],
                nz: [ 1, 2, 0, 1, -1 ]
            }, {
                size: 5,
                px: [ 16, 9, 8, 17, 15 ],
                py: [ 12, 6, 6, 22, 12 ],
                pz: [ 0, 1, 1, 0, 0 ],
                nx: [ 11, 23, 23, 23, 22 ],
                ny: [ 11, 23, 22, 21, 23 ],
                nz: [ 1, 0, 0, 0, -1 ]
            }, {
                size: 5,
                px: [ 5, 2, 4, 4, 9 ],
                py: [ 22, 3, 15, 20, 18 ],
                pz: [ 0, 2, 0, 0, 0 ],
                nx: [ 9, 4, 23, 7, 22 ],
                ny: [ 8, 4, 22, 19, 23 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 5,
                px: [ 8, 6, 9, 7, 3 ],
                py: [ 3, 3, 3, 3, 1 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 5, 5, 4, 4, 4 ],
                ny: [ 0, 1, 1, 2, 0 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 3 ],
                py: [ 3, 3 ],
                pz: [ 2, 2 ],
                nx: [ 3, 6 ],
                ny: [ 4, 6 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 1, 1, 0, 1, 0 ],
                py: [ 17, 15, 6, 16, 10 ],
                pz: [ 0, 0, 1, 0, 0 ],
                nx: [ 4, 4, 7, 4, 8 ],
                ny: [ 2, 5, 9, 4, 4 ],
                nz: [ 2, 2, 1, 2, -1 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 13, 13 ],
                py: [ 10, 9, 11, 13, 13 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 4, 3, 3, 5, 3 ],
                ny: [ 21, 18, 17, 23, 16 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 4,
                px: [ 5, 6, 5, 9 ],
                py: [ 13, 7, 9, 23 ],
                pz: [ 0, 0, 1, 0 ],
                nx: [ 6, 15, 7, 5 ],
                ny: [ 9, 20, 7, 23 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 4, 2 ],
                pz: [ 1, 2 ],
                nx: [ 8, 23 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 7 ],
                py: [ 18, 0 ],
                pz: [ 0, 0 ],
                nx: [ 5, 7 ],
                ny: [ 8, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 4, 6 ],
                py: [ 11, 16 ],
                pz: [ 1, 0 ],
                nx: [ 10, 9 ],
                ny: [ 16, 7 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 11, 11, 11, 11 ],
                py: [ 11, 10, 12, 13 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 13, 13, 13, 9 ],
                ny: [ 11, 9, 10, 4 ],
                nz: [ 0, 0, 0, 1 ]
            }, {
                size: 4,
                px: [ 12, 6, 7, 6 ],
                py: [ 7, 11, 8, 4 ],
                pz: [ 0, 1, 1, 1 ],
                nx: [ 10, 0, 19, 7 ],
                ny: [ 21, 3, 12, 11 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 4, 4 ],
                py: [ 3, 4 ],
                pz: [ 2, 2 ],
                nx: [ 9, 1 ],
                ny: [ 4, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 19, 19 ],
                py: [ 21, 20 ],
                pz: [ 0, 0 ],
                nx: [ 7, 7 ],
                ny: [ 3, 13 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 12, 9, 13, 11, 5 ],
                py: [ 0, 2, 2, 0, 0 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 6, 4, 5, 5, 5 ],
                ny: [ 1, 3, 5, 2, 6 ],
                nz: [ 0, 0, 1, 0, 1 ]
            }, {
                size: 5,
                px: [ 4, 3, 2, 5, 7 ],
                py: [ 11, 3, 3, 7, 17 ],
                pz: [ 1, 2, 2, 0, 0 ],
                nx: [ 23, 5, 11, 5, 5 ],
                ny: [ 0, 4, 10, 2, 6 ],
                nz: [ 0, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 20, 17 ],
                py: [ 12, 3 ],
                pz: [ 0, -1 ],
                nx: [ 20, 19 ],
                ny: [ 21, 23 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 1 ],
                py: [ 12, 8 ],
                pz: [ 0, 0 ],
                nx: [ 2, 8 ],
                ny: [ 2, 16 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 16, 5 ],
                py: [ 4, 5 ],
                pz: [ 0, -1 ],
                nx: [ 7, 8 ],
                ny: [ 9, 1 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 0, 1 ],
                pz: [ 1, 1 ],
                nx: [ 1, 8 ],
                ny: [ 5, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 12, 10 ],
                pz: [ 0, 1 ],
                nx: [ 2, 20 ],
                ny: [ 23, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 11, 0, 0, 2 ],
                py: [ 14, 3, 9, 22 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 13, 14, 7, 3 ],
                ny: [ 6, 7, 11, 1 ],
                nz: [ 0, 0, 0, 2 ]
            }, {
                size: 2,
                px: [ 14, 0 ],
                py: [ 2, 3 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 4, 3 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 23, 11 ],
                py: [ 18, 11 ],
                pz: [ 0, 1 ],
                nx: [ 3, 2 ],
                ny: [ 1, 21 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 17, 14 ],
                pz: [ 0, -1 ],
                nx: [ 4, 5 ],
                ny: [ 10, 8 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 9, 18 ],
                py: [ 7, 14 ],
                pz: [ 1, 0 ],
                nx: [ 18, 9 ],
                ny: [ 17, 8 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 8 ],
                py: [ 4, 22 ],
                pz: [ 2, 0 ],
                nx: [ 4, 3 ],
                ny: [ 10, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 22 ],
                py: [ 4, 9 ],
                pz: [ 2, -1 ],
                nx: [ 11, 23 ],
                ny: [ 8, 14 ],
                nz: [ 1, 0 ]
            }, {
                size: 3,
                px: [ 23, 5, 5 ],
                py: [ 8, 2, 1 ],
                pz: [ 0, 2, 2 ],
                nx: [ 10, 10, 2 ],
                ny: [ 4, 4, 2 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 14, 23 ],
                pz: [ 0, -1 ],
                nx: [ 3, 11 ],
                ny: [ 4, 13 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 3, 2 ],
                py: [ 7, 0 ],
                pz: [ 1, -1 ],
                nx: [ 4, 3 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 12, 1 ],
                py: [ 19, 13 ],
                pz: [ 0, -1 ],
                nx: [ 9, 12 ],
                ny: [ 10, 18 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 11, 10 ],
                pz: [ 1, 1 ],
                nx: [ 4, 1 ],
                ny: [ 5, 11 ],
                nz: [ 2, -1 ]
            }, {
                size: 5,
                px: [ 9, 12, 4, 8, 8 ],
                py: [ 3, 5, 2, 9, 8 ],
                pz: [ 1, 0, 2, 1, 1 ],
                nx: [ 23, 23, 23, 23, 23 ],
                ny: [ 3, 4, 6, 5, 5 ],
                nz: [ 0, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 3, 9 ],
                ny: [ 4, 6 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 13, 13, 13, 7, 7 ],
                py: [ 11, 10, 9, 6, 6 ],
                pz: [ 0, 0, 0, 1, -1 ],
                nx: [ 5, 5, 15, 5, 2 ],
                ny: [ 5, 15, 9, 9, 1 ],
                nz: [ 0, 0, 0, 1, 2 ]
            }, {
                size: 2,
                px: [ 19, 7 ],
                py: [ 21, 7 ],
                pz: [ 0, 1 ],
                nx: [ 14, 10 ],
                ny: [ 15, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 5 ],
                py: [ 3, 4 ],
                pz: [ 2, 2 ],
                nx: [ 21, 0 ],
                ny: [ 23, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 0 ],
                py: [ 0, 0 ],
                pz: [ 1, -1 ],
                nx: [ 3, 2 ],
                ny: [ 1, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 9, 0 ],
                py: [ 4, 0 ],
                pz: [ 0, -1 ],
                nx: [ 5, 12 ],
                ny: [ 0, 1 ],
                nz: [ 1, 0 ]
            }, {
                size: 5,
                px: [ 14, 16, 12, 15, 13 ],
                py: [ 0, 1, 0, 0, 0 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 4, 8, 8, 4, 9 ],
                ny: [ 2, 3, 4, 1, 3 ],
                nz: [ 2, 1, 1, 2, -1 ]
            }, {
                size: 3,
                px: [ 4, 17, 2 ],
                py: [ 11, 14, 1 ],
                pz: [ 1, -1, -1 ],
                nx: [ 9, 8, 17 ],
                ny: [ 1, 4, 0 ],
                nz: [ 1, 1, 0 ]
            }, {
                size: 2,
                px: [ 18, 9 ],
                py: [ 17, 7 ],
                pz: [ 0, 1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 3, 0 ],
                pz: [ 1, 2 ],
                nx: [ 10, 11 ],
                ny: [ 6, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 21, 21, 21, 21, 20 ],
                py: [ 17, 16, 19, 18, 21 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 0, 0, 0, 0, 0 ],
                ny: [ 4, 9, 11, 6, 6 ],
                nz: [ 1, 0, 0, 1, -1 ]
            }, {
                size: 2,
                px: [ 12, 0 ],
                py: [ 7, 1 ],
                pz: [ 0, -1 ],
                nx: [ 8, 11 ],
                ny: [ 4, 17 ],
                nz: [ 1, 0 ]
            }, {
                size: 4,
                px: [ 13, 0, 0, 0 ],
                py: [ 15, 0, 0, 0 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 3, 7, 4, 6 ],
                ny: [ 2, 7, 5, 9 ],
                nz: [ 2, 1, 2, 1 ]
            }, {
                size: 2,
                px: [ 2, 9 ],
                py: [ 3, 12 ],
                pz: [ 2, 0 ],
                nx: [ 2, 0 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 3 ],
                py: [ 6, 1 ],
                pz: [ 1, -1 ],
                nx: [ 20, 21 ],
                ny: [ 19, 14 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 5, 22, 22, 11, 22 ],
                py: [ 1, 4, 3, 3, 2 ],
                pz: [ 2, 0, 0, 1, -1 ],
                nx: [ 7, 13, 14, 8, 15 ],
                ny: [ 3, 6, 6, 3, 7 ],
                nz: [ 1, 0, 0, 1, 0 ]
            }, {
                size: 2,
                px: [ 12, 19 ],
                py: [ 5, 15 ],
                pz: [ 0, -1 ],
                nx: [ 16, 4 ],
                ny: [ 8, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 1, 0 ],
                py: [ 11, 9 ],
                pz: [ 1, 1 ],
                nx: [ 5, 0 ],
                ny: [ 3, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 8, 3, 4, 2 ],
                py: [ 6, 7, 5, 3 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 13, 14, 11, 11 ],
                ny: [ 11, 13, 3, 5 ],
                nz: [ 0, 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 5, 6 ],
                pz: [ 0, 0 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 9 ],
                py: [ 6, 17 ],
                pz: [ 1, 0 ],
                nx: [ 9, 4 ],
                ny: [ 15, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 6, 3, 6 ],
                py: [ 6, 3, 5 ],
                pz: [ 1, 2, 1 ],
                nx: [ 11, 10, 4 ],
                ny: [ 8, 11, 5 ],
                nz: [ 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 16 ],
                py: [ 0, 1 ],
                pz: [ 1, -1 ],
                nx: [ 19, 17 ],
                ny: [ 1, 0 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 21, 20 ],
                py: [ 4, 1 ],
                pz: [ 0, 0 ],
                nx: [ 11, 5 ],
                ny: [ 0, 0 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 8, 9 ],
                ny: [ 4, 10 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 1 ],
                py: [ 0, 0 ],
                pz: [ 1, -1 ],
                nx: [ 13, 12 ],
                ny: [ 6, 5 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 5, 4 ],
                py: [ 3, 11 ],
                pz: [ 1, -1 ],
                nx: [ 3, 17 ],
                ny: [ 1, 3 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 12, 13 ],
                py: [ 4, 4 ],
                pz: [ 0, 0 ],
                nx: [ 3, 3 ],
                ny: [ 1, 1 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 3, 18 ],
                py: [ 2, 7 ],
                pz: [ 2, 0 ],
                nx: [ 8, 1 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 16, 6 ],
                py: [ 8, 2 ],
                pz: [ 0, 1 ],
                nx: [ 8, 9 ],
                ny: [ 4, 19 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 12, 3, 14 ],
                py: [ 13, 3, 15 ],
                pz: [ 0, -1, -1 ],
                nx: [ 0, 1, 0 ],
                ny: [ 16, 18, 15 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 1 ],
                py: [ 3, 4 ],
                pz: [ 2, -1 ],
                nx: [ 7, 14 ],
                ny: [ 10, 14 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 9, 16 ],
                py: [ 6, 10 ],
                pz: [ 1, 0 ],
                nx: [ 8, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 11 ],
                py: [ 4, 4 ],
                pz: [ 0, 0 ],
                nx: [ 7, 23 ],
                ny: [ 3, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 2, 4, 3, 4, 4 ],
                py: [ 1, 2, 0, 1, 1 ],
                pz: [ 1, 0, 1, 0, -1 ],
                nx: [ 11, 9, 4, 9, 5 ],
                ny: [ 6, 5, 3, 6, 3 ],
                nz: [ 0, 0, 1, 0, 1 ]
            }, {
                size: 2,
                px: [ 6, 0 ],
                py: [ 14, 1 ],
                pz: [ 0, -1 ],
                nx: [ 2, 5 ],
                ny: [ 2, 9 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 6, 7 ],
                py: [ 7, 12 ],
                pz: [ 0, 0 ],
                nx: [ 3, 22 ],
                ny: [ 3, 16 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 4 ],
                py: [ 1, 1 ],
                pz: [ 0, 1 ],
                nx: [ 2, 6 ],
                ny: [ 2, 21 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 13, 1 ],
                py: [ 11, 6 ],
                pz: [ 0, -1 ],
                nx: [ 12, 6 ],
                ny: [ 5, 2 ],
                nz: [ 0, 1 ]
            }, {
                size: 5,
                px: [ 10, 5, 11, 10, 10 ],
                py: [ 4, 3, 4, 6, 5 ],
                pz: [ 0, 1, 0, 0, 0 ],
                nx: [ 4, 7, 13, 8, 4 ],
                ny: [ 2, 8, 9, 4, 4 ],
                nz: [ 2, 1, 0, 1, -1 ]
            }, {
                size: 4,
                px: [ 7, 8, 7, 8 ],
                py: [ 11, 3, 4, 7 ],
                pz: [ 1, 1, 1, 1 ],
                nx: [ 0, 7, 3, 8 ],
                ny: [ 0, 12, 2, 4 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 4, 7 ],
                pz: [ 2, 1 ],
                nx: [ 10, 1 ],
                ny: [ 7, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 19, 5 ],
                pz: [ 0, -1 ],
                nx: [ 11, 5 ],
                ny: [ 17, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 11, 12 ],
                py: [ 4, 4 ],
                pz: [ 0, 0 ],
                nx: [ 7, 5 ],
                ny: [ 8, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 4, 8, 4 ],
                py: [ 2, 9, 4 ],
                pz: [ 2, 1, 2 ],
                nx: [ 3, 19, 3 ],
                ny: [ 1, 16, 5 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 3, 7 ],
                py: [ 0, 1 ],
                pz: [ 1, 0 ],
                nx: [ 2, 3 ],
                ny: [ 15, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 0, 4 ],
                py: [ 2, 0 ],
                pz: [ 2, -1 ],
                nx: [ 9, 16 ],
                ny: [ 5, 11 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 14, 15 ],
                py: [ 23, 16 ],
                pz: [ 0, 0 ],
                nx: [ 13, 3 ],
                ny: [ 15, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 3 ],
                py: [ 0, 1 ],
                pz: [ 1, -1 ],
                nx: [ 3, 7 ],
                ny: [ 0, 0 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 7, 6 ],
                py: [ 12, 12 ],
                pz: [ 0, 0 ],
                nx: [ 4, 8 ],
                ny: [ 5, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 4, 1, 2, 4, 5 ],
                py: [ 1, 0, 0, 0, 6 ],
                pz: [ 0, 2, 1, 0, 1 ],
                nx: [ 4, 8, 7, 8, 6 ],
                ny: [ 4, 10, 11, 4, 4 ],
                nz: [ 1, 0, 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 12, 12 ],
                py: [ 15, 8 ],
                pz: [ 0, -1 ],
                nx: [ 7, 15 ],
                ny: [ 16, 14 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 8 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 4, 6 ],
                ny: [ 2, 8 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 14, 4 ],
                py: [ 19, 23 ],
                pz: [ 0, -1 ],
                nx: [ 7, 14 ],
                ny: [ 11, 18 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 7, 4 ],
                pz: [ 1, 2 ],
                nx: [ 2, 22 ],
                ny: [ 5, 19 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 8, 15 ],
                py: [ 7, 17 ],
                pz: [ 1, 0 ],
                nx: [ 14, 4 ],
                ny: [ 15, 5 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 10, 11 ],
                py: [ 9, 8 ],
                pz: [ 1, -1 ],
                nx: [ 23, 5 ],
                ny: [ 19, 4 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 11, 1 ],
                py: [ 7, 9 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 4, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 14, 7 ],
                py: [ 6, 9 ],
                pz: [ 0, 0 ],
                nx: [ 4, 11 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 4 ],
                py: [ 0, 5 ],
                pz: [ 0, -1 ],
                nx: [ 2, 2 ],
                ny: [ 0, 4 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 10, 22 ],
                py: [ 5, 20 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 1, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 3,
                px: [ 23, 11, 11 ],
                py: [ 17, 9, 8 ],
                pz: [ 0, 1, 1 ],
                nx: [ 13, 8, 8 ],
                ny: [ 5, 3, 3 ],
                nz: [ 0, 1, -1 ]
            }, {
                size: 2,
                px: [ 18, 9 ],
                py: [ 0, 21 ],
                pz: [ 0, -1 ],
                nx: [ 10, 10 ],
                ny: [ 2, 1 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 11, 10, 11, 11, 11 ],
                py: [ 11, 13, 10, 12, 12 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 11, 13, 12, 3, 8 ],
                ny: [ 5, 5, 5, 1, 10 ],
                nz: [ 0, 0, 0, 2, 0 ]
            }, {
                size: 2,
                px: [ 7, 8 ],
                py: [ 11, 11 ],
                pz: [ 0, 0 ],
                nx: [ 9, 16 ],
                ny: [ 9, 19 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 18 ],
                py: [ 23, 7 ],
                pz: [ 0, -1 ],
                nx: [ 21, 21 ],
                ny: [ 7, 13 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 8 ],
                py: [ 7, 8 ],
                pz: [ 1, 1 ],
                nx: [ 5, 21 ],
                ny: [ 9, 13 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 17, 8 ],
                py: [ 22, 8 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 5, 10 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 2, 5, 8, 8, 4 ],
                py: [ 3, 9, 13, 23, 7 ],
                pz: [ 2, 1, 0, 0, 1 ],
                nx: [ 9, 17, 18, 19, 20 ],
                ny: [ 0, 0, 0, 2, 3 ],
                nz: [ 1, 0, 0, 0, 0 ]
            }, {
                size: 3,
                px: [ 16, 15, 2 ],
                py: [ 3, 3, 13 ],
                pz: [ 0, 0, -1 ],
                nx: [ 4, 8, 4 ],
                ny: [ 3, 6, 2 ],
                nz: [ 2, 1, 2 ]
            }, {
                size: 2,
                px: [ 4, 7 ],
                py: [ 3, 7 ],
                pz: [ 2, 1 ],
                nx: [ 15, 1 ],
                ny: [ 15, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 2, 3 ],
                pz: [ 2, 1 ],
                nx: [ 3, 18 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 2, 4 ],
                pz: [ 2, 1 ],
                nx: [ 3, 0 ],
                ny: [ 5, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 0 ],
                py: [ 10, 0 ],
                pz: [ 0, -1 ],
                nx: [ 9, 4 ],
                ny: [ 2, 0 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 2, 0 ],
                py: [ 8, 3 ],
                pz: [ 1, -1 ],
                nx: [ 4, 8 ],
                ny: [ 4, 14 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 13, 18 ],
                py: [ 14, 14 ],
                pz: [ 0, -1 ],
                nx: [ 1, 1 ],
                ny: [ 15, 13 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 3, 2, 2 ],
                py: [ 17, 10, 15 ],
                pz: [ 0, 1, 0 ],
                nx: [ 13, 2, 7 ],
                ny: [ 19, 11, 0 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 4, 17 ],
                py: [ 0, 2 ],
                pz: [ 2, 0 ],
                nx: [ 8, 5 ],
                ny: [ 11, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 15, 21 ],
                py: [ 5, 4 ],
                pz: [ 0, -1 ],
                nx: [ 15, 10 ],
                ny: [ 3, 0 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 7, 3 ],
                py: [ 13, 8 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 7, 22 ],
                py: [ 3, 4 ],
                pz: [ 1, -1 ],
                nx: [ 4, 2 ],
                ny: [ 2, 3 ],
                nz: [ 1, 1 ]
            }, {
                size: 4,
                px: [ 6, 2, 6, 5 ],
                py: [ 21, 10, 22, 20 ],
                pz: [ 0, 1, 0, 0 ],
                nx: [ 2, 3, 4, 4 ],
                ny: [ 11, 21, 23, 23 ],
                nz: [ 1, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 7, 2 ],
                py: [ 6, 8 ],
                pz: [ 1, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 4,
                px: [ 11, 11, 5, 11 ],
                py: [ 6, 5, 2, 4 ],
                pz: [ 1, 1, 2, 1 ],
                nx: [ 13, 7, 8, 3 ],
                ny: [ 7, 3, 5, 2 ],
                nz: [ 0, 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 7, 8 ],
                pz: [ 1, 0 ],
                nx: [ 3, 11 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 16, 1, 5 ],
                py: [ 3, 3, 11 ],
                pz: [ 0, -1, -1 ],
                nx: [ 16, 4, 8 ],
                ny: [ 2, 0, 1 ],
                nz: [ 0, 2, 1 ]
            }, {
                size: 2,
                px: [ 10, 0 ],
                py: [ 8, 1 ],
                pz: [ 0, -1 ],
                nx: [ 19, 18 ],
                ny: [ 20, 23 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 17, 4 ],
                py: [ 10, 4 ],
                pz: [ 0, -1 ],
                nx: [ 4, 14 ],
                ny: [ 2, 9 ],
                nz: [ 2, 0 ]
            }, {
                size: 5,
                px: [ 11, 12, 9, 10, 11 ],
                py: [ 2, 3, 2, 2, 3 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 6, 4, 2, 2, 2 ],
                ny: [ 18, 9, 3, 2, 2 ],
                nz: [ 0, 1, 2, 2, -1 ]
            }, {
                size: 2,
                px: [ 0, 1 ],
                py: [ 6, 16 ],
                pz: [ 1, 0 ],
                nx: [ 8, 16 ],
                ny: [ 5, 16 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 2, 3 ],
                pz: [ 2, 2 ],
                nx: [ 8, 17 ],
                ny: [ 4, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 2, 5, 2 ],
                py: [ 5, 6, 4 ],
                pz: [ 1, -1, -1 ],
                nx: [ 0, 0, 0 ],
                ny: [ 3, 5, 6 ],
                nz: [ 2, 1, 1 ]
            }, {
                size: 5,
                px: [ 0, 0, 0, 0, 0 ],
                py: [ 6, 15, 16, 13, 14 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 4, 5, 8, 6, 8 ],
                ny: [ 4, 16, 8, 15, 4 ],
                nz: [ 1, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 3, 5 ],
                ny: [ 4, 16 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 21, 19, 21, 21, 21 ],
                py: [ 17, 23, 18, 19, 20 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 5, 2, 3, 6, 6 ],
                ny: [ 12, 5, 5, 12, 12 ],
                nz: [ 0, 1, 1, 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 2 ],
                py: [ 11, 1 ],
                pz: [ 1, -1 ],
                nx: [ 5, 11 ],
                ny: [ 3, 5 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 5, 3 ],
                pz: [ 0, 1 ],
                nx: [ 6, 15 ],
                ny: [ 11, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 2 ],
                py: [ 4, 2 ],
                pz: [ 1, -1 ],
                nx: [ 4, 3 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 10, 6 ],
                py: [ 20, 6 ],
                pz: [ 0, -1 ],
                nx: [ 5, 10 ],
                ny: [ 11, 17 ],
                nz: [ 1, 0 ]
            }, {
                size: 4,
                px: [ 8, 4, 7, 11 ],
                py: [ 7, 4, 5, 8 ],
                pz: [ 1, 2, 1, 0 ],
                nx: [ 13, 10, 5, 21 ],
                ny: [ 9, 3, 5, 4 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 7, 13 ],
                py: [ 10, 7 ],
                pz: [ 0, 0 ],
                nx: [ 10, 8 ],
                ny: [ 9, 18 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 1, 0 ],
                pz: [ 2, 2 ],
                nx: [ 8, 5 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 5, 2, 5, 8, 4 ],
                py: [ 8, 4, 14, 23, 7 ],
                pz: [ 1, 2, 0, 0, 1 ],
                nx: [ 18, 4, 16, 17, 17 ],
                ny: [ 1, 0, 0, 1, 1 ],
                nz: [ 0, 2, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 2 ],
                py: [ 2, 4 ],
                pz: [ 1, -1 ],
                nx: [ 8, 8 ],
                ny: [ 4, 3 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 6, 1 ],
                py: [ 8, 15 ],
                pz: [ 0, -1 ],
                nx: [ 8, 3 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 10, 1 ],
                py: [ 7, 2 ],
                pz: [ 1, -1 ],
                nx: [ 6, 6 ],
                ny: [ 9, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 4, 1 ],
                py: [ 6, 2 ],
                pz: [ 1, -1 ],
                nx: [ 1, 10 ],
                ny: [ 16, 12 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 7, 2 ],
                pz: [ 1, -1 ],
                nx: [ 8, 9 ],
                ny: [ 8, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 4, 8, 7, 6, 6 ],
                py: [ 0, 0, 0, 1, 1 ],
                pz: [ 1, 0, 0, 0, -1 ],
                nx: [ 11, 5, 8, 4, 10 ],
                ny: [ 5, 3, 4, 4, 5 ],
                nz: [ 0, 1, 1, 1, 0 ]
            }, {
                size: 2,
                px: [ 5, 6 ],
                py: [ 8, 5 ],
                pz: [ 0, 0 ],
                nx: [ 6, 6 ],
                ny: [ 8, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 18, 5 ],
                py: [ 19, 5 ],
                pz: [ 0, -1 ],
                nx: [ 4, 21 ],
                ny: [ 5, 19 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 9, 5 ],
                py: [ 13, 6 ],
                pz: [ 0, 1 ],
                nx: [ 2, 2 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 4 ],
                py: [ 17, 6 ],
                pz: [ 0, 1 ],
                nx: [ 10, 2 ],
                ny: [ 15, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 13, 13, 19 ],
                py: [ 11, 12, 8 ],
                pz: [ 0, 0, -1 ],
                nx: [ 12, 3, 8 ],
                ny: [ 4, 1, 4 ],
                nz: [ 0, 2, 1 ]
            }, {
                size: 3,
                px: [ 11, 7, 4 ],
                py: [ 5, 2, 1 ],
                pz: [ 0, -1, -1 ],
                nx: [ 9, 2, 4 ],
                ny: [ 11, 3, 6 ],
                nz: [ 0, 2, 1 ]
            }, {
                size: 2,
                px: [ 10, 7 ],
                py: [ 15, 2 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 0, 1 ],
                nz: [ 2, 2 ]
            }, {
                size: 5,
                px: [ 8, 9, 16, 18, 18 ],
                py: [ 0, 1, 1, 1, 1 ],
                pz: [ 1, 1, 0, 0, -1 ],
                nx: [ 5, 5, 6, 4, 4 ],
                ny: [ 21, 20, 23, 17, 18 ],
                nz: [ 0, 0, 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 7 ],
                py: [ 1, 1 ],
                pz: [ 1, 1 ],
                nx: [ 20, 19 ],
                ny: [ 2, 1 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 10, 11 ],
                pz: [ 1, 1 ],
                nx: [ 3, 3 ],
                ny: [ 10, 10 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 5 ],
                py: [ 23, 1 ],
                pz: [ 0, -1 ],
                nx: [ 4, 3 ],
                ny: [ 10, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 1, 10 ],
                py: [ 4, 7 ],
                pz: [ 2, -1 ],
                nx: [ 4, 3 ],
                ny: [ 23, 21 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 10, 21 ],
                py: [ 11, 18 ],
                pz: [ 1, 0 ],
                nx: [ 10, 4 ],
                ny: [ 18, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 23 ],
                py: [ 11, 15 ],
                pz: [ 0, -1 ],
                nx: [ 11, 11 ],
                ny: [ 7, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 10, 1 ],
                py: [ 7, 7 ],
                pz: [ 1, -1 ],
                nx: [ 15, 4 ],
                ny: [ 14, 4 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 1, 2 ],
                py: [ 9, 20 ],
                pz: [ 1, 0 ],
                nx: [ 21, 3 ],
                ny: [ 12, 20 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 7, 4 ],
                py: [ 0, 0 ],
                pz: [ 1, 2 ],
                nx: [ 4, 2 ],
                ny: [ 0, 19 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 3, 0 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 1 ],
                py: [ 5, 0 ],
                pz: [ 1, -1 ],
                nx: [ 12, 10 ],
                ny: [ 11, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 11, 12 ],
                py: [ 11, 14 ],
                pz: [ 1, -1 ],
                nx: [ 18, 16 ],
                ny: [ 21, 15 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 18 ],
                py: [ 1, 5 ],
                pz: [ 2, -1 ],
                nx: [ 4, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 9, 10 ],
                py: [ 18, 7 ],
                pz: [ 0, -1 ],
                nx: [ 3, 6 ],
                ny: [ 0, 0 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 19, 2 ],
                py: [ 1, 4 ],
                pz: [ 0, -1 ],
                nx: [ 22, 22 ],
                ny: [ 13, 15 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 13, 15, 20 ],
                py: [ 14, 21, 10 ],
                pz: [ 0, -1, -1 ],
                nx: [ 15, 7, 7 ],
                ny: [ 13, 6, 8 ],
                nz: [ 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 6, 7 ],
                pz: [ 1, 1 ],
                nx: [ 8, 7 ],
                ny: [ 4, 8 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 5, 3 ],
                pz: [ 1, 2 ],
                nx: [ 5, 10 ],
                ny: [ 2, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 14, 11 ],
                py: [ 7, 16 ],
                pz: [ 0, -1 ],
                nx: [ 1, 0 ],
                ny: [ 17, 4 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 14, 18 ],
                py: [ 17, 18 ],
                pz: [ 0, -1 ],
                nx: [ 8, 14 ],
                ny: [ 10, 16 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 6, 11 ],
                py: [ 13, 11 ],
                pz: [ 0, -1 ],
                nx: [ 8, 9 ],
                ny: [ 12, 9 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 8, 9 ],
                py: [ 2, 2 ],
                pz: [ 0, 0 ],
                nx: [ 3, 3 ],
                ny: [ 2, 2 ],
                nz: [ 2, -1 ]
            }, {
                size: 3,
                px: [ 21, 21, 21 ],
                py: [ 14, 16, 15 ],
                pz: [ 0, 0, 0 ],
                nx: [ 14, 12, 0 ],
                ny: [ 5, 12, 6 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 4, 21 ],
                py: [ 6, 15 ],
                pz: [ 1, -1 ],
                nx: [ 5, 1 ],
                ny: [ 6, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 2, 1 ],
                pz: [ 1, 2 ],
                nx: [ 8, 0 ],
                ny: [ 4, 20 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 13, 2 ],
                py: [ 9, 1 ],
                pz: [ 0, -1 ],
                nx: [ 3, 5 ],
                ny: [ 1, 2 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 16, 1 ],
                py: [ 5, 4 ],
                pz: [ 0, -1 ],
                nx: [ 17, 8 ],
                ny: [ 3, 2 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 9, 2 ],
                py: [ 7, 1 ],
                pz: [ 1, -1 ],
                nx: [ 20, 20 ],
                ny: [ 17, 16 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 5, 7 ],
                py: [ 3, 6 ],
                pz: [ 2, -1 ],
                nx: [ 9, 9 ],
                ny: [ 6, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 11, 17 ],
                py: [ 4, 1 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 15, 2 ],
                py: [ 11, 0 ],
                pz: [ 0, -1 ],
                nx: [ 5, 14 ],
                ny: [ 1, 12 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 22, 19 ],
                py: [ 3, 0 ],
                pz: [ 0, -1 ],
                nx: [ 9, 4 ],
                ny: [ 6, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 1, 22 ],
                py: [ 3, 21 ],
                pz: [ 0, -1 ],
                nx: [ 0, 0 ],
                ny: [ 1, 0 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 11, 12 ],
                pz: [ 0, 0 ],
                nx: [ 1, 2 ],
                ny: [ 1, 4 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 18, 3 ],
                py: [ 8, 1 ],
                pz: [ 0, 2 ],
                nx: [ 13, 1 ],
                ny: [ 8, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 6 ],
                py: [ 21, 3 ],
                pz: [ 0, -1 ],
                nx: [ 11, 11 ],
                ny: [ 6, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 15, 14 ],
                py: [ 4, 4 ],
                pz: [ 0, 0 ],
                nx: [ 17, 1 ],
                ny: [ 12, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 3 ],
                py: [ 12, 1 ],
                pz: [ 0, -1 ],
                nx: [ 1, 2 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 3, 2 ],
                py: [ 7, 3 ],
                pz: [ 0, 1 ],
                nx: [ 16, 2 ],
                ny: [ 3, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 7, 20 ],
                pz: [ 1, -1 ],
                nx: [ 9, 8 ],
                ny: [ 4, 6 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 19, 2 ],
                py: [ 10, 2 ],
                pz: [ 0, -1 ],
                nx: [ 9, 4 ],
                ny: [ 3, 1 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 14, 9 ],
                py: [ 0, 23 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 3, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 6, 9 ],
                py: [ 4, 10 ],
                pz: [ 1, 0 ],
                nx: [ 10, 9 ],
                ny: [ 9, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 6, 9, 10, 8 ],
                py: [ 20, 23, 18, 23 ],
                pz: [ 0, 0, 0, 0 ],
                nx: [ 9, 22, 1, 2 ],
                ny: [ 21, 14, 2, 5 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 17, 18 ],
                py: [ 13, 6 ],
                pz: [ 0, -1 ],
                nx: [ 6, 7 ],
                ny: [ 9, 11 ],
                nz: [ 1, 1 ]
            }, {
                size: 5,
                px: [ 18, 19, 20, 19, 20 ],
                py: [ 15, 19, 16, 20, 17 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 11, 22, 23, 23, 23 ],
                ny: [ 10, 22, 20, 19, 19 ],
                nz: [ 1, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 1, 0 ],
                pz: [ 1, 1 ],
                nx: [ 21, 11 ],
                ny: [ 0, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 0 ],
                py: [ 9, 3 ],
                pz: [ 0, -1 ],
                nx: [ 9, 4 ],
                ny: [ 2, 1 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 14, 23 ],
                py: [ 2, 18 ],
                pz: [ 0, -1 ],
                nx: [ 15, 18 ],
                ny: [ 1, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 9, 3 ],
                py: [ 0, 0 ],
                pz: [ 1, -1 ],
                nx: [ 3, 12 ],
                ny: [ 1, 5 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 8, 8 ],
                py: [ 7, 8 ],
                pz: [ 1, 1 ],
                nx: [ 8, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 1, 0 ],
                py: [ 1, 3 ],
                pz: [ 2, -1 ],
                nx: [ 7, 19 ],
                ny: [ 9, 15 ],
                nz: [ 1, 0 ]
            }, {
                size: 3,
                px: [ 16, 6, 4 ],
                py: [ 21, 5, 4 ],
                pz: [ 0, -1, -1 ],
                nx: [ 4, 19, 8 ],
                ny: [ 5, 21, 11 ],
                nz: [ 2, 0, 1 ]
            }, {
                size: 2,
                px: [ 5, 5 ],
                py: [ 6, 6 ],
                pz: [ 1, -1 ],
                nx: [ 10, 10 ],
                ny: [ 10, 12 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 11 ],
                py: [ 2, 5 ],
                pz: [ 1, 0 ],
                nx: [ 3, 4 ],
                ny: [ 4, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 8, 6, 2 ],
                py: [ 4, 10, 2 ],
                pz: [ 1, 1, 2 ],
                nx: [ 2, 18, 5 ],
                ny: [ 0, 11, 5 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 7 ],
                py: [ 9, 7 ],
                pz: [ 0, -1 ],
                nx: [ 12, 3 ],
                ny: [ 9, 5 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 14, 13 ],
                py: [ 20, 20 ],
                pz: [ 0, 0 ],
                nx: [ 13, 3 ],
                ny: [ 21, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 7 ],
                py: [ 5, 3 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 1, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 6, 2 ],
                py: [ 21, 5 ],
                pz: [ 0, -1 ],
                nx: [ 2, 3 ],
                ny: [ 5, 10 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 23, 5 ],
                py: [ 6, 0 ],
                pz: [ 0, 2 ],
                nx: [ 21, 4 ],
                ny: [ 6, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 7, 6 ],
                pz: [ 1, 1 ],
                nx: [ 8, 2 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 22, 11 ],
                py: [ 20, 9 ],
                pz: [ 0, 1 ],
                nx: [ 8, 8 ],
                ny: [ 10, 10 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 16 ],
                py: [ 21, 12 ],
                pz: [ 0, -1 ],
                nx: [ 2, 7 ],
                ny: [ 5, 23 ],
                nz: [ 2, 0 ]
            }, {
                size: 5,
                px: [ 0, 1, 1, 1, 1 ],
                py: [ 3, 1, 9, 4, 7 ],
                pz: [ 2, 2, 1, 1, 1 ],
                nx: [ 11, 22, 22, 23, 23 ],
                ny: [ 10, 21, 22, 19, 20 ],
                nz: [ 1, 0, 0, 0, -1 ]
            }, {
                size: 2,
                px: [ 17, 5 ],
                py: [ 12, 4 ],
                pz: [ 0, -1 ],
                nx: [ 8, 8 ],
                ny: [ 4, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 16, 4 ],
                py: [ 7, 10 ],
                pz: [ 0, -1 ],
                nx: [ 9, 15 ],
                ny: [ 4, 6 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 3, 5 ],
                pz: [ 2, 1 ],
                nx: [ 11, 12 ],
                ny: [ 11, 23 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 5, 2 ],
                py: [ 14, 7 ],
                pz: [ 0, 1 ],
                nx: [ 4, 17 ],
                ny: [ 18, 16 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 10, 1, 1 ],
                py: [ 12, 5, 4 ],
                pz: [ 0, -1, -1 ],
                nx: [ 7, 11, 5 ],
                ny: [ 1, 2, 1 ],
                nz: [ 1, 0, 1 ]
            }, {
                size: 2,
                px: [ 7, 6 ],
                py: [ 3, 9 ],
                pz: [ 0, -1 ],
                nx: [ 2, 2 ],
                ny: [ 2, 3 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 13, 6 ],
                py: [ 22, 9 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 3 ],
                nz: [ 1, 2 ]
            }, {
                size: 5,
                px: [ 12, 9, 10, 11, 11 ],
                py: [ 0, 0, 0, 0, 0 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 16, 5, 10, 4, 8 ],
                ny: [ 10, 3, 6, 4, 4 ],
                nz: [ 0, 1, 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 18, 19 ],
                py: [ 23, 20 ],
                pz: [ 0, 0 ],
                nx: [ 8, 5 ],
                ny: [ 11, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 3 ],
                py: [ 7, 2 ],
                pz: [ 1, 2 ],
                nx: [ 8, 4 ],
                ny: [ 4, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 8, 14, 8, 7, 4 ],
                py: [ 6, 12, 8, 6, 3 ],
                pz: [ 1, 0, 1, 1, 2 ],
                nx: [ 2, 6, 6, 7, 7 ],
                ny: [ 0, 1, 2, 0, 0 ],
                nz: [ 2, 0, 0, 0, -1 ]
            }, {
                size: 3,
                px: [ 1, 2, 3 ],
                py: [ 15, 18, 21 ],
                pz: [ 0, 0, 0 ],
                nx: [ 19, 5, 18 ],
                ny: [ 23, 5, 8 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 6, 2 ],
                py: [ 6, 1 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 12, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 3, 5 ],
                py: [ 5, 11 ],
                pz: [ 2, 1 ],
                nx: [ 14, 5 ],
                ny: [ 19, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 4 ],
                py: [ 4, 4 ],
                pz: [ 1, -1 ],
                nx: [ 11, 5 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 18, 4 ],
                py: [ 6, 4 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 5, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 6, 12 ],
                py: [ 2, 4 ],
                pz: [ 1, 0 ],
                nx: [ 8, 8 ],
                ny: [ 3, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 1, 0 ],
                py: [ 1, 1 ],
                pz: [ 1, 2 ],
                nx: [ 7, 2 ],
                ny: [ 4, 7 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 0 ],
                py: [ 20, 0 ],
                pz: [ 0, -1 ],
                nx: [ 4, 5 ],
                ny: [ 10, 11 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 6, 14 ],
                py: [ 5, 2 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 0, 2 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 5, 15 ],
                py: [ 4, 7 ],
                pz: [ 1, -1 ],
                nx: [ 4, 7 ],
                ny: [ 1, 2 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 7, 5 ],
                py: [ 2, 1 ],
                pz: [ 0, 1 ],
                nx: [ 3, 1 ],
                ny: [ 4, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 9 ],
                py: [ 4, 2 ],
                pz: [ 0, -1 ],
                nx: [ 11, 9 ],
                ny: [ 1, 3 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 2, 4 ],
                pz: [ 1, -1 ],
                nx: [ 4, 8 ],
                ny: [ 4, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 3, 7 ],
                py: [ 3, 7 ],
                pz: [ 2, 1 ],
                nx: [ 6, 8 ],
                ny: [ 14, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 0 ],
                py: [ 21, 3 ],
                pz: [ 0, 2 ],
                nx: [ 20, 8 ],
                ny: [ 10, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 5, 8 ],
                pz: [ 0, -1 ],
                nx: [ 4, 3 ],
                ny: [ 4, 2 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 7, 13 ],
                pz: [ 1, 0 ],
                nx: [ 3, 2 ],
                ny: [ 4, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 16, 10 ],
                py: [ 9, 7 ],
                pz: [ 0, 1 ],
                nx: [ 7, 9 ],
                ny: [ 3, 10 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 13, 10 ],
                py: [ 6, 7 ],
                pz: [ 0, -1 ],
                nx: [ 8, 17 ],
                ny: [ 4, 12 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 5, 10 ],
                py: [ 4, 10 ],
                pz: [ 2, 1 ],
                nx: [ 5, 4 ],
                ny: [ 9, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 15, 3, 5, 0 ],
                py: [ 12, 4, 2, 3 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 13, 7, 5, 7 ],
                ny: [ 12, 6, 0, 7 ],
                nz: [ 0, 1, 2, 1 ]
            }, {
                size: 4,
                px: [ 2, 3, 16, 17 ],
                py: [ 3, 4, 6, 6 ],
                pz: [ 2, 1, 0, 0 ],
                nx: [ 16, 16, 8, 16 ],
                ny: [ 8, 3, 10, 13 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 16, 8 ],
                py: [ 1, 4 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 9, 14 ],
                py: [ 6, 2 ],
                pz: [ 1, -1 ],
                nx: [ 8, 8 ],
                ny: [ 6, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 10, 4 ],
                pz: [ 1, 2 ],
                nx: [ 10, 0 ],
                ny: [ 5, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 9, 10 ],
                py: [ 4, 4 ],
                pz: [ 0, 0 ],
                nx: [ 9, 7 ],
                ny: [ 3, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 11, 10, 13, 6, 12 ],
                py: [ 2, 2, 2, 1, 2 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 4, 18, 18, 13, 13 ],
                ny: [ 2, 18, 19, 7, 7 ],
                nz: [ 2, 0, 0, 0, -1 ]
            }, {
                size: 4,
                px: [ 13, 13, 13, 2 ],
                py: [ 13, 12, 11, 3 ],
                pz: [ 0, 0, 0, -1 ],
                nx: [ 4, 6, 8, 11 ],
                ny: [ 2, 2, 4, 4 ],
                nz: [ 2, 1, 1, 0 ]
            }, {
                size: 2,
                px: [ 4, 7 ],
                py: [ 6, 13 ],
                pz: [ 1, 0 ],
                nx: [ 8, 10 ],
                ny: [ 4, 22 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 7 ],
                py: [ 4, 17 ],
                pz: [ 1, -1 ],
                nx: [ 0, 1 ],
                ny: [ 5, 21 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 12, 13 ],
                py: [ 22, 22 ],
                pz: [ 0, 0 ],
                nx: [ 2, 2 ],
                ny: [ 13, 13 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 4, 4, 3 ],
                py: [ 22, 23, 19 ],
                pz: [ 0, 0, 0 ],
                nx: [ 8, 12, 3 ],
                ny: [ 22, 15, 2 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 10, 12 ],
                py: [ 3, 13 ],
                pz: [ 0, -1 ],
                nx: [ 15, 2 ],
                ny: [ 10, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 3, 3 ],
                pz: [ 2, -1 ],
                nx: [ 8, 4 ],
                ny: [ 0, 0 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 6, 12 ],
                py: [ 6, 18 ],
                pz: [ 1, 0 ],
                nx: [ 12, 19 ],
                ny: [ 17, 16 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 2, 1 ],
                pz: [ 0, 1 ],
                nx: [ 5, 4 ],
                ny: [ 4, 17 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 3, 12, 11 ],
                py: [ 5, 23, 23 ],
                pz: [ 2, 0, 0 ],
                nx: [ 12, 4, 4 ],
                ny: [ 21, 17, 1 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 12, 0 ],
                py: [ 21, 5 ],
                pz: [ 0, -1 ],
                nx: [ 0, 0 ],
                ny: [ 7, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 17, 17 ],
                py: [ 12, 11 ],
                pz: [ 0, 0 ],
                nx: [ 8, 11 ],
                ny: [ 4, 11 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 0 ],
                py: [ 22, 1 ],
                pz: [ 0, -1 ],
                nx: [ 4, 6 ],
                ny: [ 1, 0 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 9, 5 ],
                pz: [ 1, 1 ],
                nx: [ 23, 11 ],
                ny: [ 23, 20 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 4, 12, 11, 9, 8 ],
                py: [ 0, 1, 1, 0, 1 ],
                pz: [ 1, 0, 0, 0, 0 ],
                nx: [ 4, 17, 8, 7, 7 ],
                ny: [ 2, 13, 4, 4, 4 ],
                nz: [ 2, 0, 1, 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 13 ],
                py: [ 12, 12 ],
                pz: [ 0, -1 ],
                nx: [ 1, 1 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 23, 4 ],
                py: [ 23, 2 ],
                pz: [ 0, -1 ],
                nx: [ 5, 2 ],
                ny: [ 23, 6 ],
                nz: [ 0, 1 ]
            }, {
                size: 3,
                px: [ 8, 16, 0 ],
                py: [ 5, 15, 6 ],
                pz: [ 1, -1, -1 ],
                nx: [ 23, 23, 11 ],
                ny: [ 18, 17, 8 ],
                nz: [ 0, 0, 1 ]
            }, {
                size: 2,
                px: [ 1, 16 ],
                py: [ 4, 15 ],
                pz: [ 2, -1 ],
                nx: [ 2, 2 ],
                ny: [ 3, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 3, 8 ],
                py: [ 7, 9 ],
                pz: [ 1, -1 ],
                nx: [ 4, 2 ],
                ny: [ 10, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 3,
                px: [ 22, 1, 9 ],
                py: [ 23, 2, 3 ],
                pz: [ 0, -1, -1 ],
                nx: [ 2, 2, 5 ],
                ny: [ 5, 4, 19 ],
                nz: [ 2, 2, 0 ]
            }, {
                size: 2,
                px: [ 2, 20 ],
                py: [ 5, 15 ],
                pz: [ 1, -1 ],
                nx: [ 2, 1 ],
                ny: [ 1, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 4, 8 ],
                py: [ 1, 19 ],
                pz: [ 1, -1 ],
                nx: [ 2, 2 ],
                ny: [ 5, 4 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 9, 10 ],
                py: [ 21, 0 ],
                pz: [ 0, -1 ],
                nx: [ 6, 5 ],
                ny: [ 1, 1 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 4, 8 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 9, 2 ],
                ny: [ 4, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 17, 3, 10 ],
                py: [ 8, 0, 2 ],
                pz: [ 0, 2, 0 ],
                nx: [ 13, 2, 6 ],
                ny: [ 15, 5, 1 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 9, 6 ],
                py: [ 20, 21 ],
                pz: [ 0, -1 ],
                nx: [ 4, 2 ],
                ny: [ 10, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 3, 7 ],
                py: [ 0, 1 ],
                pz: [ 2, 1 ],
                nx: [ 7, 20 ],
                ny: [ 1, 19 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 5 ],
                py: [ 0, 1 ],
                pz: [ 1, 0 ],
                nx: [ 3, 2 ],
                ny: [ 4, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 7 ],
                py: [ 4, 19 ],
                pz: [ 2, 0 ],
                nx: [ 5, 2 ],
                ny: [ 10, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 5,
                px: [ 3, 3, 4, 7, 7 ],
                py: [ 1, 0, 0, 0, 1 ],
                pz: [ 1, 1, 1, 0, 0 ],
                nx: [ 5, 4, 10, 8, 8 ],
                ny: [ 3, 3, 5, 4, 4 ],
                nz: [ 1, 1, 0, 1, -1 ]
            }, {
                size: 2,
                px: [ 1, 5 ],
                py: [ 0, 3 ],
                pz: [ 1, -1 ],
                nx: [ 1, 0 ],
                ny: [ 0, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 10, 0 ],
                py: [ 5, 5 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 0, 9 ],
                py: [ 0, 4 ],
                pz: [ 2, -1 ],
                nx: [ 13, 10 ],
                ny: [ 0, 0 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 13, 4 ],
                py: [ 14, 5 ],
                pz: [ 0, -1 ],
                nx: [ 4, 2 ],
                ny: [ 0, 0 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 17, 4 ],
                py: [ 13, 3 ],
                pz: [ 0, -1 ],
                nx: [ 4, 2 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 1, 0 ],
                py: [ 6, 2 ],
                pz: [ 1, -1 ],
                nx: [ 1, 6 ],
                ny: [ 2, 12 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 12, 4 ],
                py: [ 6, 0 ],
                pz: [ 0, -1 ],
                nx: [ 3, 3 ],
                ny: [ 8, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 1, 5 ],
                py: [ 1, 5 ],
                pz: [ 1, -1 ],
                nx: [ 17, 17 ],
                ny: [ 13, 7 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 7, 3 ],
                py: [ 12, 6 ],
                pz: [ 0, 1 ],
                nx: [ 3, 4 ],
                ny: [ 4, 11 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 17 ],
                py: [ 2, 8 ],
                pz: [ 1, 0 ],
                nx: [ 3, 3 ],
                ny: [ 1, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 13, 6, 6 ],
                py: [ 22, 11, 10 ],
                pz: [ 0, 1, 1 ],
                nx: [ 13, 12, 11 ],
                ny: [ 20, 20, 20 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 3, 12 ],
                ny: [ 4, 20 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 2 ],
                py: [ 1, 1 ],
                pz: [ 1, -1 ],
                nx: [ 13, 6 ],
                ny: [ 0, 0 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 2, 8 ],
                py: [ 3, 9 ],
                pz: [ 2, 0 ],
                nx: [ 8, 16 ],
                ny: [ 5, 17 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 16, 15 ],
                py: [ 1, 1 ],
                pz: [ 0, 0 ],
                nx: [ 7, 11 ],
                ny: [ 8, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 18 ],
                py: [ 21, 23 ],
                pz: [ 0, -1 ],
                nx: [ 1, 1 ],
                ny: [ 4, 3 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 1, 5 ],
                py: [ 0, 2 ],
                pz: [ 1, -1 ],
                nx: [ 15, 11 ],
                ny: [ 8, 7 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 5, 4 ],
                py: [ 7, 8 ],
                pz: [ 1, -1 ],
                nx: [ 9, 10 ],
                ny: [ 13, 11 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 7, 4 ],
                py: [ 10, 4 ],
                pz: [ 1, 2 ],
                nx: [ 22, 4 ],
                ny: [ 0, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 3 ],
                py: [ 3, 1 ],
                pz: [ 0, 2 ],
                nx: [ 8, 0 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 21 ],
                py: [ 11, 22 ],
                pz: [ 0, -1 ],
                nx: [ 10, 11 ],
                ny: [ 11, 9 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 5, 5 ],
                py: [ 0, 1 ],
                pz: [ 2, 2 ],
                nx: [ 2, 21 ],
                ny: [ 6, 14 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 10, 10, 1 ],
                py: [ 11, 0, 5 ],
                pz: [ 0, -1, -1 ],
                nx: [ 6, 12, 5 ],
                ny: [ 2, 5, 2 ],
                nz: [ 1, 0, 1 ]
            }, {
                size: 2,
                px: [ 9, 10 ],
                py: [ 5, 6 ],
                pz: [ 0, 0 ],
                nx: [ 12, 19 ],
                ny: [ 23, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 9, 6 ],
                pz: [ 0, 1 ],
                nx: [ 21, 0 ],
                ny: [ 23, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 12 ],
                py: [ 19, 15 ],
                pz: [ 0, 0 ],
                nx: [ 13, 0 ],
                ny: [ 17, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 14, 0 ],
                py: [ 17, 3 ],
                pz: [ 0, -1 ],
                nx: [ 7, 16 ],
                ny: [ 8, 19 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 2, 4 ],
                pz: [ 2, 1 ],
                nx: [ 8, 1 ],
                ny: [ 4, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 13, 10 ],
                py: [ 23, 20 ],
                pz: [ 0, -1 ],
                nx: [ 4, 7 ],
                ny: [ 5, 10 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 16, 9 ],
                py: [ 22, 5 ],
                pz: [ 0, -1 ],
                nx: [ 4, 2 ],
                ny: [ 10, 3 ],
                nz: [ 1, 2 ]
            }, {
                size: 4,
                px: [ 3, 1, 1, 5 ],
                py: [ 4, 2, 1, 2 ],
                pz: [ 0, 2, 2, 1 ],
                nx: [ 13, 5, 8, 0 ],
                ny: [ 22, 2, 9, 2 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 0, 0 ],
                pz: [ 1, -1 ],
                nx: [ 19, 20 ],
                ny: [ 1, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 7, 22 ],
                py: [ 6, 8 ],
                pz: [ 1, 0 ],
                nx: [ 4, 4 ],
                ny: [ 2, 4 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 4, 4 ],
                pz: [ 2, 1 ],
                nx: [ 10, 20 ],
                ny: [ 10, 6 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 12 ],
                py: [ 6, 15 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 2, 5 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 2, 7 ],
                py: [ 4, 10 ],
                pz: [ 2, -1 ],
                nx: [ 3, 6 ],
                ny: [ 4, 8 ],
                nz: [ 2, 1 ]
            }, {
                size: 3,
                px: [ 11, 11, 4 ],
                py: [ 0, 5, 7 ],
                pz: [ 1, -1, -1 ],
                nx: [ 6, 12, 12 ],
                ny: [ 1, 1, 2 ],
                nz: [ 1, 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 17 ],
                py: [ 4, 18 ],
                pz: [ 0, -1 ],
                nx: [ 8, 2 ],
                ny: [ 10, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 17, 17 ],
                py: [ 10, 18 ],
                pz: [ 0, -1 ],
                nx: [ 8, 8 ],
                ny: [ 2, 3 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 9, 9 ],
                py: [ 7, 7 ],
                pz: [ 1, -1 ],
                nx: [ 7, 4 ],
                ny: [ 6, 3 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 18, 21 ],
                py: [ 0, 0 ],
                pz: [ 0, -1 ],
                nx: [ 11, 6 ],
                ny: [ 5, 3 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 5, 2 ],
                py: [ 8, 4 ],
                pz: [ 0, 2 ],
                nx: [ 5, 8 ],
                ny: [ 9, 16 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 12, 2 ],
                py: [ 5, 4 ],
                pz: [ 0, -1 ],
                nx: [ 4, 15 ],
                ny: [ 4, 8 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 4, 6 ],
                pz: [ 1, 1 ],
                nx: [ 11, 3 ],
                ny: [ 7, 9 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 1 ],
                py: [ 3, 3 ],
                pz: [ 2, 2 ],
                nx: [ 2, 2 ],
                ny: [ 15, 16 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 17, 18 ],
                py: [ 5, 5 ],
                pz: [ 0, 0 ],
                nx: [ 9, 21 ],
                ny: [ 2, 10 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 14, 7 ],
                pz: [ 0, 1 ],
                nx: [ 3, 4 ],
                ny: [ 4, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 3 ],
                py: [ 3, 1 ],
                pz: [ 1, -1 ],
                nx: [ 19, 10 ],
                ny: [ 12, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 6, 16 ],
                py: [ 3, 8 ],
                pz: [ 1, 0 ],
                nx: [ 8, 10 ],
                ny: [ 20, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 5, 5, 2 ],
                py: [ 21, 8, 4 ],
                pz: [ 0, 1, 2 ],
                nx: [ 10, 6, 3 ],
                ny: [ 15, 2, 1 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 10 ],
                py: [ 10, 12 ],
                pz: [ 0, 0 ],
                nx: [ 11, 11 ],
                ny: [ 2, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 3, 2 ],
                pz: [ 1, 1 ],
                nx: [ 8, 11 ],
                ny: [ 3, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 13, 3 ],
                py: [ 5, 8 ],
                pz: [ 0, -1 ],
                nx: [ 12, 3 ],
                ny: [ 3, 1 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 13, 7 ],
                py: [ 2, 1 ],
                pz: [ 0, 1 ],
                nx: [ 5, 5 ],
                ny: [ 1, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 10 ],
                py: [ 10, 8 ],
                pz: [ 0, -1 ],
                nx: [ 14, 16 ],
                ny: [ 10, 15 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 10 ],
                py: [ 7, 8 ],
                pz: [ 1, -1 ],
                nx: [ 2, 6 ],
                ny: [ 5, 6 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 1, 8 ],
                pz: [ 0, -1 ],
                nx: [ 2, 2 ],
                ny: [ 3, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 4, 0 ],
                py: [ 5, 2 ],
                pz: [ 1, -1 ],
                nx: [ 1, 2 ],
                ny: [ 2, 3 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 1, 12 ],
                py: [ 1, 9 ],
                pz: [ 2, -1 ],
                nx: [ 16, 17 ],
                ny: [ 3, 3 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 6 ],
                py: [ 5, 8 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 7, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 14, 3 ],
                py: [ 11, 5 ],
                pz: [ 0, -1 ],
                nx: [ 11, 4 ],
                ny: [ 0, 0 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 6, 10 ],
                py: [ 6, 6 ],
                pz: [ 1, -1 ],
                nx: [ 0, 0 ],
                ny: [ 1, 0 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 3, 7 ],
                py: [ 0, 7 ],
                pz: [ 1, -1 ],
                nx: [ 15, 13 ],
                ny: [ 8, 4 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 18, 1 ],
                py: [ 15, 0 ],
                pz: [ 0, -1 ],
                nx: [ 18, 18 ],
                ny: [ 18, 17 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 5, 2 ],
                py: [ 4, 4 ],
                pz: [ 0, -1 ],
                nx: [ 4, 18 ],
                ny: [ 4, 15 ],
                nz: [ 1, 0 ]
            }, {
                size: 3,
                px: [ 3, 14, 13 ],
                py: [ 2, 7, 8 ],
                pz: [ 2, 0, 0 ],
                nx: [ 10, 0, 2 ],
                ny: [ 8, 3, 2 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 16, 0 ],
                py: [ 14, 3 ],
                pz: [ 0, -1 ],
                nx: [ 18, 3 ],
                ny: [ 12, 5 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 5, 3 ],
                py: [ 8, 3 ],
                pz: [ 1, 2 ],
                nx: [ 13, 4 ],
                ny: [ 10, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 1, 2 ],
                pz: [ 2, 1 ],
                nx: [ 8, 1 ],
                ny: [ 4, 20 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 8, 3 ],
                pz: [ 1, -1 ],
                nx: [ 12, 7 ],
                ny: [ 2, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 17, 3 ],
                py: [ 9, 2 ],
                pz: [ 0, 2 ],
                nx: [ 7, 6 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 12, 1 ],
                py: [ 2, 1 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 2, 3 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 22, 5 ],
                py: [ 15, 3 ],
                pz: [ 0, 2 ],
                nx: [ 16, 17 ],
                ny: [ 14, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 11 ],
                py: [ 19, 13 ],
                pz: [ 0, -1 ],
                nx: [ 0, 0 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 8, 11 ],
                py: [ 8, 1 ],
                pz: [ 1, -1 ],
                nx: [ 3, 3 ],
                ny: [ 2, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 3,
                px: [ 3, 8, 0 ],
                py: [ 7, 7, 5 ],
                pz: [ 1, -1, -1 ],
                nx: [ 11, 5, 1 ],
                ny: [ 11, 7, 5 ],
                nz: [ 0, 1, 1 ]
            }, {
                size: 2,
                px: [ 12, 6 ],
                py: [ 12, 6 ],
                pz: [ 0, 1 ],
                nx: [ 9, 0 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 16, 12 ],
                py: [ 7, 1 ],
                pz: [ 0, -1 ],
                nx: [ 16, 7 ],
                ny: [ 6, 4 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 13, 5 ],
                py: [ 14, 0 ],
                pz: [ 0, -1 ],
                nx: [ 13, 10 ],
                ny: [ 0, 0 ],
                nz: [ 0, 0 ]
            }, {
                size: 5,
                px: [ 11, 12, 13, 12, 7 ],
                py: [ 0, 1, 0, 0, 0 ],
                pz: [ 0, 0, 0, 0, 1 ],
                nx: [ 13, 16, 14, 4, 4 ],
                ny: [ 18, 23, 18, 5, 5 ],
                nz: [ 0, 0, 0, 2, -1 ]
            }, {
                size: 2,
                px: [ 14, 5 ],
                py: [ 12, 4 ],
                pz: [ 0, -1 ],
                nx: [ 7, 7 ],
                ny: [ 8, 2 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 19, 3 ],
                py: [ 2, 5 ],
                pz: [ 0, -1 ],
                nx: [ 11, 23 ],
                ny: [ 7, 13 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 19, 20 ],
                pz: [ 0, 0 ],
                nx: [ 9, 4 ],
                ny: [ 5, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 15, 4 ],
                py: [ 12, 3 ],
                pz: [ 0, 2 ],
                nx: [ 9, 5 ],
                ny: [ 4, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 8, 0, 1, 21 ],
                py: [ 6, 0, 7, 16 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 11, 6, 11, 5 ],
                ny: [ 8, 6, 4, 3 ],
                nz: [ 1, 1, 1, 2 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 7, 5 ],
                pz: [ 0, -1 ],
                nx: [ 9, 10 ],
                ny: [ 6, 7 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 1, 2 ],
                pz: [ 2, 1 ],
                nx: [ 16, 6 ],
                ny: [ 0, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 5, 3 ],
                pz: [ 1, 2 ],
                nx: [ 1, 21 ],
                ny: [ 23, 8 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 0 ],
                py: [ 7, 0 ],
                pz: [ 0, -1 ],
                nx: [ 4, 13 ],
                ny: [ 4, 10 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 11, 4 ],
                py: [ 0, 4 ],
                pz: [ 1, -1 ],
                nx: [ 4, 2 ],
                ny: [ 16, 8 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 5, 3 ],
                py: [ 12, 6 ],
                pz: [ 0, 1 ],
                nx: [ 3, 3 ],
                ny: [ 4, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 0 ],
                py: [ 19, 11 ],
                pz: [ 0, -1 ],
                nx: [ 9, 5 ],
                ny: [ 21, 9 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 17, 9 ],
                pz: [ 0, 1 ],
                nx: [ 0, 5 ],
                ny: [ 0, 9 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 4, 5 ],
                py: [ 2, 4 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 5, 6 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 1, 0 ],
                pz: [ 1, 2 ],
                nx: [ 4, 3 ],
                ny: [ 3, 6 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 0 ],
                py: [ 7, 2 ],
                pz: [ 1, -1 ],
                nx: [ 5, 5 ],
                ny: [ 1, 0 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 13, 0 ],
                py: [ 17, 2 ],
                pz: [ 0, -1 ],
                nx: [ 3, 6 ],
                ny: [ 5, 8 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 2, 1 ],
                py: [ 0, 5 ],
                pz: [ 2, -1 ],
                nx: [ 4, 9 ],
                ny: [ 2, 7 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 12, 5 ],
                py: [ 13, 8 ],
                pz: [ 0, -1 ],
                nx: [ 23, 11 ],
                ny: [ 13, 7 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 0, 2 ],
                pz: [ 1, 0 ],
                nx: [ 3, 6 ],
                ny: [ 11, 18 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 4, 3 ],
                py: [ 6, 5 ],
                pz: [ 0, -1 ],
                nx: [ 1, 1 ],
                ny: [ 1, 3 ],
                nz: [ 2, 1 ]
            }, {
                size: 4,
                px: [ 3, 6, 3, 6 ],
                py: [ 3, 6, 2, 5 ],
                pz: [ 2, 1, 2, 1 ],
                nx: [ 0, 4, 1, 1 ],
                ny: [ 0, 22, 17, 0 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 9, 15 ],
                ny: [ 4, 8 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 8, 18 ],
                py: [ 7, 8 ],
                pz: [ 1, 0 ],
                nx: [ 8, 5 ],
                ny: [ 4, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 4, 5 ],
                pz: [ 1, -1 ],
                nx: [ 5, 6 ],
                ny: [ 0, 0 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 13, 18 ],
                py: [ 23, 19 ],
                pz: [ 0, 0 ],
                nx: [ 7, 13 ],
                ny: [ 10, 20 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 6 ],
                py: [ 2, 0 ],
                pz: [ 0, 1 ],
                nx: [ 4, 1 ],
                ny: [ 5, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 5, 4 ],
                pz: [ 2, 2 ],
                nx: [ 0, 20 ],
                ny: [ 4, 4 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 5, 5 ],
                py: [ 1, 0 ],
                pz: [ 2, 2 ],
                nx: [ 12, 6 ],
                ny: [ 18, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 5,
                px: [ 2, 1, 3, 1, 5 ],
                py: [ 3, 3, 7, 4, 9 ],
                pz: [ 2, 2, 1, 2, 1 ],
                nx: [ 9, 3, 8, 16, 10 ],
                ny: [ 5, 3, 10, 6, 7 ],
                nz: [ 1, -1, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 4, 1 ],
                py: [ 12, 3 ],
                pz: [ 0, -1 ],
                nx: [ 10, 1 ],
                ny: [ 11, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 19, 0 ],
                py: [ 10, 7 ],
                pz: [ 0, -1 ],
                nx: [ 14, 7 ],
                ny: [ 6, 3 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 7, 4 ],
                py: [ 2, 1 ],
                pz: [ 1, 2 ],
                nx: [ 6, 0 ],
                ny: [ 2, 18 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 14, 8 ],
                py: [ 3, 0 ],
                pz: [ 0, 1 ],
                nx: [ 17, 1 ],
                ny: [ 1, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 18, 19 ],
                py: [ 1, 17 ],
                pz: [ 0, -1 ],
                nx: [ 5, 11 ],
                ny: [ 2, 5 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 12, 12, 12, 6, 12 ],
                py: [ 10, 11, 12, 6, 9 ],
                pz: [ 0, 0, 0, 1, 0 ],
                nx: [ 13, 3, 12, 6, 6 ],
                ny: [ 4, 1, 4, 2, 2 ],
                nz: [ 0, 2, 0, 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 10 ],
                py: [ 3, 3 ],
                pz: [ 0, 0 ],
                nx: [ 4, 9 ],
                ny: [ 4, 17 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 0 ],
                py: [ 13, 5 ],
                pz: [ 0, 2 ],
                nx: [ 8, 18 ],
                ny: [ 15, 15 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 3, 4 ],
                py: [ 6, 5 ],
                pz: [ 1, 1 ],
                nx: [ 0, 0 ],
                ny: [ 9, 4 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 1, 0 ],
                pz: [ 2, 2 ],
                nx: [ 2, 15 ],
                ny: [ 2, 1 ],
                nz: [ 2, -1 ]
            }, {
                size: 3,
                px: [ 2, 4, 2 ],
                py: [ 4, 9, 5 ],
                pz: [ 2, 1, 2 ],
                nx: [ 2, 5, 14 ],
                ny: [ 0, 1, 4 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 11, 12 ],
                py: [ 20, 20 ],
                pz: [ 0, 0 ],
                nx: [ 6, 10 ],
                ny: [ 9, 19 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 0 ],
                py: [ 16, 8 ],
                pz: [ 0, -1 ],
                nx: [ 2, 3 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 5,
                px: [ 16, 17, 15, 16, 15 ],
                py: [ 1, 1, 1, 0, 0 ],
                pz: [ 0, 0, 0, 0, 0 ],
                nx: [ 8, 8, 4, 12, 12 ],
                ny: [ 8, 7, 2, 23, 23 ],
                nz: [ 1, 1, 2, 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 4 ],
                py: [ 6, 12 ],
                pz: [ 1, -1 ],
                nx: [ 8, 13 ],
                ny: [ 1, 1 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 9, 2 ],
                py: [ 3, 2 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 6, 5 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 10, 8 ],
                py: [ 6, 1 ],
                pz: [ 1, -1 ],
                nx: [ 11, 8 ],
                ny: [ 2, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 9, 3 ],
                py: [ 7, 0 ],
                pz: [ 1, -1 ],
                nx: [ 19, 19 ],
                ny: [ 18, 16 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 2 ],
                py: [ 1, 1 ],
                pz: [ 2, 2 ],
                nx: [ 22, 11 ],
                ny: [ 4, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 10 ],
                py: [ 9, 8 ],
                pz: [ 1, 1 ],
                nx: [ 4, 4 ],
                ny: [ 10, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 1 ],
                py: [ 0, 5 ],
                pz: [ 0, -1 ],
                nx: [ 10, 8 ],
                ny: [ 2, 2 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 8, 7 ],
                pz: [ 1, 1 ],
                nx: [ 8, 2 ],
                ny: [ 8, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 5 ],
                py: [ 21, 3 ],
                pz: [ 0, -1 ],
                nx: [ 13, 3 ],
                ny: [ 20, 5 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 12, 5 ],
                py: [ 11, 2 ],
                pz: [ 0, -1 ],
                nx: [ 1, 0 ],
                ny: [ 19, 9 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 7, 10 ],
                py: [ 9, 10 ],
                pz: [ 1, 1 ],
                nx: [ 8, 4 ],
                ny: [ 10, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 5, 9 ],
                pz: [ 2, 1 ],
                nx: [ 2, 11 ],
                ny: [ 9, 19 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 5 ],
                py: [ 1, 2 ],
                pz: [ 2, 1 ],
                nx: [ 8, 23 ],
                ny: [ 4, 9 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 4 ],
                py: [ 2, 4 ],
                pz: [ 2, 1 ],
                nx: [ 5, 9 ],
                ny: [ 2, 5 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 2, 3 ],
                pz: [ 1, 1 ],
                nx: [ 19, 9 ],
                ny: [ 6, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 9, 4 ],
                py: [ 5, 10 ],
                pz: [ 1, -1 ],
                nx: [ 10, 22 ],
                ny: [ 0, 16 ],
                nz: [ 1, 0 ]
            }, {
                size: 3,
                px: [ 19, 9, 19 ],
                py: [ 3, 1, 2 ],
                pz: [ 0, 1, 0 ],
                nx: [ 6, 3, 6 ],
                ny: [ 10, 3, 0 ],
                nz: [ 1, -1, -1 ]
            }, {
                size: 2,
                px: [ 8, 3 ],
                py: [ 10, 3 ],
                pz: [ 1, 2 ],
                nx: [ 23, 14 ],
                ny: [ 3, 18 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 19, 0 ],
                pz: [ 0, -1 ],
                nx: [ 4, 16 ],
                ny: [ 4, 11 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 22, 23 ],
                py: [ 3, 22 ],
                pz: [ 0, -1 ],
                nx: [ 9, 3 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 7, 2 ],
                py: [ 12, 4 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 10, 5 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 12, 13 ],
                py: [ 5, 13 ],
                pz: [ 0, -1 ],
                nx: [ 11, 3 ],
                ny: [ 2, 0 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 3, 17 ],
                py: [ 0, 16 ],
                pz: [ 1, -1 ],
                nx: [ 12, 12 ],
                ny: [ 5, 6 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 4, 3 ],
                py: [ 1, 0 ],
                pz: [ 2, 2 ],
                nx: [ 4, 3 ],
                ny: [ 0, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 3 ],
                py: [ 12, 0 ],
                pz: [ 0, -1 ],
                nx: [ 12, 12 ],
                ny: [ 13, 12 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 13, 4 ],
                py: [ 11, 14 ],
                pz: [ 0, -1 ],
                nx: [ 0, 0 ],
                ny: [ 4, 6 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 8, 7 ],
                py: [ 7, 8 ],
                pz: [ 1, 1 ],
                nx: [ 3, 0 ],
                ny: [ 5, 21 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 1, 3 ],
                py: [ 4, 14 ],
                pz: [ 2, 0 ],
                nx: [ 8, 8 ],
                ny: [ 7, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 13, 11 ],
                py: [ 20, 7 ],
                pz: [ 0, -1 ],
                nx: [ 21, 21 ],
                ny: [ 20, 18 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 1 ],
                py: [ 11, 0 ],
                pz: [ 0, -1 ],
                nx: [ 2, 2 ],
                ny: [ 15, 14 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 10, 1 ],
                py: [ 8, 0 ],
                pz: [ 1, -1 ],
                nx: [ 8, 4 ],
                ny: [ 7, 4 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 17, 6 ],
                py: [ 13, 1 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 7, 15 ],
                py: [ 1, 3 ],
                pz: [ 1, 0 ],
                nx: [ 15, 5 ],
                ny: [ 1, 8 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 16, 1 ],
                py: [ 20, 10 ],
                pz: [ 0, -1 ],
                nx: [ 6, 8 ],
                ny: [ 11, 10 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 7, 14 ],
                py: [ 0, 0 ],
                pz: [ 1, 0 ],
                nx: [ 7, 8 ],
                ny: [ 7, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 12, 5 ],
                py: [ 17, 4 ],
                pz: [ 0, -1 ],
                nx: [ 12, 5 ],
                ny: [ 16, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 13, 3 ],
                py: [ 15, 0 ],
                pz: [ 0, -1 ],
                nx: [ 12, 7 ],
                ny: [ 17, 8 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 7, 1 ],
                py: [ 14, 1 ],
                pz: [ 0, -1 ],
                nx: [ 4, 6 ],
                ny: [ 6, 12 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 8, 7 ],
                py: [ 0, 0 ],
                pz: [ 0, 0 ],
                nx: [ 6, 20 ],
                ny: [ 5, 5 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 2 ],
                py: [ 22, 5 ],
                pz: [ 0, -1 ],
                nx: [ 4, 8 ],
                ny: [ 4, 9 ],
                nz: [ 2, 1 ]
            }, {
                size: 4,
                px: [ 8, 2, 2, 9 ],
                py: [ 6, 5, 3, 11 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 2, 7, 4, 3 ],
                ny: [ 2, 1, 0, 2 ],
                nz: [ 2, 0, 1, 2 ]
            }, {
                size: 2,
                px: [ 12, 6 ],
                py: [ 12, 6 ],
                pz: [ 0, 1 ],
                nx: [ 8, 2 ],
                ny: [ 4, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 13, 11 ],
                py: [ 19, 8 ],
                pz: [ 0, -1 ],
                nx: [ 13, 13 ],
                ny: [ 20, 17 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 11, 19 ],
                py: [ 5, 14 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 8, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 10, 0 ],
                py: [ 8, 6 ],
                pz: [ 1, -1 ],
                nx: [ 21, 21 ],
                ny: [ 16, 15 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 1, 12 ],
                py: [ 7, 6 ],
                pz: [ 1, -1 ],
                nx: [ 2, 7 ],
                ny: [ 5, 14 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 2, 9 ],
                py: [ 7, 5 ],
                pz: [ 1, -1 ],
                nx: [ 2, 5 ],
                ny: [ 5, 9 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 12, 5 ],
                py: [ 15, 6 ],
                pz: [ 0, -1 ],
                nx: [ 3, 12 ],
                ny: [ 0, 2 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 23, 22 ],
                py: [ 23, 1 ],
                pz: [ 0, -1 ],
                nx: [ 0, 0 ],
                ny: [ 2, 3 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 1, 2 ],
                pz: [ 2, 1 ],
                nx: [ 8, 0 ],
                ny: [ 4, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 1 ],
                py: [ 9, 1 ],
                pz: [ 0, -1 ],
                nx: [ 4, 2 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 0, 1 ],
                py: [ 0, 0 ],
                pz: [ 2, 0 ],
                nx: [ 2, 3 ],
                ny: [ 9, 10 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 0 ],
                py: [ 16, 14 ],
                pz: [ 0, -1 ],
                nx: [ 6, 3 ],
                ny: [ 23, 14 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 3 ],
                py: [ 2, 3 ],
                pz: [ 2, 1 ],
                nx: [ 13, 3 ],
                ny: [ 19, 14 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 8, 18 ],
                pz: [ 0, -1 ],
                nx: [ 4, 7 ],
                ny: [ 1, 2 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 4, 4 ],
                py: [ 5, 6 ],
                pz: [ 1, 1 ],
                nx: [ 2, 2 ],
                ny: [ 5, 3 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 7, 3 ],
                py: [ 13, 7 ],
                pz: [ 0, 1 ],
                nx: [ 4, 3 ],
                ny: [ 4, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 5, 6 ],
                pz: [ 1, 0 ],
                nx: [ 2, 1 ],
                ny: [ 5, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 14 ],
                py: [ 3, 5 ],
                pz: [ 1, 0 ],
                nx: [ 5, 0 ],
                ny: [ 16, 7 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 2 ],
                py: [ 18, 5 ],
                pz: [ 0, 2 ],
                nx: [ 11, 4 ],
                ny: [ 16, 4 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 6, 16 ],
                py: [ 19, 20 ],
                pz: [ 0, -1 ],
                nx: [ 3, 2 ],
                ny: [ 10, 5 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 5, 3 ],
                py: [ 3, 1 ],
                pz: [ 0, 1 ],
                nx: [ 1, 3 ],
                ny: [ 4, 8 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 12, 6 ],
                py: [ 13, 6 ],
                pz: [ 0, 1 ],
                nx: [ 10, 1 ],
                ny: [ 12, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 3 ],
                py: [ 6, 2 ],
                pz: [ 1, -1 ],
                nx: [ 4, 8 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 9, 3 ],
                py: [ 21, 2 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 1, 0 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 8, 4 ],
                py: [ 1, 0 ],
                pz: [ 1, -1 ],
                nx: [ 8, 6 ],
                ny: [ 4, 2 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 2, 7 ],
                py: [ 1, 6 ],
                pz: [ 2, -1 ],
                nx: [ 7, 9 ],
                ny: [ 6, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 8, 3 ],
                pz: [ 1, 2 ],
                nx: [ 10, 5 ],
                ny: [ 19, 11 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 3, 4 ],
                pz: [ 2, 2 ],
                nx: [ 3, 6 ],
                ny: [ 4, 6 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 3, 11 ],
                py: [ 5, 20 ],
                pz: [ 2, 0 ],
                nx: [ 11, 5 ],
                ny: [ 21, 8 ],
                nz: [ 0, -1 ]
            }, {
                size: 3,
                px: [ 5, 9, 5 ],
                py: [ 4, 7, 5 ],
                pz: [ 2, 0, 2 ],
                nx: [ 23, 10, 4 ],
                ny: [ 23, 3, 22 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 4,
                px: [ 11, 9, 7, 1 ],
                py: [ 13, 8, 11, 10 ],
                pz: [ 0, -1, -1, -1 ],
                nx: [ 8, 2, 11, 12 ],
                ny: [ 4, 2, 4, 4 ],
                nz: [ 1, 2, 0, 0 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 7, 6 ],
                pz: [ 1, 1 ],
                nx: [ 0, 4 ],
                ny: [ 1, 0 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 19, 20 ],
                py: [ 0, 1 ],
                pz: [ 0, 0 ],
                nx: [ 21, 1 ],
                ny: [ 0, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 5 ],
                py: [ 11, 0 ],
                pz: [ 0, -1 ],
                nx: [ 11, 0 ],
                ny: [ 12, 1 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 1, 1 ],
                pz: [ 0, -1 ],
                nx: [ 4, 7 ],
                ny: [ 5, 4 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 5, 12 ],
                py: [ 4, 23 ],
                pz: [ 2, -1 ],
                nx: [ 13, 15 ],
                ny: [ 5, 4 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 20 ],
                py: [ 4, 16 ],
                pz: [ 0, -1 ],
                nx: [ 9, 4 ],
                ny: [ 2, 1 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 12, 13 ],
                py: [ 2, 2 ],
                pz: [ 0, 0 ],
                nx: [ 4, 16 ],
                ny: [ 2, 11 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 19, 14 ],
                py: [ 10, 17 ],
                pz: [ 0, -1 ],
                nx: [ 3, 8 ],
                ny: [ 0, 2 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 8, 12 ],
                py: [ 1, 2 ],
                pz: [ 1, 0 ],
                nx: [ 19, 10 ],
                ny: [ 3, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 4,
                px: [ 17, 2, 3, 10 ],
                py: [ 8, 6, 2, 12 ],
                pz: [ 0, 1, 2, 0 ],
                nx: [ 17, 9, 12, 2 ],
                ny: [ 9, 22, 13, 5 ],
                nz: [ 0, -1, -1, -1 ]
            }, {
                size: 2,
                px: [ 20, 10 ],
                py: [ 15, 7 ],
                pz: [ 0, 1 ],
                nx: [ 13, 9 ],
                ny: [ 7, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 0, 0 ],
                py: [ 1, 0 ],
                pz: [ 2, 2 ],
                nx: [ 10, 3 ],
                ny: [ 9, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 4, 3 ],
                py: [ 1, 0 ],
                pz: [ 2, 2 ],
                nx: [ 0, 22 ],
                ny: [ 14, 6 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 16, 3 ],
                py: [ 4, 0 ],
                pz: [ 0, 2 ],
                nx: [ 16, 3 ],
                ny: [ 2, 0 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 8, 16 ],
                py: [ 6, 12 ],
                pz: [ 1, 0 ],
                nx: [ 8, 12 ],
                ny: [ 4, 7 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 5, 11 ],
                py: [ 0, 5 ],
                pz: [ 2, 1 ],
                nx: [ 10, 1 ],
                ny: [ 5, 5 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 7, 4 ],
                py: [ 5, 5 ],
                pz: [ 0, -1 ],
                nx: [ 3, 6 ],
                ny: [ 2, 3 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 11, 11 ],
                py: [ 11, 12 ],
                pz: [ 0, 0 ],
                nx: [ 23, 7 ],
                ny: [ 20, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 16, 8 ],
                py: [ 12, 5 ],
                pz: [ 0, 1 ],
                nx: [ 8, 2 ],
                ny: [ 2, 1 ],
                nz: [ 1, -1 ]
            }, {
                size: 3,
                px: [ 6, 11, 11 ],
                py: [ 11, 23, 20 ],
                pz: [ 1, 0, 0 ],
                nx: [ 11, 3, 22 ],
                ny: [ 21, 3, 16 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 17, 15 ],
                py: [ 3, 2 ],
                pz: [ 0, -1 ],
                nx: [ 4, 4 ],
                ny: [ 3, 2 ],
                nz: [ 2, 2 ]
            }, {
                size: 2,
                px: [ 21, 21 ],
                py: [ 11, 10 ],
                pz: [ 0, 0 ],
                nx: [ 11, 3 ],
                ny: [ 6, 2 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 23, 21 ],
                py: [ 22, 10 ],
                pz: [ 0, -1 ],
                nx: [ 20, 10 ],
                ny: [ 18, 10 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 4, 2 ],
                py: [ 6, 3 ],
                pz: [ 1, 2 ],
                nx: [ 3, 2 ],
                ny: [ 4, 3 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 16, 0 ],
                py: [ 18, 11 ],
                pz: [ 0, -1 ],
                nx: [ 8, 7 ],
                ny: [ 4, 4 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 6, 21 ],
                py: [ 3, 16 ],
                pz: [ 0, -1 ],
                nx: [ 1, 8 ],
                ny: [ 2, 14 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 8, 1 ],
                py: [ 3, 0 ],
                pz: [ 0, -1 ],
                nx: [ 11, 11 ],
                ny: [ 2, 1 ],
                nz: [ 0, 0 ]
            }, {
                size: 3,
                px: [ 11, 11, 11 ],
                py: [ 9, 10, 8 ],
                pz: [ 1, 1, 1 ],
                nx: [ 23, 1, 0 ],
                ny: [ 23, 9, 11 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 6, 3 ],
                py: [ 2, 1 ],
                pz: [ 1, 2 ],
                nx: [ 7, 1 ],
                ny: [ 8, 2 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 17 ],
                py: [ 17, 19 ],
                pz: [ 0, -1 ],
                nx: [ 10, 4 ],
                ny: [ 16, 9 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 7, 1 ],
                pz: [ 1, -1 ],
                nx: [ 11, 0 ],
                ny: [ 11, 8 ],
                nz: [ 0, 1 ]
            }, {
                size: 2,
                px: [ 10, 5 ],
                py: [ 11, 4 ],
                pz: [ 1, 2 ],
                nx: [ 5, 5 ],
                ny: [ 0, 0 ],
                nz: [ 2, -1 ]
            }, {
                size: 2,
                px: [ 3, 6 ],
                py: [ 3, 6 ],
                pz: [ 2, 1 ],
                nx: [ 8, 0 ],
                ny: [ 4, 16 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 14, 1 ],
                py: [ 20, 2 ],
                pz: [ 0, -1 ],
                nx: [ 7, 7 ],
                ny: [ 11, 9 ],
                nz: [ 1, 1 ]
            }, {
                size: 3,
                px: [ 11, 13, 4 ],
                py: [ 16, 21, 3 ],
                pz: [ 0, 0, 2 ],
                nx: [ 14, 16, 5 ],
                ny: [ 20, 14, 9 ],
                nz: [ 0, -1, -1 ]
            }, {
                size: 2,
                px: [ 7, 0 ],
                py: [ 1, 1 ],
                pz: [ 1, -1 ],
                nx: [ 4, 7 ],
                ny: [ 2, 4 ],
                nz: [ 2, 1 ]
            }, {
                size: 2,
                px: [ 23, 11 ],
                py: [ 9, 4 ],
                pz: [ 0, 1 ],
                nx: [ 11, 3 ],
                ny: [ 1, 3 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 13 ],
                py: [ 23, 23 ],
                pz: [ 0, 0 ],
                nx: [ 13, 13 ],
                ny: [ 20, 20 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 10, 8 ],
                py: [ 5, 11 ],
                pz: [ 0, -1 ],
                nx: [ 20, 19 ],
                ny: [ 18, 20 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 19, 5 ],
                py: [ 22, 4 ],
                pz: [ 0, -1 ],
                nx: [ 2, 9 ],
                ny: [ 3, 17 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 15, 2 ],
                py: [ 13, 7 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 2,
                px: [ 14, 13 ],
                py: [ 17, 2 ],
                pz: [ 0, -1 ],
                nx: [ 15, 13 ],
                ny: [ 19, 15 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 12, 23 ],
                py: [ 8, 22 ],
                pz: [ 0, -1 ],
                nx: [ 7, 10 ],
                ny: [ 5, 9 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 2, 6 ],
                py: [ 21, 10 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 3, 3 ],
                nz: [ 1, 1 ]
            }, {
                size: 2,
                px: [ 15, 11 ],
                py: [ 5, 0 ],
                pz: [ 0, -1 ],
                nx: [ 3, 4 ],
                ny: [ 17, 16 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 3, 1 ],
                py: [ 18, 8 ],
                pz: [ 0, 1 ],
                nx: [ 14, 4 ],
                ny: [ 17, 7 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 15, 3 ],
                py: [ 18, 3 ],
                pz: [ 0, 2 ],
                nx: [ 1, 22 ],
                ny: [ 0, 1 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 13, 3 ],
                py: [ 9, 3 ],
                pz: [ 0, -1 ],
                nx: [ 0, 1 ],
                ny: [ 9, 20 ],
                nz: [ 1, 0 ]
            }, {
                size: 2,
                px: [ 1, 1 ],
                py: [ 1, 0 ],
                pz: [ 2, 2 ],
                nx: [ 9, 23 ],
                ny: [ 10, 12 ],
                nz: [ 1, -1 ]
            }, {
                size: 4,
                px: [ 9, 0, 9, 1 ],
                py: [ 8, 0, 0, 10 ],
                pz: [ 1, -1, -1, -1 ],
                nx: [ 23, 7, 5, 23 ],
                ny: [ 20, 7, 5, 19 ],
                nz: [ 0, 1, 2, 0 ]
            }, {
                size: 2,
                px: [ 18, 18 ],
                py: [ 12, 12 ],
                pz: [ 0, -1 ],
                nx: [ 8, 4 ],
                ny: [ 4, 2 ],
                nz: [ 1, 2 ]
            }, {
                size: 3,
                px: [ 0, 4, 1 ],
                py: [ 3, 5, 3 ],
                pz: [ 1, -1, -1 ],
                nx: [ 16, 11, 8 ],
                ny: [ 8, 5, 6 ],
                nz: [ 0, 0, 0 ]
            }, {
                size: 5,
                px: [ 9, 10, 14, 11, 11 ],
                py: [ 0, 0, 0, 0, 0 ],
                pz: [ 0, 0, 0, 0, -1 ],
                nx: [ 8, 3, 4, 6, 2 ],
                ny: [ 22, 9, 5, 4, 0 ],
                nz: [ 0, 1, 0, 0, 2 ]
            }, {
                size: 2,
                px: [ 6, 5 ],
                py: [ 2, 2 ],
                pz: [ 1, 1 ],
                nx: [ 7, 3 ],
                ny: [ 8, 7 ],
                nz: [ 0, -1 ]
            }, {
                size: 2,
                px: [ 11, 5 ],
                py: [ 15, 2 ],
                pz: [ 0, -1 ],
                nx: [ 3, 10 ],
                ny: [ 0, 1 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 0, 11 ],
                py: [ 11, 12 ],
                pz: [ 1, -1 ],
                nx: [ 22, 22 ],
                ny: [ 14, 13 ],
                nz: [ 0, 0 ]
            }, {
                size: 2,
                px: [ 2, 2 ],
                py: [ 15, 14 ],
                pz: [ 0, 0 ],
                nx: [ 1, 2 ],
                ny: [ 11, 8 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 11, 6 ],
                py: [ 0, 7 ],
                pz: [ 1, -1 ],
                nx: [ 19, 5 ],
                ny: [ 3, 0 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 2, 3 ],
                py: [ 3, 7 ],
                pz: [ 2, 1 ],
                nx: [ 1, 5 ],
                ny: [ 5, 0 ],
                nz: [ 1, -1 ]
            }, {
                size: 2,
                px: [ 10, 14 ],
                py: [ 4, 5 ],
                pz: [ 0, -1 ],
                nx: [ 4, 18 ],
                ny: [ 2, 12 ],
                nz: [ 2, 0 ]
            }, {
                size: 2,
                px: [ 19, 10 ],
                py: [ 12, 2 ],
                pz: [ 0, -1 ],
                nx: [ 13, 4 ],
                ny: [ 10, 2 ],
                nz: [ 0, 2 ]
            }, {
                size: 2,
                px: [ 6, 1 ],
                py: [ 21, 6 ],
                pz: [ 0, -1 ],
                nx: [ 6, 5 ],
                ny: [ 0, 0 ],
                nz: [ 1, 1 ]
            } ],
            alpha: [ -1.044179, 1.044179, -.6003138, .6003138, -.4091282, .4091282, -.4590148, .4590148, -.4294004, .4294004, -.3360846, .3360846, -.3054186, .3054186, -.2901743, .2901743, -.3522417, .3522417, -.3195838, .3195838, -.2957309, .2957309, -.2876727, .2876727, -.263746, .263746, -.26079, .26079, -.2455714, .2455714, -.2749847, .2749847, -.2314217, .2314217, -.2540871, .2540871, -.2143416, .2143416, -.2565697, .2565697, -.1901272, .1901272, -.2259981, .2259981, -.2012333, .2012333, -.244846, .244846, -.2192845, .2192845, -.2005951, .2005951, -.2259, .2259, -.1955758, .1955758, -.2235332, .2235332, -.170449, .170449, -.1584628, .1584628, -.216771, .216771, -.1592909, .1592909, -.1967292, .1967292, -.1432268, .1432268, -.2039949, .2039949, -.1404068, .1404068, -.1788201, .1788201, -.1498714, .1498714, -.1282541, .1282541, -.1630182, .1630182, -.1398111, .1398111, -.1464143, .1464143, -.1281712, .1281712, -.1417014, .1417014, -.1779164, .1779164, -.2067174, .2067174, -.1344947, .1344947, -.1357351, .1357351, -.1683191, .1683191, -.1821768, .1821768, -.2158307, .2158307, -.1812857, .1812857, -.1635445, .1635445, -.1474934, .1474934, -.1771993, .1771993, -.151762, .151762, -.1283184, .1283184, -.1862675, .1862675, -.1420491, .1420491, -.1232165, .1232165, -.1472696, .1472696, -.1192156, .1192156, -.1602034, .1602034, -.1321473, .1321473, -.1358101, .1358101, -.1295821, .1295821, -.1289102, .1289102, -.123252, .123252, -.1332227, .1332227, -.1358887, .1358887, -.1179559, .1179559, -.1263694, .1263694, -.1444876, .1444876, -.1933141, .1933141, -.1917886, .1917886, -.119976, .119976, -.1359937, .1359937, -.1690073, .1690073, -.1894222, .1894222, -.1699422, .1699422, -.1340361, .1340361, -.1840622, .1840622, -.1277397, .1277397, -.138161, .138161, -.1282241, .1282241, -.1211334, .1211334, -.1264628, .1264628, -.137301, .137301, -.1363356, .1363356, -.1562568, .1562568, -.1268735, .1268735, -.1037859, .1037859, -.1394322, .1394322, -.1449225, .1449225, -.1109657, .1109657, -.1086931, .1086931, -.1379135, .1379135, -.1881974, .1881974, -.1304956, .1304956, -.09921777, .09921777, -.1398624, .1398624, -.1216469, .1216469, -.1272741, .1272741, -.1878236, .1878236, -.1336894, .1336894, -.1256289, .1256289, -.1247231, .1247231, -.18534, .18534, -.1087805, .1087805, -.1205676, .1205676, -.1023182, .1023182, -.1268422, .1268422, -.14229, .14229, -.1098174, .1098174, -.1317018, .1317018, -.1378142, .1378142, -.127455, .127455, -.1142944, .1142944, -.1713488, .1713488, -.1103035, .1103035, -.1045221, .1045221, -.1293015, .1293015, -.09763183, .09763183, -.1387213, .1387213, -.09031167, .09031167, -.1283052, .1283052, -.1133462, .1133462, -.09370681, .09370681, -.1079269, .1079269, -.1331913, .1331913, -.08969902, .08969902, -.104456, .104456, -.09387466, .09387466, -.1208988, .1208988, -.1252011, .1252011, -.1401277, .1401277, -.1461381, .1461381, -.1323763, .1323763, -.09923889, .09923889, -.1142899, .1142899, -.09110853, .09110853, -.1106607, .1106607, -.125314, .125314, -.09657895, .09657895, -.103001, .103001, -.1348857, .1348857, -.1237793, .1237793, -.1296943, .1296943, -.1323385, .1323385, -.08331554, .08331554, -.08417589, .08417589, -.1104431, .1104431, -.117071, .117071, -.1391725, .1391725, -.1485189, .1485189, -.1840393, .1840393, -.123825, .123825, -.1095287, .1095287, -.1177869, .1177869, -.1036409, .1036409, -.09802581, .09802581, -.09364054, .09364054, -.09936022, .09936022, -.1117201, .1117201, -.10813, .10813, -.1331861, .1331861, -.1192122, .1192122, -.09889761, .09889761, -.1173456, .1173456, -.1032917, .1032917, -.09268551, .09268551, -.1178563, .1178563, -.1215065, .1215065, -.1060437, .1060437, -.1010044, .1010044, -.1021683, .1021683, -.09974968, .09974968, -.1161528, .1161528, -.08686721, .08686721, -.08145259, .08145259, -.0993706, .0993706, -.1170885, .1170885, -.07693779, .07693779, -.09047233, .09047233, -.09168442, .09168442, -.1054105, .1054105, -.09036177, .09036177, -.1251949, .1251949, -.09523847, .09523847, -.103893, .103893, -.143366, .143366, -.148983, .148983, -.08393174, .08393174, -.08888026, .08888026, -.09347861, .09347861, -.1044838, .1044838, -.1102144, .1102144, -.1383415, .1383415, -.1466476, .1466476, -.1129741, .1129741, -.1310915, .1310915, -.1070648, .1070648, -.07559007, .07559007, -.08812082, .08812082, -.1234272, .1234272, -.1088022, .1088022, -.08388703, .08388703, -.07179593, .07179593, -.1008961, .1008961, -.0903007, .0903007, -.08581345, .08581345, -.09023431, .09023431, -.09807321, .09807321, -.09621402, .09621402, -.1730195, .1730195, -.08984631, .08984631, -.09556661, .09556661, -.1047576, .1047576, -.07854313, .07854313, -.08682118, .08682118, -.1159761, .1159761, -.133954, .133954, -.1003048, .1003048, -.09747544, .09747544, -.09501058, .09501058, -.1321566, .1321566, -.09194706, .09194706, -.09359276, .09359276, -.1015916, .1015916, -.1174192, .1174192, -.1039931, .1039931, -.09746733, .09746733, -.128612, .128612, -.1044899, .1044899, -.1066385, .1066385, -.08368626, .08368626, -.1271919, .1271919, -.1055946, .1055946, -.08272876, .08272876, -.1370564, .1370564, -.08539379, .08539379, -.1100343, .1100343, -.0810217, .0810217, -.1028728, .1028728, -.1305065, .1305065, -.1059506, .1059506, -.1264646, .1264646, -.08383843, .08383843, -.09357698, .09357698, -.074744, .074744, -.07814045, .07814045, -.0860097, .0860097, -.120609, .120609, -.09986512, .09986512, -.08516476, .08516476, -.07198783, .07198783, -.07838409, .07838409, -.1005142, .1005142, -.09951857, .09951857, -.07253998, .07253998, -.09913739, .09913739, -.0750036, .0750036, -.0925809, .0925809, -.1400287, .1400287, -.1044404, .1044404, -.07404339, .07404339, -.07256833, .07256833, -.1006995, .1006995, -.1426043, .1426043, -.1036529, .1036529, -.1208443, .1208443, -.1074245, .1074245, -.1141448, .1141448, -.1015809, .1015809, -.1028822, .1028822, -.1055682, .1055682, -.09468699, .09468699, -.1010098, .1010098, -.1205054, .1205054, -.08392956, .08392956, -.08052297, .08052297, -.09576507, .09576507, -.09515692, .09515692, -.1564745, .1564745, -.07357238, .07357238, -.1129262, .1129262, -.1013265, .1013265, -.08760761, .08760761, -.08714771, .08714771, -.09605039, .09605039, -.09064677, .09064677, -.08243857, .08243857, -.08495858, .08495858, -.08350249, .08350249, -.07423234, .07423234, -.07930799, .07930799, -.06620023, .06620023, -.07311919, .07311919, -.1237938, .1237938, -.1086814, .1086814, -.06379798, .06379798, -.07526021, .07526021, -.08297097, .08297097, -.08186337, .08186337, -.07627362, .07627362, -.1061638, .1061638, -.08328494, .08328494, -.1040895, .1040895, -.07649056, .07649056, -.07299058, .07299058, -.09195198, .09195198, -.0799088, .0799088, -.07429346, .07429346, -.09991702, .09991702, -.09755385, .09755385, -.1344138, .1344138, -.1707917, .1707917, -.0832545, .0832545, -.08137793, .08137793, -.08308659, .08308659, -.07440414, .07440414, -.07012744, .07012744, -.08122943, .08122943, -.08845462, .08845462, -.0880345, .0880345, -.09653392, .09653392, -.08795691, .08795691, -.1119045, .1119045, -.1068308, .1068308, -.08406359, .08406359, -.1220414, .1220414, -.1024235, .1024235, -.1252897, .1252897, -.1121234, .1121234, -.0905415, .0905415, -.08974435, .08974435, -.1351578, .1351578, -.1106442, .1106442, -.08093913, .08093913, -.09800762, .09800762, -.07012823, .07012823, -.07434949, .07434949, -.08684816, .08684816, -.08916388, .08916388, -.08773159, .08773159, -.07709608, .07709608, -.07230518, .07230518, -.09662156, .09662156, -.07957632, .07957632, -.07628441, .07628441, -.08050202, .08050202, -.1290593, .1290593, -.09246182, .09246182, -.09703662, .09703662, -.07866445, .07866445, -.1064783, .1064783, -.1012339, .1012339, -.06828389, .06828389, -.1005039, .1005039, -.07559687, .07559687, -.06359878, .06359878, -.08387002, .08387002, -.07851323, .07851323, -.08878569, .08878569, -.07767654, .07767654, -.08033338, .08033338, -.09142797, .09142797, -.08590585, .08590585, -.1052318, .1052318, -.08760062, .08760062, -.09222192, .09222192, -.07548828, .07548828, -.08003344, .08003344, -.1177076, .1177076, -.1064964, .1064964, -.08655553, .08655553, -.09418112, .09418112, -.07248163, .07248163, -.07120974, .07120974, -.06393114, .06393114, -.07997487, .07997487, -.1220941, .1220941, -.09892518, .09892518, -.08270271, .08270271, -.10694, .10694, -.05860771, .05860771, -.091266, .091266, -.06212559, .06212559, -.09397538, .09397538, -.08070447, .08070447, -.08415587, .08415587, -.08564455, .08564455, -.07791811, .07791811, -.06642259, .06642259, -.08266167, .08266167, -.1134986, .1134986, -.1045267, .1045267, -.07122085, .07122085, -.07979415, .07979415, -.07922347, .07922347, -.09003421, .09003421, -.08796449, .08796449, -.07933279, .07933279, -.08307947, .08307947, -.08946349, .08946349, -.07643384, .07643384, -.07818534, .07818534, -.07990991, .07990991, -.09885664, .09885664, -.08071329, .08071329, -.06952112, .06952112, -.06429706, .06429706, -.06307229, .06307229, -.08100137, .08100137, -.07693623, .07693623, -.06906625, .06906625, -.07390462, .07390462, -.06487217, .06487217, -.1233681, .1233681, -.06979273, .06979273, -.08358669, .08358669, -.109542, .109542, -.08519717, .08519717, -.07599857, .07599857, -.06042816, .06042816, -.06546304, .06546304, -.1016245, .1016245, -.08308787, .08308787, -.07385708, .07385708, -.0675163, .0675163, -.09036695, .09036695, -.09371335, .09371335, -.1116088, .1116088, -.05693741, .05693741, -.06383983, .06383983, -.05389843, .05389843, -.08383191, .08383191, -.07820822, .07820822, -.07067557, .07067557, -.07971948, .07971948, -.07360668, .07360668, -.07008027, .07008027, -.08013378, .08013378, -.08331605, .08331605, -.07145702, .07145702, -.0786394, .0786394, -.06992679, .06992679, -.05716495, .05716495, -.05306006, .05306006, -.08855639, .08855639, -.07656397, .07656397, -.06939272, .06939272, -.07523742, .07523742, -.08472299, .08472299, -.08114341, .08114341, -.06795517, .06795517, -.0789013, .0789013, -.07488741, .07488741, -.09281972, .09281972, -.09325498, .09325498, -.1401587, .1401587, -.1176284, .1176284, -.08867597, .08867597, -.08124232, .08124232, -.09441235, .09441235, -.08029452, .08029452, -.08581848, .08581848, -.1029819, .1029819, -.09569118, .09569118, -.07690893, .07690893, -.09018228, .09018228, -.1049209, .1049209, -.08969413, .08969413, -.08651891, .08651891, -.08613331, .08613331, -.07120468, .07120468, -.08743959, .08743959, -.07607158, .07607158, -.1015547, .1015547, -.08090879, .08090879, -.07114079, .07114079, -.08744835, .08744835, -.06074904, .06074904, -.06919871, .06919871, -.07607774, .07607774, -.094446, .094446, -.07833429, .07833429, -.06817555, .06817555, -.0899739, .0899739, -.09845223, .09845223, -.0789418, .0789418, -.07921373, .07921373, -.07448032, .07448032, -.1178165, .1178165, -.08216686, .08216686, -.08103286, .08103286, -.0698147, .0698147, -.08709008, .08709008, -.08336259, .08336259, -.06213589, .06213589, -.07068045, .07068045, -.06915676, .06915676, -.07103416, .07103416, -.06523849, .06523849, -.0763476, .0763476, -.07263038, .07263038, -.07164396, .07164396, -.08745559, .08745559, -.06960181, .06960181, -.08500098, .08500098, -.0652326, .0652326, -.07319714, .07319714, -.06268125, .06268125, -.07083135, .07083135, -.07984517, .07984517, -.1256265, .1256265, -.1065412, .1065412, -.08524323, .08524323, -.09291364, .09291364, -.07936567, .07936567, -.08607723, .08607723, -.07583416, .07583416, -.07931928, .07931928, -.07408357, .07408357, -.1034404, .1034404, -.1012127, .1012127, -.07916689, .07916689, -.08753651, .08753651, -.06090366, .06090366, -.07500103, .07500103, -.1228709, .1228709, -.06318201, .06318201, -.0758542, .0758542, -.0708909, .0708909, -.1053542, .1053542, -.08549521, .08549521, -.07906308, .07906308, -.0633878, .0633878, -.0841791, .0841791, -.07115511, .07115511, -.07693949, .07693949, -.07446749, .07446749, -.1037929, .1037929, -.07991005, .07991005, -.07119439, .07119439, -.0707134, .0707134, -.08587362, .08587362, -.07001236, .07001236, -.07567115, .07567115, -.0711893, .0711893, -.06844895, .06844895, -.1035118, .1035118, -.08156618, .08156618, -.07449593, .07449593, -.0815436, .0815436, -.09110878, .09110878, -.06222534, .06222534, -.1033841, .1033841, -.06811687, .06811687, -.06828443, .06828443, -.05769408, .05769408, -.05917684, .05917684, -.08358868, .08358868 ]
        } ]
    };
    headtrackr.getWhitebalance = function(canvas) {
        var avggray, avgr, avgb, avgg;
        var canvasContext = canvas.getContext("2d");
        canvasContext.willReadFrequently = true;
        var image = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
        var id = image.data;
        var imagesize = image.width * image.height;
        var r = g = b = 0;
        for (var i = 0; i < imagesize; i++) {
            r += id[4 * i];
            g += id[4 * i + 1];
            b += id[4 * i + 2];
        }
        avgr = r / imagesize;
        avgg = g / imagesize;
        avgb = b / imagesize;
        avggray = (avgr + avgg + avgb) / 3;
        return avggray;
    };
    headtrackr.Smoother = function(alpha, interval) {
        var sp, sp2, sl, newPositions, positions;
        var updateTime = new Date();
        this.initialized = false;
        this.interpolate = false;
        this.init = function(initPos) {
            this.initialized = true;
            sp = [ initPos.x, initPos.y, initPos.z, initPos.width, initPos.height ];
            sp2 = sp;
            sl = sp.length;
        };
        this.smooth = function(pos) {
            positions = [ pos.x, pos.y, pos.z, pos.width, pos.height ];
            if (this.initialized) {
                for (var i = 0; i < sl; i++) {
                    sp[i] = alpha * positions[i] + (1 - alpha) * sp[i];
                    sp2[i] = alpha * sp[i] + (1 - alpha) * sp2[i];
                }
                updateTime = new Date();
                var msDiff = new Date() - updateTime;
                var newPositions = predict(msDiff);
                pos.x = newPositions[0];
                pos.y = newPositions[1];
                pos.z = newPositions[2];
                pos.width = newPositions[3];
                pos.height = newPositions[4];
                return pos;
            } else {
                return false;
            }
        };
        function predict(time) {
            var retPos = [];
            if (this.interpolate) {
                var step = time / interval;
                var stepLo = step >> 0;
                var ratio = alpha / (1 - alpha);
                var a = (step - stepLo) * ratio;
                var b = 2 + stepLo * ratio;
                var c = 1 + stepLo * ratio;
                for (var i = 0; i < sl; i++) {
                    retPos[i] = a * (sp[i] - sp2[i]) + b * sp[i] - c * sp2[i];
                }
            } else {
                var step = time / interval >> 0;
                var ratio = alpha * step / (1 - alpha);
                var a = 2 + ratio;
                var b = 1 + ratio;
                for (var i = 0; i < sl; i++) {
                    retPos[i] = a * sp[i] - b * sp2[i];
                }
            }
            return retPos;
        }
    };
    headtrackr.camshift = {};
    headtrackr.camshift.Histogram = function(imgdata) {
        this.size = 4096;
        var bins = [];
        var i, x, r, g, b, il;
        for (i = 0; i < this.size; i++) {
            bins.push(0);
        }
        for (x = 0, il = imgdata.length; x < il; x += 4) {
            r = imgdata[x + 0] >> 4;
            g = imgdata[x + 1] >> 4;
            b = imgdata[x + 2] >> 4;
            bins[256 * r + 16 * g + b] += 1;
        }
        this.getBin = function(index) {
            return bins[index];
        };
    };
    headtrackr.camshift.Moments = function(data, x, y, w, h, second) {
        this.m00 = 0;
        this.m01 = 0;
        this.m10 = 0;
        this.m11 = 0;
        this.m02 = 0;
        this.m20 = 0;
        var i, j, val, vx, vy;
        var a = [];
        for (i = x; i < w; i++) {
            a = data[i];
            vx = i - x;
            for (j = y; j < h; j++) {
                val = a[j];
                vy = j - y;
                this.m00 += val;
                this.m01 += vy * val;
                this.m10 += vx * val;
                if (second) {
                    this.m11 += vx * vy * val;
                    this.m02 += vy * vy * val;
                    this.m20 += vx * vx * val;
                }
            }
        }
        this.invM00 = 1 / this.m00;
        this.xc = this.m10 * this.invM00;
        this.yc = this.m01 * this.invM00;
        this.mu00 = this.m00;
        this.mu01 = 0;
        this.mu10 = 0;
        if (second) {
            this.mu20 = this.m20 - this.m10 * this.xc;
            this.mu02 = this.m02 - this.m01 * this.yc;
            this.mu11 = this.m11 - this.m01 * this.xc;
        }
    };
    headtrackr.camshift.Rectangle = function(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.clone = function() {
            var c = new headtrackr.camshift.Rectangle();
            c.height = this.height;
            c.width = this.width;
            c.x = this.x;
            c.y = this.y;
            return c;
        };
    };
    headtrackr.camshift.Tracker = function(params) {
        if (params === undefined) params = {};
        if (params.calcAngles === undefined) params.calcAngles = true;
        var _modelHist, _curHist, _pdf, _searchWindow, _trackObj, _canvasCtx, _canvasw, _canvash;
        this.getSearchWindow = function() {
            return _searchWindow.clone();
        };
        this.getTrackObj = function() {
            return _trackObj.clone();
        };
        this.getPdf = function() {
            return _pdf;
        };
        this.getBackProjectionImg = function() {
            var weights = _pdf;
            var w = _canvasw;
            var h = _canvash;
            var img = _canvasCtx.createImageData(w, h);
            var imgData = img.data;
            var x, y, val;
            for (x = 0; x < w; x++) {
                for (y = 0; y < h; y++) {
                    val = Math.floor(255 * weights[x][y]);
                    pos = (y * w + x) * 4;
                    imgData[pos] = val;
                    imgData[pos + 1] = val;
                    imgData[pos + 2] = val;
                    imgData[pos + 3] = 255;
                }
            }
            return img;
        };
        this.initTracker = function(canvas, trackedArea) {
            _canvasCtx = canvas.getContext("2d");
            var taw = trackedArea.width;
            var tah = trackedArea.height;
            var tax = trackedArea.x;
            var tay = trackedArea.y;
            var trackedImg = _canvasCtx.getImageData(tax, tay, taw, tah);
            _modelHist = new headtrackr.camshift.Histogram(trackedImg.data);
            _searchWindow = trackedArea.clone();
            _trackObj = new headtrackr.camshift.TrackObj();
        };
        this.track = function(canvas) {
            var canvasCtx = canvas.getContext("2d");
            _canvash = canvas.height;
            _canvasw = canvas.width;
            var imgData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
            if (imgData.width != 0 && imgData.height != 0) camShift(imgData);
        };
        function camShift(frame) {
            var w = frame.width;
            var h = frame.height;
            var m = meanShift(frame);
            var a = m.mu20 * m.invM00;
            var c = m.mu02 * m.invM00;
            if (params.calcAngles) {
                var b = m.mu11 * m.invM00;
                var d = a + c;
                var e = Math.sqrt(4 * b * b + (a - c) * (a - c));
                _trackObj.width = Math.sqrt((d - e) * .5) << 2;
                _trackObj.height = Math.sqrt((d + e) * .5) << 2;
                _trackObj.angle = Math.atan2(2 * b, a - c + e);
                if (_trackObj.angle < 0) _trackObj.angle = _trackObj.angle + Math.PI;
            } else {
                _trackObj.width = Math.sqrt(a) << 2;
                _trackObj.height = Math.sqrt(c) << 2;
                _trackObj.angle = Math.PI / 2;
            }
            _trackObj.x = Math.floor(Math.max(0, Math.min(_searchWindow.x + _searchWindow.width / 2, w)));
            _trackObj.y = Math.floor(Math.max(0, Math.min(_searchWindow.y + _searchWindow.height / 2, h)));
            _searchWindow.width = Math.floor(1.1 * _trackObj.width);
            _searchWindow.height = Math.floor(1.1 * _trackObj.height);
        }
        function meanShift(frame) {
            var w = frame.width;
            var h = frame.height;
            var imgData = frame.data;
            var curHist = new headtrackr.camshift.Histogram(imgData);
            var weights = getWeights(_modelHist, curHist);
            _pdf = getBackProjectionData(imgData, frame.width, frame.height, weights);
            var m, x, y, i, wadx, wady, wadw, wadh;
            var meanShiftIterations = 10;
            var prevx = _searchWindow.x;
            var prevy = _searchWindow.y;
            for (i = 0; i < meanShiftIterations; i++) {
                wadx = Math.max(_searchWindow.x, 0);
                wady = Math.max(_searchWindow.y, 0);
                wadw = Math.min(wadx + _searchWindow.width, w);
                wadh = Math.min(wady + _searchWindow.height, h);
                m = new headtrackr.camshift.Moments(_pdf, wadx, wady, wadw, wadh, i == meanShiftIterations - 1);
                x = m.xc;
                y = m.yc;
                _searchWindow.x += x - _searchWindow.width / 2 >> 0;
                _searchWindow.y += y - _searchWindow.height / 2 >> 0;
                if (_searchWindow.x == prevx && _searchWindow.y == prevy) {
                    m = new headtrackr.camshift.Moments(_pdf, wadx, wady, wadw, wadh, true);
                    break;
                } else {
                    prevx = _searchWindow.x;
                    prevy = _searchWindow.y;
                }
            }
            _searchWindow.x = Math.max(0, Math.min(_searchWindow.x, w));
            _searchWindow.y = Math.max(0, Math.min(_searchWindow.y, h));
            return m;
        }
        function getWeights(mh, ch) {
            var weights = [];
            var p;
            for (var i = 0; i < 4096; i++) {
                if (ch.getBin(i) != 0) {
                    p = Math.min(mh.getBin(i) / ch.getBin(i), 1);
                } else {
                    p = 0;
                }
                weights.push(p);
            }
            return weights;
        }
        function getBackProjectionData(imgData, idw, idh, weights, hsMap) {
            var data = [];
            var x, y, r, g, b, pos;
            var a = [];
            for (x = 0; x < idw; x++) {
                a = [];
                for (y = 0; y < idh; y++) {
                    pos = (y * idw + x) * 4;
                    r = imgData[pos] >> 4;
                    g = imgData[pos + 1] >> 4;
                    b = imgData[pos + 2] >> 4;
                    a.push(weights[256 * r + 16 * g + b]);
                }
                data[x] = a;
            }
            return data;
        }
    };
    headtrackr.camshift.TrackObj = function() {
        this.height = 0;
        this.width = 0;
        this.angle = 0;
        this.x = 0;
        this.y = 0;
        this.clone = function() {
            var c = new headtrackr.camshift.TrackObj();
            c.height = this.height;
            c.width = this.width;
            c.angle = this.angle;
            c.x = this.x;
            c.y = this.y;
            return c;
        };
    };
    headtrackr.facetrackr = {};
    headtrackr.facetrackr.Tracker = function(params) {
        if (!params) params = {};
        if (params.sendEvents === undefined) params.sendEvents = true;
        if (params.whitebalancing === undefined) params.whitebalancing = true;
        if (params.debug === undefined) {
            params.debug = false;
        } else {
            if (params.debug.tagName != "CANVAS") params.debug = false;
        }
        if (params.whitebalancing) {
            var _currentDetection = "WB";
        } else {
            var _currentDetection = "VJ";
        }
        if (params.calcAngles == undefined) params.calcAngles = false;
        var _inputcanvas, _curtracked, _cstracker;
        var _confidenceThreshold = -10;
        var previousWhitebalances = [];
        var pwbLength = 15;
        this.init = function(inputcanvas) {
            _inputcanvas = inputcanvas;
            _cstracker = new headtrackr.camshift.Tracker({
                calcAngles: params.calcAngles
            });
        };
        this.track = function() {
            var result;
            if (_currentDetection == "WB") {
                result = checkWhitebalance();
            } else if (_currentDetection == "VJ") {
                result = doVJDetection();
            } else if (_currentDetection == "CS") {
                result = doCSDetection();
            }
            if (result.detection == "WB") {
                if (previousWhitebalances.length >= pwbLength) previousWhitebalances.pop();
                previousWhitebalances.unshift(result.wb);
                if (previousWhitebalances.length == pwbLength) {
                    var max = Math.max.apply(null, previousWhitebalances);
                    var min = Math.min.apply(null, previousWhitebalances);
                    if (max - min < 2) {
                        _currentDetection = "VJ";
                    }
                }
            }
            if (result.detection == "VJ" && result.confidence > _confidenceThreshold) {
                _currentDetection = "CS";
                var cRectangle = new headtrackr.camshift.Rectangle(Math.floor(result.x), Math.floor(result.y), Math.floor(result.width), Math.floor(result.height));
                _cstracker.initTracker(_inputcanvas, cRectangle);
            }
            _curtracked = result;
            if (result.detection == "CS" && params.sendEvents) {
                var evt = document.createEvent("Event");
                evt.initEvent("facetrackingEvent", true, true);
                evt.height = result.height;
                evt.width = result.width;
                evt.angle = result.angle;
                evt.x = result.x;
                evt.y = result.y;
                evt.confidence = result.confidence;
                evt.detection = result.detection;
                evt.time = result.time;
                document.dispatchEvent(evt);
            }
        };
        this.getTrackingObject = function() {
            return _curtracked.clone();
        };
        function doVJDetection() {
            var start = new Date().getTime();
            var ccvCanvas = document.createElement("canvas");
            ccvCanvas.width = _inputcanvas.width;
            ccvCanvas.height = _inputcanvas.height;
            ccvCanvas.getContext("2d").drawImage(_inputcanvas, 0, 0, ccvCanvas.width, ccvCanvas.height);
            var comp = headtrackr.ccv.detect_objects(headtrackr.ccv.grayscale(ccvCanvas), headtrackr.cascade, 5, 1);
            var diff = new Date().getTime() - start;
            var candidate;
            if (comp.length > 0) {
                candidate = comp[0];
            }
            for (var i = 1; i < comp.length; i++) {
                if (comp[i].confidence > candidate.confidence) {
                    candidate = comp[i];
                }
            }
            var result = new headtrackr.facetrackr.TrackObj();
            if (!(candidate === undefined)) {
                result.width = candidate.width;
                result.height = candidate.height;
                result.x = candidate.x;
                result.y = candidate.y;
                result.confidence = candidate.confidence;
            }
            result.time = diff;
            result.detection = "VJ";
            return result;
        }
        function doCSDetection() {
            var start = new Date().getTime();
            _cstracker.track(_inputcanvas);
            var csresult = _cstracker.getTrackObj();
            if (params.debug) {
                params.debug.getContext("2d").putImageData(_cstracker.getBackProjectionImg(), 0, 0);
            }
            var diff = new Date().getTime() - start;
            var result = new headtrackr.facetrackr.TrackObj();
            result.width = csresult.width;
            result.height = csresult.height;
            result.x = csresult.x;
            result.y = csresult.y;
            result.angle = csresult.angle;
            result.confidence = 1;
            result.time = diff;
            result.detection = "CS";
            return result;
        }
        function checkWhitebalance() {
            var result = new headtrackr.facetrackr.TrackObj();
            result.wb = headtrackr.getWhitebalance(_inputcanvas);
            result.detection = "WB";
            return result;
        }
    };
    headtrackr.facetrackr.TrackObj = function() {
        this.height = 0;
        this.width = 0;
        this.angle = 0;
        this.x = 0;
        this.y = 0;
        this.confidence = -1e4;
        this.detection = "";
        this.time = 0;
        this.clone = function() {
            var c = new headtrackr.facetrackr.TrackObj();
            c.height = this.height;
            c.width = this.width;
            c.angle = this.angle;
            c.x = this.x;
            c.y = this.y;
            c.confidence = this.confidence;
            c.detection = this.detection;
            c.time = this.time;
            return c;
        };
    };
    headtrackr.Ui = function() {
        var timeout;
        var d = document.createElement("div"), d2 = document.createElement("div"), p = document.createElement("p");
        d.setAttribute("id", "headtrackerMessageDiv");
        d.style.left = "20%";
        d.style.right = "20%";
        d.style.top = "30%";
        d.style.fontSize = "90px";
        d.style.color = "#777";
        d.style.position = "absolute";
        d.style.fontFamily = "Helvetica, Arial, sans-serif";
        d.style.zIndex = "100002";
        d2.style.marginLeft = "auto";
        d2.style.marginRight = "auto";
        d2.style.width = "100%";
        d2.style.textAlign = "center";
        d2.style.color = "#fff";
        d2.style.backgroundColor = "#444";
        d2.style.opacity = "0.5";
        p.setAttribute("id", "headtrackerMessage");
        d2.appendChild(p);
        d.appendChild(d2);
        document.body.appendChild(d);
        var supportMessages = {
            "no getUserMedia": "getUserMedia is not supported in your browser :(",
            "no camera": "no camera found :("
        };
        var statusMessages = {
            whitebalance: "Waiting for camera whitebalancing",
            detecting: "Please wait while camera is detecting your face...",
            hints: "We seem to have some problems detecting your face. Please make sure that your face is well and evenly lighted, and that your camera is working.",
            redetecting: "Lost track of face, trying to detect again..",
            lost: "Lost track of face :(",
            found: "Face found! Move your head!"
        };
        var override = false;
        document.addEventListener("headtrackrStatus", function(event) {
            if (event.status in statusMessages) {
                window.clearTimeout(timeout);
                if (!override) {
                    var messagep = document.getElementById("headtrackerMessage");
                    messagep.innerHTML = statusMessages[event.status];
                    timeout = window.setTimeout(function() {
                        messagep.innerHTML = "";
                    }, 3e3);
                }
            } else if (event.status in supportMessages) {
                override = true;
                window.clearTimeout(timeout);
                var messagep = document.getElementById("headtrackerMessage");
                messagep.innerHTML = supportMessages[event.status];
                window.setTimeout(function() {
                    messagep.innerHTML = "added fallback video for demo";
                }, 2e3);
                window.setTimeout(function() {
                    messagep.innerHTML = "";
                    override = false;
                }, 4e3);
            }
        }, true);
    };
    headtrackr.headposition = {};
    headtrackr.headposition.Tracker = function(facetrackrObj, camwidth, camheight, params) {
        if (!params) params = {};
        if (params.edgecorrection === undefined) {
            var edgecorrection = true;
        } else {
            var edgecorrection = params.edgecorrection;
        }
        this.camheight_cam = camheight;
        this.camwidth_cam = camwidth;
        var head_width_cm = 16;
        var head_height_cm = 19;
        var head_small_angle = Math.atan(head_width_cm / head_height_cm);
        var head_diag_cm = Math.sqrt(head_width_cm * head_width_cm + head_height_cm * head_height_cm);
        var sin_hsa = Math.sin(head_small_angle);
        var cos_hsa = Math.cos(head_small_angle);
        var tan_hsa = Math.tan(head_small_angle);
        var init_width_cam = facetrackrObj.width;
        var init_height_cam = facetrackrObj.height;
        var head_diag_cam = Math.sqrt(init_width_cam * init_width_cam + init_height_cam * init_height_cam);
        if (params.fov === undefined) {
            var head_width_cam = sin_hsa * head_diag_cam;
            var camwidth_at_default_face_cm = this.camwidth_cam / head_width_cam * head_width_cm;
            if (params.distance_to_screen === undefined) {
                var distance_to_screen = 60;
            } else {
                var distance_to_screen = params.distance_to_screen;
            }
            var fov_width = Math.atan(camwidth_at_default_face_cm / 2 / distance_to_screen) * 2;
        } else {
            var fov_width = params.fov * Math.PI / 180;
        }
        var tan_fov_width = 2 * Math.tan(fov_width / 2);
        var x, y, z;
        this.track = function(facetrackrObj) {
            var w = facetrackrObj.width;
            var h = facetrackrObj.height;
            var fx = facetrackrObj.x;
            var fy = facetrackrObj.y;
            if (edgecorrection) {
                var margin = 11;
                var leftDistance = fx - w / 2;
                var rightDistance = this.camwidth_cam - (fx + w / 2);
                var topDistance = fy - h / 2;
                var bottomDistance = this.camheight_cam - (fy + h / 2);
                var onVerticalEdge = leftDistance < margin || rightDistance < margin;
                var onHorizontalEdge = topDistance < margin || bottomDistance < margin;
                if (onHorizontalEdge) {
                    if (onVerticalEdge) {
                        var onLeftEdge = leftDistance < margin;
                        var onTopEdge = topDistance < margin;
                        if (onLeftEdge) {
                            fx = w - head_diag_cam * sin_hsa / 2;
                        } else {
                            fx = fx - w / 2 + head_diag_cam * sin_hsa / 2;
                        }
                        if (onTopEdge) {
                            fy = h - head_diag_cam * cos_hsa / 2;
                        } else {
                            fy = fy - h / 2 + head_diag_cam * cos_hsa / 2;
                        }
                    } else {
                        if (topDistance < margin) {
                            var originalWeight = topDistance / margin;
                            var estimateWeight = (margin - topDistance) / margin;
                            fy = h - (originalWeight * (h / 2) + estimateWeight * (w / tan_hsa / 2));
                            head_diag_cam = estimateWeight * (w / sin_hsa) + originalWeight * Math.sqrt(w * w + h * h);
                        } else {
                            var originalWeight = bottomDistance / margin;
                            var estimateWeight = (margin - bottomDistance) / margin;
                            fy = fy - h / 2 + (originalWeight * (h / 2) + estimateWeight * (w / tan_hsa / 2));
                            head_diag_cam = estimateWeight * (w / sin_hsa) + originalWeight * Math.sqrt(w * w + h * h);
                        }
                    }
                } else if (onVerticalEdge) {
                    if (leftDistance < margin) {
                        var originalWeight = leftDistance / margin;
                        var estimateWeight = (margin - leftDistance) / margin;
                        head_diag_cam = estimateWeight * (h / cos_hsa) + originalWeight * Math.sqrt(w * w + h * h);
                        fx = w - (originalWeight * (w / 2) + estimateWeight * (h * tan_hsa / 2));
                    } else {
                        var originalWeight = rightDistance / margin;
                        var estimateWeight = (margin - rightDistance) / margin;
                        head_diag_cam = estimateWeight * (h / cos_hsa) + originalWeight * Math.sqrt(w * w + h * h);
                        fx = fx - w / 2 + (originalWeight * (w / 2) + estimateWeight * (h * tan_hsa / 2));
                    }
                } else {
                    head_diag_cam = Math.sqrt(w * w + h * h);
                }
            } else {
                head_diag_cam = Math.sqrt(w * w + h * h);
            }
            z = head_diag_cm * this.camwidth_cam / (tan_fov_width * head_diag_cam);
            x = -(fx / this.camwidth_cam - .5) * z * tan_fov_width;
            y = -(fy / this.camheight_cam - .5) * z * tan_fov_width * (this.camheight_cam / this.camwidth_cam);
            if (params.distance_from_camera_to_screen === undefined) {
                y = y + 11.5;
            } else {
                y = y + params.distance_from_camera_to_screen;
            }
            var evt = document.createEvent("Event");
            evt.initEvent("headtrackingEvent", true, true);
            evt.x = x;
            evt.y = y;
            evt.z = z;
            document.dispatchEvent(evt);
            return new headtrackr.headposition.TrackObj(x, y, z);
        };
        this.getTrackerObj = function() {
            return new headtrackr.headposition.TrackObj(x, y, z);
        };
        this.getFOV = function() {
            return fov_width * 180 / Math.PI;
        };
    };
    headtrackr.headposition.TrackObj = function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.clone = function() {
            var c = new headtrackr.headposition.TrackObj();
            c.x = this.x;
            c.y = this.y;
            c.z = this.z;
            return c;
        };
    };
    headtrackr.controllers = {};
    headtrackr.controllers.three = {};
    headtrackr.controllers.three.realisticAbsoluteCameraControl = function(camera, scaling, fixedPosition, lookAt, params) {
        if (params === undefined) params = {};
        if (params.screenHeight === undefined) {
            var screenHeight_cms = 20;
        } else {
            var screenHeight_cms = params.screenHeight;
        }
        if (params.damping === undefined) {
            params.damping = 1;
        }
        camera.position.x = fixedPosition[0];
        camera.position.y = fixedPosition[1];
        camera.position.z = fixedPosition[2];
        camera.lookAt(lookAt);
        var wh = screenHeight_cms * scaling;
        var ww = wh * camera.aspect;
        document.addEventListener("headtrackingEvent", function(event) {
            var xOffset = event.x > 0 ? 0 : -event.x * 2 * params.damping * scaling;
            var yOffset = event.y < 0 ? 0 : event.y * 2 * params.damping * scaling;
            camera.setViewOffset(ww + Math.abs(event.x * 2 * params.damping * scaling), wh + Math.abs(event.y * params.damping * 2 * scaling), xOffset, yOffset, ww, wh);
            camera.position.x = fixedPosition[0] + event.x * scaling * params.damping;
            camera.position.y = fixedPosition[1] + event.y * scaling * params.damping;
            camera.position.z = fixedPosition[2] + event.z * scaling;
            camera.fov = Math.atan((wh / 2 + Math.abs(event.y * scaling * params.damping)) / Math.abs(event.z * scaling)) * 360 / Math.PI;
            camera.updateProjectionMatrix();
        }, false);
    };
    headtrackr.controllers.three.realisticRelativeCameraControl = function(camera, scaling, relativeFixedDistance, params) {
        if (params === undefined) params = {};
        if (params.screenHeight === undefined) {
            var screenHeight_cms = 20;
        } else {
            var screenHeight_cms = params.screenHeight;
        }
        var scene = camera.parent;
        var init = true;
        var offset = new THREE.Object3D();
        offset.position.set(0, 0, 0);
        offset.add(camera);
        scene.add(offset);
        var wh = screenHeight_cms * scaling;
        var ww = wh * camera.aspect;
        document.addEventListener("headtrackingEvent", function(event) {
            var xOffset = event.x > 0 ? 0 : -event.x * 2 * scaling;
            var yOffset = event.y > 0 ? 0 : -event.y * 2 * scaling;
            camera.setViewOffset(ww + Math.abs(event.x * 2 * scaling), wh + Math.abs(event.y * 2 * scaling), xOffset, yOffset, ww, wh);
            offset.rotation = camera.rotation;
            offset.position.x = 0;
            offset.position.y = 0;
            offset.position.z = 0;
            offset.translateX(event.x * scaling);
            offset.translateY(event.y * scaling);
            offset.translateZ(event.z * scaling + relativeFixedDistance);
            camera.fov = Math.atan((wh / 2 + Math.abs(event.y * scaling)) / Math.abs(event.z * scaling)) * 360 / Math.PI;
            camera.updateProjectionMatrix();
        }, false);
    };
    return headtrackr;
});

var siteCore = {};

siteCore.apps = {};

var $globalEl = new elements();

var sound;

function siteCoreInit() {
    var everythingLoaded = setInterval(function() {
        if (/loaded|complete/.test(document.readyState)) {
            clearInterval(everythingLoaded);
            bug("Everything is loaded");
            siteCore.apps.gameSystem = new gameSystem();
            siteCore.apps.gameCore = new gameCore();
            siteCore.apps.gameRender = new gameRender();
            siteCore.apps.gameController = new gameController();
            siteCore.apps.viewAnimations = new viewAnimations();
            siteCore.apps.viewUX = new viewUX();
            sound = new soundCore();
            responder.init();
            responder.viewPortCheck();
            checkCameraStatus();
            siteCore.apps.gameSystem.gameRun();
        }
    }, 10);
}

window.onload = function() {
    siteCoreInit();
};

var debug = {};

debug.active = true;

debug.version = "0001A";

if (debug.active) {
    debug.core = new debugConsole();
    function bug($data) {
        debug.core.debugConsole($data);
    }
    bug("val() attached");
    function val($valueName, $data) {
        debug.core.debugValue($valueName, $data);
    }
    bug("bug() attached");
}

function debugConsole() {
    var $el = {};
    var consoleLine = 0;
    var init = function() {
        buildConsole();
        cacheEl();
        createValue("game-paused");
        createValue("key-down");
        createValue("view-status");
        createValue("mouse-hover");
        createValue("key-status");
        createValue("game-time");
        createValue("score");
        styleConsole();
        debugConsole("init");
        document.onkeypress = function(e) {
            getKeyDown(e);
            if (e.which == 104 || e.which == 72) {
                toggleConsole();
            }
        };
    };
    var getKeyDown = function(e) {
        debugValue("key-down", e.which);
    };
    var buildConsole = function() {
        $("body").append("<div id='debug-console'>" + "Press H to toggle in window debug console <br/>" + "Version: " + debug.version + "<div id='debug-feed'>" + "</div>" + "<div id='debug-static-values'>" + "</div>" + "</div>");
    };
    var createValue = function($valueName) {
        $el.debugStaticValues.append("<div id='" + $valueName + "'>" + $valueName + ": <span class='value'></span>" + "</div>");
    };
    var styleConsole = function() {
        $el.debugConsole.css({
            color: "white",
            background: "black",
            border: "1px solid gray",
            position: "absolute",
            zIndex: "3000",
            fontSize: 9,
            padding: 10,
            maxHeight: 500,
            height: 350,
            width: 400,
            opacity: .65,
            top: 30,
            left: 10,
            display: "none"
        });
        $el.debugFeed.css({
            background: "black",
            overflowY: "scroll",
            width: 200,
            paddingTop: 10,
            paddingBottom: 10,
            marginTop: 10
        });
        $el.debugStaticValues.css({
            position: "absolute",
            top: 0,
            right: 0,
            width: 200,
            paddingTop: 10,
            paddingBottom: 10,
            marginTop: 10
        });
        $el.debugConsole.css("font-family", '"Helvetica Neue", helvetica, arial, verdana, sans-serif');
    };
    var toggleConsole = function() {
        if ($el.debugConsole.css("display") == "block") {
            $el.debugConsole.css({
                display: "none"
            });
            $el.debugExtraElements.css({
                display: "none",
                opacity: 0
            });
        } else {
            $el.debugConsole.css({
                display: "block"
            });
            $el.debugExtraElements.css({
                display: "block",
                opacity: 1
            });
        }
    };
    var debugConsole = function($data) {
        if (debug.active) {
            $el.debugFeed.prepend(consoleLine + " > " + $data + "<br />");
            consoleLine++;
        }
    };
    var debugValue = function($valueName, $data) {
        if (debug.active) {
            $el.debugStaticValues.find("#" + $valueName + " span.value").empty().append($data);
        }
    };
    var cacheEl = function() {
        $el.debugConsole = $("#debug-console");
        $el.debugFeed = $("#debug-feed");
        $el.debugStaticValues = $("#debug-static-values");
        $el.debugExtraElements = $("#motion-control-helper, #motion-track-overlay");
    };
    init();
    return {
        debugConsole: function($data) {
            debugConsole($data);
        },
        debugValue: function($valueName, $data) {
            debugValue($valueName, $data);
        }
    };
}

function elements() {
    var $els = {};
    $els.window = $(window);
    $els.body = $("body");
    $els.document = $(document);
    $els.game = {};
    $els.game.view = $("#view-game");
    $els.game.HUD = $("#game-timer, #score-counter, #score-bar");
    $els.game.scoreCounter = $("#score-counter");
    $els.game.comboCounter = $("#game-combo span");
    $els.game.scoreText = $("#game-score-text");
    $els.game.HUDwrap = $("#game-hud");
    $els.game.timeExtended = $("#time-extended, #time-extended-text");
    $els.game.timeExtendedText = $("#time-extended-text");
    $els.ux = {};
    $els.ux.blackOut = $("#black-out");
    $els.ux.introScreens = {};
    $els.ux.introScreens.logo = $("#intro-logo");
    $els.ux.introScreens.presents = $("#intro-presents");
    $els.ux.introScreens.chomperLogo = $("#chomper-logo");
    $els.ux.instructions = {};
    $els.ux.instructions.instructions = $("#instructions");
    $els.ux.instructions.warning = $("#warning");
    $els.ux.instructions.resetButton = $("#reset-button");
    $els.ux.countdown = {};
    $els.ux.countdown.counts = $(".count-down");
    $els.ux.countdown.count01 = $("#countdown-1");
    $els.ux.countdown.count02 = $("#countdown-2");
    $els.ux.countdown.count03 = $("#countdown-3");
    $els.ux.levelLabel = $("#level-label");
    $els.ux.levelCounter = $("#level-counter");
    $els.ux.endgame = {};
    $els.ux.endgame.loose = $("#you-loose");
    $els.ux.endgame.win = $("#well-done");
    $els.ux.endgame.finished = $("#game-won");
    $els.ux.endgame.scoreText = $("#game-won-score-text");
    return $els;
}

var lazyLoader = {};

$.fn.imgLoad = function(callback) {
    return this.each(function() {
        if (callback) {
            if (this.complete || this.readyState === 4 || this.readyState === "complete") {
                callback.apply(this);
            } else {
                $(this).one("load.imgCallback", function() {
                    callback.apply(this);
                });
            }
        }
    });
};

function lazyLoad($parentEl, $html, $elementsToCheck, callBack) {
    $parentEl = $parentEl || $("body");
    $html = $html || '<img id="testing-image" src="http://edspurrier.com/testing-assets/test-image.jpg" />';
    callBack = callBack || false;
    var extraAssetsLoading = false;
    var noAssetsToLoad = 0;
    var extraAssetsLoaded = false;
    var howManyLoaded = 0;
    var init = function() {
        bug("lazyLoader - init()");
        loadAssets();
    };
    var checkAssetsLoaded = function() {
        bug("lazyLoader - checkAssetsLoaded()");
        $elementsToCheck = $elementsToCheck || $("img");
        noAssetsToLoad = $elementsToCheck.length;
        $elementsToCheck.imgLoad(function() {
            howManyLoaded++;
            bug("Asset Loaded - " + howManyLoaded + " of " + noAssetsToLoad);
            if (noAssetsToLoad == howManyLoaded) {
                bug("lazyLoader - All Assets Loaded");
                extraAssetsLoaded = true;
                if (callBack) {
                    callBack();
                }
            }
        });
    };
    var loadAssets = function() {
        if (!extraAssetsLoading) {
            bug("Adding Assets");
            $parentEl.append($html);
            extraAssetsLoading = true;
            checkAssetsLoaded();
        } else {
            bug("Assets already loaded");
        }
    };
    init();
    return {};
}

var responderStartUp = false;

var $el = {};

$el["responsive-check"] = $("#responderCheck div");

$el["square-mobile"] = $(".square-sm");

$el["square-tablet"] = $(".square-md");

$el["square-desktop"] = $(".square-lg");

$el["square-all"] = $(".square-all");

var viewPort = {};

viewPort["deviceType-global"] = "desktop";

viewPort["breakpoint"] = "desktop";

viewPort["deviceH"] = window.screen.height;

viewPort["deviceW"] = window.screen.width;

var viewportRatios = {};

viewportRatios["1:1"] = 1;

viewportRatios["4:3"] = 1.33;

viewportRatios["3:2"] = 1.5;

viewportRatios["16:10"] = 1.6;

viewportRatios["17:10"] = 1.7;

viewportRatios["16:9"] = 1.78;

responder = {
    init: function() {
        this.calibrateHeight();
        this.calibrateWidth();
        this.calibrateOrientation();
        this.calibrateDevice();
        bug("Responder Init()");
    },
    update: function() {
        this.calibrateHeight();
        this.calibrateWidth();
        this.calibrateOrientation();
        this.calibrateDevice();
        bug("Responder update()");
    },
    viewPortCheck: function() {
        viewPort["windowH"] = $(window).height();
        viewPort["windowW"] = $(window).width();
        viewPort["outerH"] = window.outerHeight;
        viewPort["outerW"] = window.outerWidth;
        viewPort["windowH-half"] = viewPort["windowH"] / 2;
        viewPort["windowH-quart"] = viewPort["windowH"] / 4;
        viewPort["documentH"] = $("body").height();
        viewPort["documentW"] = $("body").width();
        viewPort["breakpoint"] = this.checkBreakpoint();
    },
    checkBreakpoint: function() {
        var checkStatus;
        $el["responsive-check"].each(function() {
            if ($(this).css("display") == "block") {
                checkStatus = $(this).attr("id");
            }
        });
        return checkStatus;
    },
    checkLandscape: function() {
        var checkStatus = true;
        if (viewPort["orientation"] != "landscape") {
            checkStatus = false;
        }
        return checkStatus;
    },
    calibrateHeight: function() {
        if (viewPort["breakpoint"] == "mobile") {
            $(".h100-md, .h100-lg, .h75-lg, .h50-md, .h50-lg, .h25-md, .h25-lg").height("auto");
            $el["square-tablet"].height("auto");
            $el["square-desktop"].height("auto");
            $(".h25-sm").height(viewPort["windowH-quart"]);
            $(".h50-sm").height(viewPort["windowH-half"]);
            $(".h75-sm").height(viewPort["windowH-half"] + viewPort["windowH-quart"]);
            $(".h100-sm").height(viewPort["windowH"]);
            var squareGroup = 0;
            $el["square-mobile"].each(function() {
                if ($(this).hasClass("square-group-boss")) {
                    squareGroup = $(this).width();
                }
                $(this).height(squareGroup);
            });
            $(".h-alt-sm").each(function() {
                var thisHeight = $(this).height() + $(this).data("height");
                $(this).height(thisHeight);
            });
        } else if (viewPort["breakpoint"] == "tablet") {
            $(".h100-lg, .h75-lg, .h50-lg, .h25-lg").height("auto");
            $el["square-mobile"].height("auto");
            $el["square-desktop"].height("auto");
            $(".h25-sm, .h25-md").height(viewPort["windowH-quart"]);
            $(".h50-sm, .h50-md").height(viewPort["windowH-half"]);
            $(".h75-sm, .h75-md").height(viewPort["windowH-half"] + viewPort["windowH-quart"]);
            $(".h100-sm, .h100-md").height(viewPort["windowH"]);
            var squareGroup = 0;
            $el["square-tablet"].each(function() {
                if ($(this).hasClass("square-group-boss")) {
                    squareGroup = $(this).width();
                }
                $(this).height(squareGroup);
            });
            $(".h-alt-md").each(function() {
                var thisHeight = $(this).height() + $(this).data("height");
                $(this).height(thisHeight);
            });
        } else if (viewPort["breakpoint"] == "desktop") {
            $el["square-mobile"].height("auto");
            $el["square-tablet"].height("auto");
            $(".h25-sm, .h25-md, .h25-lg").height(viewPort["windowH-quart"]);
            $(".h50-sm, .h50-md, .h50-lg").height(viewPort["windowH-half"]);
            $(".h75-sm, .h75-md, .h75-lg").height(viewPort["windowH-half"] + viewPort["windowH-quart"]);
            $(".h100-sm, .h100-md, .h100-lg").height(viewPort["windowH"]);
            $el["square-desktop"].each(function() {
                $(this).height($(this).width());
            });
        }
        $el["square-all"].each(function() {
            $(this).height($(this).width());
        });
    },
    calibrateWidth: function() {
        if (this.checkLandscape) {} else {}
        $(".w100-alter").each(function() {
            var thisWidth = viewPort["windowW"] + $(this).data("width");
            $(this).width(thisWidth);
        });
    },
    calibrateOrientation: function() {
        $("body").removeClass("landscape").removeClass("square").removeClass("portrait").addClass(viewPort["orientation"]);
    },
    calibrateDevice: function() {
        $("body").removeClass("mobile").removeClass("desktop").addClass(viewPort["deviceType-global"]);
    },
    deviceCheck: function() {
        var deviceAgent = navigator.userAgent;
        if (deviceAgent.match(/Android/i)) {
            viewPort["deviceType"] = "Android";
        } else if (deviceAgent.match(/BlackBerry/i)) {
            viewPort["deviceType"] = "BlackBerry";
        } else if (deviceAgent.match(/iPhone|iPad|iPod/i)) {
            viewPort["deviceType"] = "iOS";
        } else if (deviceAgent.match(/Opera Mini/i)) {
            viewPort["deviceType"] = "OperaMini";
        } else if (deviceAgent.match(/IEMobile/i)) {
            viewPort["deviceType"] = "Windows";
        } else if (deviceAgent.match(/BlackBerry/i)) {
            viewPort["deviceType"] = "BlackBerry";
        } else if (deviceAgent.match(/BlackBerry/i)) {
            viewPort["deviceType"] = "BlackBerry";
        } else if (deviceAgent.match(/BlackBerry/i)) {
            viewPort["deviceType"] = "BlackBerry";
        } else if (deviceAgent.match(/BlackBerry/i)) {
            viewPort["deviceType"] = "BlackBerry";
        } else if (deviceAgent.match(/BlackBerry/i)) {
            viewPort["deviceType"] = "BlackBerry";
        } else {
            viewPort["deviceType"] = "Desktop";
        }
        if (viewPort["deviceType"] != "Desktop") {
            viewPort["deviceType-global"] = "mobile";
        }
    },
    orientationCheck: function() {
        if (viewPort["windowH"] < viewPort["windowW"]) {
            viewPort["orientation"] = "landscape";
        } else if (viewPort["windowH"] > viewPort["windowW"]) {
            viewPort["orientation"] = "portrait";
        } else {
            viewPort["orientation"] = "square";
        }
    },
    windowRatioCheck: function() {
        if (viewPort["windowH"] < viewPort["windowW"]) {
            viewPort["windowRatio"] = viewPort["windowW"] / viewPort["windowH"];
        } else {
            viewPort["windowRatio"] = viewPort["windowH"] / viewPort["windowW"];
        }
        var ratios = $.map(viewportRatios, function(value, key) {
            return value;
        });
        var goal = viewPort["windowRatio"];
        var closest = ratios.reduce(function(prev, curr) {
            return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
        });
        viewPort["windowRatio-closest"] = $.map(viewportRatios, function(value, key) {
            if (closest === value) {
                return key;
            }
        });
    }
};

responder.viewPortCheck();

responder.deviceCheck();

responder.orientationCheck();

responder.windowRatioCheck();

$(document).on("load", function() {});

$(window).on("load", function() {});

$(window).on("resizeComplete", function() {
    responder.viewPortCheck();
    responder.orientationCheck();
    responder.windowRatioCheck();
    responder.update();
});

var anim = {};

anim.startupWait = .5;

anim.logoWait = .3;

anim.presentsWait = .2;

anim.instructionsWait = 1;

anim.countdownWait = 0;

anim.levelLabelWait = 2;

anim.winGameWait = 5;

function viewAnimations() {
    var timeLine = new TimelineMax();
    var init = function() {};
    var setupUX = function() {
        bug("setupUX()");
        $globalEl.game.view.css({
            display: "block",
            opacity: 1
        });
        $globalEl.ux.blackOut.css({
            display: "block",
            opacity: 1
        });
        $globalEl.ux.introScreens.logo.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.introScreens.presents.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.instructions.resetButton.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.levelCounter.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.levelLabel.css({
            display: "block",
            opacity: 0
        });
    };
    var animateStartUp = function() {
        bug("animateStartUp()");
        setupUX();
        timeLine.clear();
        timeLine.fromTo($globalEl.ux.introScreens.logo, anim_fast_x2, {
            opacity: 0,
            scale: 1.2
        }, {
            opacity: 1,
            scale: 1
        });
        timeLine.to($globalEl.ux.introScreens.logo, anim_fast_x2, {
            opacity: 0,
            scale: .8
        }, "+=" + anim.logoWait);
        timeLine.fromTo($globalEl.ux.introScreens.presents, anim_fast_x2, {
            opacity: 0,
            scale: 1.2
        }, {
            opacity: 1,
            scale: 1
        });
        timeLine.to($globalEl.ux.introScreens.presents, anim_fast_x2, {
            opacity: 0,
            scale: .8
        }, "+=" + anim.presentsWait);
        timeLine.fromTo($globalEl.ux.introScreens.chomperLogo, anim_fast_x2, {
            opacity: 0,
            scale: 1.2
        }, {
            opacity: 1,
            scale: 1
        });
        timeLine.to($globalEl.ux.introScreens.chomperLogo, anim_fast_x2, {
            opacity: 0,
            scale: .8
        }, "+=" + anim.logoWait);
        timeLine.to($globalEl.ux.blackOut, anim_med, {
            opacity: .5
        });
        timeLine.to($globalEl.ux.instructions.warning, anim_fast_x2, {
            opacity: 1
        });
        timeLine.to($globalEl.ux.instructions.resetButton, anim_fast_x2, {
            opacity: 1
        });
        timeLine.to($globalEl.ux.instructions.resetButton, anim_fast_x2, {
            opacity: 0
        });
        timeLine.to($globalEl.ux.instructions.resetButton, anim_fast_x2, {
            opacity: 1
        });
        timeLine.to($globalEl.ux.instructions.resetButton, anim_fast_x2, {
            opacity: 0
        });
        timeLine.to($globalEl.ux.instructions.resetButton, anim_fast_x2, {
            opacity: 1,
            onComplete: animateInstructions
        });
    };
    var animateInstructions = function() {
        bug("animateInstructions()");
        timeLine.clear();
        timeLine.to($globalEl.ux.blackOut, anim_med, {
            opacity: .5
        });
        timeLine.to([ $globalEl.ux.instructions.resetButton, $globalEl.ux.instructions.warning ], anim_fast_x2, {
            opacity: 0
        }, "-=" + anim_fast_x2);
        timeLine.to($globalEl.ux.instructions.instructions, anim_fast_x2, {
            opacity: 1
        });
        timeLine.to($globalEl.ux.instructions.instructions, anim_fast_x2, {
            opacity: 0
        }, "+=" + anim.instructionsWait);
        timeLine.to($globalEl.ux.blackOut, anim_med, {
            opacity: .25,
            onComplete: function() {
                siteCore.apps.viewUX.changeView("game-start");
            }
        });
    };
    var setupGame = function() {
        bug("setupGame()");
        $globalEl.ux.countdown.counts.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.countdown.count01.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.countdown.count02.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.countdown.count03.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.levelCounter.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.levelLabel.css({
            display: "block",
            opacity: 0
        });
    };
    var animateGameStart = function() {
        bug("animateGameStart()");
        timeLine.clear();
        timeLine.to($globalEl.game.view, anim_fast_x2, {
            opacity: 1,
            onComplete: function() {
                startGame();
            }
        });
    };
    var startGame = function() {
        bug("startGame()");
        timeLine.fromTo($globalEl.ux.countdown.count01, anim_med, {
            opacity: 0,
            scale: 1.2
        }, {
            opacity: 1,
            scale: 1
        });
        timeLine.to($globalEl.ux.countdown.count01, anim_med, {
            opacity: 0,
            scale: .8
        }, "+=" + anim.countdownWait);
        timeLine.fromTo($globalEl.ux.countdown.count02, anim_med, {
            opacity: 0,
            scale: 1.2
        }, {
            opacity: 1,
            scale: 1
        }, "-=" + anim_fast);
        timeLine.to($globalEl.ux.countdown.count02, anim_med, {
            opacity: 0,
            scale: .8
        }, "+=" + anim.countdownWait);
        timeLine.fromTo($globalEl.ux.countdown.count03, anim_med, {
            opacity: 0,
            scale: 1.2
        }, {
            opacity: 1,
            scale: 1
        }, "-=" + anim_fast);
        timeLine.to($globalEl.ux.countdown.count03, anim_med, {
            opacity: 0,
            scale: .8
        }, "+=" + anim.countdownWait);
        timeLine.to($globalEl.ux.blackOut, anim_fast, {
            opacity: 0
        });
        timeLine.to($globalEl.game.HUD, anim_fast_x2, {
            opacity: 1,
            onComplete: function() {
                siteCore.apps.gameController.gameRun();
                siteCore.viewStatus = "play";
            }
        });
    };
    var animateRestart = function() {
        bug("animateRestart()");
        timeLine.clear();
        setupGame();
        startGame();
    };
    var pauseGame = function() {
        game.timeLinePauseGame.clear();
        game.timeLinePauseGame.to($globalEl.game.view, anim_fast_x2, {
            opacity: .5
        });
    };
    var unpauseGame = function() {
        game.timeLinePauseGame.clear();
        game.timeLinePauseGame.to($globalEl.game.view, anim_fast_x2, {
            opacity: 0
        });
    };
    var setupEndGame = function() {
        bug("setupEndGame()");
        $globalEl.ux.endgame.loose.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.endgame.win.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.endgame.finished.css({
            display: "block",
            opacity: 0
        });
        $globalEl.ux.endgame.scoreText.css({
            display: "block",
            opacity: 0
        });
    };
    var animateEndGame = function($fromGame) {
        bug("animateEndGame()");
        siteCore.viewStatus = "end-game";
        timeLine.clear();
        setupEndGame();
        timeLine.to($globalEl.ux.blackOut, anim_med, {
            opacity: .5
        });
        timeLine.to($globalEl.ux.endgame.loose, anim_fast_x2, {
            opacity: 1
        });
    };
    var setupEndLevel = function() {
        bug("setupEndLevel()");
    };
    var animateEndLevel = function($fromGame) {
        bug("animateEndLevel()");
        timeLine.clear();
        setupEndLevel();
        setupEndGame();
        timeLine.to($globalEl.ux.blackOut, anim_med, {
            opacity: .5
        });
        timeLine.to($globalEl.ux.endgame.win, anim_fast_x2, {
            opacity: 1
        });
        timeLine.to($globalEl.ux.endgame.win, anim_fast_x2, {
            opacity: 0,
            onComplete: function() {
                animateGameStart();
            }
        }, "+=" + anim.winGameWait);
    };
    var setupGameWon = function() {
        bug("setupGameWon()");
    };
    var animateGameWon = function($fromGame) {
        bug("animateGameWon()");
        timeLine.clear();
        setupGameWon();
        setupEndGame();
        timeLine.to($globalEl.ux.blackOut, anim_med, {
            opacity: .5
        });
        timeLine.to($globalEl.ux.endgame.finished, anim_fast_x2, {
            opacity: 1
        });
        timeLine.to($globalEl.ux.endgame.scoreText, anim_fast_x2, {
            opacity: 1
        });
        timeLine.to($globalEl.ux.endgame.scoreText, anim_fast_x2, {
            opacity: 0
        });
        timeLine.to($globalEl.ux.endgame.scoreText, anim_fast_x2, {
            opacity: 1
        });
        timeLine.to($globalEl.ux.endgame.scoreText, anim_fast_x2, {
            opacity: 0
        });
        timeLine.to($globalEl.ux.endgame.scoreText, anim_fast_x2, {
            opacity: 1
        });
        timeLine.to($globalEl.ux.endgame.scoreText, anim_fast_x2, {
            opacity: 0
        });
        timeLine.to($globalEl.ux.endgame.scoreText, anim_fast_x2, {
            opacity: 1
        });
    };
    init();
    return {
        animateEndLevel: function() {
            animateEndLevel();
        },
        animateExpand: function() {
            animateExpand();
        },
        animateStartUp: function() {
            animateStartUp();
        },
        animateInstructions: function() {
            animateInstructions();
        },
        animateGameStart: function() {
            animateGameStart();
        },
        animateRestart: function() {
            animateRestart();
        },
        animateEndGame: function($fromGame) {
            animateEndGame($fromGame);
        },
        animateGameWon: function() {
            animateGameWon();
        },
        pauseGame: function() {
            pauseGame();
        },
        unpauseGame: function() {
            unpauseGame();
        }
    };
}

siteCore.viewStatus = "init";

siteCore.hoverPause = {};

siteCore.hoverPause.active = false;

siteCore.hoverPause.status = false;

function viewUX() {
    var setupCTAs = function() {};
    var setupMouseHovers = function() {
        $globalEl.body.mouseleave(function() {
            if (siteCore.hoverPause.active) {
                val("mouse-hover", "Out - Pausing");
                siteCore.hoverPause.status = true;
                siteCore.apps.gameCore.gamePause(true);
            } else {
                val("mouse-hover", "Out - No Action");
            }
        });
        $globalEl.body.mouseenter(function() {
            if (siteCore.hoverPause.active) {
                val("mouse-hover", "In - UnPausing");
                siteCore.hoverPause.status = false;
                siteCore.apps.gameCore.gamePause(false);
            } else {
                val("mouse-hover", "In - No Action");
            }
        });
    };
    var init = function() {
        setupMouseHovers();
        setupCTAs();
        changeView("intro");
    };
    var changeView = function($viewName, callBack) {
        callBack = callBack || false;
        bug("Changing View: " + $viewName);
        if ($viewName == "intro") {
            if (siteCore.viewStatus == "init") {
                bug("View = Intro - init");
                siteCore.apps.viewAnimations.animateStartUp();
            }
        } else if ($viewName == "game-start") {
            bug("View = Start Game");
            siteCore.apps.viewAnimations.animateGameStart();
        } else if ($viewName == "end-game") {
            bug("View = End Game");
            siteCore.viewStatus = "end-game";
            siteCore.apps.viewAnimations.animateEndGame(true);
        } else if ($viewName == "end-level") {
            bug("View = End Level");
            siteCore.viewStatus = "end-level";
            siteCore.apps.viewAnimations.animateEndLevel();
        } else if ($viewName == "game-won") {
            bug("View = Game Won");
            siteCore.viewStatus = "game-won";
            siteCore.apps.viewAnimations.animateGameWon();
        }
        val("view-status", siteCore.viewStatus);
        if (callBack) {
            callBack();
        }
    };
    init();
    return {
        changeView: function($viewName, callBack) {
            changeView($viewName, callBack);
        }
    };
}

