const Command = require("../util/Command")

module.exports = class Ban extends Command {
	constructor(self) {
		super({
			name: "ban",
			desc: "Bans a guild member from a guild.",
			detailed: "Bans a guild member from a guild. Reason can be included (Audit Logs).",
			usage: "<@member> [reason]",
			admin: true,
			messageSplit: true,
			self
		});
	}

	async run(msg, params, reply) {
		const mention = params.shift(),
			reason = params.join(" "),
			user = await this.helpers.fetchUser(mention, msg.guild)
		if(!user)reply.throw("Invalid discord user.");
		const [p1, banInfo] = await Promise.all([ 
			msg.guild.ban(user, { reason }),
			msg.guild.fetchBan(user).catch(err => {
				if(err.message === 'Unknown Ban')return null;
				throw err;
			})
		]);
		if(banInfo)return reply.append(`User ${ user.tag } (ID: ${ user.id }) is already banned${ banInfo.reason ? ` due to **${ banInfo.reason }**` : " with no reason given" }.`);
		reply.channel = this.self.production ? msg.guild.channels.get("416248602227376128") : msg.guild.channels.find(ch => ch.name === "testing");
		reply.append(`Successfully banned user ${ user.tag } (ID: ${ user.id }) ${ reason ? ` due to **${ reason }**` : "" }.`);
		msg.react('✅');
	}
}