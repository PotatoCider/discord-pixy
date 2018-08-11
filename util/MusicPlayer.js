const ytdl = require("ytdl-core");

module.exports = class MusicPlayer extends Array {
	add(item) {
		this.push(item);
		if(!this.nowPlaying)return this.play();
	}

	async play(reason, seek) {
		if(!this[0] || reason === "stop")return;
		if(!this.connection)throw new Error("Not connected to vc to play.");

		this.nowPlaying = this.shift();
		this.stream = ytdl(`https://www.youtube.com/watch?v=${ this.nowPlaying.id }`, { filter: "audioonly" });
		this.dispatcher = this.connection.playStream(this.stream, { seek });

		const { title, duration, channelTitle } = this.nowPlaying;
		this.reply.append(`:notes: | Now playing **${ title } (${ duration })** by *${ channelTitle }*.`).delete(10).send();
		this.reply = this.reply.next;

		this.dispatcher.once("end", reason => {
			if(reason === "sound")return;
			if(this[0] && reason !== "stop")return this.play();
			this.length = 0;
			this.nowPlaying = this.dispatcher = this.reply = this.connection = this.stream = null;
			this.vc.leave();
		});
	}

	playSound(url) {
		this.stream = ytdl(url, { filter: "audioonly" });
		this.dispatcher = this.connection.playStream(this.stream);
		this.dispatcher.once("end", () => {
			this.stream = this.dispatcher = this.connection = null;
			this.vc.leave();
		});
	}

	async connect(member, guild) {
		if(this.connection)return;
		this.vc = member.voiceChannel || member;
		return this.connection = await this.vc.join();
	}

	notify(reply) {
		this.reply = reply.sent ? reply.next : reply;
	}
}