const Command = require("../util/Command");

module.exports = class Unmute extends Command {
	constructor(self) {
		super({
			name: "unmute",
			desc: `Reverses the effect of ${ self.prefix }mute.`,
			usage: "<@member/all> [reason]",
			admin: true,
			requiresGuild: true,
			messageSplit: true,
			self
		});
	}

	async run(msg, params, reply) {
		const mention = params.shift(),
			all = mention === "all",
			reason = params.join(" ");
		let muted = all ? [] : [ await this.helpers.fetchMember(mention, msg.guild) ];

		// Built-in check for no one muted.
		if(all)muted = await this.self.commands.whois.muted(msg.guild, reply, true);

		if(muted.length === 0)reply.throw("Invalid guild member.");

		const pending = [];
		for(let i = 0; i < muted.length; i++) {
			const roles = muted[i].roles.filterArray(role => role.name.toLowerCase().includes("mute"));
			if(!all && roles.length === 0)reply.throw("Member is not muted!");

			pending[i] = muted[i].removeRoles(roles, reason);
		}
		await Promise.all(pending);

		reply.append(`Successfully unmuted ${ all ? "everyone" : muted[0] }${ reason ? ` due to **${ reason }**` : "" }.`);
	}
}