/*
解析 getevent 数据
adb shell getevent -l -t > events.txt

[  406222.918729] /dev/input/event0: EV_ABS       ABS_MT_POSITION_X    000002af
[  406222.918729] /dev/input/event0: EV_SYN       SYN_REPORT           00000000
[  406222.930951] /dev/input/event0: EV_ABS       ABS_MT_POSITION_X    000002ac
[  406222.930951] /dev/input/event0: EV_SYN       SYN_REPORT           00000000
[  406222.944407] /dev/input/event0: EV_ABS       ABS_MT_POSITION_X    000002a8
[  406222.944407] /dev/input/event0: EV_ABS       ABS_MT_POSITION_Y    00000509
[  406222.944407] /dev/input/event0: EV_SYN       SYN_REPORT           00000000
[  406222.957926] /dev/input/event0: EV_ABS       ABS_MT_POSITION_X    000002a4

*/

function getContent() {
  const fs = require('fs');
  return fs.readFileSync('C:/Users/y/Desktop/events.txt', 'UTF-16LE')
}

function getEvents(content) {
  let arr = content.split('\n').map((item)=>{
   return item.trim()
 }).filter((item)=>{
  return item && item.startsWith('[') && item.includes('/dev/input')
 })
 return arr
}

/*
'[  406284.815605] /dev/input/event0: EV_ABS       ABS_MT_POSITION_X    00000240',
  '406284.815605',
  '/dev/input/event0:',
  'EV_ABS',
  'ABS_MT_POSITION_X',
  '00000240',
*/
function parseEvents(events) {
  let evts = events.map((item)=>{
   let e = item.match(/\[ *(\d+\.\d+)\] ([^ ]+) ([^ ]+) +([^ ]+) +([^ ]+)$/)
   e[1] = parseFloat(e[1])
   if ((/^[\da-f]+$/).test(e[5])) {
     e[5] = parseInt(e[5], 16)
   }
   return e
  })
  let cmds = []
  let time = 0
  let x = 0, y = 0
  for (var i = 0; i < evts.length; i++) {
    let e = evts[i]
    let dt = (time==0)?0:(e[1]-time)
    dt = parseInt(dt*1000)
    // move
    if (e[4] == 'ABS_MT_POSITION_X') {
      i++
      let e2 = evts[i]
      if (dt) { cmds.push(`sleep ${dt}`) }
      x = e[5]
      y = e2[5]
      cmds.push(`touch move ${x} ${y}`)
      time = e[1]
      continue
    }

    if (e[4] == 'BTN_TOUCH') {
      if (e[5] == 'DOWN') {
        if (dt) { cmds.push(`sleep ${dt}`) }
        do {
          i++
          e = evts[i]
          if (e[4] == 'ABS_MT_POSITION_X') {
            x = e[5]
            i++
            e = evts[i]
            y = e[5]
            break;
          }
        } while (true);
        cmds.push(`touch down ${x} ${y}`)
        time = e[1]
        continue
      }
      if (e[5] == 'UP') {
        if (dt) { cmds.push(`sleep ${dt}`) }
        cmds.push(`touch up ${x} ${y}`)
        time = e[1]
        continue
      }
    }
    if (e[4] == 'KEY_HOMEPAGE') {
      if (e[5] == 'DOWN') {
        if (dt) { cmds.push(`sleep ${dt}`) }
        cmds.push(`touch down home`)
        time = e[1]
        continue
      }
      if (e[5] == 'UP') {
        if (dt) { cmds.push(`sleep ${dt}`) }
        cmds.push(`touch up home`)
        time = e[1]
        continue
      }
    }

    console.log(e.join(' '));
  }

  return cmds;
}

function start() {
  let content = getContent()
  let events = getEvents(content)
  events = parseEvents(events)
  console.log(events.join('\n'));
}

start()
