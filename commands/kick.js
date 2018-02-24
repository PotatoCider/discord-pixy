const Command = require("../util/Command");

module.exports = class extends Command {
	constructor(self) {
		super({
			name: "kick",
			desc: "Kicks a guild member from a guild.",
			usage: "<@member> [reason]",
			admin: true,
			messageSplit: true,
			self
		});
	}

	run(msg, params) {
		const mention = params.shift(),
			reason = params.join(" ");

		return this.helpers.fetchMember(mention, msg.guild)
		.then(mem => {
			if(!mem)throw "Invalid guild member.";
			return mem.kick(reason);
		})
		.then(mem => `Successfully kicked ${ mem }${ reason ? ` due to **${ reason }**` : "" }.`);
	}
}