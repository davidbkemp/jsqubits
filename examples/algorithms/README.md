To run an algorithm, use `npm`:

eg (note that the path is relative to the location of `package.json`).

    $ npm install
    $ npm run-script example examples/algorithms/deutsch.js

Or, to run them all:

    $ npm install
    $ npm run-script all-examples

You can of course run them directly using `node`,
but you will need to pre-load `babel-core/register`:

    $ npm install
    $ node --require babel-core/register ./deutsch.js
