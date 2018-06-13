const Command = require("../util/Command")

module.exports = class Ban extends Command {
	constructor(self) {
		super({
			name: "ban",
			desc: "Bans a guild member from a guild.",
			usage: "<@member> [reason]",
			admin: true,
			messageSplit: true,
			self
		});
	}

	async run(msg, params, reply) {
		const mention = params.shift(),
			reason = params.join(" "),
			member = await this.helpers.fetchMember(mention, msg.guild);
		if(!member)reply.throw("Invalid guild member.");

		await member.ban(reason);

		reply.append(`Successfully banned ${ member }${ reason ? ` due to **${ reason }**` : "" }.`);
	}
}