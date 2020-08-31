import path from 'path';
import minimist from 'minimist';
import { getPackages } from '@lerna/project';
import filterPackages from '@lerna/filter-packages';
import batchPackages from '@lerna/batch-packages';
import copy from 'rollup-plugin-copy';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

async function getSortedPackages(scope, ignore) {
  const packages = await getPackages(__dirname);
  const filtered = filterPackages(packages, scope, ignore, false);

  return batchPackages(filtered).reduce((arr, batch) => arr.concat(batch), []);
}

async function main() {
  const config = [];
  // Support --scope and --ignore globs if passed in via commandline
  const { scope, ignore } = minimist(process.argv.slice(2));
  const packages = await getSortedPackages(scope, ignore);
  packages.forEach(pkg => {
    /* Absolute path to package directory */
    const basePath = path.relative(__dirname, pkg.location);
    /* Absolute path to input file */
    const input = path.join(basePath, 'src/index.js');
    /* "main" field from package.json file. */
    const {
      exports: { import: esPath, require: cjsPath },
    } = pkg.toJSON();
    /* Push build config for this package. */
    config.push({
      input,
      output: [
        {
          sourcemap: true,
          file: path.join(basePath, cjsPath),
          format: 'cjs',
          plugins: [terser({ module: false, ecma: 2015, mangle: false })],
        },
        {
          sourcemap: true,
          file: path.join(basePath, esPath),
          format: 'es',
          plugins: [terser({ module: true, ecma: 2015, mangle: false })],
        },
      ],
      // all dependencies should be listed as external
      external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
      // copy the ts declaration file into the dist folder
      plugins: [
        copy({ targets: [{ src: path.join(basePath, 'src/index.d.ts'), dest: path.join(basePath, 'dist') }] }),
        babel({ babelHelpers: 'bundled' }),
      ],
    });
  });

  return config;
}

export default main();
