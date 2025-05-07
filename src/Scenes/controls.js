class Controls extends Phaser.Scene {
    constructor() {
        super("controls");
    }

    preload() {
        this.load.setPath("./assets/Tiles/");
        this.load.image("ship", "tile_0137.png");           // ship sprite
        this.load.image("bullet", "tile_0070.png");         // bullet sprite

        this.load.setPath("./assets/Audio/");
        this.load.audio("confirm", "confirmation_001.ogg");
    }

    create() {
        my.sprite.ship = this.add.sprite(180, game.config.height/1.55, "ship");
        my.sprite.ship.setScale(4);

        my.sprite.ship2 = this.add.sprite(game.config.width - 230, game.config.height/1.55, "ship");
        my.sprite.ship2.setScale(4);

        my.sprite.bullet = this.add.sprite(171, game.config.height/1.67, "bullet");
        my.sprite.bullet.setScale(2);

        this.title = this.add.text(game.config.width/2, game.config.height/2 - 400,
            "Controls",
            {
                fontFamily: 'Times, Serif',
                fontSize: 60
            }
        )
        this.title.setOrigin(0.5);
        this.shootText = this.add.text(60, game.config.height/1.4,
            "SPACE to fire",
            {
                fontSize: 30
            }
        )
        this.shootText.setOrigin(0);
        this.moveText = this.add.text(420, game.config.height/1.4,
            "A/D or LEFT/RIGHT\narrow keys to move",
            {
                fontSize: 30
            }
        )
        this.moveText.setOrigin(0);

        this.X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X); // X key
        this.direction = 0;
    }

    update() {
        if (this.direction) {
            if (my.sprite.ship2.x > game.config.width - my.sprite.ship2.displayWidth/2 - 40) {
                this.direction = 0;
            }
            my.sprite.ship2.x += 4;
        }
        else {
            if (my.sprite.ship2.x < game.config.width/2 - my.sprite.ship2.displayWidth/2 + 40) {
                this.direction = 1;
            }
            my.sprite.ship2.x -= 4;
        }

        my.sprite.bullet.y -= 10;
        if (my.sprite.bullet.y < 250) {
            my.sprite.bullet.y = game.config.height/1.67;
        }

        if (Phaser.Input.Keyboard.JustDown(this.X)) {
            this.sound.play("confirm");
            this.scene.get("game").scene.restart();
            this.scene.start("game");
        }
    }
}