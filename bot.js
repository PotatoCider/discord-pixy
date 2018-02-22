const Self = require("./util/Self"),
	self = new Self(),
	prefix = self.prefix;

self.client.on("message", msg => {
	if(!msg.content.startsWith(prefix) || !self.Constants.owners.includes(msg.author.id) || msg.author.bot || !self.set)return;

	const channel = msg.channel,
		content = msg.content,
		name = content.slice(prefix.length, ~(~content.indexOf(" ", prefix.length) || ~content.length)),
		cmd = self.commands[name];
	if(!cmd)return;
	if(cmd.requiresGuild && !msg.guild)return channel.send("This command can only be used in Paragon Xenocide.");

	const params = content.slice(prefix.length + name.length).trim().split(/ +/g);

	Promise.resolve(cmd.run(msg, cmd.messageSplit ? params : params.join(" ")))
	.catch(err => {
		if(typeof err === "string")return err && "**Error**: " + err;
		if(err.content){
			err.content = "**Error**: " + err.content;
			return err;
		}
		self.errorHandler(err);
	})
	.then(out => {
		if(out)channel.send(out.content || out, Object.assign({ split: true }, out.options)).then(m => {
			const del = out.del || cmd.del;
			if(del)m.delete(del);
		});
	});
})

.on("guildMemberAdd", mem => {
	const guild = mem.guild,
		channel = guild.channels.find("name", "welcome");
	channel.send(`<@${ mem.id }>, Welcome to Paragon Xenocide! You are the ${ guild.memberCount }th user!`);
});