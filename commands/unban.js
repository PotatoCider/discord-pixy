const Command = require("../util/Command");

module.exports = class extends Command {
	constructor(self) {
		 super({
		 	name: "unban",
		 	desc: "Unbans a user from a guild.",
		 	usage: "<name>[#1234] [reason]",
		 	admin: true,
		 	requiresGuild: true,
		 	messageSplit: true,
		 	self
		 });
	}

	run(msg, params, reply) {
		const tag = params.shift(),
			[ name, discriminator ] = tag.split("#"),
			reason = params.join(" ");
		return msg.guild.fetchBans().then(banned => {
			const toUnban = discriminator ? 
				banned.find(user => user.username === name && user.discriminator === discriminator) :
				banned.findAll("username", name);
			if(!toUnban || (toUnban instanceof Array && !toUnban.length))reply.throw("User specified is not banned or invalid.");
			if(!(toUnban instanceof Array) || toUnban.length === 1)return msg.guild.unban(toUnban[0] || toUnban, reason);
			
			if(toUnban.length > 10)reply.throw(`There are more than 10 users banned with that same name. Please specify a tag number (${ name }#1234) in your following command.`);

			const tags = {};
			reply.append('Type in the discord tag you want to ban. Type "cancel" to cancel.');

			for(let i = 0; i < toUnban.length; i++){
				const user = toUnban[i], 
					{ username, discriminator } = user;
				tags[discriminator] = tags[username + "#" + discriminator] = user;

				reply.append(`${ i+1 }: **${ user.username }#${ user.discriminator }**`);
			}

			return reply.await(m => tags[m.content] || m.content === "cancel", 15000, true).then(msg => {
				reply = reply.next;
				if(!msg)reply.throw("Selection timed out.");
				msg.delete();
				if(msg.content === "cancel"){
					reply.append("Selection cancelled.").delete(5);
					return;
				}

				const received = msg.content.split("#").pop();
				return msg.guild.unban(tags[received], reason);
			});
		}).then(user => {
			if(user)return reply.append(`Successfully unbanned **${ user.tag }**${ reason ? ` due to **${ reason }**` : "" }.`)
		})
	}
}