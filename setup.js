const errorHandler = require("./util/error.js");
process.on("unhandledRejection", errorHandler)
.on("uncaughtException", errorHandler);

try {
	const { prefix, token, mongodb_path, yt_api_key, production } = require("./config.json");
	process.env.PREFIX = prefix;
	process.env.TOKEN = token;
	process.env.MONGODB_URI = mongodb_path;
	process.env.YT_API_KEY = yt_api_key;
	process.env.PRODUCTION = production.toLowerCase() === 'true' ? true : false;
} catch(err) {
	if(err.message !== "Cannot find module './config.json'")throw err;
} finally {
	const { TOKEN, PREFIX, MONGODB_URI, YT_API_KEY } = process.env;
	if(!TOKEN)throw new Error("Bot token is not specified.");
	if(!PREFIX)throw new Error("Bot prefix is not specified.");
	if(!MONGODB_URI)throw new Error("Mongo Database URL is not specified.");
	if(!YT_API_KEY)throw new Error("Youtube API Key is not specified.");

	return true;
}
