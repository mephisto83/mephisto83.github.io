@ECHO OFF
REM		* Generate themes for the U4 application. 
REM		* To run: Run this bat file from the sass folder.

REM		* All scss files NOT starting with '_' will be assumed to be theme files. They will be processed by Compass and a corresponding css file will be 
REM		* generated and placed under folder '..\css' (relative to this folder). Therefore, there should only be one file not prefixed with '_' per theme.
REM		* This file should be placed directly below the sass folder, just as with u4.scss. Child scss files imported by a theme scss file
REM		* should be placed in a folder named the same as the theme.

REM		* Example:
REM		* Theme file:									sass\u4-purple.scss
REM		* Imports (overrides default U4 & Ext styles):	sass\themes\u4-purple\_variables.scss
REM		* Imports (holdes default u4 & Ext styles):		sass\u4.scss

REM		* There are some prerequisites to run the bat file. First you need to install Ruby.
REM		* You can find Ruby here: http://rubyinstaller.org/downloads/

REM		* When you install Ruby, you need to select the option that updates the system paths to include Ruby executables.

REM		* After you have installed Ruby, you need to install compass. Open a new command prompt after you have installed Ruby to update the paths, 
REM		* and run the commands below. We need to force sass version 3.1.7 because Ext does not yet support later versions. If you install compass first, 
REM		* it will pull in a later version of sass, and you will then have to uninstall sass and reinstall version 3.1.7.

REM		* gem install sass -v 3.1.7
REM		* gem install compass -v 0.12.2
REM     * We need to enforce compass version as well, otherwise unexplained errors

@ECHO ON

compass watch