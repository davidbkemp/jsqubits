/*
 * Load and run all the algorithms...
 */

/* global require, console, __dirname, module */

(function () {
  const fs = require('fs');
  const path = require('path');
  const thisFile = path.basename(module.filename);

  const executeFiles = function executeFiles(err, files) {
    if (err) throw err;
    files.forEach((file) => {
      if (file !== thisFile && file.match(/.*\.js/)) {
        const moduleExpression = path.join(__dirname, file);
        console.log(moduleExpression);
        require(moduleExpression);
      }
    });
    console.log('Finished!!!!!');
  };

  fs.readdir(__dirname, executeFiles);
}());

