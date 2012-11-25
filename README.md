
# jsqubits

  Quantum computation simulation JavaScript library

Website:
http://davidbkemp.github.com/jsqubits/

The user manual:
http://davidbkemp.github.com/jsqubits/jsqubitsManual.html

Try it out online using the jsqubits runner:
http://davidbkemp.github.com/jsqubits/jsqubitsRunner.html

Wiki (with examples):
https://github.com/davidbkemp/jsqubits/wiki

You can use it to implement quantum algorithms using JavaScript like this:

    jsqubits('|01>')
        .hadamard(jsqubits.ALL)
        .cnot(1, 0)
        .hadamard(jsqubits.ALL)
        .measure(1)
        .result

If you are new to quantum programming, then it is highly recommended that you try reading
[John Watrous' Quantum Information and Computation Lecture Notes](http://www.cs.uwaterloo.ca/~watrous/lecture-notes.html).
You may also wish to try reading the (work in progress) [Introduction to Quantum Programming using jsqubits](http://davidbkemp.github.com/jsqubits/jsqubitsTutorial.html).

NOTE: This library has only recently been renamed from jsqbits to jsqubits to reflect the more conventional spelling of qubit.

TODO
-----
* Support easy creation of |+> and |-> states.
* Document QState.each()
* Fix exceptions to follow a more standard pattern
* Allow array of bits anywhere we currently allow a bit range (measure() and applyFunction())
* Include a 'remainingQbits' field on measurement outcomes.
* Mermin-Peres magic square

DEVELOPMENT
-----------
To run the Jasmine specs, you will need to install Node.js (http://nodejs.org).
Then use 'npm install' to install the testing dependencies (Jasmine) and 'npm test' to run the specs.
NOTE: The Jasmine specs include an example of factoring using Shor's faction algorithm.  This is non-deterministic and can take a fraction of a second or several seconds to complete.

## License 

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