var minify = require('html-minifier').minify;
var fs = require('fs');
var path = require('path');
var del = require("del");
var gzip = require('gzip');
var gzipme = require('gzipme');

var bundledHtmlDir = path.join(__dirname, "build/bundled/src");

fs.readdir(bundledHtmlDir, function(err, files) {
  if(err) {
    console.error(`Something wrong in reading the directory : ${bundledHtmlDir}`);
    return;
  }
  files.forEach(function(file) {
    if(path.extname(file) == ".html") {
      var filePath = path.join(__dirname, "build/bundled/src", file);
      console.log(`minifying for file : ${filePath}`);

      fs.readFile(filePath, function(err, htmlString) {

        var minifiedHtml = minify(htmlString.toString(), {
          collapseInlineTagWhitespace: true,
          collapseWhitespace: true,
          decodeEntities: true,
          minifyCSS: true,
          minifyJS: true,
          removeComments: true
        });
        if(err) {
          console.error("i have error in reading");
        }

        fs.writeFile(filePath, minifiedHtml, function(err) {
          if(err) {
            console.error(`Couldn't write file : ${file}`);
          } else {
            // gzipme(filePath, true, "best");
          }
        });
      });

    }
  })
});
