const 
	[ _, { Client }, { EventEmitter }, { loadCommands }, { getCommand, processMsg }, errorHandler, { owners } ]
		= require("./util/loadModules.js")("./setup", "discord.js", "events", "commandLoading", "commandProcessing", "error", "./config"),

	client = new Client(),

	self = client.self = Object.assign(new EventEmitter(), { client, guilds: {}, commands: {}, prefix: process.env.PREFIX, set: false }),
	prefix = self.prefix;

client.on("message", msg => {
	if(!msg.content.startsWith(prefix) || !owners.includes(msg.author.id) || msg.author.bot || !self.set)return;

	const channel = msg.channel,
		name = getCommand(msg.content, prefix),
		cmd = self.commands[name];
	if(!cmd)return;
	if(cmd.requiresGuild && !msg.guild)return channel.send("This command can only be used in guilds!");

	Promise.resolve(cmd.run(msg, processMsg(msg.content, name, prefix))).then(out => {
		if(out)channel.send(out, { split: true }).then(m => {
			if(cmd.del)m.delete(cmd.del);
		});
	})
})

.on("guildMemberAdd", mem => {

})

.on("error", errorHandler)

.login(process.env.TOKEN)
.then(() => console.log("Login successful!"))
.then(() => loadCommands(self.commands, "commands", self))
.then(() => {
	self.emit("set");
	self.set = true;
	
	console.log("Pixt is online!");
});

process.on("unhandledRejection", errorHandler)
	.on("uncaughtException", errorHandler);
