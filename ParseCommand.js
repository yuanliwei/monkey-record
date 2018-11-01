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

function getContent(file) {
  const fs = require('fs');
  return fs.readFileSync(file, 'UTF-16LE')
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
  return evts
}

/*
'[  187501.878712] /dev/input/event5: EV_ABS       ABS_MT_POSITION_Y    000005a4',
187501.878712,
'/dev/input/event5:',
'EV_ABS',
'ABS_MT_POSITION_Y',
1444,
*/
function groupEvents(events) {
  let arr = []
  let pack = []
  let lastTime = 0
  arr.push(pack)
  for (var i = 0; i < events.length; i++) {
    let e = events[i]
    if (lastTime == 0) {
      lastTime = e[1]
    }
    if (lastTime != e[1]) {
      lastTime = e[1]
      pack = []
      arr.push(pack)
    }
    pack.push(e)
  }
  console.log('pack.length : '+pack.length);
  return arr
}

function getPackMap(pack) {
  let map = {}
  pack.forEach((item)=>{
    map[item[4]] = item[5]
  })
  return map
}

function cmpModel(pack, string) {
  let m = pack.map((item)=>{
    return item[4].trim()
  }).join('\n')
  let models = string.split('-').filter((item)=>{
    return item && item.trim().length
  }).map((item)=>{
    return item.split('\n').filter((item)=>{
      return item && item.trim().length
    }).map((item)=>{
      return item.trim()
    }).join('\n')
  })
  let s = models.includes(m)
  debugger
  return s
}

function toCommands(evts) {
  let cmds = []
  let time = 0
  let x = 0, y = 0
  for (var i = 0; i < evts.length; i++) {
    let pack = evts[i]
    let map = getPackMap(pack)
    let e = pack[0]
    let dt = (time==0)?0:(e[1]-time)
    dt = parseInt(dt*1000)
    let x_ = map['ABS_MT_POSITION_X']
    let y_ = map['ABS_MT_POSITION_Y']
    if (x_ != void(0)) { x = x_ }
    if (y_ != void(0)) { y = y_ }
    // move
    if (cmpModel(pack, `
      ABS_MT_POSITION_X
      ABS_MT_POSITION_Y
      ABS_MT_TOUCH_MAJOR
      ABS_MT_PRESSURE
      SYN_REPORT
      -
      ABS_MT_POSITION_X
      ABS_MT_POSITION_Y
      SYN_REPORT
      -
      ABS_MT_POSITION_X
      SYN_REPORT
      -
      ABS_MT_POSITION_Y
      SYN_REPORT
      -
      ABS_MT_POSITION_Y
      ABS_MT_TOUCH_MAJOR
      ABS_MT_PRESSURE
      SYN_REPORT
      -
      ABS_MT_POSITION_X
      ABS_MT_TOUCH_MAJOR
      ABS_MT_PRESSURE
      SYN_REPORT
      `)) {
      if (dt) { cmds.push(`sleep ${dt}`) }
      cmds.push(`touch move ${x} ${y}`)
      time = e[1]
      continue
    }
    // touch
    if (cmpModel(pack, `
      BTN_TOUCH
      BTN_TOOL_FINGER
      ABS_MT_TRACKING_ID
      ABS_MT_POSITION_X
      ABS_MT_POSITION_Y
      ABS_MT_TOUCH_MAJOR
      ABS_MT_PRESSURE
      SYN_REPORT
      -
      ABS_MT_TRACKING_ID
      BTN_TOUCH
      BTN_TOOL_FINGER
      SYN_REPORT
      -
      BTN_TOUCH
      BTN_TOOL_FINGER
      ABS_MT_TRACKING_ID
      SYN_REPORT
      -
      BTN_TOUCH
      BTN_TOOL_FINGER
      ABS_MT_TRACKING_ID
      ABS_MT_POSITION_X
      ABS_MT_POSITION_Y
      SYN_REPORT
      `)) {
        let i = 1
        while (e[4] != 'BTN_TOUCH') { e = pack[i++] }
      if (e[5] == 'DOWN') {
        if (dt) { cmds.push(`sleep ${dt}`) }
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
      console.log('e[5] = '+e[5]+'  =  '+e);
      console.error('bad pack:\n'+pack.map((item)=>{
        return item[0].trim()
      }).join('\n')+'\n\n\n');
      continue
    }
    console.log('e[5] = '+e[5]+'  =  '+e);
    console.log('bad pack:\n'+pack.map((item)=>{
      return item[0].trim()
    }).join('\n')+'\n\n\n');

  //   if (e[4] == 'KEY_HOMEPAGE') {
  //     if (e[5] == 'DOWN') {
  //       if (dt) { cmds.push(`sleep ${dt}`) }
  //       cmds.push(`touch down home`)
  //       time = e[1]
  //       continue
  //     }
  //     if (e[5] == 'UP') {
  //       if (dt) { cmds.push(`sleep ${dt}`) }
  //       cmds.push(`touch up home`)
  //       time = e[1]
  //       continue
  //     }
  //   }
  //
  //   console.log(e.join(' '));
  }

  return cmds;
}

function start() {
  let content = getContent()
  let events = getEvents(content)
  events = parseEvents(events)
  events = groupEvents(events)
  events = toCommands(events)
  console.log(events);
  // console.log(events.join('\n'));
}

function zipCommands(events) {
  let cmds = []
  for (var i = 0; i < events.length; i++) {
    let e = events[i]
    if (e.startsWith('touch down')) {
      if (events[i+2]&&events[i+2].startsWith('touch up')) {
        let pos1 = e.replace('touch down','')
        let time = parseInt(events[i+1].replace('sleep',''))
        let pos2 = events[i+2].replace('touch up','')
        if (pos1 == pos2 && time < 100) {
          cmds.push(`tap ${pos1}`)
          i+=2
          continue
        }
      }
    }
    cmds.push(e)
  }
  return cmds
}

function getCommands(file) {
  let content = getContent(file)
  let events = getEvents(content)
  events = parseEvents(events)
  events = groupEvents(events)
  events = toCommands(events)
  events = zipCommands(events)
  return events
}

exports.getCommands = getCommands
