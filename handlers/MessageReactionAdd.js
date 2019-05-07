const ClientHandler = require('../util/ClientHandler');

module.exports = class MessageReactionAdd extends ClientHandler {
	constructor(self) {
		super(self, 'messageReactionAdd');
		this.guilds = self.db.collection('guilds');
		this.init = self.production && this.startListening();
		this.triggerMsgs = {};
		
	}

	async startListening() {
		await this.self.logined;
		this.xeno = this.self.client.guilds.get('346244476211036160');
		const { roleMessages } = await this.guilds.getOne({ id: this.xeno.id }, { roleMessages: 1 });
		roleMessages.forEach(msg => {
			triggerMsgs[msg.id] = msg;
			this.xeno.channels.get(msg.channelId)
			.fetchMessage(msg.id)
			.then(m => triggerMsgs[m.id].message = m);
		});
	}

	async handle(reaction, user) {
		const triggered = this.triggerMsgs[reaction.message.id];
		if(!triggered)return;
		const role = triggered.roles[reaction.emoji.identifier];
		if(!role)return;
		await user.addRole(role, `Reacted to ${ reaction.message.id } with ${ reaction.emoji.name }`);
	}
}