const Command = require("../util/Command")

module.exports = class Ban extends Command {
	constructor(self) {
		super({
			name: "ban",
			desc: "Bans a user from a guild.",
			detailed: "Bans a user from a guild. Reason can be included (in Audit Logs).",
			usage: "<user> [reason]",
			admin: true,
			messageSplit: true,
			self
		});
	}

	async run(msg, params, reply) {
		const mention = params.shift(),
			mentionType = this.helpers.identifyMention(mention);

		if(mentionType === 'role') {
			const count = params.shift(),
				reason = params.join(' '),
				roleId = this.helpers.resolveMention(mention, 'role');
			if(isNaN(count))return reply.throw('Invalid count.');
			await msg.guild.fetchMembers();
			const role = msg.guild.roles.get(roleId),
				toBan = role.members.random(+count);
			if(count > toBan.length)msg.channel.send(`Only ${ toBan.length } has the **${ role.name }** role. Banning ${ toBan.length } members instead.`);
			for(let i = 0; i < toBan.length; i++) {
				console.log(`Banning ${ toBan[i].user.tag }`)
				// await msg.guild.ban(toBan[i], { reason });
			}
			reply.append(`Successfully banned ${ toBan.length } members with the role **${ role.name }**${ reason ? ` because of **${ reason }**` : '' }.`)
		} else {
			const reason = params.join(" "),
				user = await this.helpers.fetchUser(mention);

			if(!user)return reply.throw("Invalid discord user.");

			const banInfo = await msg.guild.fetchBan(user).catch(err => {
				if(err.message === 'Unknown Ban')return null;
				throw err;
			})
			if(banInfo)return reply.append(`User ${ user.tag } (ID: ${ user.id }) is already banned${ banInfo.reason ? ` due to **${ banInfo.reason }**` : " with no reason given" }.`);

			await msg.guild.ban(user, { reason });
			reply.channel = this.self.production ? msg.guild.channels.get("416248602227376128") : msg.guild.channels.find(ch => ch.name === "testing");
			reply.append(`Successfully banned user **${ user.tag }** (ID: ${ user.id })${ reason ? ` due to **${ reason }**` : "" }.`);
			msg.react('✅');
		}
	}
}