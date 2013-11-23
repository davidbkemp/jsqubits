/* global requirejs, document */

(function () {
    "use strict";

    requirejs.config({
        baseUrl: '../..',
        paths: {
            jsqubits: 'lib/jsqubits',
            jsqubitsmath: 'lib/jsqubitsmath'
        }
    });

    requirejs(['jsqubits', 'jsqubitsmath'],
        function (jsqubits, jsqubitsmath) {
            var qstate = jsqubits('|0>').hadamard(0).T(0);
            document.getElementById("jsqubitsResult").innerHTML = qstate.toString();
            document.getElementById("powerModResult").innerHTML = jsqubitsmath.powerMod(234, 756, 15).toString();
        }
    );
})();

