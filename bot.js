const Self = require("./util/Self"),
	Message = require("./util/Message"),
	self = new Self(),
	prefix = self.prefix;

self.client.on("message", async msg => {
	if(!msg.content.startsWith(prefix) || msg.author.bot || !self.set)return;

	const channel = msg.channel,
		content = msg.content,
		name = content.slice(prefix.length, ~(~content.indexOf(" ", prefix.length) || ~content.length)),
		cmd = self.commands[name];
	if(!cmd)return;
	if(cmd.admin && !self.helpers.isAdmin(msg.author))return;
	if(cmd.requiresGuild && !msg.guild)return channel.send("This command can only be used in Paragon Xenocide.");

	const params = content.slice(prefix.length + name.length).trim().split(/ +/g);
	let reply = new Message(channel, "", cmd.del);

	const out = cmd.run(msg, cmd.messageSplit ? params : params.join(" "), reply)
	.catch(err => {
		if(err instanceof Message)return err;
		self.errorHandler(err);
	});
	
	if(typeof out === "string")return console.warn("Deprecated: return msg.content.");
	if(out instanceof Message && !out.sent)return out.send();
	while(reply) {
		if(!reply.sent && reply.content)reply.send();
		reply = reply.next;
	}
})

.on("guildMemberAdd", mem => {
	const guild = mem.guild,
		channel = guild.channels.find("name", "welcome");
	channel.send(`<@${ mem.id }>, Welcome to Paragon Xenocide! You are the ${ guild.memberCount }th user!`);
});