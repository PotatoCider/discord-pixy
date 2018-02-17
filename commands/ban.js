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

	run(msg, params) {
		const mention = params.shift(),
			reason = params.join(" ");

		return this.helpers.fetchMember(mention, msg.guild)
		.then(mem => {
			if(!mem)throw "Invalid guild member.";
			return mem.ban(reason);
		})
		.then(mem => "Sucessfully banned " + mem.user + (reason ? ` due to **${ reason }**.` : "."))
	}
}