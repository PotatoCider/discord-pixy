const Command = require("../util/Command");

module.exports = class React extends Command {
	constructor(self) {
		super({
			name: "react",
			desc: "Reacts to all reactions on a message in the same channel",
			usage: "<message id>",
			requiresGuild: true,
			messageSplit: true,
			aliases: [],
			utils: [],
			self
		});
	}

	async run(msg, params, reply) {
		const id = params[0]
		const reactMsg = await msg.channel.fetchMessage(id).catch(console.error)
		if (!reactMsg) {
			await msg.react('❌')
			await msg.delete(3000)
			return
		}
		const ps = reactMsg.reactions.map(r => reactMsg.react(r.emoji))
		await Promise.all(ps)
		await msg.react('✅').catch(console.error)
		await msg.delete(3000).catch(console.error)
	}
}	