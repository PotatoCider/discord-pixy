const Command = require("../util/Command");

module.exports = class Kick extends Command {
	constructor(self) {
		super({
			name: "kick",
			desc: "Kicks a guild member from a guild.",
			detailed: "Kicks a guild member from a guild. Reason can be included (Audit Logs).",
			usage: "<@member> [reason]",
			admin: true,
			messageSplit: true,
			self
		});
	}

	async run(msg, params, reply) {
		const mention = params.shift(),
			reason = params.join(" "),
			member = await this.helpers.fetchMember(mention, msg.guild)
		if(!member)reply.throw("Invalid guild member.");

		await member.kick(reason);

		reply.append(`Successfully kicked <@${ member.id }>${ reason ? ` due to **${ reason }**` : "" }.`);
	}
}