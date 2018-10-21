const Command = require("../util/Command");

module.exports = class Stop extends Command {
	constructor(self) {
		super({
			name: "stop",
			desc: "Stops music/sounds from playing and leaves the vc.",
			usage: "",
			requiresGuild: true,
			messageSplit: true,
			aliases: ["reset", "leave"],
			utils: [],
			self
		});
	}

	async run(msg, params, reply) {
		const player = msg.guild.player,
			queue = player.length,
			playing = player.dispatcher || player.connection || player.nowPlaying || msg.guild.me.voiceChannel;
		if(!playing && !queue)reply.throw("Nothing is playing and queue is empty.");
		if(player.dispatcher)player.dispatcher.end("stop");

		await player.cleanup();
		let content = "";
		if(playing)content += "stopped playing music";
		if(playing && queue)content += " and ";
		if(queue)content += "emptied queue";

		reply.append(":notes: | " + content[0].toUpperCase() + content.slice(1) + ".");
	}
}	