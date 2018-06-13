const Command = require("../util/Command");

module.exports = class Unban extends Command {
	constructor(self) {
		 super({
		 	name: "unban",
		 	desc: "Unbans a user from a guild.",
		 	usage: "<name>[#1234] [reason]",
		 	admin: true,
		 	requiresGuild: true,
		 	messageSplit: true,
		 	utils: ["hastebin"],
		 	self
		 });
	}

	async run(msg, params, reply) {
		const tag = params.shift(),
			[ name, discriminator ] = tag.split("#"),
			reason = params.join(" ");

		const banned = await msg.guild.fetchBans(),
			toUnban = discriminator ? 
			banned.find(user => user.username === name && user.discriminator === discriminator) :
			banned.findAll("username", name);

		if(!toUnban || !toUnban.length)reply.throw("User specified is not banned or invalid.");
		if(discriminator || toUnban.length === 1)return this.unban(msg.guild, toUnban[0] || toUnban, reason, reply);

		const tags = {};
		let hastebin = toUnban.length > 10 ? `List of banned user tags with username "${ name }":\n` : null;

		for(let i = 0; i < toUnban.length; i++){
			const user = toUnban[i];
			tags[user.discriminator] = tags[user.tag] = user;

			if(hastebin) {
				hastebin += `${ user.tag }\n`;
				continue;
			}
			reply.append(`${ i+1 }: **${ user.tag }**`);
		}
		if(hastebin)reply.append(`List of banned users with name "${ name }": ${ await this.utils.hastebin(hastebin, "txt") }.`);

		const m = await reply
		.append('Type in the discord tag you want to ban. Type "cancel" to cancel.')
		.await(m => tags[m.content] || m.content === "cancel", toUnban.length > 10 ? 60 : 20, true);

		reply = reply.next;
		if(!m)reply.throw("Selection timed out.");
		m.delete();
		if(m.content === "cancel"){
			reply.append("Selection cancelled.").delete(5);
			return;
		}

		const received = m.content.split("#").pop();
		await this.unban(m.guild, tags[received], reason, reply);
	}

	async unban(guild, user, reason, reply) {
		await guild.unban(user, reason);
		
		reply.append(`Successfully unbanned **${ user.tag }**${ reason ? ` due to **${ reason }**` : "" }.`);
	}
}