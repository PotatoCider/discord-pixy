const ClientHandler = require("../util/ClientHandler"),
	fontCodes = new Set(require("../assets/font.json")),
	Jimp = require("jimp");

module.exports = class GuildMemberAdd extends ClientHandler {
	constructor(self) {
		super(self, "guildMemberAdd");
		this.guilds = self.db.guilds;
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

		let tag = mem.user.tag.split("");
		for(let i = 0; i < tag.length; i++) {
			if(!fontCodes.has(tag[i].charCodeAt(0)))tag[i] = "_"
		}
		tag = tag.join("");

		avatar.resize(290, 290);
		image.composite(avatar, 407, 248, { mode: Jimp.BLEND_DESTINATION_OVER });

		let width = Jimp.measureText(this.font, tag);
		if(width > 1024) {
			const [ name, number ] = tag.split("#");
			tag = name.slice(0, 10) + "...#" + number;
			width = Jimp.measureText(this.font, tag);
		}
		image.print(this.font, ~~(552 - width / 2), 635, tag);

		const imageBuffer = await image.getBufferAsync("image/png");
		
		channel.send(`Welcome to ๖̶̶̶ζ͜͡Paragon ${ Math.random() < 0.05 ? "G" : "X" }enocide, ${ mem }.`, { files: [ { attachment: imageBuffer, name: "welcome.png" } ] });
	}
}