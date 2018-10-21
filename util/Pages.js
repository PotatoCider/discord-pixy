const Embed = require("./Embed"),
	Message = require("./Message");
module.exports = class Pages extends Array {
	constructor(channel, ...msgs) {
		super();
		this.channel = channel;
		for(let i = 0; i < msgs.length; i++) {
			
			this[i] = msgs[i];
		}
	}

	add(...msgs) {
		for(let i = 0; i < msgs.length; i++) {
			if(msgs[i] instanceof Embed.RichEmbed) {
				msgs[i] = new Message(this.channel, { embed: msgs[i] });
			}
			if(typeof msgs[i] === "string") {
				msgs[i] = new Message(this.channel, { content: msgs[i] });
			}
			this.push(msgs[i]);
		}
		return this;
	}

	async send() {
		if(this.sent)return new Error("Already sent.");
		if(!this.channel)this.channel = this[0].channel;
		this.sent = this[0].send(this.channel);
		this.sent = await this.sent;
		this.index = 0;
		const react = this.channel.guild.s.reactions;
		react[this.sent.id] = (reaction, user) => {
			switch(reaction.emoji.name) {
				case "◀":
					this.prev();
					break;
				case "▶":
					this.next();
					break;
				case "⏹":
					react[this.sent.id] = null;
					this.sent.delete();
					break;
			}
		};
		await this.sent.react("◀")
		await this.sent.react("▶")
		await this.sent.react("⏹");
		return this;
	}

	async next() {
		return await this.update(this.index + 1);
	}

	async prev() {
		return await this.update(this.index - 1);
	}

	async update(index = this.index) {
		if(index < 0 || index >= this.length)return;		
		this.index = index;
		this.sent = await this.sent.edit(this[index].content, this[index].options);

		return this;
	}
}