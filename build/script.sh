#!/bin/bash

# vars
PATH=$PATH:`pwd`/`dirname $0`
BASE=$(dirname $0)
VER=`cat $BASE/config.txt`
filelist=`cat $BASE/filelist.txt`
combinefile="$BASE/../dist/touchy.$VER.js"
minfile="$BASE/../dist/touchy.min.$VER.js"
YUICOMPRESSOR="/usr/share/yui-compressor/yui-compressor.jar"
DEBUG=$1

# If the output file already exists, we don't want to double its size. Remove it.
if [ -e "./$combinefile" ]; then
    echo -e "Removing existing copy of $combinefile."
    rm $combinefile
fi
if [ -e "./$minfile" ]; then
    echo -e "Removing existing copy of $minfile."
    rm $minfile
fi

# combine js
echo -e "\nCombining..."

for file in $filelist
do
    echo "Adding: $file"
    cat "$BASE/$file" >> $combinefile
    
    # add line break at the end
    echo -e "\n" >> $combinefile
done

if [ "$DEBUG" == "debug" ]; then
    echo ""
else
    # Minify JavaScripts
    echo -e "\nMinifying $combinefile to $minfile.."
    java -jar $YUICOMPRESSOR --type js $combinefile >> $minfile
fi

echo -e "\nDone."
exit 0
