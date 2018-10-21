const Command = require("../util/Command");

module.exports = class Resume extends Command {
	constructor(self) {
		super({
			name: "resume",
			desc: "Resumes the music player.",
			usage: "",
			requiresGuild: true,
			messageSplit: true,
			aliases: ["continue"],
			utils: [],
			self
		});
	}

	async run(msg, params, reply) {
		const player = msg.guild.player;
		if(!player.nowPlaying)reply.throw("Music is not playing.");

		if(!player.dispatcher.paused)reply.throw("Music player is not paused!");

		player.dispatcher.resume();
		reply.append("Resumed music player.");
	}
}	