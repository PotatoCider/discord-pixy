const Command = require("../util/Command");

module.exports = class Mute extends Command {
	constructor(self) {
		super({
			name: "mute",
			desc: "Prevents someone from sending anymore messages.",
			usage: "<@member> [reason]",
			admin: true,
			requiresGuild: true,
			messageSplit: true,
			self
		});
	}

	async run(msg, params, reply) {
		const mention = params.shift(),
			reason = params.join(" "),
			[role, member] = await Promise.all([
				this.getMutedRole(msg.guild, reply),
				this.helpers.fetchMember(mention, msg.guild)
			]);
		if(!member)reply.throw("Invalid guild member.");

		if(member.roles.find("name", "Muted") && this.channelHasRole(msg.channel, role))
			reply.throw("That member is already muted.");

		await member.addRole(role, reason);

		reply.append(`Successfully muted ${ member }${ reason ? ` due to **${ reason }**`: "" }.`);
	}

	channelHasRole(channel, role) {
		return channel.permissionOverwrites.some(perm => perm.type === "role" && perm.id === role.id);
	}

	async getMutedRole(guild) {
		const role = guild.roles.find("name", "Muted"),
			isSet = role && guild.channels.every(channel => 
				channel.type !== "text" || 
				this.channelHasRole(channel, role)
			);
		if(isSet)return role;
		if(role)role.delete();
		const newRole = await guild.createRole({
			name: "Muted",
			color: "DARK_GREY",
			hoist: false,
			mentionable: true,
			permissions: ["VIEW_CHANNEL"]
		}, `enable ${ this.self.prefix }mute`)

		const channels = guild.channels.array(),
			pending = [];
		for(let i = 0; i < channels.length; i++) {
			if(channels[i].type === "text")
				pending.push(channels[i].overwritePermissions(newRole, { SEND_MESSAGES: false }, `enable ${ this.self.prefix }mute`));
		}
		await Promise.all(pending);
		
		reply.append("Created new role 'Muted'.");
		return newRole;
	}
}