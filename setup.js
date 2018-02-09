try {
	const { prefix, token } = require("./settings.json");
	process.env.PREFIX = prefix;
	process.env.TOKEN = token;
} catch(e) {
	
} finally {
	const { TOKEN, PREFIX } = process.env;
	if(!TOKEN)throw "Bot token is not specified in config.json or process.env!";
	if(!PREFIX)throw "Bot prefix is not specified in config.json or process.env!";

	return true;
}
