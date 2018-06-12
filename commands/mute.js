const Command = require("../util/Command");

module.exports = class extends Command {
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

	run(msg, params, reply) {
		const mention = params.shift(),
			reason = params.join(" ");
		return Promise.all([
			this.getMutedRole(msg.guild),
			this.helpers.fetchMember(mention, msg.guild)
		]).then(([ role, mem ]) => {
			if(!mem)reply.throw("Invalid guild member.");

			if(mem.roles.find("name", "Muted") && this.channelHasRole(msg.channel, role))
				reply.throw("That member is already muted.");

			return mem.addRole(role, reason).then(() => {
				if(role.new)reply.append("Created new role 'Muted'.");
				reply.append(`Successfully muted ${ mem }${ reason ? ` due to **${ reason }**`: "" }.`);
			});
		});
	}

	channelHasRole(channel, role) {
		return channel.permissionOverwrites.some(perm => perm.type === "role" && perm.id === role.id);
	}

	getMutedRole(guild) {
		const role = guild.roles.find("name", "Muted"),
			isSet = role && guild.channels.every(channel => 
				channel.type !== "text" || 
				this.channelHasRole(channel, role)
			);
		if(isSet)return role;
		if(role)role.delete();
		return guild.createRole({
			name: "Muted",
			color: "DARK_GREY",
			hoist: false,
			mentionable: true,
			permissions: ["VIEW_CHANNEL"]
		}, `enable ${ this.self.prefix }mute`).then(role => {
			const channels = guild.channels.values(),
				loading = [];
			for(const channel of channels) {
				if(channel.type === "text")
					loading.push(channel.overwritePermissions(role, { SEND_MESSAGES: false }, `enable ${ this.self.prefix }mute`));
			}
			role.new = true;
			return Promise.all(loading).then(() => role);
		});
	}
}