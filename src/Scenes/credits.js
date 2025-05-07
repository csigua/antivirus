class Credits extends Phaser.Scene {
    constructor() {
        super("credits");
    }

    preload() {
        this.load.setPath("./assets/Audio/");
        this.load.audio("confirm", "confirmation_001.ogg");
    }

    create() {
        this.title = this.add.text(game.config.width/2, 100,
            "Credits",
            {
                fontFamily: 'Times, Serif',
                fontSize: 60
            }
        )
        this.title.setOrigin(0.5);
        this.infoText = this.add.text(game.config.width/2, game.config.height/2,
            "Game created by Christian Sigua\n\nAssets from Kenney Assets - Cursor\nPixel Pack\n\nAudio from Kenney Assets - Interface\nSounds Pack\n\n\n\n'X' to return to main menu!",
            {
                fontSize: 30
            }
        )
        this.infoText.setOrigin(0.5);

        this.X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X); // X key
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.X)) {
            this.sound.play("confirm");
            this.scene.start("menu");
        }
    }
}