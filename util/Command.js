module.exports = class Command {
	constructor({ name, self, aliases, desc, detailed, usage, requiresGuild, del, messageSplit, ignore, commands }) {
		if(ignore)return;

		this.name = name;
		this.self = self;
		this.aliases = aliases || [];
		this.desc = desc || "";
		this.detailed = detailed || desc;
		this.usage = usage || "";
		this.requiresGuild = requiresGuild || false;
		this.messageSplit = messageSplit || false;
		this.del = del;
		this.commands = commands;
		if(!(self && name && this.aliases instanceof Array))throw new Error("Invalid parameters.");
		const cmds = commands ? commands : self.commands;
		cmds[name] = this;
		for(let i = 0; i < this.aliases.length; i++){
			const alias = this.aliases[i];
			if(!cmds[alias])Object.defineProperty(cmds, alias, {
				get() { return this[name]; }
			});
		}
	}

	help() {
		return `**${ this.name }**: ${ this.desc }`
	}

	detailedHelp() {
		return `**${ this.name }**:\n\n\`${ process.env.PREFIX + this.name } ${ this.usage }\`\n\n${ this.detailed }`;
	}

	run() { console.warn(this.name, "has no run method!"); }
}