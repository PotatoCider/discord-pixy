const Command = require("../util/Command");

module.exports = class Mute extends Command {
	constructor(self) {
		super({
			name: "mute",
			desc: "Prevents someone from sending anymore messages.",
			detailed: "Prevents someone from sending anymore messages.\nIf you want to mute someone for 4 hours and 20 minutes, then type '~mute @spammer 4h20m' (4h20m must be **one word**)\nReason can be included (Audit Logs).",
			usage: "<@member> <1d/2h/3m/4s/forever> [reason]",
			admin: true,
			requiresGuild: true,
			messageSplit: true,
			utils: { schedule: "node-schedule" },
			self
		});

		this.guilds = this.db.collection("guilds");
		this.init = this.resetSchedule();
	}

	async resetSchedule() {
		const entries = await this.guilds.getAll({}, { memberHistory: 1, id: 1 });
		await this.self.handlers.guildMemberAdd.init;
		await this.self.logined;
		entries.forEach(entry => {
			const guild = this.self.client.guilds.get(entry.id),
				doc = {},
				loading = Object.keys(entry.memberHistory).map(async (id) => {
					const unmuteTimestamp = entry.memberHistory[id].muted;
					if(!unmuteTimestamp || unmuteTimestamp === "forever")return;
					if(Date.now() >= unmuteTimestamp - 1000)return this.setSchedule(guild, id, unmuteTimestamp, false);

					doc[`memberHistory.${ id }.muted`] = "";
					const member = await this.helpers.fetchMember(id, guild),
						muted = guild.roles.find(role => role.name === "Muted");
					if(!member || !member.roles.has(role))return;
					await member.removeRole(role, "mute expired");
				});
			if(Object.keys(doc).length > 0)loading.concat(this.guilds.update({ id: guild.id }, doc, "unset"));
		});
	}

	async run(msg, params, reply) {
		const mention = params.shift(),
			duration = this.getDuration(params.shift()),
			reason = params.join(" "),
			[role, member] = await Promise.all([
				this.getMutedRole(msg.guild, reply),
				this.helpers.fetchMember(mention, msg.guild)
			]);

		if(!member)reply.throw("Invalid guild member.");
		if(duration === null)reply.invalidUsage(this);
		if(duration <= 4000)reply.throw("Please set a mute period more than 4s.");
		if(member.roles.some(role => role.name === "Muted"))reply.throw("That member is already muted.");

		await Promise.all([
			this.setSchedule(msg.guild, member, msg.createdTimestamp + duration),
			member.addRole(role, reason)
		]);
		const totalTime = duration !== "forever" && this.helpers.resolveDuration({ ms: duration, format: { s: 1, m: 1, h: 1, d: 1 } });

		reply.append(`Successfully muted ${ member } for**${ totalTime ? " " + totalTime : "ever" }**${ reason ? ` due to **${ reason }**`: "" }.`);
	}

	getDuration(time) {
		if(!time)return null;
		if(time === "forever")return "forever";
		const [ _, d, h, m, s ] = time.match(/(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);

		return this.helpers.resolveDuration({ d, h, m, s, getMs: 1 });
	}

	async setSchedule(guild, mem, unmuteTimestamp, update = true) {
		const memId = mem.id || mem;
		if(unmuteTimestamp !== "forever") {
			guild.s.muteJobs[memId] = this.utils.schedule.scheduleJob(new Date(unmuteTimestamp), async () => {
				const member = await this.helpers.fetchMember(memId, guild);
				if(!member)return;
				const muted = guild.roles.find(role => role.name === "Muted");
				member.removeRole(muted, "mute expired");
				this.guilds.update({ id: guild.id }, { [`memberHistory.${ memId }.muted`]: "" }, "unset");
			});
		}
		if(update)await this.guilds.update({ id: guild.id }, { [`memberHistory.${ memId }.muted`]: unmuteTimestamp });
	}

	channelHasRole(channel, role) {
		return channel.permissionOverwrites.some(perm => perm.type === "role" && perm.id === role.id);
	}

	async getMutedRole(guild, reply) {
		const role = guild.roles.find(role => role.name === "Muted"),
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