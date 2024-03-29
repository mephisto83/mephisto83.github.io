﻿# sass_path: the directory your Sass files are in. THIS file should also be in the Sass folder
# Generally this will be in a resources/sass folder
# <root>/resources/sass
sass_path = File.dirname(__FILE__)

# css_path: the directory you want your CSS files to be.
# Generally this is a folder in the parent directory of your Sass files
# <root>/resources/css
css_path = File.join(sass_path, "..", "css")

# output_style: The output style for your compiled CSS
# nested, expanded, compact, compressed
# More information can be found here http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#output_style
output_style = :expanded

# We need to load in the Ext4 themes folder, which includes all it's default styling, images, variables and mixins
# require File.join( $ext_path, 'packages/ext-theme-base/sass','utils.rb')

# add_import_path File.join( $ext_path, 'packages/ext-theme-classic/build')
