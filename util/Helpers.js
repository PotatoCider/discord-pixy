const Constants = require("./Constants"),
	Embed = require("./Embed"),
	months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let self;

module.exports = class Helpers {
	constructor(s) {
		self = s;
	}

	fetchUser(id) {
		id = this.resolveMention(id, "user") || id;
		if(!id || isNaN(id))return Promise.resolve(null);
		return self.client.fetchUser(id);
	}

	async fetchMember(id, guild) {
		const user = await this.fetchUser(id);
		if(user)return guild.fetchMember(user);
		return null;
	}

	resolveMention(mention, type) {
		const pattern = Constants.patterns[type];
		if(!pattern)throw new Error("Invalid pattern type.");
		const match = mention.match(pattern);
		return match && match[1];
	}

	awaitMessage(channel, filter, time = 15000) {
		channel = channel.channel || channel;
		const collector = channel.createMessageCollector(filter, { time });
		return collector.next.catch(err => {
			if(err instanceof Error)throw err;
			return null;
		});
	}

	isAdmin(user) {
		if(typeof user !== "string")user = user.id;
		return Constants.owners.includes(user);
	}

	getEmbed(details = {}) {
		if(details instanceof Embed.RichEmbed)return details;
		const { file, author = {}, fields = [], color = "RANDOM", description, footer = {}, image, thumbnail, timestamp, title, url } = details;

		return new Embed()
		.attachFile(file)
		.setAuthor(author)
		.setColor(color)
		.setDescription(description || "")
		.setFooter(footer)
		.setImage(image)
		.setThumbnail(thumbnail)
		.setTimestamp(timestamp)
		.setTitle(title || "")
		.setURL(url)
		.addFields(fields);
	}

	splitLength(text, maxLength = 1024, { char = "\n", prepend, append } = {}) {
		try {
			let content = Constants.Discord.Util.splitMessage(text, { maxLength, char, prepend, append });
			if(typeof content === "string") {
				content = [ prepend + content + append ];
			}
			return content;
		} catch(err) {
			if(err.message === "SPLIT_MAX_LEN")return false;
			throw err;
		}
	}

	addContLink(link, text, maxLen = 1024, { prepend = "", append = "" } = {}) {
		if(maxLen && text.length <= maxLen)return text;
		return prepend + text.slice(0, maxLen - 7 - prepend.length - append.length - link.length) + `(...)[${ link }]` + append;
	}

	resolveDuration({ ms = 0, s = 0, m = 0, h = 0, d = 0, iso, format, yt }) {
		if(iso){
			const time = iso.match(/P(?:(\d*)D)?T(?:(\d*)H)?(?:(\d*)M)?(?:(\d*)S)?/);
			if(!time)throw new Error("Invaild params.");
			d = ~~time[1] || 0;
			h = ~~time[2] || 0;
			m = ~~time[3] || 0;
			s = ~~time[4] || 0;
		}else{
			s += ~~(ms / 1000);
			ms %= 1000;
			m += ~~(s / 60);
			s %= 60;
			h += ~~(m / 60);
			m %= 60;
			d += ~~(h / 24);
			h %= 24;
		}
		if(yt){
			if(d)h += d * 24;
			if(s < 10)s = "0" + s;
			if(h && m < 10)m = "0" + m;
			return (h ? h + ":" : "") + m + ":" + s;
		}
		if(format){
			return (
				(format.d && d ? `${d}d ` : "") + 
				(format.h && h ? `${h}h ` : "") + 
				(format.m && m ? `${m}m ` : "") + 
				(format.s && s ? `${s}s ` : "") + 
				(format.ms && ms ? `${ms}ms `: "")
				).slice(0, -1)
		}
		return { ms, s, m, h, d };
	}

	resolveIsoDate(iso) {
		let [ _, y, mm, d, h, m ] = iso.match(/(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):\d\d\.\d{3}Z/),
			suffix = "am";

		h = ~~h;
		if(h >= 12)suffix = "pm";
		if(h > 12)h -= 12;

		d = ~~d;
		mm = months[mm - 1];

		return { m, h, d, mm, y };
	}
}