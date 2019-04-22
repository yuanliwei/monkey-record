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

let cmds = `

tap  1046 1189
sleep 300
tap  1025 955
sleep 300
tap  1028 1172
sleep 300
tap  1033 1413
sleep 300
touch up 1033 1622
sleep 300
touch down 1006 1412
sleep 300
touch up 1006 1412
sleep 300
tap  1029 1190
sleep 300
touch down 1009 940
sleep 300
touch move 1014 943
sleep 300
touch move 1010 942
sleep 300
touch up 1010 942
sleep 300
tap  1031 1171
sleep 300
tap  1035 1427
`

function runCommands() {
    cmds.split('\n').map((item) => {
        return item.trim()
    }).filter((item) => {
        return item.length > 0 && !item.trim().startsWith('//')
    }).forEach((item) => {
        adbexec(item)
    })
}

/// Connect ///

const net = require('net');
const exec = require('child_process').exec;

let HOST = '127.0.0.1'
let PORT = 1080
let TIMER = 0
let TRY_COUNT = 300
let client = null

exec(`adb shell monkey --port ${PORT}\n`)
exec(`adb forward tcp:${PORT} tcp:${PORT}\n`, () => {
    connect(() => {
        runCommands()
        adbexec('quit')
        setTimeout(() => {
            process.exit(0)
        }, 1000);
    })
})

function adbexec(command) {
    client.write(`${command}\n`)
}

function connect(callback) {
    client = new net.Socket()
    client.connect(PORT, HOST, () => {
        console.log('connected to : ' + HOST + ' ' + PORT);
        callback()
    })
    client.on('data', (data) => {
        // console.log('DATA:'+data);
    })
    client.on('close', () => {
        console.log('connection closed!');
        console.log('TRY_COUNT : ' + TRY_COUNT);
        adbexec('try')
    })
    client.on('error', (data) => {
        console.log('error:' + data);
        console.log('TRY_COUNT : ' + TRY_COUNT);
        if (TRY_COUNT-- < 0) { return }
        clearTimeout(TIMER)
        TIMER = setTimeout(() => {
            connect(callback)
        }, 300)
    })
}

