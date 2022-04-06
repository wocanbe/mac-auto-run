# mac-auto-start
A tool to scan app which run at startup.

## intro

Scan the plist files which has `keepAlive`,`RunAtLoad`,`SuccessfulExit`,`OnDemand` attribute,Print the path of these files.You can edit these files to forbid autorun.If you don't know plist files well, I suggest you only modify the `RunAtLoad` attribute to `false`

## Planning

Collect more software startup features to forbid autorun of unfriendly apps.This needs your help. If you have any questions, please leave a message. I will deal and update them to the tool.