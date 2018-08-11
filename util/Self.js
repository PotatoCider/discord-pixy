const
	[ _, { Client }, EventEmitter, fs, Constants, Helpers, loadModules, errorHandler, Database, MusicPlayer ] = 
	require("./loadModules")("../setup", "discord.js", "events", "fs", "Constants", "Helpers", "loadModules", "error", "Database", "MusicPlayer");

module.exports = class Self extends EventEmitter {
	constructor() {
		super();

		this.client = new Client();
		this.guilds = {};
		this.commands = {};
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

		this.init = new Promise(resolve => this.once("set", resolve));

		this.start().then(() => {
			this.emit("set");
			this.set = true;
			console.log(`${ this.client.user.username } is online!`);
		});

	}

	async start() {
		this.db = await new Database(process.env.MONGODB_URI, process.env.MONGODB_URI.split("/").pop()).init;
		console.log("Database connected.");
		await Promise.all([this.login(), this.loadCommands("commands")]);
		await this.loadGuilds();
	}

	async loadGuilds() {
		const ids = this.client.guilds.keyArray();
		for(let i = 0; i < ids.length; i++) {
			this.guilds[ids[i]] = { player: new MusicPlayer() };
		}
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