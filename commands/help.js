const Command = require("../util/Command");

module.exports = class Help extends Command {
	constructor(self) {
		super({
			name: "help",
			desc: "Displays this help message.",
			usage: "[command]",
			requiresGuild: true,
			messageSplit: true,
			utils: [],
			self
		});
	}

	async run(msg, params, reply) {
		const cmd = params.shift();
		if(!cmd) {
			reply.opts({ code: true });
			for(const name in this.self.commands) {
				const command = this.self.commands[name];
				if(command.ignore)continue;
				if(typeof command.help !== "function")console.log(command);
				reply.append(command.help());
			}
			await reply.send(msg.member);
			reply.next.append(":arrow_right: | Sent to your DMs.").send(msg.channel);
		} else {
			const command = this.self.commands[cmd];
			if(!command)reply.throw(`No such command "${ cmd }".`);
			reply.append(command.detailedHelp());
		}
	}
}	