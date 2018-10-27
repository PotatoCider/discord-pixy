const Command = require("../util/Command");

module.exports = class Play extends Command {
	constructor(self) {
		super({
			name: "soundboard",
			desc: "Plays a sound",
			usage: "<sound> [channel]",
			usages: [
				"<sound> [channel]",
				"add <sound name> <sound URL>",
				"remove/rm/delete <sound name>",
				"list"
			],
			requiresGuild: true,
			messageSplit: true,
			aliases: ["sound", "s"],
			utils: { ytdl: "ytdl-core" },
			self
		});
	}

	async run(msg, params, reply) {
		let sound = params.shift();
		if(!sound)reply.throw("No sound given.");
		let url;

		this.db.setCollection("sounds");
		if(sound === "add"){
			sound = params.shift();
			url = params.shift();
			if(!sound)reply.throw(`No sound name provided.`);
			if(!url)reply.throw(`No URL provided.`);

			await this.db.update({ name: sound }, { url });
			return reply.append(`Successfully added "${ sound }" to the soundboard.`);
		}else if(["remove", "rm", "delete"].includes(sound)) {

			const toRemove = params.shift();
			if(!toRemove)reply.throw("No sound name provided to delete.");

			const success = await this.db.delete({ name: toRemove });
			if(success)return reply.append(`Successfully deleted "${ toRemove }" from the soundboard.`);
			reply.throw(`There is no such sound "${ toRemove }" in the sound board to delete.`);

		}else if(sound === "list") {
			const sounds = await this.db.getAll();
			if(sounds.length === 0)return reply.append("There is no sounds in this soundboard.");
			reply.append("List of Sounds: ").disableNext().prefix(", ")
			for(let i = 0; i < sounds.length; i++) {
				reply.append(sounds[i].name);
			}
			return;
		}else if(this.utils.ytdl.validateURL(sound)) {
			url = sound;
		} else {
			const result = await this.db.get({ name: sound });
			if(!result)reply.throw(`No such sound called "${ sound }".`);
			url = result.url;
		}

		let vc = msg.member.voiceChannel;
		const player = msg.guild.player;
		if(player.connection && !vc) {
			const channel = params.join(" ");	
			if(!channel)return reply.throw(`Join or specify a channel: ~play ${ sound } <Channel>`);
			vc = msg.guild.channels.findAll("name", channel).filter(ch => ch.type === "voice")[0];
			if(!vc)return reply.throw(`Invalid channel.`);
		}
		if(!player.connection)await player.connect(vc);
		player.playSound(url);
		reply.append(`Played sound "${ sound }".`);
	}
}	