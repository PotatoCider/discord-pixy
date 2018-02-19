const Command = require("../util/Command");

module.exports = class extends Command {
	constructor(self) {
		super({
			name: "mute",
			desc: "Prevents someone from sending anymore messages.",
			usage: "<@member> [reason]",
			admin: true,
			messageSplit: true,
			self
		});
	}

	run(msg, params) {
		const mention = params.shift(),
			reason = params.join(" ");

		return Promise.all([
			this.getMutedRole(msg.guild),
			this.helpers.fetchMember(mention, msg.guild)
		]).then(([ role, mem ]) => {
			if(!mem)return "Invalid guild member.";

			return mem.addRole(role, reason).then(() => 
				(role.new ? "Created new role 'Muted'.\n\n" : "") + 
				"Successfully muted " + mem + (reason ? `due to **${ reason }**.` : ".")
			);
		});
	}

	getMutedRole(guild) {
		const role = guild.roles.find("name", "Muted"),
			isSet = role && guild.channels.every(channel => 
				channel.type !== "text" || 
				channel.permissionOverwrites.some(perm => perm.type === "role" && perm.id === role.id)
			);
		if(isSet)return role;
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