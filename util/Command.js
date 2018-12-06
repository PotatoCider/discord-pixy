module.exports = class Command {
	constructor({ name, self, admin, aliases, desc, detailed, usage, requiresGuild, del, messageSplit, ignore, parent, utils, usages }) {
		if(ignore)return;

		this.name = name;
		this.self = self;
		this.admin = admin;
		this.aliases = aliases || [];
		this.desc = desc || "";
		this.detailed = detailed || desc;
		this.usage = usage || "";
		this.usages = usages || [this.usage];
		this.requiresGuild = requiresGuild || false;
		this.messageSplit = messageSplit || false;
		this.del = del;
		this.parent = parent || self;

		this.utils = {};
		this.helpers = self.helpers;
		this.Constants = self.Constants;
		this.db = self.db;

		if(!(self && name && this.aliases instanceof Array))throw new Error("Invalid parameters.");
		const commands = this.parent.commands;
		commands[name] = this;
		this.aliases.forEach(alias => commands[alias] = this);

		if(!utils)return;
		let utilNames;
		if(!(utils instanceof Array)) {
			utilNames = Object.keys(utils);
			utils = Object.values(utils);
		} else {
			if(!utils.length)return;
			utilNames = utils;
		}
		for(let i = 0; i < utils.length; i++) {
			if(typeof utils[i] !== "string" && utils[i])
				utils[i] = utilNames[i];
		}
		const modules = self.loadModules(...utils);
		for(let i = 0; i < utils.length; i++){
			this.utils[utilNames[i]] = modules[i];
		}
	}

	help() {
		return `${ this.name }: ${ this.desc }`
	}

	detailedHelp() {
		return `**Name**: ${ this.name }\n\n**Usage${ this.usages.length > 1 ? "s" : "" }**: \n${ this.how() }\n${ this.detailed }\n\n**Aliases**: ${ this.aka() }`;
	}

	how(prefix = true, name = this.name) {
		let content = "";
		if(this.usages.length === 0)throw new Error("Usages not added.");
		for(let i = 0; i < this.usages.length; i++) {
			content += `\`${ prefix ? this.self.prefix : "" }${ name } ${ this.usages[i] }\`\n`;
		}
		return content;
	}

	aka() {
		return `\`${ this.aliases.join(", ") }\``
	}

	run() { console.warn(this.name, "has no run method!"); }
}