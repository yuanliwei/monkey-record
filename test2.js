
function start() {
  // adb shell getevent -l -t > .git/events.txt
  const path = require('path');
  let file = path.join(__dirname, '.git/events.txt')
  const ParseCommand = require('./ParseCommand');
  let events = ParseCommand.getCommands(file)
  console.log(events.join('\n'));
}

start()
