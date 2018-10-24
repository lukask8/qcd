# Quick directory navigator

# Content
<!-- TOC -->

- [Quick directory navigator](#quick-directory-navigator)
- [Content](#content)
- [Intro](#intro)
    - [Run](#run)
    - [Live help](#live-help)
- [Getting Started](#getting-started)
    - [Download](#download)
    - [Install modules](#install-modules)
    - [Configure bash script](#configure-bash-script)
    - [Install an alias](#install-an-alias)
- [Dev notes](#dev-notes)

<!-- /TOC -->

# Intro

This is a visual colorized quick directory navigator for linux console.  Quickly change current working directory with a pretty gui.
Manage bookmarks for "quick jump".
Written in nodejs and blessedjs module. 

This is a POC "fullstack-everywhere" javascript programming. Nodejs + Blessedjs brings to you a powerful tool to make every complex console app you need without using perl/python/lua/tcltk and other stuff like this. 


## Run
Type "ccd" to quick change directory

    $ ccd
    
```
┌───────────────────────────────────────────────────────────────────────────────┐
│From dir     : /home/myh                                                       │
│Current exit : /home/myh                                                       │
│Next dir     : dev                                                             │
│                                                                               │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────┐┌───────────────────────────────────────────────┐
│..                            ││/home/myh                                      │
│.adobe                        ││/home/myh/Business                             │
│.arm                          ││/home/myh/xDrive/Income                        │
│.cache                        ││/home/myh/xDrive/Income/part                   │
│.config                       ││/home/myh/dev/js/node/cordova                  │
│.cordova                      ││/home/myh/Download                             │
│.eclipse                      ││/home/myh/Software                             │
│.fonts                        ││/home/myh/dev/java/server-side/projects        │
│dev                           ││                                               │
│documents                     ││                                               │
│data                          ││                                               │
│images                        ││                                               │
└──────────────────────────────┘└───────────────────────────────────────────────┘
                                                                                  
  [↵] chdir  [space] reset  [\] go HOME  [a-z] go to [SHIFT + H] help [ESC] exit                                                                       
```

## Live help

Type `SHIFT + H` to open/close help.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│From dir     : /home/myh                                                                               │
│Current exit : /home/myh                                                                               │
│Next dir ┌──────────────────────────────────────────────────────────────────────────────────┐          │
│         │Help                                                                              │          │
│         │                                                                                  │          │
│         │   [Enter]     -  to chdir                                                        │          │
└─────────│   [SPACE]     -  go back to the starting directory                               │──────────┘
┌─────────│   [PgUp]      -  Jump to Top directory                                           │──────────┐
│..       │   [PgDown]]   -  Jump to Bottom directory                                        │          │
│.adobe   │   [\]         -  go to HOME directory                                            │          │
│.arm     │   [a-z]       -  go to directory named ...                                       │          │
│.cache   │   [RIGHT]     -  add directory to bookmarks list                                 │          │
│.config  │   [SHIFT + X] -  remove directory from bookmarks list                            │          │
│.cordova │   [TAB]       -  jump to/from navigation/bookmarks list                          │          │
│.eclipse │   [SHIFT + H] -  Open/Close Help                                                 │          │
│.fonts   │   [ESC]       -  exit to current directory                                       │          │
│.eclipse │                                                                                  │          │
│.fonts   │                                                                                  │          │
│dev      │                                                                                  │          │
│documents│                                                                                  │          │
│data     │                                                                                  │          │
│images   │                                                                                  │          │
└─────────│                                                                                  │──────────┘
          └──────────────────────────────────────────────────────────────────────────────────┘
                                                                                                         
    [↵] chdir   [space] reset   [\] go HOME   [a-z] go to   [SHIFT + H] help   [ESC] exit
```


# Getting Started
## Download
Clone or download codes. Go to root directory (where app.js is).

    $ cd  /your/path/to/root-dir/

Example:

    ~/software/qcd
      + app.js
      + package.json
      + exitcwd.sh

## Install modules
Execute ```npm install``` to install required modules:

    $ npm install

## Configure bash script
Edit paths (first two llines) in "exitcwd.sh" if you need:

    $ nano exitcwd.sh

```
#!/bin/bash
QCD_PWD_FILE="/tmp/qcd.todelete"
/usr/bin/node ~/software/qcd/app.js "$QCD_PWD_FILE"
if  test -r "$QCD_PWD_FILE"; then
         QCD_PWD="`cat "$QCD_PWD_FILE"`"
         if test -n "$QCD_PWD" && test -d "$QCD_PWD"; then
                 cd "$QCD_PWD"
         fi
         unset QCD_PWD
fi
rm -f "$QCD_PWD_FILE"
unset QCD_PWD_FILE
```
Add an X attribute to execute script

	$ chmod +x exitcwd.sh
	
## Install an alias
Add an alias inside your ~/.bashrc or ~/.profile like:

	alias ccd='.  ~/software/qcd/exitcwd.sh'
 
Note: Open & close the terminal to active alias



# Dev notes
You can't change console CWD  because the nodejs process is executed as a child of bash process. You can't do this even if your code is written in cute C/C++. Bash need bash scripting.
You need to  "share"  selected  directory  info  that  lives  inside nodejs application back to console process in some way. 
One way is to put such info in a file and than execute a "cd" command.

Here are the steps you have to follow:

1. Create a "CD" script if not exist  `~/software/qcd/exitcwd.sh`



```
exitcwd.sh
==========
#!/bin/bash
QCD_PWD_FILE="/tmp/qcd.todelete"
/usr/bin/node ~/software/qcd/app.js "$QCD_PWD_FILE"
if  test -r "$QCD_PWD_FILE"; then
         QCD_PWD="`cat "$QCD_PWD_FILE"`"
         if test -n "$QCD_PWD" && test -d "$QCD_PWD"; then
                 cd "$QCD_PWD"
         fi
         unset QCD_PWD
 fi
 rm -f "$QCD_PWD_FILE"
 unset QCD_PWD_FILE
```
Add an *exec* attribute to execute script

	$ chmod +x exitcwd.sh

Once created you can't execute it because Shell scripts are run inside a subshell, and each subshell has its own concept of what the current directory is.
The only work around is to use an alias inside `.bashrc` or `.profile` :
 
	alias ccd='. ~/software/qcd/exitcwd.sh'
 

