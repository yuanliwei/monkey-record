# monkey-record
android 使用 monkey 模拟快速点击，事件录制回放功能。

> https://android.googlesource.com/platform/development/+/master/cmds/monkey/README.NETWORK.txt

> SIMPLE PROTOCOL FOR AUTOMATED NETWORK CONTROL<br>
> The Simple Protocol for Automated Network<br> Control was designed to be a
> low-level way to programmability inject<br> KeyEvents and MotionEvents
> into the input system.  The idea is that a<br> process will run on a host
> computer that will support higher-level<br> operations (like conditionals,
> etc.) and will talk (via TCP over ADB) to the<br> device in Simple
> Protocol for Automated Network Control.  For<br> security reasons, the
> Monkey only binds to localhost, so you will<br> need to use adb to setup
> port forwarding to actually talk to the device.<br>
