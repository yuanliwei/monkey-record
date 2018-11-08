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
const exec = require('child_process').exec;

let HOST = '127.0.0.1'
let PORT = 1080
let TIMER = 0
let TRY_COUNT = 300
let client = null

exec('adb shell monkey --port 1080\n')
exec('adb forward tcp:1080 tcp:1080\n', ()=>{
  connect(()=>{
    for (var i = 0; i < 30; i++) {
      down(155, 234)
      move(555, 234)
      up(555, 234)
      sleep(500)
    }
    adbexec('quit')
  })
})

function tap(x, y) {
  client.write(`tap ${parseInt(x)} ${parseInt(y)}\n`)
}

function down(x, y) {
  client.write(`touch down ${parseInt(x)} ${parseInt(y)}\n`)
}

function move(x, y) {
  client.write(`touch move ${parseInt(x)} ${parseInt(y)}\n`)
}

function up(x, y) {
  client.write(`touch up ${parseInt(x)} ${parseInt(y)}\n`)
}
function sleep(time) {
  client.write(`sleep ${parseInt(time)}\n`)
}
function adbexec(command) {
  client.write(`${command}\n`)
}

function connect(callback) {
  client = new net.Socket()
  client.connect(PORT, HOST, ()=>{
    console.log('connected to : ' + HOST+' '+PORT);
    callback()
  })
  client.on('data', (data)=>{
    console.log('DATA:'+data);
  })
  client.on('close',()=>{
    console.log('connection closed!');
  })
  client.on('error', (data)=>{
    console.log('error:'+data);
    console.log('TRY_COUNT : '+TRY_COUNT);
    if (TRY_COUNT--<0) { return }
    clearTimeout(TIMER)
    TIMER = setTimeout(()=>{
      connect(callback)
    },300)
  })
}
