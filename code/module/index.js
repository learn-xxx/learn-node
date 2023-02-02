// [
//   '/Volumes/Data/project/learn-node/code/module/node_modules',
//   '/Volumes/Data/project/learn-node/code/node_modules',
//   '/Volumes/Data/project/learn-node/node_modules',
//   '/Volumes/Data/project/node_modules',
//   '/Volumes/Data/node_modules',
//   '/Volumes/node_modules',
//   '/node_modules'
// ]
console.log(module.paths);

exports.add = (a, b) => a + b;

console.log(module)
// Module {
//   id: '.',
//   path: '/Volumes/Data/project/learn-node/code/module',
//   exports: { add: [Function (anonymous)] },
//   filename: '/Volumes/Data/project/learn-node/code/module/index.js',
//   loaded: false,
//   children: [],
//   paths: [
//     '/Volumes/Data/project/learn-node/code/module/node_modules',
//     '/Volumes/Data/project/learn-node/code/node_modules',
//     '/Volumes/Data/project/learn-node/node_modules',
//     '/Volumes/Data/project/node_modules',
//     '/Volumes/Data/node_modules',
//     '/Volumes/node_modules',
//     '/node_modules'
//   ]
// }

require.extensions['.ts'] = require.extensions['.json']

const json = require('./json.ts');
console.log(json)

console.log(require.extensions)
// [Object: null prototype] {
//   '.js': [Function (anonymous)],
//   '.json': [Function (anonymous)],
//   '.node': [Function (anonymous)],
//   '.ts': [Function (anonymous)]
// }

console.log(this)
