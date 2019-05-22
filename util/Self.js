const
	[ _, { Client }, EventEmitter, fs, Constants, Helpers, loadModules, errorHandler, Database, MusicPlayer ] = 
	require("./loadModules")("../setup", "discord.js", "events", "fs", "Constants", "Helpers", "loadModules", "error", "Database", "MusicPlayer");

module.exports = class Self extends EventEmitter { // Todo: convert object to Map system.
	constructor() {
		super();

		this.client = new Client();
		this.guilds = {};
		this.commands = {};
		this.handlers = {};
		this.prefix = process.env.PREFIX;
 		this.production = process.env.PRODUCTION === "TRUE";
		this.set = false;

		this.Constants = Constants;
		this.helpers = new Helpers(this);
		this.loadModules = loadModules;
		this.errorHandler = errorHandler;

		this.client.self = this;

		let reactionListener = (reaction, user) => {
			if(!reaction.me || user.id === this.client.user.id)return;
			const react = this.guilds[reaction.message.guild.id].reactions[reaction.message.id];
			if(!react)return;
			react(reaction, user);
		};

		this.client
		.on("messageReactionAdd", reactionListener)
		.on("messageReactionRemove", reactionListener)
		.on("warn", errorHandler)
		.on("error", errorHandler);

		this.init = new Promise(resolve => this.once("set", resolve));
		this.logined = new Promise(resolve => this.once("login", resolve));
	}

	setMessage(msg) {
		msg.self = this;
		msg.guild.s = this.guilds[msg.guild.id];
		msg.guild.player = msg.guild.s.player;
	}

	async handleClient() {
		this._handlers = this._handlers || await this.helpers.readdir("handlers");

		const loading = [];
		for(let i = 0; i < this._handlers.length; i++) {
			loading[i] = new (require(`../handlers/${ this._handlers[i] }`))(this);
		}
		await Promise.all(loading);
	}

	async start() {
		this.db = new Database(process.env.MONGODB_URI, process.env.MONGODB_URI.split("/").pop(), this);
		console.log("Database connected.");

		await Promise.all([this.login(), this.loadGuilds(), this.db.guildSync]);
		await this.db.guildSync;
		await Promise.all([this.loadCommands("commands"), this.handleClient()]);

		this.emit("set");
		this.set = true;
		console.log(`${ this.client.user.username } is online!`);
	}

	async loadGuilds() {
		await this.logined;
		const ids = this.client.guilds.keyArray();
		for(let i = 0; i < ids.length; i++) {
			this.guilds[ids[i]] = { player: new MusicPlayer(this), reactions: {}, muteJobs: {} };
		}
	}
	
	async loadCommands(path, reload) {
		this._cmds = this._cmds || (await this.helpers.readdir(path)).filter(cmd => cmd.endsWith(".js"));

		const loading = [];
		for(let i = 0; i < this._cmds.length; i++){
			loading[i] = this.loadCommand(`../${ path }/${ this._cmds[i] }`, reload);
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
		
		this.emit("login");
		console.log("Login successful.");
	}
}