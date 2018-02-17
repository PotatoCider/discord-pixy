const Command = require("../util/Command");

module.exports = class extends Command {
	constructor(self) {
		 super({
		 	name: "unban",
		 	desc: "Unbans a user from a guild.",
		 	usage: "<name>[#1234] [reason]",
		 	admin: true,
		 	messageSplit: true,
		 	self
		 });
	}

	run(msg, params) {
		const tag = params.shift(),
			[ name, discriminator ] = tag.split("#"),
			reason = params.join(" ");
		return msg.guild.fetchBans().then(banned => {
			const toUnban = discriminator ? 
				banned.find(user => user.username === name && user.discriminator === discriminator) :
				banned.findAll("username", name);
			if(!toUnban || (toUnban instanceof Array && !toUnban.length))throw "User specified is not banned or invalid.";
			if(!(toUnban instanceof Array) || toUnban.length === 1)return msg.guild.unban(toUnban[0] || toUnban, reason);
			
			if(toUnban.length > 10)throw `There are more than 10 users banned with that same name. Please specify a tag number (${ name }#1234) in your following command.`
			const tags = {};
			let content = 'Type in the discord tag you want to ban. Type "cancel" to cancel.\n\n';
			for(let i = 0; i < toUnban.length; i++){
				const user = toUnban[i], 
					{ username, discriminator } = user;
				tags[discriminator] = tags[username + "#" + discriminator] = user;
				content += `${ i+1 }: **${ user.username }#${ user.discriminator }**\n`;
			}
			let clean = false, m;
			msg.channel.send(content).then(msg => {
				if(clean)return msg.delete();
				m = msg;
			});

			return this.helpers.awaitMessage(msg, m => tags[m.content] || m.content === "cancel", 15000)
			.then(msg => {
				if(!msg){
					if(m)m.delete();
					clean = true;
					throw "Selection timed out.";
				}
				if(m)m.delete();
				if(msg.content === "cancel")throw "";
				const received = msg.content.split("#").pop();
				if(~~received < 1 || ~~received > 9999)throw new RangeError("Out of range: user discriminator: " + msg.content);

				msg.delete();
				return msg.guild.unban(tags[received], reason);
			});
		}).then(user => `Successfully unbanned **${ user.tag }**${ reason ? ` due to **${ reason }**` : "" }.`)
	}
}