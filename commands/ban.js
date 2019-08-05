const Command = require("../util/Command")

module.exports = class Ban extends Command {
	constructor(self) {
		super({
			name: "ban",
			desc: "Bans a guild member from a guild.",
			detailed: "Bans a guild member from a guild. Reason can be included (Audit Logs).",
			usage: "<@member> [reason]",
			admin: true,
			messageSplit: true,
			self
		});
	}

	async run(msg, params, reply) {
		const mention = params.shift(),
			reason = params.join(" "),
			user = await this.helpers.fetchUser(mention, msg.guild);
		if(!user)reply.throw("Invalid discord user.");
		await msg.guild.ban(user, { reason });
		reply.channel = this.self.production ? msg.guild.channels.get("416248602227376128") : msg.guild.channels.find(ch => ch.name === "testing");
		reply.append(`Successfully banned user ${ user.tag } (ID: ${ member.id }) ${ reason ? ` due to **${ reason }**` : "" }.`);
	}
}