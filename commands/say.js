const Command = require("../util/Command");

module.exports = class extends Command {
	constructor(self) {
		super({
			name: "say",
			desc: "Repeats what you said in a different channel.",
			usage: "[channel] <message>",
			messageSplit: true,
			admin: true,
			self
		});
	}

	run(msg, params) {
		const channelId = this.helpers.resolveMention(params[0], "channel");
		if(channelId){
			if(!msg.guild)throw "This feature only works in Paragon Xenocide!";
			params.shift();
		}

		(channelId ? msg.guild.channels.get(channelId) : msg.channel).send(params.join(" "));
	}
}