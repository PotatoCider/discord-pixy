const ytdl = require("ytdl-core");

module.exports = class MusicPlayer extends Array {
	add(item) {
		this.push(item);
		if(!this.nowPlaying)this.play();
		return this;
	}

	async play(reason) {
		if(!this[0] || reason === "stop")return;
		if(!this.connection)throw new Error("Not connected to vc to play.");

		this.nowPlaying = this.shift();
		this.stream = ytdl(`https://www.youtube.com/watch?v=${ this.nowPlaying.id }`, this.nowPlaying.live ? {} : { quality: "highestaudio", filter: "audioonly" });
		this.dispatcher = this.connection.playStream(this.stream);

		const { title, duration, channelTitle } = this.nowPlaying;

		this.dispatcher.once("end", reason => {
			if(reason === "sound")return;
			if(this.repeat)this.push(this.nowPlaying);
			if(this[0] && reason !== "stop")return this.play();
			this.cleanup();
		});
		
		await this.reply.append(`:notes: | Now playing **${ title } (${ duration })** by *${ channelTitle }*.`).delete(10).send();
		this.reply = this.reply.next;
		return this;
	}

	playSound(url) {
		if(this.nowPlaying)this.dispatcher.end("sound");
		this.soundStream = ytdl(url, { filter: "audioonly" });
		this.dispatcher = this.connection.playStream(this.soundStream);
		this.dispatcher.once("end", () => {
			if(!this.nowPlaying)return this.cleanup(false);
			this.connection.playStream(this.stream);
		});
		return this;
	}

	async connect(member, guild) {
		if(this.connection)return;
		this.vc = member.voiceChannel || member;
		this.connection = await this.vc.join();
		return this;
	}

	notify(reply) {
		this.reply = reply.sent ? reply.next : reply;
		return this;
	}

	async cleanup(queue = true) {
		this.nowPlaying = this.dispatcher = this.reply = this.connection = this.stream = null;
		if(queue)this.length = 0;
		if(this.vc)await this.vc.leave();
		return this;
	}
}