const
	isBuiltin = require("is-builtin-module"),
	{ dependencies } = require("../package.json");
	
module.exports = (...mods) => {
	const fetched = [];
	for(let i = 0; i < mods.length; i++){
		const mod = mods[i],
			name = isBuiltin(mod) || dependencies[mod] ?
				mod :
				mod.startsWith("./") ? "." + mod : "./" + mod;

		fetched[i] = require(name);
	}
	return fetched;
};