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

let HOST = '127.0.0.1'
let PORT = 1080

let client = new net.Socket()
client.connect(PORT, HOST, ()=>{
  console.log('connected to : ' + HOST+' '+PORT);
  down(455, 234)
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