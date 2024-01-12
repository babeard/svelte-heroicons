import * as fs from 'fs/promises';
import { generateFromFolder } from 'svg-to-svelte';

const options = {
	clean: true
};

async function generateType(sourceFolder, type) {
	await generateFromFolder(`node_modules/heroicons/${sourceFolder}`, `src/lib/${type}`, options);

	let index = await fs.readFile(`src/lib/${type}/index.js`, { encoding: 'utf-8' });
	index = index
		.replace(/export { (\w+) }/g, 'export { $1 as $1Icon }')
		.replace(/from ".\/(\w+)";/g, 'from "./$1/index.js";');
	await fs.writeFile(`src/lib/${type}/index.js`, index);
}

async function build() {
	await generateType('16/solid', 'micro');
	await generateType('20/solid', 'mini');
	await generateType('24/solid', 'solid');
	await generateType('24/outline', 'outline');
}

build();
