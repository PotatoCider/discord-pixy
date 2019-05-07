const Command = require("../util/Command");

module.exports = class YoutubeDownload extends Command {
	constructor(self) {
		super({
			name: "youtubedownload",
			desc: "Downloads a video/song from youtube.",
			usage: "<mp3/mp4> <query/url>",
			requiresGuild: true,
			messageSplit: true,
			aliases: ['ytdl', 'youtubedl', 'ytdownload'],
			utils: { ytdl: 'ytdl-core', fs: 'fs' },
			self
		});
		this.useFs = false;
	}

	async run(msg, query, reply) {
		const container = query.shift().toLowerCase();
		if(container === 'usefs')return reply.append(`useFs: ${ this.useFs = !this.useFs }`);
		if(container !== 'mp3' && container !== 'mp4')return reply.invalidUsage(this);

		const selected = await this.self.commands.play.getVideoFromQuery(msg, query.join(' '), reply),
			stream = this.utils.ytdl(selected.url, { filter: container === 'mp3' ? 'audioonly' : 'audioandvideo' }),
			start = Date.now(),
			filename = 'downloads/download' + start;
		let percentage;
		stream
		.on('progress', (length, done, total) => {
			if(done !== total) {
				percentage = (done / total * 100).toFixed(2);
				return;
			}
			sent.delete();
			msg.client.clearInterval(timer);
			if(this.useFs) {
				reply.new.attach(this.utils.fs.createReadStream(filename), `download.${ container }`).send()
				.then(msg => {
					msg.edit(`Time elapsed: ${ ((Date.now() - start) / 1000).toFixed(2) }s.`);
					this.utils.fs.unlink(filename, err => { if(err)throw err; });
				});
			}
		});
		if(this.useFs) {
			stream.pipe(this.utils.fs.createWriteStream(filename));
		} else {
			reply.new.attach(stream, `download.${ container }`).send()
			.then(msg => {
				msg.edit(`Time elapsed: ${ ((Date.now() - start) / 1000).toFixed(2) }s.`);
			});
		}

		const sent = await reply.next.append('Downloading... Progress: 0%').send(),
			timer = msg.client.setInterval(() => sent.edit(`Downloading... Progress: ${ percentage }%`), 3000);
	}
}	