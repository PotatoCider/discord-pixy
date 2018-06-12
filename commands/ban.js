const Command = require("../util/Command")

module.exports = class extends Command {
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

	run(msg, params, reply) {
		const mention = params.shift(),
			reason = params.join(" ");

		return this.helpers.fetchMember(mention, msg.guild)
		.then(mem => {
			if(!mem)reply.throw("Invalid guild member.");

			reply.append(`Successfully banned ${ mem }${ reason ? ` due to **${ reason }**` : "" }.`);

			return mem.ban(reason);
		})
	}
}