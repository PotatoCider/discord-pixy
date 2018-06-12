const Constants = require("./Constants");
let self;

module.exports = class Helpers {
	constructor(s) {
		self = s;
	}

	fetchUser(id) {
		id = this.resolveMention(id, "user") || id;
		if(!id || isNaN(id))return Promise.resolve(null);
		return self.client.fetchUser(id);
	}

	fetchMember(id, guild) {
		return this.fetchUser(id).then(user => user && guild.fetchMember(user))
	}

	resolveMention(mention, type) {
		const pattern = Constants.patterns[type];
		if(!pattern)throw new Error("Invalid pattern type.");
		const match = mention.match(pattern);
		return match && match[1];
	}

	awaitMessage(channel, filter, time = 15000) {
		channel = channel.channel || channel;
		const collector = channel.createMessageCollector(filter, { time });
		return collector.next.catch(err => {
			if(err instanceof Error)throw err;
			return null;
		});
	}

	isAdmin(user) {
		if(typeof user !== "string")user = user.id;
		return Constants.owners.includes(user);
	}
}