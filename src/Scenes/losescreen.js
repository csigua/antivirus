class LoseScreen extends Phaser.Scene {
    constructor() {
        super("lose");
    }

    preload() {
        this.load.setPath("./assets/Audio/");
        this.load.audio("confirm", "confirmation_001.ogg");
    }

    create() {
        this.smile = this.add.text(30, 0,":(",
            {
                fontFamily: "Arial",
                fontSize: 400
            }
        );
        this.smile.setOrigin(0);
        this.winText = this.add.text(30, 500, "You died! The virus has won.\nSay goodbye to your computer.",
            {
                fontSize: 30
            }
        )
        this.continueText = this.add.text(30, 600, "Press 'X' to play again!\nPress 'C' to view credits!",
            {
                fontSize: 30
            }
        )

        this.X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X); // X key
        this.C = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C); // C key
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.X)) {
            this.sound.play("confirm");
            this.scene.get("game").scene.restart();
            this.scene.start("game");
        }
        if (Phaser.Input.Keyboard.JustDown(this.C)) {
            this.sound.play("confirm");
            this.scene.start("credits");
        }
    }
}