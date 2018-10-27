const mongo = require("mongodb").MongoClient;

module.exports = class Database {
	constructor(url, db, self) {
		this.url = url;
		this.dbName = db;
		this.init = this.connect();
		this.self = self;
	}

	async checkUser(user) {
		if(user.cached)return;
		const found = await this.users.findOne({ id: user.id });
		if(found) {
			Object.assign(user, found);
			user.cached = true;
			return { silentMode: user.silentMode, new: false };
		}
		const result = await this.users.insertOne({ id: user.id, silentMode: false });
		user.silentMode = false;
		return { silentMode: false, new: true };
	}

	async connect() {
		this.client = await mongo.connect(this.url, { useNewUrlParser: true }).catch(err => console.log(err));
		this.db = this.client.db(this.dbName);
		this.users = this.db.collection("users");

		return this;
	}

	setCollection(collection) {
		this.collection = this.db.collection(collection);
		return this;
	}

	async set(doc) {
		this.assert();
		const query = doc.id ? { id: doc.id } : doc,
			{ result } = await this.collection.updateOne(query, doc, { upsert: true });
		return result.ok === 1;
	}

	async update(filter, doc) {
		this.assert();
		const { result } = await this.collection.updateOne(filter, { $set: doc }, { upsert: true });
		return result.ok === 1;
	} 

	async get(query) {
		this.assert();
		return this.collection.findOne(query);
	}

	async getAll(query) {
		this.assert();
		return this.collection.find(query).toArray();
	}

	async delete(query) {
		this.assert();
		const { result } = await this.collection.deleteOne(query);
		return result.ok === 1;
	}

	assert() {
		if(!this.collection)throw new Error("No collection.");
		return true;
	}
}