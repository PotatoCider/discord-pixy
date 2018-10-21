const Command = require("../util/Command");

module.exports = class Pause extends Command {
	constructor(self) {
		super({
			name: "pause",
			desc: "Pauses the music player.",
			usage: "",
			requiresGuild: true,
			messageSplit: true,
			aliases: [],
			utils: [],
			self
		});
	}

	async run(msg, params, reply) {
		const player = msg.guild.player;
		if(!player.nowPlaying)reply.throw("Music is not playing.");

		if(player.dispatcher.paused) {
			player.dispatcher.resume();
			reply.append("Resumed music player.")
		} else {
			player.dispatcher.pause();
			reply.append("Paused music player.");
		}
	}
}	