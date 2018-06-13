const
	[ { Client }, EventEmitter, fs, Constants, Helpers, loadModules, errorHandler ] = 
	require("./loadModules")("discord.js", "events", "fs", "Constants", "Helpers", "loadModules", "error");

require("../setup");

process.on("unhandledRejection", console.log)
.on("uncaughtException", console.log);


module.exports = class Self extends EventEmitter {
	constructor() {
		super();

		this.client = new Client();
		this.guilds = this.commands = {};
		this.prefix = process.env.PREFIX;
 		this.production = process.env.PRODUCTION === "TRUE";
		this.set = false;

		this.Constants = Constants;
		this.helpers = new Helpers(this);
		this.loadModules = loadModules;
		this.errorHandler = errorHandler;

		this.client.self = this;

		this.client
		.on("warn", errorHandler)
		.on("error", errorHandler);

		Promise.all([
			this.login(),
			this.loadCommands("commands")	
		]).then(() => {
			this.emit("set");
			this.set = true;
			console.log("Pixy is online!");
		});

	}
	
	async loadCommands(path, reload) {
		const cmds = this._cmds = this._cmds || fs.readdirSync(path).filter(cmd => cmd.endsWith(".js")),
			loading = [];
		for(let i = 0; i < cmds.length; i++){
			loading[i] = this.loadCommand(`../${ path }/${ cmds[i] }`, reload);
		}

		if(!this.production && !this.set){
			let fsTimeout = false;
			fs.watch(path, "utf-8", (event, module) => {
				if(event !== "change" || fsTimeout)return;
				this.loadCommand(`../${ path }/${ module }`, true);
				console.log(`${ module } reloaded.`);
				fsTimeout = setTimeout(() => fsTimeout = false, 1000); // Prevents multiple event calls within 1 second.
			});
		}
		await Promise.all(loading).catch(errorHandler);

		this.emit(`./${ path } load`);
		console.log(`./${ path } loaded.`);
	}

	async loadCommand(path, changed) {
		if(changed)delete require.cache[require.resolve(path)];
		try {
			const cmd = new (require(path))(this);
			await cmd.init;
			this.emit(cmd.name + ".js load", cmd);
		} catch(e) {
			errorHandler(e);
			process.exit();
		}
	}

	async login() {
		await this.client.login(process.env.TOKEN);
		
		this.logined = true;
		this.emit("login");
		console.log("Login successful.");
	}
}