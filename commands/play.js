const Command = require("../util/Command");

module.exports = class Play extends Command {
	constructor(self) {
		super({
			name: "play",
			desc: "Plays music from YouTube.",
			usage: "<query/url>",
			requiresGuild: true,
			aliases: ["p"],
			utils: { ytdl: "ytdl-core", youtube: 1 },
			self
		});
	}

	async run(msg, query, reply) { 
		if(!query)reply.throw("Please specify a video name!");
		const player = msg.guild.player,
			connected = player.notify(reply).connect(msg.member, msg.guild);

		const selected = await this.getVideoFromQuery(msg, query, reply);

		reply.append(`:arrow_right: | Added **${ selected.title }** (${ selected.duration }) to queue.`).send();
		if(!msg.member.voiceChannel)player.reply.send();
		await connected;
		player.add(selected);
	}

	async getVideoFromQuery(msg, query, reply) {
		let selected;
		reply = reply.new;
		if(!this.utils.ytdl.validateURL(query)) {
			reply.collect(m => m.content >= 1 && m.content <= 5 || m.content === "cancel", 35);

			const results = await this.utils.youtube.searchInfo(query, { maxResults: 5 });
			if(!results.length)return this.throwErr("No results found.", reply);

			for(let i = 0; i < results.length; i++) {
				//results[i].durationSeconds = results[i].live || this.helpers.resolveDuration({ iso: results[i].duration, getMs: true }) / 1000;
				results[i].duration = results[i].live ? "Live" : this.helpers.resolveDuration({ iso: results[i].duration, yt: true });
			}
			selected = await this.selection(results, msg, reply);
		//	reply = reply.next;
			
			if(selected === "cancel")return this.throwErr("Selection cancelled.", reply.next);
		} else {
			[ selected ] = await this.utils.youtube.fetchVideoInfo(this.utils.ytdl.getURLVideoID(query));
			selected.duration = this.helpers.resolveDuration({ iso: selected.duration, yt: true });
		}
		return selected;
	}

	throwErr(err, reply) {
		const player = reply.channel.guild.player
		if(!player.dispatcher)player.cleanup(false);
		return reply.throw(err).delete(5);
	}

	async selection(items, msg, reply) {
		reply.setEmbed({
			title: `Reply with a song number "1-${ items.length }". Reply "cancel" to cancel selection.`,
			author: msg.member,
			thumbnail: this.Constants.images.music,
			footer: "Selection timeout in 20 seconds."
		}).setList();

		for(let i = 0; i < items.length; i++) {
			const { title, url, duration } = items[i];
			reply.append(`[**${ title }**](${ url }) **(${ duration })**`);
		}
		const m = await reply.await();
		if(!m)reply.next.delete(20).throw("Selection timed out.");
		const item = items[m.content - 1] || {};
		item.index = m.content - 1;
		return m.content === "cancel" ? "cancel" : item;
	}
}	