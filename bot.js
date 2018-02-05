const 
	[ _, { Client }, { EventEmitter }, { loadCommands }, { getCommand, processMsg } ]
		= require("./util/loadModules.js")("./setup", "discord.js", "events", "commandLoading", "commandProcessing"),

	client = new Client(),

	self = client.self = Object.assign(new EventEmitter(), { client, guilds: {}, commands: {}, prefix: process.env.PREFIX, set: false }),
	prefix = self.prefix;

client.on("message", msg => {
	if(!msg.content.startsWith(prefix) || msg.author.bot || !self.set)return;

	const channel = msg.channel,
		name = getCommand(msg.content, prefix),
		cmd = self.commands[name];
	console.log(cmd)
	if(!cmd)return;
	if(cmd.requiresGuild && !msg.guild)return channel.send("This command can only be used in guilds!");

	msg.params = processMsg(msg.content, name, prefix);

	Promise.resolve(cmd.run(msg)).then(out => {
		if(out)channel.send(out, { split: true }).then(m => {
			if(cmd.del)m.delete(cmd.del);
		});
	})
})

.login(process.env.TOKEN)
.then(() => console.log("Login successful!"))
.then(() => loadCommands(self.commands, "commands", self))
.then(() => {
	self.emit("set");
	self.set = true;
	console.log(self.commands)
	console.log("Pixy is online!");
});