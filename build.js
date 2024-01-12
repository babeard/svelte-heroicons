import * as fs from 'fs/promises';
import { generateFromFolder } from 'svg-to-svelte';
import PackageJson from '@npmcli/package-json';

const options = {
	clean: true
};

const exprts = {
	'.': {
		types: './dist/index.d.ts',
		svelte: './dist/index.js'
	},
	'./micro': './dist/micro/index.js',
	'./mini': './dist/mini/index.js',
	'./outline': './dist/outline/index.js',
	'./solid': './dist/solid/index.js'
};

async function generateType(sourceFolder, type) {
	await generateFromFolder(`node_modules/heroicons/${sourceFolder}`, `src/lib/${type}`, {
		...options,
		onModuleName(name) {
			exprts[`./${type}/${name}`] = `./dist/${type}/${name}/index.js`;
			return name;
		}
	});

	let index = await fs.readFile(`src/lib/${type}/index.js`, { encoding: 'utf-8' });
	index = index
		.replace(/export { (\w+) }/g, 'export { $1 as $1Icon }')
		.replace(/from ".\/(\w+)";/g, 'from "./$1/index.js";');
	await fs.writeFile(`src/lib/${type}/index.js`, index);
}

async function updatePackageJsonExports() {
	const pkg = await PackageJson.load('./');

	pkg.update({
		exports: {
			...exprts
		}
	});

	await pkg.save();
}

async function build() {
	await generateType('16/solid', 'micro');
	await generateType('20/solid', 'mini');
	await generateType('24/solid', 'solid');
	await generateType('24/outline', 'outline');
	await updatePackageJsonExports();
}

build();
