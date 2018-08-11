const Discord = require("discord.js");
module.exports = class Message {
	constructor(channel, content, del, list, options, delimiter) {
		if(!channel)throw new Error("Missing channel");
		this.channel = channel;
		this.content = content || "";
		this.delimiter = delimiter || "\n\n";
		this.del = del;
		this.options = options || { split: true };
		this.error = this.sent = false;
		this.done = new Promise(resolve => this.resolve = resolve);
		if(list)this.setList();
	}

	append(texts, delimiter = true, list = true, embed = true) {
		if(!(texts instanceof Array))texts = [texts];
		let toAppend = "";

		if((this.content || (this.embed && this.embed.description)) && delimiter && !this.disablePrefix)
			toAppend += this.delimiter;

		if(this.list && list)toAppend += this.list.next();
		toAppend += texts.join(this.delimiter);

		if(this.embed && embed) {
			this.embed.setDescription(this.embed.description + toAppend);
		} else {
			this.disablePrefix = false;
			this.content += toAppend;
		}
		return this;
	}

	prefix(delimiter) {
		this.delimiter = delimiter || "";
		return this;
	}

	disableNext() {
		this.disablePrefix = true;
		return this;
	}

	replace(text) {
		this.content = text;
		return this;
	}

	setList(bold = true, remove) {
		this.list = remove ? null : 
		{ line: 0, bold, 
			next() {
				const n = ++this.line + ": ";
				return bold ? `**${ n }**` : n;
			} 
		};
		return this;
	}

	async send(channel) {
		this.channel = channel || this.channel;
		if(!this.channel)throw new Error("No channel specified.");
		this.sent = true;
		const msg = await this.channel.send(this.content, this.options);

		if(!isNaN(this.del))msg.delete(this.del);
		this.next = new Message(this.channel);
		this.next.prev = msg.from = this;
		return this.sent = msg;
	}

	async await(filter, time, del = true, inMs = false) {
		if(!time)throw new Error("Argument Error: time");
		if(!this.sent)this.send();
		if(!inMs)time *= 1000;
		if(typeof filter === "string")filter = m => m.content === filter;
		const msg = await this.channel.createMessageCollector(filter, { time }).next.catch(err => {
			if(err instanceof Map)return null;
			throw err;
		});
		if(del || typeof del === "number")Promise.resolve(this.sent).then(sent => sent.delete(typeof del === "number" ? del : 0));
		return msg;
	}

	delete(t, inMs) {
		this.del = inMs ? t : t * 1000;
		return this;
	}

	throw(err) {
		this.append("**Error**: " + err);
		this.error = true;
		throw this;
	}

	opts(opts) {
		Object.assign(this.options, opts);
		return this;
	}

	setEmbed({ file, author, color = "RANDOM", description, footer, image, thumbnail, timestamp = true, title, url } = {}, delimiter = "\n") {
		if(author instanceof Discord.GuildMember) {
			const user = { name: author.displayName, icon: author.user.displayAvatarURL };
			author = user;
		}
		if(author instanceof Discord.User) {
			const user = { name: author.username, icon: author.displayAvatarURL };
			author = user;
		}
		if(typeof footer === "string")footer = { text: footer };
		this.embed = new Discord.RichEmbed()
		.attachFile(file)
		.setAuthor(author.name, author.icon, author.url)
		.setColor(color)
		.setDescription(description || "")
		.setFooter(footer.text || "", footer.icon)
		.setImage(image)
		.setThumbnail(thumbnail)
		.setTimestamp(timestamp === true ? undefined : timestamp)
		.setTitle(title || "")
		.setURL(url);

		this.opts({ embed: this.embed });
		this.prefix(delimiter);
		
		return this;
	}

	addField(name, value, inline) {
		if(!this.embed)throw new Error("No embed when addField is called");
		this.embed.addField(name, value, inline);

		return this;
	}
}