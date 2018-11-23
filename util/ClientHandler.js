module.exports = class ClientHandler {
	constructor(self, event, once = false) {
		this.self = self;
		this.event = event;
		this.once = once;
		this.listener = (...args) => this.handle(...args);

		self.handlers[event] = this;
		if(once) {
			self.client.once(event, this.listener);
		} else {
			self.client.on(event, this.listener);
		}
	}

	handle() {
		console.warn("No event handler assigned to this class.");
	}

	remove() {
		return client.removeListener(this.listener);
	}
}