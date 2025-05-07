class Game extends Phaser.Scene {
    constructor() {
        super("game");

        this.my = {sprite: {}};  // Create an object to hold sprite bindings

        this.posX = 400;
        this.posY = 700;

        this.maxEnemies = 10;
    }

    preload() {
        this.load.setPath("./assets/Tiles/");
        this.load.image("ship", "tile_0137.png");           // ship sprite
        this.load.image("bullet", "tile_0070.png");         // bullet sprite
        this.load.image("enemy", "tile_0047.png");          // enemy sprite
        this.load.image("enemyBullet", "tile_0040.png");    // enemy bullet sprite
        this.load.image("bossBullet", "tile_0054.png");     // boss bullet sprite
        this.load.image("pathingEnemy", "tile_0045.png")    // pathing enemy sprite

        // explosion animation
        this.load.image("death01", "tile_0189.png");
        this.load.image("death02", "tile_0044.png");
        this.load.image("death03", "tile_0024.png");
        this.load.image("death04", "tile_0064.png");

        this.load.setPath("./assets/");
        this.load.image("boss", "boss.png");


        // load sounds
        this.load.setPath("./assets/Audio/");
        this.load.audio("loseSound",  "error_003.ogg");
        this.load.audio("bossHit",    "glitch_001.ogg");
        this.load.audio("bossDeath",  "question_002.ogg");
        this.load.audio("bossFire",   "error_004.ogg");
        this.load.audio("playerFire", "click_002.ogg");
        this.load.audio("playerHit",  "error_006.ogg");
        this.load.audio("enemyHit",   "back_003.ogg");
        this.load.audio("enemyFire1", "select_004.ogg");
        this.load.audio("enemyFire2", "select_005.ogg");
    }

    create() {
        let my = this.my;

        // game variables
        this.my.sprite.pathingEnemies = [];
        this.my.sprite.bossBullets = [];

        this.startX = game.config.width/2;
        this.startY = game.config.height - 40

        this.bulletCooldown = 20;
        this.bulletCooldownCounter = 0;

        this.enemySpawnCooldown = 200;
        this.enemyCooldownCounter = 50;

        this.moveTimer = 200;

        this.pathingSpawnCooldown = 10;
        this.pathingSpawnCooldownCounter = 30;

        this.invincibilityCooldown = 100;
        this.invincibilityCounter = 0;

        this.attackTimer = 0;
        this.attackCountdown = 80;

        this.endGame = false;

        my.sprite.ship = this.add.sprite(this.startX, this.startY, "ship");
        my.sprite.ship.setScale(4);

        this.AKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); // a key
        this.DKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); // d key

        // add arrows
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        this.Spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // ENEMY PATH
        this.points = [
            850,479,
            687,72,
            88,80,
            97,520,
            688,521,
            685,114,
            95,117,
            -50,499
        ];
        this.curve = new Phaser.Curves.Spline(this.points);

        // make a bullet group for the player
        my.sprite.bulletGroup = this.add.group({
            defaultKey: "bullet",
            maxSize: 20
        })

        // make all bullets at once and set them to be inactive
        my.sprite.bulletGroup.createMultiple({
            active: false,
            key: my.sprite.bulletGroup.defaultKey,
            repeat: my.sprite.bulletGroup.maxSize-1     
        })

        // make an enemy group for enemies
        my.sprite.enemyGroup = this.add.group({
            defaultKey: "enemy",
            maxSize: 15
        })

        // group for enemy bullets
        my.sprite.enemyBulletGroup = this.add.group({
            defaultKey: "enemyBullet",
            maxSize: 30
        })

        my.sprite.enemyGroup.createMultiple({
            active: false,
            visible: false,
            key: my.sprite.enemyGroup.defaultKey,
            repeat: my.sprite.enemyGroup.maxSize-1    
        })
        my.sprite.enemyBulletGroup.createMultiple({
            active: false,
            visible: false,
            key: my.sprite.enemyBulletGroup.defaultKey,
            repeat: my.sprite.enemyBulletGroup.maxSize-1
        })

        // pathing enemies but as an array instead
        for (let x = 0; x < this.maxEnemies; x++) {
            let newEnemy = this.add.follower(this.curve, this.curve.points[0].x, this.curve.points[0].y, "pathingEnemy")
            newEnemy.visible = false;
            my.sprite.pathingEnemies.push(newEnemy);
        }

        for (let x = 0; x < 50; x++) {
            let bossBullet = this.add.sprite(10, 10, "bossBullet");
            bossBullet.active = false;
            bossBullet.visible = false;
            my.sprite.bossBullets.push(bossBullet);
        }

        // boss
        my.sprite.boss = this.add.sprite(game.config.width/2, -200, "boss");
        my.sprite.boss.visible = false;
        my.sprite.boss.active = false;

        this.bulletSpeed = 20;
        this.shipSpeed = 10;
        this.enemySpeed = 2;
        this.enemyBulletSpeed = 5;
        this.score = 0;
        this.lives = 3;
        this.shotProbability = 0.002;

        this.allEnemiesSpawned = false;

        this.bossSpawned = false;
        this.direction = 1; // control boss movement
        this.bossHealth = 60;
        this.bossFinalPhase = false;

        // boss death animation
        this.anims.create({
            key: "death",
            frames: [
                {key: "death01"},
                {key: "death02"},
                {key: "death03"},
                {key: "death04"}
            ],
            frameRate: 4,
            hideOnComplete: true
        });


        this.scoreLabel = this.add.text(game.config.width, 120,"SCORE" + this.score,
            {
                fontSize: 50
            }
        );
        this.scoreLabel.setOrigin(1);

        this.lifeLabel = this.add.text(210, 120, "LIVES\n" + this.lives,
            {
                fontSize: 50
            }
        )
        this.lifeLabel.setOrigin(1);

        this.bossLabel = this.add.text(game.config.width/2, 50, "BOSS HEALTH\n" + this.lives,
            {
                bold: true,
                fontSize: 40
            }
        )
        this.bossLabel.visible = false;
        this.bossLabel.setOrigin(0.5);

        // // debugging variable
        // this.enemiesLaunched = 0;
    }

    update(time, delta) {
        let my = this.my;

        this.scoreLabel.setText("SCORE \n" + this.score);
        this.lifeLabel.setText("LIVES \n" + this.lives);
        this.bossLabel.setText("BOSS HEALTH\n" + this.bossHealth);

        this.bulletCooldownCounter--;
        this.pathingSpawnCooldownCounter--;
        this.moveTimer--;
        this.invincibilityCounter--;
        this.attackTimer--;

        // my.sprite.bullet.y -= 1 * delta;

        if (this.AKey.isDown || this.leftKey.isDown) {
            if (my.sprite.ship.x > my.sprite.ship.displayWidth/2) {
                my.sprite.ship.x -= this.shipSpeed;
            };
        }

        if (this.DKey.isDown || this.rightKey.isDown) {
            if (my.sprite.ship.x < game.config.width - my.sprite.ship.displayWidth/2) {
                my.sprite.ship.x += this.shipSpeed;
            };
        }

        // from BulletTime.js by JimWhiteheadUCSC
        // Check for bullet being fired
        if (this.Spacebar.isDown) {
            if (this.bulletCooldownCounter < 0) {
                // Get the first inactive bullet, and make it active
                let bullet = my.sprite.bulletGroup.getFirstDead();
                // bullet will be null if there are no inactive (available) bullets
                if (bullet != null) {
                    bullet.active = true;
                    bullet.visible = true;
                    bullet.setScale(2);
                    bullet.x = my.sprite.ship.x - (my.sprite.ship.displayWidth/8);
                    bullet.y = my.sprite.ship.y - (my.sprite.ship.displayHeight/3);
                    this.bulletCooldownCounter = this.bulletCooldown;
                }
                this.sound.play("playerFire");
            }
        }

        // check for bullet going offscreen
        for (let bullet of my.sprite.bulletGroup.getChildren()) {
            if (bullet.y < -(bullet.displayHeight/2)) {
                bullet.active = false;
                bullet.visible = false;
            }
        }

        // put normal enemies on screen
        if (!this.allEnemiesSpawned) {
            for (let x = -2; x < 3; x++) {
                for (let y = -1; y < 2; y++) {
                    let enemy = my.sprite.enemyGroup.getFirstDead();
                    if (enemy != null) {
                        enemy.active = true;
                        enemy.visible = true;
                        enemy.setRotation(-Math.PI/(4/3));
                        enemy.setScale(5);
                        enemy.x = game.config.width/2 - x * 100;
                        enemy.y = -enemy.displayHeight + y * 100;
                    }
                }
            }
        }
        this.allEnemiesSpawned = true;

        this.totalPathingSpawned = 0;
        if (this.totalPathingSpawned <= this.maxEnemies && this.pathingSpawnCooldownCounter < 0) {
            for (let pathingEnemy of my.sprite.pathingEnemies) {
                this.totalPathingSpawned++;
                if (!pathingEnemy.visible) {
                    pathingEnemy.x = this.curve.points[0].x;
                    pathingEnemy.y = this.curve.points[0].y;
                    pathingEnemy.setScale(4);
                    pathingEnemy.startFollow(
                        {
                            from: 0,
                            to: 1,
                            delay: 0,
                            duration: 6000,
                            ease: 'Linear',
                            repeat: -1,
                            yoyo: false,
                            rotateToPath: true,
                            rotationOffset: -90
                        }
                    );
                    pathingEnemy.visible = true;
                    this.pathingSpawnCooldownCounter = this.pathingSpawnCooldown;
                    break;
                }
            }
        }

        for (let enemy of my.sprite.enemyGroup.getChildren()) {
            for (let bullet of my.sprite.bulletGroup.getChildren()) {
                if (this.collides(enemy, bullet) && bullet.active && enemy.active) {
                    enemy.active = false;
                    enemy.visible = false;
                    bullet.active = false;
                    bullet.visible = false;
                    this.score += 10;
                    this.sound.play("enemyHit");
                }
            }
        }
        // check collision between all bullets and pathing enemies
        for (let enemy of my.sprite.pathingEnemies) {
            for (let bullet of my.sprite.bulletGroup.getChildren()) {
                if (this.collides(enemy, bullet) && bullet.active && enemy.active) {
                    enemy.stopFollow();
                    enemy.active = false;
                    enemy.visible = false;
                    bullet.active = false;
                    bullet.visible = false;
                    this.score += 20;
                    this.sound.play("enemyHit");
                }
            }
        }
        // check collision between all bullets and boss
        for (let bullet of my.sprite.bulletGroup.getChildren()) {
            if (this.bossCollides(my.sprite.boss, bullet) && bullet.active && this.moveTimer < 0 && my.sprite.boss.visible) {
                bullet.active = false;
                bullet.visible = false;
                this.bossHealth--;
                this.sound.play("bossHit");
            }
        }

        // move bullets
        my.sprite.bulletGroup.incY(-this.bulletSpeed);
        my.sprite.enemyBulletGroup.incY(this.enemyBulletSpeed);

        // move enemies
        if (this.moveTimer > 0 || this.bossFinalPhase) {
            my.sprite.enemyGroup.incY(this.enemySpeed);
        }

        // enemy shoots back!
        for (let enemy of my.sprite.enemyGroup.getChildren()) {
            if (enemy.visible) {
                let shotVariable = Math.random();
                if (shotVariable < this.shotProbability) {
                    let enemyBullet = my.sprite.enemyBulletGroup.getFirstDead();
                    if (enemyBullet != null) {
                        enemyBullet.active = true;
                        enemyBullet.visible = true;
                        enemyBullet.setScale(2);
                        enemyBullet.x = enemy.x;
                        enemyBullet.y = enemy.y;
                        this.sound.play("enemyFire1");
                    }
                }
            }
        }
        for (let enemy of my.sprite.pathingEnemies) {
            if (enemy.visible && enemy.active) {
                let shotVariable = Math.random();
                if (shotVariable < this.shotProbability) {
                    let enemyBullet = my.sprite.enemyBulletGroup.getFirstDead();
                    if (enemyBullet != null) {
                        enemyBullet.active = true;
                        enemyBullet.visible = true;
                        enemyBullet.setScale(3);
                        enemyBullet.x = enemy.x;
                        enemyBullet.y = enemy.y;
                        this.sound.play("enemyFire2");
                    }
                }
            }
        }
        // check for enemy bullets going offscreen
        for (let bullet of my.sprite.enemyBulletGroup.getChildren()) {
            if (bullet.y > game.config.height + (bullet.displayHeight/2)) {
                bullet.active = false;
                bullet.visible = false;
            }
        }
        // check for boss bullets going offscreen
        for (let bullet of my.sprite.bossBullets) {
            if (bullet.y > game.config.height + (bullet.displayHeight/2)) {
                bullet.active = false;
                bullet.visible = false;
            }
        }

        // check collision between enemy bullets and player ship
        for (let bullet of my.sprite.enemyBulletGroup.getChildren()) {
            if (this.collides(my.sprite.ship, bullet) && bullet.active && this.invincibilityCounter < 0 && !this.endGame) {
                my.sprite.ship.x = this.startX;
                my.sprite.ship.y = this.startY;
                this.lives--;
                bullet.active = false;
                bullet.visible = false;
                this.sound.play("playerHit");
                this.invincibilityCounter = this.invincibilityCooldown;
            }
        }
        // check collision between boss bullets and player ship
        for (let bullet of my.sprite.bossBullets) {
            if (this.collides(my.sprite.ship, bullet) && bullet.active && this.invincibilityCounter < 0 && !this.endGame) {
                my.sprite.ship.x = this.startX;
                my.sprite.ship.y = this.startY;
                this.lives--;
                bullet.active = false;
                bullet.visible = false;
                this.sound.play("playerHit");
                this.invincibilityCounter = this.invincibilityCooldown;
            }
        }

        if (this.invincibilityCounter > 0) {
            my.sprite.ship.visible = !my.sprite.ship.visible;
        }

        // spawn the boss
        if (this.score >= 350 && !this.bossSpawned) {
            my.sprite.boss.active = true;
            my.sprite.boss.visible = true;
            my.sprite.boss.setScale(4);
            my.sprite.boss.x = game.config.width/2;
            my.sprite.boss.y = -my.sprite.boss.displayHeight/2;
            this.moveTimer = 300;
            this.bossSpawned = true;
        }
        else if (this.score >= 350) {
            if (this.moveTimer > 0) { // entrance animation
                my.sprite.boss.y++;
            }
            else if (this.bossHealth > 40) { // 1ST PHASE
                this.bossLabel.visible = true;
                // BOSS MOVEMENT
                if (this.direction) {
                    if (my.sprite.boss.x > game.config.width - my.sprite.boss.displayWidth/2) {
                        this.direction = 0;
                    }
                    my.sprite.boss.x += 3;
                }
                else {
                    if (my.sprite.boss.x < my.sprite.boss.displayWidth/2) {
                        this.direction = 1;
                    }
                    my.sprite.boss.x -= 3;
                }

                // BOSS ATTACK
                if (this.attackTimer < 0 && my.sprite.boss.active) {
                    for (let x = 0; x < 3; x++) {
                        for (let bossBullet of my.sprite.bossBullets) {
                            if (!bossBullet.visible) {
                                bossBullet.active = true;
                                bossBullet.visible = true;
                                bossBullet['xTraj'] = (x-1) * 2;
                                bossBullet.x = my.sprite.boss.x;
                                bossBullet.y = my.sprite.boss.y;
                                bossBullet.setScale(3);
                                break;
                            }
                        }
                    }
                    this.sound.play("bossFire");
                    this.attackTimer = this.attackCountdown;
                }
                for (let bossBullet of my.sprite.bossBullets) {
                    if (bossBullet.visible) {
                        bossBullet.y += this.enemyBulletSpeed * 1.5;
                        bossBullet.x += bossBullet.xTraj;
                    }
                    if (bossBullet.y < -(bossBullet.displayHeight/2)) {
                        bossBullet.visible = false;
                    }
                }
            }
            else if (this.bossHealth <= 40 && this.bossHealth > 20) { // 2ND PHASE
                // BOSS MOVEMENT
                if (this.direction) {
                    if (my.sprite.boss.x > game.config.width - my.sprite.boss.displayWidth/2) {
                        this.direction = 0;
                    }
                    my.sprite.boss.x += 5;
                }
                else {
                    if (my.sprite.boss.x < my.sprite.boss.displayWidth/2) {
                        this.direction = 1;
                    }
                    my.sprite.boss.x -= 5;
                }

                // BOSS ATTACK
                if (this.attackTimer < 0 && my.sprite.boss.active) {
                    for (let x = 0; x < 5; x++) {
                        for (let bossBullet of my.sprite.bossBullets) {
                            if (!bossBullet.visible) {
                                bossBullet.active = true;
                                bossBullet.visible = true;
                                bossBullet['xTraj'] = (x-2) * 2;
                                bossBullet.x = my.sprite.boss.x;
                                bossBullet.y = my.sprite.boss.y;
                                bossBullet.setScale(3);
                                break;
                            }
                        }
                    }
                    this.sound.play("bossFire");
                    this.attackTimer = this.attackCountdown * 0.75;
                }
                for (let bossBullet of my.sprite.bossBullets) {
                    if (bossBullet.visible) {
                        bossBullet.y += this.enemyBulletSpeed * 1.5;
                        bossBullet.x += bossBullet.xTraj;
                    }
                    if (bossBullet.y < -(bossBullet.displayHeight/2)) {
                        bossBullet.visible = false;
                    }
                }
            }
            else { // FINAL PHASE
                this.bossFinalPhase = true;
                // BOSS MOVEMENT
                if (this.direction) {
                    if (my.sprite.boss.x > game.config.width - my.sprite.boss.displayWidth/2) {
                        this.direction = 0;
                    }
                    my.sprite.boss.x += 8;
                }
                else {
                    if (my.sprite.boss.x < my.sprite.boss.displayWidth/2) {
                        this.direction = 1;
                    }
                    my.sprite.boss.x -= 8;
                }

                // BOSS ATTACK
                if (this.attackTimer < 0 && my.sprite.boss.active) {
                    for (let x = 0; x < 7; x++) {
                        for (let bossBullet of my.sprite.bossBullets) {
                            if (!bossBullet.visible) {
                                bossBullet.active = true;
                                bossBullet.visible = true;
                                bossBullet['xTraj'] = (x-3) * 2;
                                bossBullet.x = my.sprite.boss.x;
                                bossBullet.y = my.sprite.boss.y;
                                bossBullet.setScale(3);
                                break;
                            }
                        }
                    }

                    let enemy = my.sprite.enemyGroup.getFirstDead();
                    if (enemy != null) {
                        enemy.active = true;
                        enemy.visible = true;
                        enemy.setRotation(-Math.PI/(4/3));
                        enemy.setScale(4);
                        enemy.x = my.sprite.boss.x;
                        enemy.y = my.sprite.boss.y;
                    }

                    this.sound.play("bossFire");
                    this.attackTimer = this.attackCountdown * 0.6;
                }
                for (let bossBullet of my.sprite.bossBullets) {
                    if (bossBullet.visible) {
                        bossBullet.y += this.enemyBulletSpeed * 1.5;
                        bossBullet.x += bossBullet.xTraj;
                    }
                    if (bossBullet.y < -(bossBullet.displayHeight/2)) {
                        bossBullet.visible = false;
                    }
                }
            }
        }


        if (this.lives < 1) {
            this.sound.play("loseSound");
            this.scene.start("lose");
        }
        if (this.bossHealth <= 0 && my.sprite.boss.visible) {
            this.endGame = true;
            my.sprite.boss.visible = false;
            my.sprite.boss.active = false;
            this.sound.play("bossDeath");
            for (let enemy of my.sprite.enemyGroup.getChildren()) {
                enemy.active = false;
                enemy.visible = false;
            }
            this.death = this.add.sprite(my.sprite.boss.x, my.sprite.boss.y, "death04").setScale(12).play("death");
            this.death.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.scene.start("end");
            }, this);
        }
    }

    collides(a, b) 
    // a & b are sprites/
    // gameObjs(AABBs)
    {
      if (Math.abs(a.x - b.x) > (a.displayWidth/3 + b.displayWidth/3)) return false;
      if (Math.abs(a.y - b.y) > (a.displayHeight/3 + b.displayHeight/3)) return false;
      return true;
    }

    bossCollides(a, b) 
    // a & b are sprites/
    // gameObjs(AABBs)
    {
      if (Math.abs(a.x - b.x) > (a.displayWidth/2.5 + b.displayWidth/2.5)) return false;
      if (Math.abs(a.y - b.y) > (a.displayHeight/2.5 + b.displayHeight/2.5)) return false;
      return true;
    }
    
}