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

	send(channel) {
		this.channel = channel || this.channel;
		if(!this.channel)throw new Error("No channel specified.");
		return this.sent = this.channel.send(this.content, this.options).then(msg => {
			if(!isNaN(this.del))msg.delete(this.del);
			this.next = new Message(this.channel);
			msg.from = this;
			return this.sent = msg;
		})
	}

	await(filter, time, del) {
		if(!this.sent)this.send();
		const next = this.channel.createMessageCollector(filter, { time }).next;
		if(del)Promise.all([this.sent, next]).then(([sent]) => sent.delete());

		return next;
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