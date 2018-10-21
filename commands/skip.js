const Command = require("../util/Command");

module.exports = class Skip extends Command {
	constructor(self) {
		super({
			name: "skip",
			desc: "Skips the song currently playing.",
			detailedDesc: "Skips the song currently playing. Specify queue position to remove that song from queue.",
			usage: "[song position]",
			requiresGuild: true,
			messageSplit: true,
			utils: [],
			self
		});
	}

	async run(msg, params, reply) {
		const index = params.shift(),
			player = msg.guild.player;
		if(index) {
			if(isNaN(index) || index < 0)reply.throw("Please specify a valid number.");
			if(index > player.length)reply.throw("Song number out of range.");

			reply.append(`Removed **${ player[index - 1].title }** from queue.`);
			return player.splice(index - 1, 1);
		}
		reply.append(`Skipped **${ player.nowPlaying.title }**.`);
		player.dispatcher.end("skip");
	}
}	