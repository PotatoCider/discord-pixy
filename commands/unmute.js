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

	run(msg, params, reply) {
		const mention = params.shift(),
			reason = params.join(" ");

		return this.helpers.fetchMember(mention, msg.guild).then(mem => {
			if(!mem)reply.throw("Invalid guild member.");

			const roles = mem.roles.filterArray(role => role.name.toLowerCase().includes("mute"));
			if(!roles.length)reply.throw("Member is not muted!");

			reply.append(`Successfully unmuted ${ mem }${ reason ? ` due to **${ reason }**` : "" }.`);

			return mem.removeRoles(roles, reason)
		})
	}
}