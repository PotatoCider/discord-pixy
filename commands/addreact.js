const Command = require("../util/Command");

module.exports = class AddReact extends Command {
	constructor(self) {
		super({
			name: "copyreact",
			desc: "Adds a reaction to every following reaction you make.",
			usage: "[start/stop/toggle(default)]",
			requiresGuild: true,
			messageSplit: true,
			aliases: ['cr', 'copyreaction'],
			utils: ['ClientHandler'],
			self
		});
	}

	addReactor(user) {
		let refreshed = false;
		if(user.reactor) {
			this.removeReactor(user);
			refreshed = true;
		}
		user.reactor = async (reaction, u) => {
			if(u.id !== user.id)return;
			await reaction.message.react(reaction.emoji);
			reaction.remove(user);
		};
		user.client
		.on('messageReactionAdd', user.reactor)
		.setTimeout(() => this.removeReactor(msg.author), 3 * 60 * 1000);
	}

	removeReactor(user) {
		if(!user.reactor)return;
		user.client.removeListener('messageReactionAdd', user.reactor);
		user.reactor = null;
	}

	async run(msg, params, reply) {
		const selection = params.shift(),
			stop = (selection === 'stop' && selection !== 'start') || msg.author.reactor;
		if(stop) {
			this.removeReactor(msg.author);
			return reply.append('Stopped reacting.');
		}

		this.addReactor(msg.author);
		reply.append('Started reacting. Effect lasts for 3 mins');
	}
}	