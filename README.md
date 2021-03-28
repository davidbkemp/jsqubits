# jsqubits
  Quantum computation simulation JavaScript library

[![Build Status](https://travis-ci.org/davidbkemp/jsqubits.png)](https://travis-ci.org/davidbkemp/jsqubits)

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

WARNING: jsqubits operators return new instances of the quantum state and they do NOT modify the existing object.

If you are new to quantum programming, then it is highly recommended that you try reading
[John Watrous' Quantum Information and Computation Lecture Notes](https://cs.uwaterloo.ca/~watrous/QC-notes/).
You may also wish to try reading the (work in progress) [Introduction to Quantum Programming using jsqubits](https://davidbkemp.github.io/jsqubits/jsqubitsTutorial.html).

Usage
-----
Try it out online using the jsqubits runner:
https://davidbkemp.github.io/jsqubits/jsqubitsRunner.html

Use it in a Node application (see https://nodejs.org).
**WARNING: Use at least version 15 of Node.**


```shell
$ npm install jsqubits
$ cat > myprogram.mjs << EOF

import {jsqubits} from 'jsqubits'
const result = jsqubits('|0101>').hadamard(jsqubits.ALL);
console.log(result.toString());

EOF
$ node myprogram.mjs
```

NOTE:

- jsqubits operators return new instances of the quantum state and they do NOT modify the existing object.
- If you clone the github repository, or download a release,
you will need to run `npm install` from within the root of the repository.
e.g.

```shell
    $ git clone https://github.com/davidbkemp/jsqubits.git
    $ cd jsqubits
    $ npm install
    $ node
    import('./lib/index.js').then(({jsqubits}) => {
        const result = jsqubits('|0101>').hadamard(jsqubits.ALL);
        console.log(result.toString());
    });
```

TODO: Instructions on how to use it in a static web page.

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
