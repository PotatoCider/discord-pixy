const Command = require("../util/Command");

module.exports = class Whois extends Command {
	constructor(self) {
		super({
			name: "whois",
			desc: "List all members who are muted/banned or shows info about yourself/a member.",
			usage: "[muted/banned/@member]",
			requiresGuild: true,
			messageSplit: true,
			admin: true,
			utils: ["hastebin"],
			self
		});
	}

	async run(msg, params, reply) {
		const query = params.shift();
		if(!this.helpers.isAdmin(msg.author) && (query === "muted" || query === "banned"))return reply.throw("Insufficient permissions.")
		if(query === "muted")return this.muted(msg.guild, reply);
		if(query === "banned")return this.banned(msg.guild, reply);

		const member = query ? await this.helpers.fetchMember(query, msg.guild) : msg.member;
		reply.throw("Still work in progress");
	}

	async muted(guild, reply, raw) {
		await guild.fetchMembers();
		const mutedMembers = guild.roles.filter(role => role.name.toLowerCase().includes('mute'))
			.reduce((muted, role) => muted.concat(role.members.array()), []);

		if(mutedMembers.length === 0)return reply.append("There is no one muted.");
		if(raw)return mutedMembers;

		const muted = mutedMembers.map(muted => `${ muted.user.tag }`);

		if(muted.length > 5)return reply.append(`Collection of muted users: ${ await this.utils.hastebin(muted.join("\n"), "txt") }`);

		reply.append(`Muted users: ${ muted.join(", ") }.`);
	}

	async banned(guild, reply) {
		const banned = (await guild.fetchBans()).map(user => user.tag);
		
		if(banned.length === 0)return reply.append("There is no one banned.")
		if(banned.length > 5)return reply.append(`Collection of banned users: ${ await this.utils.hastebin(banned.join("\n"), "txt") }`);
		reply.append(`Banned users: ${ banned.join(", ") }.`);
	}
}