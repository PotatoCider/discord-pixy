const ClientHandler = require("../util/ClientHandler"),
	fontCodes = new Set(require("../assets/font.json").concat(32)), // spaces included.
	Jimp = require("jimp");

module.exports = class GuildMemberAdd extends ClientHandler {
	constructor(self) {
		super(self, "guildMemberAdd");
		this.guilds = self.db.collection("guilds");
		this.init = Promise.all([this.preloadAssets(), self.production && this.addMissedMembers()]);
	}

	async addMissedMembers() {
		const entries = await this.guilds.getAll();

		await this.self.logined;
		const loading = entries.map(async (entry) => {
			const guild = this.self.client.guilds.get(entry.id);
			await guild.fetchMembers();
			const members = guild.members.clone();
			members.sweep(member => entry.memberHistory[member.id]);
			const guildDoc = {};
			if(members.size === 0)return;
			return members.map(mem => {
				guildDoc[`memberHistory.${ mem.id }`] = { xp: 0, inGuild: true };
				return Promise.all([this.welcome(mem), this.checkState(mem)]);
			}).concat(this.guilds.update({ id: entry.id }, guildDoc));
		});
		await Promise.all([].concat(...loading));
	}

	async preloadAssets() {
		let resolve;
		this.loadedAssets = new Promise(res => resolve = res);
		this.welcImage = await Jimp.read("assets/welcome.png");
		this.font = await Jimp.loadFont("assets/font.fnt");
		resolve();
	}

	async checkState(mem) {
		const now = Date.now(),
			doc = await this.guilds.getOne({ id: mem.guild.id, [`memberHistory.${ mem.id }.muted`]: { $exists: true } }, { [`memberHistory.${ mem.id }`]: 1 }),
			unmuteTimestamp = doc.memberHistory[mem.id].muted;
		if(!doc)return;
		if(unmuteTimestamp !== "forever" && now >= unmuteTimestamp)return;

		const muted = mem.guild.roles.find(role => role.name === "Muted");
		await mem.addRole(muted, "member attempted to rejoin before the muted effect expired");
	}

	async addToDatabase(mem) {
		const res = await this.guilds.getOne({ id: mem.guild.id }, { [`memberHistory.${ mem.id }.inGuild`]: 1 });
		if(res.memberHistory[mem.id]) {
			if(!res.memberHistory[mem.id].inGuild){
				this.guilds.update({ id: mem.guild.id }, { [`memberHistory.${ mem.id }.inGuild`]: true });
			}
			return false;
		}

		await this.guilds.update({ id: mem.guild.id }, { [`memberHistory.${ mem.id }`]: { xp: 0, inGuild: true } });
		return true;
	}

	async welcome(mem) { // TODO: Move code to modules that has names related *to what they do* 
		//await this.loadedAssets;
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

		let width = Jimp.measureText(this.font, tag) + (tag.split(" ").length - 1) * 39;
		
		if(width > 1024) {
			const [ name, number ] = tag.split("#");
			tag = name.slice(0, 10) + "...#" + number;
			width = Jimp.measureText(this.font, tag) + (tag.split(" ").length - 1) * 39;
		}
		image.print(this.font, ~~(552 - width / 2), 635, { text: tag });

		const imageBuffer = await image.getBufferAsync("image/png");
		
		channel.send(`Welcome to ๖̶̶̶ζ͜͡Paragon ${ Math.random() < 0.05 ? "G" : "X" }enocide, ${ mem }.`, { files: [ { attachment: imageBuffer, name: "welcome.png" } ] });
	}

	async handle(mem, force) {
		if(mem.guild.id !== "346244476211036160")return;
		this.checkState(mem);
		const isNew = await this.addToDatabase(mem);
		if(isNew || force)this.welcome(mem);
	}
}