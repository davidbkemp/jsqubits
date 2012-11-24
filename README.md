jsqbits
========

A JavaScript library for quantum computation simulation.

Website:
http://davidbkemp.github.com/jsqbits/

The user manual:
http://davidbkemp.github.com/jsqbits/jsqbitsManual.html

Try it out online using the jsqbits runner:
http://davidbkemp.github.com/jsqbits/jsqbitsRunner.html

Wiki (with examples):
https://github.com/davidbkemp/jsqbits/wiki

You can use it to implement quantum algorithms using JavaScript like this:

    jsqbits('|01>')
        .hadamard(jsqbits.ALL)
        .cnot(1, 0)
        .hadamard(jsqbits.ALL)
        .measure(1)
        .result

If you are new to quantum programming, then it is highly recommended that you try reading
[John Watrous' Quantum Information and Computation Lecture Notes](http://www.cs.uwaterloo.ca/~watrous/lecture-notes.html).
You may also wish to try reading the (work in progress) [Introduction to Quantum Programming using jsqbits](http://davidbkemp.github.com/jsqbits/jsqbitsTutorial.html).

TODO
-----
* Support easy creation of |+> and |-> states.
* Document QState.each()
* Fix exceptions to follow a more standard pattern
* Allow array of bits anywhere we currently allow a bit range (measure() and applyFunction())
* Include a 'remainingQbits' field on measurement outcomes.
* JSLint?
* Coverage?
* Mermin-Peres magic square

DEVELOPMENT
-----------
To run the Jasmine specs, you will need to install Node.js (http://nodejs.org).
Then use 'npm install' to install the testing dependencies (Jasmine) and 'npm test' to run the specs.
NOTE: The Jasmine specs include an example of factoring using Shor's faction algorithm.  This is non-deterministic and can take a fraction of a second or several seconds to complete.
