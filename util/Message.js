module.exports = class Message {
	constructor(channel, content, del, options) {
		this.channel = channel;
		this.content = content || "";
		this.del = del;
		this.options = options || { split: true };
		this.error = this.sent = false;
		this.done = new Promise(resolve => this.resolve = resolve);
	}

	append(...texts) {
		this.content += (this.content ? "\n\n" : "") + texts.join("\n\n");
		return this;
	}

	replace(text) {
		this.content = text;
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

	async await(filter, time, del = false, inMs = false) {
		if(!time)throw new Error("Argument Error: time");
		if(!this.sent)this.send();
		if(!inMs)time *= 1000;
		const msg = await this.channel.createMessageCollector(filter, { time }).next;
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

	page() {
		 
	}
}