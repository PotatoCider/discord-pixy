#!/bin/bash
cd $PWD

echo "***** Bot Restarted *****" >> bot.log
node bot.js >> bot.log &
