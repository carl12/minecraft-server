const { spawn, exec } = require('child_process');
const interval = 30000;
const startup = 10000;
const minutes = 10;
const emptyShutdown = 1000 * 60 * minutes;
let zeroStreak = 0;

const child = spawn('java -Xmx1024M -Xms1024M -jar server.jar nogui', [], { shell: true});
child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
  console.log(chunk);
  if (chunk.includes('[Server thread/INFO]: There are ')) {
    const players = Number(chunk.split(' ')[5]);
    zeroStreak = players === 0 ? zeroStreak + 1 : 0;
    if (zeroStreak > emptyShutdown / interval) {
      child.stdin.write('/stop\n');
      console.log(`No players found for ${minutes} minutes. Shutting down.`);
      setTimeout(() => {shutDown()}, 10000);
    }
  }
});
setTimeout(() => setInterval(() => {
  child.stdin.write('/list\n');
}, interval), startup);

let retries = 3;
function shutDown() {
  exec('sudo shutdown now', (error, stdout, stderr) => { 
    console.log(error, stdout, stderr);
  });
}
