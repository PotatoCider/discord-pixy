const Command = require("../util/Command");

module.exports = class Repeat extends Command {
	constructor(self) {
		super({
			name: "repeat",
			desc: "Sets the music player on repeat.",
			detailedDesc: "Toggles repeat.",
			usage: "[on/off]",
			requiresGuild: true,
			messageSplit: true,
			aliases: ["loop"],
			utils: [],
			self
		});
	}

	async run(msg, params, reply) {
		const player = msg.guild.player,
			choice = params.shift(),
			before = player.repeat;

		if(choice === "on") {
			player.repeat = true;
		}else if(choice === "off") {
			player.repeat = false;
		}else player.repeat = !player.repeat;
		
		reply.append(`:repeat: | Repeat is ${ before === player.repeat ? "already " : "" }${ player.repeat ? "on" : "off" }.`);
	}
}	