var path = require('path');
var fs = require('fs');
var replaceStream = require('replacestream');
var del = require("del");
var move = require('mv');

var bundledHtmlDir = path.join(__dirname, "build/bundled/src");
var mainFile = path.join(__dirname, "build/bundled/index.html");

var tmpDirPath = path.join(__dirname, ".tmp");
var tmpDirSrcPath = path.join(tmpDirPath, "src");

var myAppFile = "my-app.html";
var myAppGz = "my-app.html.gz";

var tmpExists = fs.existsSync(tmpDirPath);
if(!tmpExists) {
  fs.mkdirSync(tmpDirPath);
}
var tmpSrcExists = fs.existsSync(tmpDirSrcPath);
if(!tmpSrcExists) {
  fs.mkdirSync(tmpDirSrcPath);
}

let formIndexFile = () => {
  return new Promise((resolve, reject) => {
    fs.closeSync(fs.openSync(path.join(tmpDirPath, "index.html"), 'w'));
    var writeStream = fs.createWriteStream(path.join(tmpDirPath, "index.html"));
    var readStream = fs.createReadStream(mainFile);
    readStream.pipe(replaceStream(myAppFile, myAppGz)).pipe(writeStream);
    console.log("index file is done");
    resolve(true);
  });
};

let formSrcFiles = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(bundledHtmlDir, function(err, files) {
      if(err) {
        console.error(`cannot read files from directory: ${bundledHtmlDir}`);
        reject(err);
      } else {
        files.forEach(function(fileName) {
          if(path.extname(fileName) == ".html") {
            var filePath = path.join(bundledHtmlDir, fileName);
            var newFilePath = path.join(tmpDirSrcPath, fileName)
            fs.closeSync(fs.openSync(newFilePath, 'w'));
            var writeStream = fs.createWriteStream(newFilePath);
            var readStream = fs.createReadStream(filePath);
            readStream.pipe(replaceStream(myAppFile, myAppGz)).pipe(writeStream);
          }
        });
        console.log("src folder is done");
        resolve(true);
      }
    });
  });
};

formIndexFile()
  .then(function() {
    return formSrcFiles();
  })
  .then(function() {
    del.sync([bundledHtmlDir, mainFile]);

    return new Promise((resolve, reject) => {
      move(path.join(tmpDirPath, "index.html"), path.join(__dirname, "build/bundled/index.html"), function(err) {
        if(err) {
          reject(err);
        } else {
          resolve(true);
        }
      })
    })
  })
  .then(function() {
    return new Promise((resolve, reject) => {
      move(tmpDirSrcPath, path.join(__dirname, "build/bundled/src"), {mkdirp: true}, (err) => {
        if(err) {
          reject(err);
        } else {
          resolve(true);
        }
      })
    })
  })
  .then(() => {
    del.sync([tmpDirPath]);
    console.log("whole process successful!!!");
  })
  .catch((err) => {
    console.log("caught error: ", err);
  })
