
function start() {
  const ParseCommand = require('./ParseCommand');
  let events = ParseCommand.getCommands()
  console.log(events);
  // console.log(events.join('\n'));
}

start()
