/*
 * Load and run all the algorithms...
 */

/*global require, console, __dirname, module */

(function () {
    "use strict";

    var fs = require('fs');
    var path = require('path');
    var thisFile = path.basename(module.filename);

    var executeFiles = function executeFiles(err, files) {
        if (err) throw err;
        files.forEach(function executeFile(file) {
            if (file !== thisFile && file.match(/.*\.js/)) {
                var moduleExpression = path.join(__dirname, file);
                console.log(moduleExpression);
                require(moduleExpression);
            }
        });
        console.log('Finished!!!!!');
    };

    fs.readdir(__dirname, executeFiles);

})();


