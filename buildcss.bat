@ECHO OFF
:: Display Ruby version
ruby.exe -v
 
:: Switch to Sass dir:
cd .\public\assets\css
 
:: run Sass
:: output version:
call sass -v
:: force overwrite of css
call sass --update site.scss:site.css -f -C --style compact --precision 8
:: watch for more updates
call sass --watch site.scss:site.css --style compact --precision 8