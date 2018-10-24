#!/bin/bash
# A sample Bash script to change dir
# Edit path to point to your nodejs instance
# Edit path to app.js file
# If you need change PWD file even if it is deleted every time

QCD_PWD_FILE="/tmp/qcd.todelete"
/usr/bin/node /home/myh/software/qcd/app.js "$QCD_PWD_FILE"
if test -r "$QCD_PWD_FILE"; then
         QCD_PWD="`cat "$QCD_PWD_FILE"`"
         if test -n "$QCD_PWD" && test -d "$QCD_PWD"; then
                 cd "$QCD_PWD"
         fi
         unset QCD_PWD
fi
rm -f "$QCD_PWD_FILE"
unset QCD_PWD_FILE
