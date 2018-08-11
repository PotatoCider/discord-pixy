const Command = require("../util/Command");

module.exports = class Role extends Command {
	constructor(self) {
		super({
			name: "role",
			desc: "Assigns a free role to yourself, admins can assign roles to other members.",
			detailed: "Assigns a free role to yourself, admins can assign roles to other members. Reason can be included (Audit Logs).",
			usage: "[@member] <@?role1> | [reason]",
			requiresGuild: true,
			messageSplit: true,
			admin: true, // For now.
			self
		});
	}

	async run(msg, params, reply) {
		let member = await this.helpers.fetchMember(params[0], msg.guild);
		if(this.helpers.isAdmin(msg.author)) {
			if(member)params.shift();
			member = member || msg.member;
			params = params.join(" ");

			const role = msg.guild.roles.get(this.helpers.resolveMention(params, "role")) || msg.guild.roles.find(role => role.name.toLowerCase() === params.toLowerCase());
			let reason = params.split(" | ").pop();
			if(!role)reply.throw("Invalid role.");
			if(reason === params)reason = null;
			const remove = member.roles.has(role.id);
			
			await member[remove ? "removeRole" : "addRole"](role, reason);
			
			reply.append(`Successfully ${ remove ? "removed" : "added" } the role **${ role.name }** to ${ member ? `**${ member.user.tag }**` : "yourself" }.`);
		} else {

		}
	}
}	