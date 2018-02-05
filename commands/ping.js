const Command = require("../util/Command");
module.exports = class extends Command {
	constructor(self) {
		super({
			name: "ping",
			desc: "Time taken for a message to travel round-trip.",
			self: self
		});
	}

	run(msg) {
		const start = Date.now();
		msg.channel.send("Pong!").then(m => {
			const elapsed = Date.now() - start;
			m.edit(`Pong! Latency is \`${ elapsed }ms\`, API Latency is \`${ Math.round(m.client.ping) }ms\`.`)
		});
	}
}