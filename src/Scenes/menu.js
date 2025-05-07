class Menu extends Phaser.Scene {
    constructor() {
        super("menu");
    }

    preload() {
        this.load.setPath("./assets/Audio/");
        this.load.audio("confirm", "confirmation_001.ogg");
    }

    create() {
        this.title = this.add.text(game.config.width/2, game.config.height/2 - 200,
            "ANTIVIRUS",
            {
                fontFamily: 'Times, Serif',
                fontSize: 60
            }
        )
        this.title.setOrigin(0.5);
        this.infoText = this.add.text(game.config.width/2, game.config.height/2,
            "Oh no! Your computer has been infected.\nGet rid of those viruses!\n\nPress 'X' to start.\nPress 'C' to view credits.",
            {
                fontSize: 30
            }
        )
        this.infoText.setOrigin(0.5);

        this.X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X); // X key
        this.C = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C); // C key
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.X)) {
            this.sound.play("confirm");
            this.scene.start("controls");
        }
        if (Phaser.Input.Keyboard.JustDown(this.C)) {
            this.sound.play("confirm");
            this.scene.start("credits");
        }
    }
}