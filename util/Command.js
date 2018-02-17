module.exports = class Command {
	constructor({ name, self, admin, aliases, desc, detailed, usage, requiresGuild, del, messageSplit, ignore, parent, utils }) {
		if(ignore)return;

		this.name = name;
		this.self = self;
		this.admin = admin;
		this.aliases = aliases || [];
		this.desc = desc || "";
		this.detailed = detailed || desc;
		this.usage = usage || "";
		this.requiresGuild = requiresGuild || false;
		this.messageSplit = messageSplit || false;
		this.del = del;
		this.parent = parent || self;

		this.utils = {};
		this.helpers = self.helpers;
		this.Constants = self.Constants;

		if(!(self && name && this.aliases instanceof Array))throw new Error("Invalid parameters.");
		const commands = this.parent.commands;
		commands[name] = this;
		for(let i = 0; i < this.aliases.length; i++){
			const alias = this.aliases[i];
			if(!commands[alias])Object.defineProperty(commands, alias, {
				get() { return this[name]; }
			});
		}

		if(!utils)return;
		const modules = self.loadModules(...utils);
		for(let i = 0; i < utils.length; i++){
			this.utils[utils[i]] = modules[i];
		}
	}

	help() {
		return `**${ this.name }**: ${ this.desc }`
	}

	detailedHelp() {
		return `**${ this.name }**:\n\n\`${ this.self.prefix + this.name } ${ this.usage }\`\n\n${ this.detailed }`;
	}

	run() { console.warn(this.name, "has no run method!"); }
}