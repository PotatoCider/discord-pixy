const Command = require("../util/Command");
module.exports = class extends Command {
	constructor(self) {
		super({
			name: "eval",
			desc: "Executes JavaScript code. (Owners Only)",
			usage: "[```] <code> [```]",
			utils: ["fs"],
			admin: true,
			self
		});
	}

	run(msg, params, reply) {
		if(!this.Constants.owners.includes(msg.author))return;
		if(params === "clear")return new Promise(resolve => this.utils.fs.writeFile("log.txt", "", err => {
			if(err)throw err;
			resolve("Error log cleared.");
		}));
			
		const client = msg.client, self = client.self;
		reply.append(eval(params));
	}
}