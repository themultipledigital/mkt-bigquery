const { spawnSync } = require('child_process');

function shellSetSecret(name, value) {
  const env = { ...process.env, CI: '1' };
  const cmd = `cmd /c "echo ${value} | npx --yes wrangler@latest secret put ${name}"`;
  const res = spawnSync(cmd, { shell: true, stdio: 'inherit', env });
  return res.status === 0;
}

function main() {
  let secrets;
  try {
    secrets = require('./cf-secrets.json');
  } catch (e) {
    console.error('cf-secrets.json not found or invalid.');
    process.exit(1);
  }
  const entries = Object.entries(secrets);
  let okCount = 0;
  for (const [name, value] of entries) {
    if (!name) continue;
    console.log(`Setting secret: ${name}`);
    const ok = shellSetSecret(name, String(value ?? ''));
    if (!ok) {
      console.error(`Failed setting secret: ${name}`);
      process.exit(1);
    }
    okCount++;
  }
  console.log(`Successfully set ${okCount} secrets.`);
}

main();


