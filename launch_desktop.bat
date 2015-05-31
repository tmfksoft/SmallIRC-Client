@echo off
echo Zipping Application
winrar a -afzip app.zip -r -ma5 -ep1 www\
copy app.zip app.nw
del app.zip
echo Booting Node-Webkit Application
nw app.nw
echo Removing Left Over Files
del app.nw
echo Finished.