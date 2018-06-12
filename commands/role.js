const Command = require("../util/Command");

module.exports = class extends Command {
	constructor(self) {
		super({
			name: "role",
			desc: "Assigns a free role to yourself, admins can assign roles to other members.",
			usage: "[@member] <@?role1[, @?role2, ..., @?roleN]> | [reason]",
			requiresGuild: true,
			messageSplit: true,
			admin: true, // For now.
			self
		});
	}

	async run(msg, params, reply) {
		const member = await this.helpers.fetchMember(params[0], msg.guild);
		if(this.helpers.isAdmin(msg.author)) {
			if(member)params.shift();

			const mention = params.shift(),
				role = msg.guild.roles.get(this.helpers.resolveMention(mention, "role")) || msg.guild.roles.find(role => role.name.toLowerCase() === mention.toLowerCase()),
				reason = params.join(" ");

			await (member || msg.member).addRole(role, reason);
			reply.append(`Successfully added the role **${ role.name }** to ${ member ? `**${ member.user.tag }**` : "yourself" }.`);
		} else {

		}
	}
}	