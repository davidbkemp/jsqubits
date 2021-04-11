# jsqubits
  Quantum computation simulation JavaScript library

[![Build Status](https://github.com/davidbkemp/jsqubits/actions/workflows/node.js.yml/badge.svg)](https://github.com/davidbkemp/jsqubits/actions/workflows/node.js.yml)

Website:
https://davidbkemp.github.io/jsqubits/

The user manual:
https://davidbkemp.github.io/jsqubits/jsqubitsManual.html

Try it out online using the jsqubits runner:
https://davidbkemp.github.io/jsqubits/jsqubitsRunner.html

Wiki (with examples):
https://github.com/davidbkemp/jsqubits/wiki

GitHub:
https://github.com/davidbkemp/jsqubits

Node npm module:
https://npmjs.org/package/jsqubits

You can use it to implement quantum algorithms using JavaScript like this:

    jsqubits('|01>')
        .hadamard(jsqubits.ALL)
        .cnot(1, 0)
        .hadamard(jsqubits.ALL)
        .measure(1)
        .result


If you are new to quantum programming, then it is highly recommended that you try reading
[John Watrous' Quantum Information and Computation Lecture Notes](https://cs.uwaterloo.ca/~watrous/QC-notes/).
You may also wish to try reading the (work in progress) [Introduction to Quantum Programming using jsqubits](https://davidbkemp.github.io/jsqubits/jsqubitsTutorial.html).

Usage
-----

## Online
Try it out online using the jsqubits runner:
https://davidbkemp.github.io/jsqubits/jsqubitsRunner.html

## Install using npm

You can use jsqubits in a Node application by installing jsqubits using npm.

**First, make sure you have at least version 15 of Node installed.**

Place the following code in `myprogram.mjs`.
Note the `.mjs` extension is a way of informing Node that the program uses ES modules.

```javascript
import {jsqubits} from 'jsqubits'
const result = jsqubits('|0101>').hadamard(jsqubits.ALL);
console.log(result.toString());
```

Run the following:
```shell
$ npm install jsqubits@2
$ node myprogram.mjs
```

## Downloading from github

You could use jsqubits by cloning the github repository, or downloading a release from github.

**First, make sure you have at least version 15 of Node installed.**

Clone jsqubits

```shell
$ git clone https://github.com/davidbkemp/jsqubits.git
```

Place the following code in `myprogram.mjs`.
Note the `.mjs` extension is a way of informing Node that the program uses ES modules.

```javascript
import {jsqubits} from './jsqubits/lib/index.js'
const result = jsqubits('|0101>').hadamard(jsqubits.ALL);
console.log(result.toString());
```

Run your program using Node:

```shell
$ node myprogram.mjs
```

## On your own website

We are using [native ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).
Sadly, this complicates things when using jsqubits from within a web page:

- The page will need to be served by a web server, not just loaded from your local file system.
  Note: placing your web page on github pages is an option for this.
- You will need a copy of the contents of the `lib` directory on your web server.
- Your page will need to specify `type="module"` in the `script` tag used to load the jsqubits library.
- The page will not work on old versions of web browsers.  It definitely won't work on Internet Explorer.
I have successfully had jsqubits running on Chrome 89, Firefox 87, Safari 14, and Edge 89.

e.g. assuming you have placed the contents of `lib` in a directory called `jsqubits` that sits next to your webpage,
then you could create a simple web page like this:

```html
<html>
<body><p id="result"></p></body>
<script type="module">
  import jsqubits from './jsqubits/index.js';
  const qstate = jsqubits('|0>').hadamard(0).T(0);
  document.getElementById("result").innerHTML = qstate.toString();
</script>
</html>
```

See other examples in the `examples` directory.

TypeScript type definitions
---------------------------
TypeScript type definitions for jsqubits are available:

- Node npm module: https://www.npmjs.com/package/@types/jsqubits
- Github: https://github.com/qramana/jsqubits.d.ts


Development
-----------
To run the tests, you will need to install version 15 or later of Node.js (https://nodejs.org).
Then use `npm install` to install the testing dependencies and `npm test` to run the specs.
NOTE: The tests include an example of factoring using Shor's faction algorithm.  This is non-deterministic and can take a fraction of a second or several seconds to complete.

License
-------

(The MIT License)

Copyright (c) 2012 David Kemp &lt;davidbkemp@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
