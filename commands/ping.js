const Command = require("../util/Command");

module.exports = class Ping extends Command {
	constructor(self) {
		super({
			name: "ping",
			desc: "Time taken for a message to travel back and forth.",
			detailed: "Time taken for a message to travel round-trip. This **does not** tell your ping, but tells my ping.",
			self
		});
	}

	async run(msg, params, reply) {
		const start = Date.now(),
			m = await reply.append("Pong!").send(),
			elapsed = Date.now() - start;
		m.edit(`Pong! Latency is \`${ elapsed }ms\`, API Latency is \`${ Math.round(m.client.ping) }ms\`.`)
	}
}