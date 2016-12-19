#!/bin/bash
git add .
git commit -m 'updated the bot to speak'
heroku git:remote -a violet-messenger-bot
git push heroku master
