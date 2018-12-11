const Command = require("../util/Command");

module.exports = class Unmute extends Command {
	constructor(self) {
		super({
			name: "unmute",
			desc: `Reverses the effect of ${ self.prefix }mute.`,
			detailed: `Reverses the effect of ${ self.prefix }mute. Reason can be included (Audit Logs).`,
			usage: "<@member/all> [reason]",
			admin: true,
			requiresGuild: true,
			messageSplit: true,
			self
		});
		this.guilds = this.db.collection("guilds");
	}

	async run(msg, params, reply) {
		const mention = params.shift(),
			all = ["all", "everyone", "@everyone"].includes(mention),
			reason = params.join(" ");
		let members = all ? [] : [ await this.helpers.fetchMember(mention, msg.guild) ];

		// Built-in check for no one muted.
		if(all)members = await this.self.commands.whois.muted(msg.guild, reply, true);

		if(members.length === 0)reply.throw("Invalid guild member.");

		const pending = [],
			doc = {},
			muteJobs = msg.guild.s.muteJobs;
		for(let i = 0; i < members.length; i++) {
			const muted = members[i],
				roles = muted.roles.filter(role => role.name.toLowerCase().includes("mute"));
			if(!all && roles.size === 0)reply.throw("Member is not muted!");
			doc[`memberHistory.${ muted.id }.muted`] = "";
			pending[i] = muted.removeRoles(roles, reason);

			if(!muteJobs[muted.id])continue;
			muteJobs[muted.id].cancel();
			muteJobs[muted.id] = null;
		}
		await Promise.all(pending);
		await this.guilds.update({ id: msg.guild.id }, doc, "unset");

		reply.append(`Successfully unmuted ${ all ? "everyone" : members[0] }${ reason ? ` due to **${ reason }**` : "" }.`);
	}
}