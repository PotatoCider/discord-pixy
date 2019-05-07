const Command = require("../util/Command"),
	fs = require('fs'),
	{ PassThrough } = require('stream');

module.exports = class YoutubeDownload extends Command {
	constructor(self) {
		super({
			name: "youtubedownload",
			desc: "Downloads audio/videos from youtube.",
			usage: "[mp4] <query/url>",
			requiresGuild: true,
			messageSplit: true,
			aliases: ['ytdl', 'youtubedl', 'ytdownload'],
			utils: { ytdl: 'ytdl-core' },
			self
		});
		this.useFs = false;
	}

	async run(msg, query, reply) {
		let container = query[0].toLowerCase();
		if(container === 'mp3' || container === 'mp4'){
			query.shift();
		} else container = 'mp3';
		const selected = await this.self.commands.play.getVideoFromQuery(msg, query.join(' '), reply),
			start = Date.now();

		const info = await this.utils.ytdl.getInfo(selected.url),
			format = this.utils.ytdl.chooseFormat(info.formats, { filter: container === 'mp3' ? 'audioonly' : 'audioandvideo' });

		if(!format.clen)format.clen = +format.url.match(/&clen=(\d+)&/)[1];

		if(format.clen > 8388608)return reply.throw('Filesize too big!');

		let completed = 0, completedSegments = 0;
		const filenames = [],
			totalSegments = ~~(format.clen / 524288);

		for(let i = 0; i <= totalSegments; i++) {
			const filename = `downloads/${ selected.id }#${ i }`;
			filenames.push(filename);
			const file = fs.createWriteStream(filename);
			this.utils.ytdl(selected.url, { format, range: { start: i*524288, end: i === totalSegments ? format.clen : (i+1)*524288-1 } })
			.on('progress', (length, progress, total) => completed += length)
			.once('end', () => {
				completedSegments++;
				if(completedSegments === totalSegments + 1)done();
			})
			.pipe(file);
		}

		const done = () => {
			const stream = new PassThrough();
			const pipe = i => {
				fs.createReadStream(filenames[i])
				.once('end', () => {
					if(filenames.length !== i+1)return pipe(i+1);
					stream.end();
				})
				.pipe(stream, { end: false });
			}
			pipe(0);

			reply.new
			.append(`Time elapsed: ${ ((Date.now() - start) / 1000).toFixed(2) }s.`)
			.attach(stream, `${ selected.title }.${ container }`)
			.send().then(() => {
				filenames.forEach(filename => {
					fs.unlink(filename, err => { if(err)throw err; });
				});
			});
		}
		
		
	}
}	