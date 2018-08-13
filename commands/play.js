const Command = require("../util/Command");

module.exports = class Play extends Command {
	constructor(self) {
		super({
			name: "play",
			desc: "Plays music from YouTube.",
			usage: "<url>",
			requiresGuild: true,
			aliases: ["p"],
			utils: { ytdl: "ytdl-core", youtube: 1 },
			self
		});
	}

	async run(msg, query, reply) { // Fix queue and nowplaying notifier issue.
		const vc = msg.member.voiceChannel;
		if(!vc)reply.throw("Please join a voice channel!");
		if(!query)reply.throw("Please specify a video name!");
		
		const player = this.self.guilds[msg.guild.id].player;

		let selected;
		if(!this.utils.ytdl.validateURL(query)) {
			const results = await this.utils.youtube.searchInfo(query, { maxResults: 5 });

			for(let i = 0; i < results.length; i++) {
				results[i].duration = this.helpers.resolveDuration({ iso: results[i].duration, yt: true });
			}
			selected = await this.selection(results, msg, reply);
			reply = reply.next;
			if(selected === "cancel")return reply.append("Selection cancelled.").delete(5);
		} else [ selected ] = await this.utils.youtube.fetchVideoInfo(this.utils.ytdl.getURLVideoID(query));

		await player.connect(msg.member, msg.guild);
		player.notify(reply);
		player.add(selected);
		reply.append(`:arrow_right: | Added **${ selected.title }** (${ selected.duration }) to queue.`);
	}

	async selection(items, msg, reply) {
		reply.setEmbed({
			title: `Reply with a song number "1-${ items.length }". Reply "cancel" to cancel selection.`,
			author: msg.member,
			thumbnail: this.Constants.images.music,
			footer: "Selection timeout in 30 seconds."
		}).setList();

		for(let i = 0; i < items.length; i++) {
			const { title, id, duration } = items[i];
			reply.append(`[**${ title }**](https://www.youtube.com/watch?v=${ id }) **(${ duration })**`);
		}
		const m = await reply.await(m => m.content >= 1 && m.content <= items.length || m.content === "cancel", 30);
		if(!m)reply.next.delete(10).throw("Selection timed out.");
		return m.content === "cancel" ? "cancel" : items[m.content - 1];
	}
}	