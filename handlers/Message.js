const ClientHandler = require("../util/ClientHandler"),
	MessageUtil = require("../util/Message");
let self;

module.exports = class Message extends ClientHandler {
	constructor(s) {
		self = s;
		super(self, "message");
	}

	async handle(msg) {
		await self.init;
		self.db.updateUser(msg.author);
		if(!msg.content.startsWith(self.prefix) || msg.author.bot)return;

		const channel = msg.channel,
			content = msg.content,
			name = content.slice(self.prefix.length, ~(~content.indexOf(" ", self.prefix.length) || ~content.length)).toLowerCase(),
			cmd = self.commands[name];
		if(!cmd)return;
		if(cmd.admin && !self.helpers.isAdmin(msg.author))return;
		await msg.author.cached;
		if(msg.author.silentMode)msg.delete();
		if(cmd.requiresGuild && !msg.guild)return channel.send("This command can only be used in Paragon Xenocide.");

		const params = content.slice(self.prefix.length + name.length).trim().split(/ +/g);
		let reply = new MessageUtil(channel, { del: cmd.del });
		self.setMessage(msg);
		const out = await cmd.run(msg, cmd.messageSplit ? params : params.join(" "), reply)
		.catch(err => {
			if(err instanceof MessageUtil)return err;
			self.errorHandler(err);
		});
		
		if(typeof out === "string")return console.warn("Deprecated: return msg.content.");
		if(out instanceof MessageUtil && !out.sent)return out.send();
		while(reply) {
			if(!reply.sent && (reply.content || reply.embed))reply.send();
			reply = reply.next;
		}
	}
}