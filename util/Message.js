const Discord = require('discord.js');
// commonly known as 'reply'
module.exports = class Message {
	constructor(channel, { content, del, list, options, delimiter, embed } = {}) {
		if(!channel)throw new Error("Missing channel");
		this.channel = channel;
		this.content = content || "";
		this.delimiter = delimiter || "\n\n";
		this.del = del;
		this.options = options || { split: true };
		this.error = this.sent = false;
		this.done = new Promise(resolve => this.resolve = resolve);
		if(embed)this.setEmbed(embed);
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

	attach(file, name) {
		if(!this.options.files)this.options.files = [];
		this.options.files.push(new Discord.Attachment(file, name));
		return this;
	}

	get new() {
		return new Message(this.channel);
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
		if(this.sent)console.warn('sent message 2 times');
		this.sent = true;
		this.next = this.new;
		
		let resolve;
		this.sending = new Promise(res => resolve = res);
		const msg = await this.channel.send(this.content, this.options);
			
		if(!isNaN(this.del)) {
			msg.delete(this.del);
			msg.deleted = true;
		}
		this.next.prev = msg.from = this;
		this.sent = msg;
		resolve();
		return msg;
	}

	collect(val, time, opts, inMs = false) {
		if(!time)throw new Error("Missing argument: time.");
		if(!inMs)time *= 1000;
		let filter = val;
		if(typeof filter === "string")filter = m => m.content === val;
		if(filter instanceof Array)filter = m => val.includes(m);
		this.collector = this.channel.createMessageCollector(filter, Object.assign({}, opts, { time }));
		return this;
	}

	async await(del = true, inMs = false) {
		if(!this.collector)throw new Error("Need to collect messages before awaiting them.");
		if(!this.sent)this.send();

		const msg = await this.collector.next.catch(err => {
			if(err instanceof Map)return null;
			throw err;
		});
		if(del || typeof del === "number") {
			await this.sending;
			this.sent.delete(typeof del === "number" ? del : 0);
		}
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

	invalidUsage(cmd, name) {
		this.throw(`Invalid usage.\n\n Proper Usage: ${ cmd.how(name) }`);
	}

	opts(opts) {
		Object.assign(this.options, opts);
		return this;
	}

	setEmbed(details, delimiter = "\n") {
		this.embed = this.channel.client.self.helpers.getEmbed(details);
		this.opts({ embed: this.embed });
		this.prefix(delimiter);
		
		return this;
	}
}