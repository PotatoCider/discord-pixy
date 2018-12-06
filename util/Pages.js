const Embed = require("./Embed"),
	Message = require("./Message");
module.exports = class Pages extends Array {
	constructor(channel, ...msgs) {
		super();
		this.channel = channel;
		this.add(...msgs);
	}

	add(...msgs) {
		if(msgs[0] instanceof Array)msgs = msgs[0];
		for(let i = 0; i < msgs.length; i++) {
			this.push(this.convert(msgs[i]));
		}
		return this;
	}

	convert(msg) {
		if(msg instanceof Embed.RichEmbed) {
			return new Message(this.channel, { embed: msg });
		}
		if(typeof msg === "string") {
			return new Message(this.channel, { content: msg });
		}
		return msg;
	}

	async send() {
		if(this.sent)return new Error("Already sent.");
		if(!this.channel)this.channel = this[0].channel;
		if(this[0].embed instanceof Embed)this[0].embed.changePage(1, this.length);
		this.sent = this[0].send(this.channel);
		this.sent = await this.sent;
		this.index = 0;

		this.channel.guild.s.reactions[this.sent.id] = async (reaction, user) => {
			switch(reaction.emoji.name) {
				case "◀":
					this.flip(-1, true);
					break;
				case "▶":
					this.flip(1, true);
					break;
				case "⏹":
					this.clear(true);
					break;
			}
		};
		await this.sent.react("◀");
		await this.sent.react("▶");
		await this.sent.react("⏹");
		this.channel.client.setTimeout(() => this.clear(), 5 * 60 * 1000);
		return this;
	}

	async clear(del = false) {
		this.channel.guild.s.reactions[this.sent.id] = null;
		if(del) {
			await this.sent.delete();
		} else await this.sent.clearReactions();
		return this;
	}

	async flip(index = 0, relative) {
		if(relative)index += this.index;
		if(this.update)this[index] = this.convert(await this.update(index)) || this[index];
		if(index < 0 || index >= this.length)return;
		if(this[index].embed instanceof Embed)this[index].embed.changePage(index + 1, this.length);
		this.index = index;
		this.sent = await this.sent.edit(this[index].content, this[index].options);

		return this;
	}
}