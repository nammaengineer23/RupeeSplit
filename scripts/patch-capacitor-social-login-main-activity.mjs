import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = path.resolve('android/app/src/main/java');

async function findMainActivity(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') return [];
    throw error;
  }

  const matches = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      matches.push(...await findMainActivity(fullPath));
    } else if (entry.isFile() && entry.name === 'MainActivity.java') {
      matches.push(fullPath);
    }
  }
  return matches;
}

const matches = await findMainActivity(sourceRoot);
if (matches.length !== 1) {
  throw new Error(`Expected exactly one generated MainActivity.java under ${sourceRoot}; found ${matches.length}.`);
}

const file = matches[0];
let source = await readFile(file, 'utf8');
const marker = 'ModifiedMainActivityForSocialLoginPlugin';

if (source.includes(marker) && source.includes('handleGoogleLoginIntent(requestCode, data)')) {
  console.log(`Social Login MainActivity callback is already configured: ${file}`);
  process.exit(0);
}

const imports = [
  'import android.content.Intent;',
  'import android.util.Log;',
  'import com.getcapacitor.Plugin;',
  'import com.getcapacitor.PluginHandle;',
  'import ee.forgr.capacitor.social.login.GoogleProvider;',
  'import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;',
  'import ee.forgr.capacitor.social.login.SocialLoginPlugin;',
];

const packageLine = source.match(/^package\s+[\w.]+\s*;\s*$/m);
if (!packageLine) throw new Error('Could not find Java package declaration in generated MainActivity.java.');

for (const statement of imports) {
  if (!source.includes(statement)) {
    source = source.replace(packageLine[0], `${packageLine[0]}\n\n${statement}`);
  }
}

const classPattern = /public\s+class\s+MainActivity\s+extends\s+BridgeActivity(?:\s+implements\s+[^\{]+)?\s*\{/;
const declaration = source.match(classPattern);
if (!declaration) {
  throw new Error('MainActivity class declaration differs from the expected Capacitor Java template; refusing to patch it unsafely.');
}
if (!declaration[0].includes(marker)) {
  const updatedDeclaration = declaration[0].replace(/\s*\{$/, ` implements ${marker} {`);
  source = source.replace(declaration[0], updatedDeclaration);
}

const callback = `
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode >= GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MIN
                && requestCode < GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MAX) {
            PluginHandle pluginHandle = getBridge().getPlugin("SocialLogin");
            if (pluginHandle == null) {
                Log.i("Google Activity Result", "SocialLogin login handle is null");
                return;
            }

            Plugin plugin = pluginHandle.getInstance();
            if (!(plugin instanceof SocialLoginPlugin)) {
                Log.i("Google Activity Result", "SocialLogin plugin instance is not SocialLoginPlugin");
                return;
            }

            ((SocialLoginPlugin) plugin).handleGoogleLoginIntent(requestCode, data);
        }
    }

    @Override
    public void IHaveModifiedTheMainActivityForTheUseWithSocialLoginPlugin() {}
`;

const finalBrace = source.lastIndexOf('}');
if (finalBrace < 0) throw new Error('Could not find the closing brace of MainActivity.');
source = source.slice(0, finalBrace) + callback + '\n' + source.slice(finalBrace);
await writeFile(file, source);
console.log(`Configured MainActivity to forward Google sign-in activity results: ${file}`);
