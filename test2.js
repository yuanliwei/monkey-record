
function start() {
  // adb shell getevent -l -t > events.txt
  let file = 'C:/Users/y/Desktop/events.txt'
  const ParseCommand = require('./ParseCommand');
  let events = ParseCommand.getCommands(file)
  console.log(events.join('\n'));
}

start()
