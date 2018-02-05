module.exports = class Command {
	constructor({ name, self, aliases = [], desc = "", detailed = "", usage = "", requiresGuild = false, del, ignore = false }) {
		if(!(name && aliases instanceof Array))throw new Error("Invalid parameters.");
		this.name = name;
		this.self = self;
		this.aliases = aliases;
		this.desc = desc;
		this.detailed = detailed || desc;
		this.usage = usage;
		this.requiresGuild = requiresGuild;
		this.del = del;
		this.ignore = ignore;
	}

	help() {
		return `**${ this.name }**: ${ this.desc }`
	}

	detailedHelp() {
		return `**${ this.name }**:\n\n\`${ process.env.PREFIX + this.name } ${ this.usage }\`\n\n${ this.detailed }`;
	}

	run() { console.warn(this.name, "has no run method!"); }
}