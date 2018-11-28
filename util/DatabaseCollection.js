module.exports = class DatabaseCollection {
	constructor(db, self, collection) {
		this.self = self;
		this.db = db;
		this.collection = db.collection(collection);
		this.writeAllowed = self.production || process.argv[2] === "dbWriteAllowed"
	}

	async set(doc) {
		if(!this.assert("write"))return;
		const query = doc.id ? { id: doc.id } : doc,
			{ result } = await this.collection.updateOne(query, doc, { upsert: true });
		return result.ok === 1;
	}

	async update(filter, docs, operations = "set") {
		if(!this.assert("write"))return;
		if(!(docs instanceof Array)) {
			docs = [ docs ];
		}
		if(!(operations instanceof Array)) {
			if(docs.length > 1)throw new Error(`one operation ($${ operation }) only supports one given document.`);
			operations = [ operations ];
		}
		operations = operations.map(op => `$${ op }`);

		const doc = docs.reduce((main, doc, i) => {
			main[operations[i]] = doc;
			return main;
		}, {});

		const result = await this.collection.updateOne(filter, doc, { upsert: true });
		result.ok = result.result.ok
		return result;
	}

	async getOne(query, projection) {
		return this.collection.findOne(query, projection);
	}

	async getAll(query, projection) {
		return this.collection.find(query, projection).toArray();
	}

	find(query, projection) {
		return this.collection.find(query, projection);
	}

	async count(query) {
		return this.find(query).count();
	}

	async exists(key, doc = {}) {
		doc[key] = { $exists: true };
		return await this.count(doc) > 0;
	}

	async delete(query) {
		if(!this.assert("write"))return;
		const { result } = await this.collection.deleteOne(query);
		return result.ok === 1;
	}

	assert(operation) {
		if(operation !== "write" || this.writeAllowed)return true;
		return false; 
	}
}