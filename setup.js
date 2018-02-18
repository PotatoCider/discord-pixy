try {
	const { prefix, token, mongodb_path } = require("./config.json");
	process.env.PREFIX = prefix;
	process.env.TOKEN = token;
	process.env.MONGODB_URI = mongodb_path;
} catch(err) {
	if(err.message !== "Cannot find module './config.json'")throw err;
} finally {
	const { TOKEN, PREFIX, MONGODB_URI } = process.env;
	if(!TOKEN)throw new Error("Bot token is not specified.");
	if(!PREFIX)throw new Error("Bot prefix is not specified.");
	if(!MONGODB_URI)throw new Error("Mongo Database URL is not specified.");

	return true;
}
