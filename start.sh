#!/bin/bash
cd /home/pi/projects/discord-pixy
echo "***** Bot Restarted *****" >> bot.log
node bot.js >> bot.log &
