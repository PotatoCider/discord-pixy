const ytdl = require("ytdl-core");

module.exports = class MusicPlayer extends Array {
	add(item) {
		this.push(item);
		if(!this.nowPlaying)return this.play();
	}

	async play(reason) {
		if(!this[0] || reason === "stop")return;
		if(!this.connection)throw new Error("Not connected to vc to play.");

		this.nowPlaying = this.shift();
		this.stream = ytdl(`https://www.youtube.com/watch?v=${ this.nowPlaying.id }`, { filter: "audioonly" });
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
	}

	playSound(url) {
		this.stream = ytdl(url, { filter: "audioonly" });
		this.dispatcher = this.connection.playStream(this.stream);
		this.dispatcher.once("end", () => this.cleanup(false));
	}

	async connect(member, guild) {
		if(this.connection)return;
		this.vc = member.voiceChannel || member;
		return this.connection = await this.vc.join();
	}

	notify(reply) {
		this.reply = reply.sent ? reply.next : reply;
	}

	async cleanup(total = true) {
		this.nowPlaying = this.dispatcher = this.reply = this.connection = this.stream = null;
		if(total)this.length = 0;
		if(this.vc)await this.vc.leave();
	}
}