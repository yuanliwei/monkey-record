/*
解析 getevent 数据
adb shell getevent -l -t > events.txt

*/

function injectEvents(events) {
  const net = require('net');
  const exec = require('child_process').exec;

  let HOST = '127.0.0.1'
  let PORT = 1080

  exec('adb shell monkey --port 1080\n')
  let client = new net.Socket()
  exec('adb forward tcp:1080 tcp:1080\n', () => {
    client.connect(PORT, HOST, () => {
      console.log('connected to : ' + HOST + ' ' + PORT);
      events.forEach((item) => {
        adbexec(item)
      })
      adbexec('quit')
    })
  })
  client.on('data', (data) => {
    console.log('DATA:' + data);
  })
  client.on('close', () => {
    console.log('connection closed!');
  })

  function adbexec(command) {
    client.write(`${command}\n`)
  }
}

function start() {
  const ParseCommand = require('./ParseCommand');
  let events = ParseCommand.getCommands()
  console.log(events.join('\n'));
  injectEvents(events)
  console.log('over!');
}

start()
