const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const crawler = require('simplecrawler');
const exec = require('child_process').execSync;
const spawn = require('child_process').spawn;

const destination = process.env.DESTINATION || './build';
const npm = process.env.NPM_EXECPATH || 'npm';
const npmScript = process.env.NPM_SCRIPT || 'start';

// clear destination
exec('rm -rf ' + destination);
// obtain latest next build ID
const buildId = fs.readFileSync('./.next/BUILD_ID');
// ensure build bundles destination exists
mkdirp.sync(destination + '/_next/' + buildId);
// copy all build bundles to destination
console.log('> copying bundle files...');
exec('cp -R ./.next/bundles/* ' + destination + '/_next/' + buildId);

function renameFilesRecursive(dir, from, to) {
  fs.readdirSync(dir).forEach(it => {
    const itsPath = path.resolve(dir, it);
    const itsStat = fs.statSync(itsPath);

    if (itsStat.isDirectory()) {
      renameFilesRecursive(itsPath, from, to);
      return;
    }

    if (itsPath.search(from) !== -1) {
      fs.renameSync(itsPath, itsPath.replace(from, to))
    }
  });
}

// HACK: rename bundle files to fool the static server
// into loading them without their file extension
renameFilesRecursive(destination + '/_next', /\.json$/, '.html');

console.log('> starting Next.js server...');
const nextStart = spawn(npm, ['run', npmScript], {detached: true});
let firstFileFound = false;

nextStart.stdout.on('data', function () {
  const port = process.env.PORT || 3000;
  let host = process.env.HOST || 'http://localhost';
  host = host + ':' + port;

  const c = new crawler(host);
  c.on("fetchcomplete", function(queueItem, responseBuffer, response) {
    !firstFileFound && console.log('> crawling Next.js server...');
    !firstFileFound && (firstFileFound = true);

    // prepare file/directory names
    let filename = original = queueItem.url.replace(host, '');
    let dir = filename;

    if (filename.endsWith('/')) {
      filename += 'index.html';
    } else {
      dir = filename.split('/').slice(0, -1).join('/');
    }

    // ensure destination directory exists
    mkdirp.sync(destination + dir);

    fs.writeFileSync(destination + filename, responseBuffer);
    console.log('Saved "' + original + '" as "' + destination + filename + '"');
  });
  c.on("complete", function () {
    // this event can fire a few times before the crawler even starts
    if (!firstFileFound) {
      return;
    }

    // kill of child process.
    // ensures children of children are killed with the `-` prefix
    process.kill(-nextStart.pid);
    process.exit();
  });
  c.start();
});
