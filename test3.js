/*
解析 getevent 数据
adb shell getevent -l -t > .git/events.txt

*/

function injectEvents(events) {
  const net = require('net');
  const exec = require('child_process').exec;

  let HOST = '127.0.0.1'
  let PORT = 1080
  let TIMER = 0
  let TRY_COUNT = 300
  let client = null

  exec('adb shell monkey --port 1080\n')
  exec('adb forward tcp:1080 tcp:1080\n', () => {
    connect(() => {
      for (var i = 0; i < 1; i++) {
        events.forEach((item) => {
          adbexec(item)
        })
      }
      adbexec('quit')
    })
  })

  function adbexec(command) {
    client.write(`${command}\n`)
  }

  function connect(callback) {
    client = new net.Socket()
    client.on('data', (data) => {
      console.log('DATA:' + data);
    })
    client.on('close', () => {
      console.log('connection closed!');
    })
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
}


function start() {
  // adb shell getevent -l -t > .git/events.txt
  const path = require('path');
  let file = path.join(__dirname, '.git/events.txt')
  const ParseCommand = require('./ParseCommand');
  let events = ParseCommand.getCommands(file)
  console.log(events.join('\n'));
  injectEvents(events)
  console.log('over!');
}

start()
