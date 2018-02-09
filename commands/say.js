const Command = require("../util/Command");

module.exports = class extends Command {
	constructor(self) {
		super({
			name: "say",
			desc: "Repeats what you said in a different channel.",
			messageSplit: true,
			self
		});
	}

	run(msg, params) {
		params = params.split(" ");
		const match = params[0].match(/<#([0-9]+)>/),
			channelId = match ? match[1] : null,
			channel = channelId ? msg.guild.channels.get(channelId) : msg.channel;
		if(channelId)params.shift();
		channel.send(params.join(" "));
	}
}