const ClientHandler = require("../util/ClientHandler");

module.exports = class GuildMemberRemove extends ClientHandler {
	constructor(self) {
		super(self, "guildMemberRemove");
		this.guilds = self.db.collection("guilds");
		this.init = self.production && this.flagMissedMembers();
	}

	async flagMissedMembers() {
		const entries = await this.guilds.getAll();
		await this.self.logined;
		await this.self.handlers.guildMemberAdd.init;
		const loading = entries.map(entry => {
			const memberHistory = Object.keys(entry.memberHistory),
				guild = this.self.client.guilds.get(entry.id);
			if(!guild)return;

			const inGuild = guild.members.clone(),
				toFlag = memberHistory.filter(mem => !inGuild.has(mem.id) && mem.inGuild),
				guildDoc = {};
			if(toFlag.length === 0)return;
			
			toFlag.forEach(mem => guildDoc[`memberHistory.${ mem.id }.inGuild`] = false);
			return this.guilds.update({ id: entry.id }, guildDoc);
		});
		await Promise.all(loading);
	}

	async flagMember(mem, force) {
		if(force)return await this.guilds.update({ id: mem.guild.id }, { [`memberHistory.${ mem.id }`]: "" }, "unset");
		await this.guilds.update({ id: mem.guild.id }, { [`memberHistory.${ mem.id }.inGuild`]: false });
	}

	async handle(mem) {
		this.flagMember(mem);
	}
}