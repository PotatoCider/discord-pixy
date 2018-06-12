const Command = require("../util/Command");

module.exports = class extends Command {
	constructor(self) {
		super({
			name: "whois",
			desc: "List all members who are muted/banned or shows info about a member.",
			usage: "<muted/banned/@member>",
			requiresGuild: true,
			messageSplit: true,
			utils: ["hastebin"],
			self
		});
	}

	run(msg, params, reply) {
		const query = params.shift();
		if(query === "muted")return this.muted(msg.guild, reply);
		if(query === "banned")return this.banned(msg.guild, reply);

		const member = this.helpers.fetchMember(query, msg.guild);
		if(!member)return reply.throw("Invalid guild member.");
		reply.throw("Still work in progress");
	}

	muted(guild, reply) {
		return guild.fetchMembers().then(guild => guild.roles
			.filter(role => role.toLowerCase().includes('mute'))
			.reduce((muted, role) => muted.concat(role.members.array()), [])
		)
		.then(muted => {
			if(muted.length === 0)return reply.append("There is no one muted.");
			reply.append(muted.map(muted => `${ muted.user.tag }`).join(", "))
		});
	}

	async banned(guild, reply) {
		const banned = (await guild.fetchBans()).map(user => user.tag);
		
		if(banned.length > 5)return reply.append(`Collection of banned users: ${ await this.utils.hastebin(banned.join("\n"), "txt") }`);
		reply.append(`Banned users: ${ banned.join(", ") }.`);
	}
}