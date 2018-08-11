const mongo = require("mongodb").MongoClient;

module.exports = class Database {
	constructor(url, db) {
		this.url = url;
		this.dbName = db;
		this.init = this.connect();
	}

	async connect() {
		this.client = await mongo.connect(this.url, { useNewUrlParser: true }).catch(err => console.log(err));
		this.db = this.client.db(this.dbName);
		return this;
	}

	setCollection(collection) {
		this.collection = this.db.collection(collection);
		return this;
	}

	async set(doc) {
		this.assert();
		this.collection.insertOne(doc);
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
		return this.collection.deleteOne(query);
	}

	assert() {
		if(!this.collection)throw new Error("No collection.");
		return true;
	}
}