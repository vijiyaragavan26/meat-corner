const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function build() {
  const entryPath = path.join(__dirname, 'src/serverless_entry.ts');
  fs.writeFileSync(entryPath, `import app from './server';\nmodule.exports = app;\n`);

  await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: path.join(__dirname, '../frontend/api/index.cjs'),
  });

  if (fs.existsSync(entryPath)) {
    fs.unlinkSync(entryPath);
  }
  console.log('✅ Serverless function bundled as CJS to frontend/api/index.cjs');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
