# Screenshot Plugin for GLPI
Take a screenshot directly from GLPI and attach it to a ticket, change or problem. Only works from the timeline for now.

This plugin relies on some WebRTC features that are only available on a few browsers (Some features are still a working draft and not implemented into the W3C standard). It works on Chrome and should work on all other Chromium-based browsers (new Edge, Brave, etc), but doesn't work properly on Firefox.

Additionally, browsers only expose this feature when it is being used over HTTPS (or running over localhost). If your GLPI server doesn't use HTTPS yet, this plugin will not work.

![Preview](https://raw.githubusercontent.com/cconard96/glpi-screenshot-plugin/master/Screenshot%20Plugin%20Preview.gif)