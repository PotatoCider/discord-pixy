const ClientHandler = require("../util/ClientHandler"),
	Jimp = require("jimp");

module.exports = class GuildMemberAdd extends ClientHandler {
	constructor(self) {
		super(self, "guildMemberAdd");
		this.init = this.preloadAssets();
	}

	async preloadAssets() {
		this.welcImage = await Jimp.read("assets/welcome.png");
		this.font = await Jimp.loadFont("assets/font.fnt");
	}

	async handle(mem) {
		
		const channel = this.self.production ? mem.guild.channels.get("355563483783364612") : mem.guild.channels.find(ch => ch.name ===	"testing"),
			image = this.welcImage.clone(),
			avatar = await Jimp.read(mem.user.displayAvatarURL);

		avatar.resize(290, 290);
		image.composite(avatar, 407, 248, { mode: Jimp.BLEND_DESTINATION_OVER });

		const width = Jimp.measureText(this.font, mem.user.tag);
		image.print(this.font, ~~(552 - width / 2), 635, mem.user.tag);

		const imageBuffer = await image.getBufferAsync("image/png");
		channel.send({ files: [ { attachment: imageBuffer, name: "welcome.png" } ] });
	}
}