const Command = require("../util/Command");

module.exports = class Queue extends Command {
	constructor(self) {
		super({
			name: "queue",
			desc: "Shows the current music queue.",
			usage: "[page]",
			requiresGuild: true,
			messageSplit: true,
			aliases: [],
			utils: [],
			self
		});
	}

	async run(msg, params, reply) { // Add url from videoId convienence to youtube.js
		const player = this.self.guilds[msg.guild.id].player;
		if(!player.nowPlaying && !player.length)reply.throw("Nothing is playing and queue is empty.");
		const { title, duration, id } = player.nowPlaying || {},
			currentTime = this.helpers.resolveDuration({ ms: player.dispatcher.time, yt: true });
		reply.setEmbed({ 
			description: id ? `**Now Playing:** [**${ title }**](https://www.youtube.com/watch?v=${ id }) **(${ currentTime } / ${ duration })**\n` : "",
			author: msg.member,
			thumbnail: this.Constants.images.music,
			footer: "This message will self destruct in 60 seconds to prevent clutter."
		}).setList();

		for(let i = 0; i < player.length; i++) {
			const { title, id, duration } = player[i];
			reply.append(`[**${ title }**](https://www.youtube.com/watch?v=${ id }) **(${ duration })**`);
		}
	}
}	