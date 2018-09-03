const ytdl = require("ytdl-core");

module.exports = class MusicPlayer extends Array {
	constructor(self) {
		super();

		this.self = self;

		self.client.on("voiceStateUpdate", (oldMember, member) => {
			if(member.voiceChannel && this.joined)this.joined(member);
		})
	}
	add(item) {
		this.push(item);
		if(!item.stream)item.stream = this.ytdl(item);
		if(!this.nowPlaying)this.play();
		return this;
	}

	preload(items) {
		if(!(items instanceof Array))items = [ items ];
		for(let i = 0; i < items.length; i++) {
			items[i].stream = this.ytdl(items[i]);
		}
		return this;
	}

	ytdl(item) {
		return ytdl(`https://www.youtube.com/watch?v=${ item.id }`, item.live ? {} : { quality: "highestaudio", filter: "audioonly" });
	}

	async play(reason) {
		if(!this[0] || reason === "stop")return;
		if(!this.connection)throw new Error("Not connected to vc to play.");

		this.nowPlaying = this.shift();
		this.stream = this.nowPlaying.stream;
		const start = Date.now();
		this.dispatcher = this.connection.playStream(this.stream);

		this.dispatcher.once("speaking", () => {
			console.log(Date.now() - start);
		})

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
			if(this.nowPlaying)return this.connection.playStream(this.stream);
			this.cleanup(false);
			this.soundStream = null;
		});
		return this;
	}

	async connect(member, guild) {
		if(this.connection)return;
		if(member.user) {
			this.member = member;
			this.vc = member.voiceChannel;
		} else this.vc = member;

		if(!this.vc) {
			const join = new Promise(resolve => {
				this.joined = member => {
					if(member.id === this.member.id)resolve(member.voiceChannel);
				};
			});
			const msg = this.reply.append("Please join a voice channel so that I can play music!");
			this.vc = await join;
			(await msg).delete();
			this.reply = this.reply.next;
		}
		this.connection = await this.vc.join();
		return this;
	}

	notify(reply) {
		this.reply = reply.new;
		return this;
	}

	async cleanup(queue = true) {
		if(this.vc)await this.vc.leave();
		if(this.stream)this.stream.destroy();
		if(queue)this.length = 0;
		this.nowPlaying = this.dispatcher = this.reply = this.connection = this.stream = null;
		return this;
	}
}