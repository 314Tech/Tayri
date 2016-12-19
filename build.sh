#!/bin/bash
git add .
git commit -m 'new update'
heroku git:remote -a tayri
git push heroku master
