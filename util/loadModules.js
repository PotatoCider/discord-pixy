const
	isBuiltin = require("is-builtin-module"),
	{ dependencies } = require("../package.json"),
	coreModules = Object.keys(dependencies);
	
module.exports = (...mods) => {
	const fetched = [];
	for(const mod of mods){
		const 
			isCore = isBuiltin(mod) || coreModules.includes(mod),
			name = isCore ? mod : require.resolve(mod.startsWith("./") ? `.${ mod }` : `./${ mod }`);
		fetched.push(require(name));
	}
	return fetched;
};