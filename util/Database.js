const mongo = require("mongodb").MongoClient,
	Collection = require("./DatabaseCollection");

module.exports = class Database {
	constructor(url, db, self) {
		this.url = url;
		this.dbName = db;
		this.init = this.connect();
		this.self = self;
	}

	async updateUser(user) {
		if(user.cached)return;
		let resolve;
		user.cached = new Promise(res => resolve = res);
		const found = await this.users.findOne({ id: user.id });
		if(found) {
			Object.assign(user, found);
			resolve(true);
			return { silentMode: user.silentMode, new: false };
		}
		const result = await this.users.insertOne({ id: user.id, silentMode: false });
		user.silentMode = false;
		resolve(true);
		return { silentMode: false, new: true };
	}

	async connect() {
		this.client = await mongo.connect(this.url, { useNewUrlParser: true }).catch(err => console.log(err));
		this.db = this.client.db(this.dbName);
		this.users = this.db.collection("users");
		this.guilds = this.db.collection("guilds");

		this.guildSync = this.syncGuilds();
		return this;
	}

	async syncGuilds() {
		const entries = await this.guilds.find({}, { id: 1 }).toArray();
		await this.self.logined;

		const guilds = this.self.client.guilds.clone(),
			toDelete = [];
		entries.forEach(entry => {
			if(!guilds.has(entry.id))return toDelete.push(entry.id);
			guilds.delete(entry.id);
		});

		const loading = guilds.map(guild => {
			const doc = { id: guild.id, memberHistory: {} };
			guild.members.forEach(mem => doc.memberHistory[mem.id] = { xp: 0, inGuild: true }); // to add info
			return this.guilds.insertOne(doc);
		}),
			loading2 = toDelete.map(guild => this.guilds.deleteOne({ id: guild.id }));

		await Promise.all(loading.concat(loading2));
	}

	collection(collection) {
		return new Collection(this.db, this.self, collection);
	}
}