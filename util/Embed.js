const Discord = require("discord.js");

module.exports = class Embed extends Discord.RichEmbed {
	setAuthor(author, icon, url) {
		if(author instanceof Discord.GuildMember) {
			icon = author.user.displayAvatarURL;
			author = author.displayName;
		} else if(author instanceof Discord.User) {
			icon = author.displayAvatarURL;
			author = author.username;
		} else if(typeof author === "object") {
			({ name: author, icon, url } = author);
		}
		return super.setAuthor(author || "", icon, url);
	}

	setFooter(text, icon) {
		if(typeof text === "object") {
			({ text, icon } = text);
		}
		//console.log(text);
		return super.setFooter(text || "", icon);
	}

	addField(name, value, inline) {
		if(typeof name === "object") {
			({ name, value, inline } = name);
		} 
		return super.addField(name || "\u200b", value, inline);
	}

	changePage(cur, total) {
		if(!this.page)this.prevFooter = this.footer.text;
		this.page = true;
		return this.setFooter(`Page ${ cur }/${ total }${ this.prevFooter ? " | " : "" }${ this.prevFooter }`, this.footer.icon_url);
	}

	addFields(...fields) {
		if(fields[0] instanceof Array)fields = fields[0];
		for(let i = 0; i < fields.length; i++) {
			if(typeof fields[i] === "string")fields[i] = { value: fields[i] };
			this.addField(fields[i]);
		}
		return this;
	}
}

module.exports.RichEmbed = Discord.RichEmbed;