/*
adb shell monkey --port 1080
adb forward tcp:1080 tcp:1080
telnet 127.0.0.1 1080

sleep 300
quit
done
type string
press keycode
tap x y
wake
flip [open|close]
trackball dx dy
touch [down|up] keycode

*/

const net = require('net');
const { execSync } = require('child_process');

let HOST = '127.0.0.1'
let PORT = 1080

execSync('adb shell monkey --port 1080\n')
execSync('adb forward tcp:1080 tcp:1080\n')
let client = new net.Socket()
client.connect(PORT, HOST, ()=>{
  console.log('connected to : ' + HOST+' '+PORT);
  for (var i = 0; i < 30; i++) {
    down(155, 234)
    up(555, 234)
    sleep(500)
  }
  adbexec('quit')
})
client.on('data', (data)=>{
  console.log('DATA:'+data);
})
client.on('close',()=>{
  console.log('connection closed!');
})

function tap(x, y) {
  client.write(`tap ${parseInt(x)} ${parseInt(y)}\n`)
}

function down(x, y) {
  client.write(`touch down ${parseInt(x)} ${parseInt(y)}\n`)
}

function up(x, y) {
  client.write(`touch move ${parseInt(x)} ${parseInt(y)}\n`)
  client.write(`touch up ${parseInt(x)} ${parseInt(y)}\n`)
}
function sleep(time) {
  client.write(`sleep ${parseInt(time)}\n`)
}
function adbexec(command) {
  client.write(`${command}\n`)
}
