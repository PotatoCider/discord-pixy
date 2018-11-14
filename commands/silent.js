const Command = require("../util/Command");

module.exports = class Silent extends Command {
	constructor(self) {
		super({
			name: "silent",
			desc: "Toggles silent mode.",
			detailedDesc: "Toggles silent mode on or off for the user.",
			usage: "[on/off]",
			messageSplit: true,
			aliases: ["silentmode"],
			utils: [],
			self
		});
		this.silentIgnore = true;
	}

	async run(msg, params, reply) {
		const selected = params.shift().toLowerCase();
		let state = !msg.author.silentMode;
		if(selected === "on") {
			state = true;
		} else if(selected === "off") {
			state = false;
		}
		if(state)msg.delete();
		await this.db.setCollection("users").update({ id: msg.author.id }, { silentMode: state });
		reply.channel = msg.author;
		reply.append(`Silent mode is ${ msg.author.silentMode === state ? "already" : "now" } ${ state ? "on" : "off" }.`).delete(60);
		msg.author.silentMode = state;
	}
}	