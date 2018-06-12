const Command = require("../util/Command");

module.exports = class extends Command {
	constructor(self) {
		super({
			name: "",
			desc: "",
			usage: "",
			requiresGuild: true,
			messageSplit: true,
			utils: [],
			ignore: true, // Remove this line
			self
		});
	}

	run(msg, params, reply) {
		
	}
}	