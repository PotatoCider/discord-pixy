const Command = require("../util/Command"),
	request = require('request');

module.exports = class Say extends Command {
	constructor(self) {
		super({
			name: "say",
			desc: "Repeats what you said.",
			detailed: "Repeats what you said. Can be in a different channel.",
			usage: "[channel] <message>",
			messageSplit: true,
			admin: true,
			self
		});
	}

	async run(msg, params, reply) {
		const channelId = this.helpers.resolveMention(params[0], "channel");
		if(channelId){
			if(!msg.guild)reply.throw("This feature only works in Paragon Xenocide!");
			params.shift();
			reply.channel = msg.guild.channels.get(channelId);
		}
		const files = msg.attachments.count > 0 ? msg.attachments.map(attachment => ({ attachment: request(attachment.url), name: attachment.filename })) : [];

		reply.append(params.join(" ")).opts({ files }).send();
	}
}