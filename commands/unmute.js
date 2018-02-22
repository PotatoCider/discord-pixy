const Command = require("../util/Command");

module.exports = class extends Command {
	constructor(self) {
		super({
			name: "unmute",
			desc: "Unmutes a guild member.",
			usage: "<@member> [reason]",
			admin: true,
			requiresGuild: true,
			messageSplit: true,
			self
		});
	}

	run(msg, params) {
		const mention = params.shift(),
			reason = params.join(" ");

		return this.helpers.fetchMember(mention, msg.guild).then(mem => {
			if(!mem)throw "Invalid guild member.";

			const roles = mem.roles.filterArray(role => role.name.toLowerCase().includes("mute"));
			if(!roles.length)throw "Member is not muted!";

			return roles.length === 1 ? mem.removeRole(roles[0], reason) : mem.removeRoles(roles, reason);
		}).then(mem => `Successfully unmuted ${ mem }${ reason ? ` due to **${ reason }**` : "" }.`)
	}
}