/*******************************************************************************
 * A simple "change directory" for bash console with a prety GUI.
 * 
 * Todo
 * - Optimize code
 * - history, quick jump to previous exit directories
 * - reset history
 * - show/hide files after dirs
 * - show/hide size on ALT+Enter
 * - a setup script
 * 
 * Working on
 * - Update README.md
 *
 * Version 0.6
 * - delete bookmark
 * - fix mouse bug on bookmark list
 * - change box border on focus
 * - Full help messages + fix
 * - load/save bookmarks on JSON file
 * - bookmark box
 * - "use strict" for ES6 compliance
 * - Add a README.md first version
 * - bookmark, quick jump to a bookmark previous saved work
 *
 * Version 0.5
 * - quick jump on the other occurrances of typed char
 * - quick jump on the first occurrance of typed char
 * - [h] or [\] to jump to HOME (~)
 * - list sort
 * 
 * Version 0.4
 * - first usable release
 * - More JSDoc addendum
 * - pageup/pagedown/reset to quick go to
 * 
 * Version 0.1
 * - Proof of concept
 * 
 * A note for developers
 * You can't change console CWD  because  the nodejs process is executed as a
 * child of bash process.
 * You need to  "share"  selected  directory  info  that  lives  inside nodejs
 * application back to console process in some way. You need to put such info in
 * a file for example, then execute a "cd" command.
 *
 * Here are the steps you have to follow:
 */ 

 //
 // Create a "CD" script if not exist  ~/.config/myscript/exitcwd.sh
 //
 // $ cd .config
 // $ mkdir myscript
 // 
 //
 //  exitcwd.sh
 //  =====
 //  #!/bin/bash
 // # A sample Bash script to change dir
 // # Edit path to point to your nodejs instance and app.js file
 //
 //  MC_PWD_FILE="/tmp/qcd.todelete"
 //  /usr/bin/node /home/jhon/software/qcd/app.js "$MC_PWD_FILE"
 //  
 //  if test -r "$MC_PWD_FILE"; then
 //         MC_PWD="`cat "$MC_PWD_FILE"`"
 //         if test -n "$MC_PWD" && test -d "$MC_PWD"; then
 //                 cd "$MC_PWD"
 //         fi
 //         unset MC_PWD
 //  fi
 //  
 //  rm -f "$MC_PWD_FILE"
 //  unset MC_PWD_FILE
 //  ======
 //
 // $ chmod +x exitcwd.sh
 // 
 // Once created you can't execute it because Shell scripts are run inside a
 // subshell, and each subshell has its own concept of what the current
 // directory is.
 // The only work around is to use an alias inside .bashrc or .profile :
 // 
 // alias ccd='. ~/.config/myscript/exitcwd.sh'
 // 
 //
 

// Enable strict mode everytime you can
 'use strict'


/*******************************************************************************
 *  Required modules
 ******************************************************************************/
const fs      = require('fs');
const blessed = require('blessed');

/*******************************************************************************
 *  Globals
 ******************************************************************************/
var path_start;                         // path iniziale
var path_current;                       // path attuale
var list_current_item;                  // list_current_item.content is the select item (next path)
var list_current_index          = 0;    // current list_current_item index
var path_current_files_list     = [];   // current files list
var path_current_directory_list = [];   // current directory list

var help_short_line_text = "";          // short help
var help_full_text = "";                // full help

// Global const
const console_output_file ="/tmp/qcd.todelete";            // print currnet path to this file
const bookmarks_output_file =__filename + ".books.json";    // save bookmarks


/*******************************************************************************
 *  Functions
 ******************************************************************************/


/**
 * Read all directories in the current_path
 * Add ".." root dir as first item
 * Sort list
 * @param {*} current_path 
 * @returns sorted directories list plus a ".." 
 */
function parseDirectory (current_path) {
  var output = [".."];
  fs.readdirSync(current_path).forEach(file => {
    if (fs.lstatSync(file).isDirectory()) {
      output.push(file);
    }
  })
  return output.sort();
}

/**
 * Read all files in the current_path
 * 
 * @param {*} current_path 
 * @returns sorted files list
 */
function parseFiles(current_path) {
  var output = [];
  fs.readdirSync(current_path).forEach(file => {
    if (fs.lstatSync(file).isFile()) {
      output.push(file);
    }
  })
  return output.sort();
}

/**
 * Update info box. You need to call a screen.render() to take effect.
 * 
 * @param {string} start - path_start
 * @param {string} current - path_current
 * @param {string} next - next path to go to
 * 
 */
function updateTextInfo(start,current,next){
    text_info.setLine(0,'From dir     : {bold}' + start +'{/bold}');
    text_info.setLine(1,'Current exit : {bold}' + current +'{/bold}');
    text_info.setLine(2,'Next dir     : {bold}' + next +'{/bold}');
}

/*******************************************************************************
 *  Main
 ******************************************************************************/

// store initial root directory 
// note:
// __dirname is your "app.js" directory, where the script is
// process.cwd() is where nodejs is executed, or actual console directory
path_start = process.cwd();
path_current = path_start;
path_current_directory_list = parseDirectory(path_start);
path_current_files_list = parseFiles(path_start);


// Create a screen object.
var screen = blessed.screen({
    smartCSR: true,
    style   : {
        fg  : 'white',
        bg  : 'black'
    }
});
  
// Titolo
screen.title = 'Change dir';

// Main navigation list
// to get the focus element use : var item = list.ritems[list.selected]
var list = blessed.list({
    parent  : screen,
    mouse   : true,
    keys    : true,
    top     : '30%',
    left    : '0%',
    width   : '40%',
    height  : '60%',
    tags    : true,
    border  : {
      type  : 'line'
    },
    style   : {
      fg    : 'white',
      bg    : 'black',
      border: {
        fg  : '#f0f0f0'
      }
    }
  });


// Main bookmark list
var bookmark_list = blessed.list({
    parent  : screen,
    mouse   : true,
    keys    : true,
    top     : '30%',
    left    : '40%',
    width   : '60%',
    height  : '60%',
    tags    : true,
    border  : {
      type  : 'line'
    },
    style   : {
      fg    : 'white',
      bg    : 'black',
      border: {
        fg  : '#f0f0f0'
      }
    }
  });


// Text box for info 
var text_info = blessed.text({
    parent    : screen,
    top       : '0%',
    left      : '0%',
    width     : '100%',
    height    : '30%',
    tags      : true,
    border    : {
        type  : 'line'
    },
    style     : {
        fg    : 'white',
        bg    : 'black',
        border: {
          fg  : '#f0f0f0'
        }
    }    
})


// Use this for every message like log/error/info
var alert_message = blessed.message({
  parent  : screen,
  height  : "shrink",
  width   : "50%",
  top     : 'center',
  left    : 'center',
  border  : {
    type  : 'line'
  },
  style   : {
    fg    : 'white',
    bg    : 'black',
    border: {
      fg  : '#f0f0f0'
    }
  }
});

// An help bar
var help_line = blessed.text({
  parent  : screen,
  tags    : true,
  top     : "90%",
  left    : "0%",
  align   : "right",
  width   : "100%",
  height  : "shrink",
  border  : {
    type  : 'bg'
  },
  style   : {
    fg    : 'white',
    bg    : 'black',
    border: {
      fg  : '#f0f0f0'
    }
  }
})

// An helper box
var help_box = blessed.box({
    align       : "left",
    //alwaysScroll: true,
    tags        : true,
    top         : "center",
    left        : "center",
    height      : "80%",
    width       : "80%",
    border      : {
        type    : 'line'
    },
    style       : {
        fg      : 'white',
        bg      : 'black',
        border  : {
          fg    : '#f0f0f0'
        }
    }    
})



// init help line
help_short_line_text = '   {green-fg}[↵]{/} chdir'
                     + '   {green-fg}[space]{/} reset'
                     + '   {green-fg}[\\]{/} go HOME'
                     + '   {green-fg}[a-z]{/} go to'
                     + '   {green-fg}[SHIFT + H]{/} help'
                     + '   {green-fg}[ESC]{/} exit';
help_line.setContent(help_short_line_text);

// init full help text box
help_full_text = '{bold}Help{/}\n\n' + 
                 '   {green-fg}[Enter]{/}     -  to chdir\n' +
                 '   {green-fg}[SPACE]{/}     -  go back to the starting directory\n' +
                 '   {green-fg}[PgUp]{/}      -  Jump to Top directory\n' +
                 '   {green-fg}[PgDown]]{/}   -  Jump to Bottom directory\n' +
                 '   {green-fg}[\\]{/}         -  go to HOME directory \n' +
                 '   {green-fg}[a-z]{/}       -  go to directory named ...\n' +
                 '   {green-fg}[RIGHT]{/}     -  add directory to bookmarks list\n' +
                 '   {green-fg}[SHIFT + X]{/}     -  remove directory from bookmarks list\n' +
                 '   {green-fg}[TAB]{/}       -  jump to/from navigation/bookmarks list\n' +
                 '   {green-fg}[SHIFT + H]{/} -  Open/Close Help\n' +
                 '   {green-fg}[ESC]{/}       -  exit to current directory';
help_box.setContent(help_full_text);
help_box.hide();

// init alert box
alert_message.hide();

// init text info
updateTextInfo(path_start,path_current,path_current_directory_list[0]);

// init global vars
list_current_index = 0;
list_current_item = {"content": path_current_directory_list[0]};

// init list
path_current_directory_list.forEach( item => {
    list.add(item);
})

// init bookmark_list from files
JSON.parse(fs.readFileSync(bookmarks_output_file)).forEach( item => {
    bookmark_list.add(item);
});

// Append our boxes to the screen.
// Last added element is on the top. 
// "alert_message" is last box so it's rendered over every thing
screen.append(text_info);
screen.append(help_line);
screen.append(list);
screen.append(bookmark_list);
screen.append(alert_message);
screen.append(help_box);


/*******************************************************************************
 * Events
 */

/**
 *  Change border color on focus
 */
list.on("focus", () => {
    list.style.border.fg = '#00ff00';
    bookmark_list.style.border.fg = '#f0f0f0';
    screen.render();
})

bookmark_list.on("focus", () => {
    list.style.border.fg = '#f0f0f0';
    bookmark_list.style.border.fg = '#00ff00';
    screen.render();
})

/**
 * ON select (focus on item) show me current item
 * This is executed after parent's events
 */
list.on("select item", function(item, index){
    list_current_item = item;
    list_current_index = index;
    updateTextInfo(path_start,path_current,list_current_item.content)
    //typed_char_old = "";
    screen.render();
})

/**
 * ON Selected ("double clicked" or "enter")
 * This is executed after parent's events
 */
list.on("select", function(item, index){
    list_current_item = item;
    list_current_index = index;
    //typed_char_old = "";
    // change working directory
    try {
        // chdir
        process.chdir(list_current_item.content);
        // update path_current
        path_current = process.cwd();
        // read new directory
        path_current_directory_list = parseDirectory(path_current);
        // init list
        list.clearItems();
        path_current_directory_list.forEach(function(item){
            list.add(item);
        })
        updateTextInfo(path_start,path_current,list_current_item.content)
    }
    catch (err) {
        alert_message.error('No permission to enter directory',2,() => {
            list.focus(); // be sure list is always in focus
        });
    }    
    
    // redraw screen
    screen.render();    

})


/**
 * ON Selected ("double clicked" or "enter")
 * This is executed after parent's events
 */
bookmark_list.on("select", (item, index) => {
    try {
        // change dir getting selected in a different way (without using item/index)
        process.chdir(bookmark_list.ritems[bookmark_list.selected]);
        // update path_current
        path_current = process.cwd();
        // read new directory
        path_current_directory_list = parseDirectory(path_current);    
        // clear
        list.clearItems();
        // init list
        path_current_directory_list.forEach(function(item){
            list.add(item);
        })
        updateTextInfo(path_start,path_current,list_current_item.content);
        screen.render();
    } catch (error) {
        alert_message.error("No permission to enter directory",2);
    }//try
})


/**
 * Mapping key.full  [key.full=="enter"]:
 * All binding come here! 
 * If you need you can use an "on event" for each element
 * 
 * "enter"  "space"
 * "up" "down" "right" "left"
 * "tab" 
 * "S-tab" => SHIFT + tab
 * "C-down" => CTRL + down
 * "pageup" "pagedown"
 */
screen.on("keypress",function(ch,key){
    //alert_message.display(key.full,3);

    // if you click "right" when on list the directory will be bookmarked
    if (key.full=="right") {
        if (list.focused){
            bookmark_list.add(path_current +"/" + list_current_item.content);
            screen.render();
        }
    }

    // Jump to/from list/bookmarks
    if (key.full=="tab") {
        if (list.focused){
            bookmark_list.focus();
            //bookmark_list
        } else {
            list.focus();
        }
    }

    // Shift + h to show help
    if (key.full=="S-h"){
        if (help_box.hidden) {
            help_box.show();
        } else {
            help_box.hide();
        }
        screen.render();
    }

    // go up
    if (key.full=="pageup"){
        list.select(0);
        list.scrollTo(0);
        screen.render();
    }

    // go down
    if (key.full=="pagedown"){
        list.select(path_current_directory_list.length-1);
        list.scrollTo(path_current_directory_list.length-1);
        screen.render();
    }
    
    // on "\"" go to user home
    if (key.full=="\\" ){
        try {
            // chdir to HOME
            process.chdir(process.env.HOME);
            // update path_current
            path_current = process.cwd();
            // read new directory
            path_current_directory_list = parseDirectory(path_current);
            // clear
            list.clearItems();
            // init list
            path_current_directory_list.forEach(function(item){
                list.add(item);
            })
            updateTextInfo(path_start,path_current,list_current_item.content);
        } 
        catch(err){
        alert_message.error("No permission to enter directory",2,() =>{
                list.focus(); // be sure list is always in focus
            })
        }
        screen.render();
    } // home

    // on space go back to starting point
    if (key.full=="space") {
        //typed_char_old = "";
        try {
            // chdir to root path
            process.chdir(path_start);
            // update path_current
            path_current = process.cwd();
            // read new directory
            path_current_directory_list = parseDirectory(path_current);
            // clear
            list.clearItems();
            // init list
            path_current_directory_list.forEach(function(item){
                list.add(item);
            })
            updateTextInfo(path_start,path_current,list_current_item.content);
        }
        catch (err) {
            alert_message.error("No permission to enter directory",2,() =>{
                list.focus(); // be sure list is always in focus
            })
        }
        screen.render();
    }// space

    if ( (String(key.full).length==1) && (key.full.match("^[a-zA-Z]*$"))) {
        var typed_char =  String(key.full).toLowerCase();
        // count multi typed occurrence
        // if you type the same char typed_char_counter is increased
        // if (typed_char_last == typed_char_old){
        //     typed_char_old = typed_char_last;
        //     typed_char_counter = typed_char_counter + 1;
        // } else {
        //     typed_char_old = typed_char_last;
        //     typed_char_counter = 0;
        // }

        // jump to first occurrence if you are not on a typed char
        try {
            var ch_temp = list_current_item.content[0].toLowerCase();
            if (typed_char != ch_temp){ // first occurrance
                var i;
                for (i = 0; i < path_current_directory_list.length; i++) {
                    var ch_1 = path_current_directory_list[i][0].toLowerCase();
                    var ch_2 = String(key.full).toLowerCase();
                    if (ch_1 == ch_2){
                            list.select(i);
                            list.scrollTo(i);
                            break;
                    }
                }
            } else if (typed_char == ch_temp){ // go to next occurrance
                var i;
                for (i = list_current_index+1; i < path_current_directory_list.length; i++) {
                    var ch_1 = path_current_directory_list[i][0].toLowerCase();
                    var ch_2 = String(key.full).toLowerCase();
                    if (ch_1 == ch_2){
                            list.select(i);
                            list.scrollTo(i);
                            break;
                    }
                }            
    
            }
        } catch(err) {
            alert_message.error(err);
        }//try
        screen.render();
    }// if key a-z
});

// On [SHIFT] + [x] on bookmark_list delete current selected item
bookmark_list.key(['S-x'], () =>{
    try {
        // delete the item selected
        bookmark_list.removeItem(bookmark_list.selected);
        screen.render();
    } catch (error) {
        alert_message.error("Nothing to remove!",2);
    }//try
})

// Quit on Escape, or Control-C.
screen.key(['escape', 'C-c'], function (ch, key) {
    // save elements from bookmarks before destroy
    var output = bookmark_list.ritems;
    // remove screen to reset display if you need a console output
    screen.destroy();
    try {
        // output current selected working directory to a file
        // var stats = fs.statSync(console_output_file); // check exist
        fs.writeFileSync(console_output_file, path_current);
        // save bookmarks in json
        fs.writeFileSync(bookmarks_output_file,JSON.stringify(output,null,2));
        return process.exit(0);
    }
    catch (err) {
        return process.exit(1);
    }
});


/*******************************************************************************
 * Block end
 */

// No blocking "Wellcome screen"
alert_message.display("QCD Version 0.6",2,() =>{
    list.focus(); // be sure list is always in focus
})

// Focus our main element and select the first element
list.focus();
list.select(0);
list.scrollTo(0);


// Render the screen
screen.render();
