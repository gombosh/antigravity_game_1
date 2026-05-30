/**
 * Nature Guardians - Stanadlone Bundler and AES-GCM Encryptor
 * Combines index.html, style.css, and js/*.js files into a single standalone HTML game pack,
 * and encrypts it using AES-256-GCM with the Master Key.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configurations
const masterKeyText = 'smileSuccessMaster2026!'; // Default Master Key
const outputDir = path.join(__dirname, 'games');
const outputFile = path.join(outputDir, 'game1.crypt.txt');

// 1. Load raw file assets
console.log('Loading raw assets...');
const rawHTML = fs.readFileSync(path.join(__dirname, 'backup_game1.html'), 'utf8');
const rawCSS = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const rawAudioJS = fs.readFileSync(path.join(__dirname, 'js', 'audio.js'), 'utf8');
const rawParticlesJS = fs.readFileSync(path.join(__dirname, 'js', 'particles.js'), 'utf8');
const rawGameJS = fs.readFileSync(path.join(__dirname, 'js', 'game.js'), 'utf8');

// 2. Assemble standalone HTML bundle
console.log('Assembling standalone bundle...');
let standaloneHTML = rawHTML;

// Replace stylesheet link with style tag containing raw CSS
const stylesheetLinkPattern = /<link rel="stylesheet" href="style\.css">/g;
standaloneHTML = standaloneHTML.replace(stylesheetLinkPattern, `<style>\n${rawCSS}\n</style>`);

// Replace external script tags at the bottom with raw script content tags
const scriptsPattern = /<script src="js\/audio\.js"><\/script>\s*<script src="js\/particles\.js"><\/script>\s*<script src="js\/game\.js"><\/script>/g;
const scriptTagsReplacement = `
<script>
${rawAudioJS}
</script>
<script>
${rawParticlesJS}
</script>
<script>
${rawGameJS}
</script>
`;

standaloneHTML = standaloneHTML.replace(scriptsPattern, scriptTagsReplacement);

// backup_game1.html is now the source, so we do not overwrite it!


// 3. Encrypt standalone HTML using AES-256-GCM
console.log('Encrypting bundle using AES-256-GCM...');
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);

// Hash the master key with SHA-256 to get a 32-byte AES key
const key = crypto.createHash('sha256').update(masterKeyText).digest();

const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
let ciphertext = cipher.update(standaloneHTML, 'utf8', 'hex');
ciphertext += cipher.final('hex');

// Retrieve GCM authentication tag and append to ciphertext
const authTag = cipher.getAuthTag();
const finalCiphertext = ciphertext + authTag.toString('hex');

const finalPayload = {
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    ciphertext: finalCiphertext
};

// 4. Save encrypted text
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

fs.writeFileSync(outputFile, JSON.stringify(finalPayload), 'utf8');
console.log(`Successfully compiled and encrypted game! Saved to: ${outputFile}`);
console.log(`Total encrypted payload size: ${Math.round(JSON.stringify(finalPayload).length / 1024)} KB`);
