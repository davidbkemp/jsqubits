exports.toBeApprox = function(expected) {


    this.message = function() {
        var notText = this.isNot ? " not" : "";
        return "Expected " + this.actual + " to" + notText + " be equal to " + expected;
    };

    return  Math.abs(this.actual.real() - expected.real()) < 0.0001 &&
        Math.abs(this.actual.imaginary() - expected.imaginary()) < 0.0001
};

exports.toEql =
    (function() {
        var arraysAreEql = function(a1, a2) {
            var i;
            if (!(a2 instanceof Array)) return false;
            if (a1.length !== a2.length) return false;
            for (i in a1) {
                if (!a1[i].eql(a2[i])) return false;
            }
            for (i in a2) {
                if (!a1[i].eql(a2[i])) return false;
            }
            return true;
        };

        return function(expected) {
            if (this.actual === expected) return true;
            if (this.actual instanceof Array) {
               return  arraysAreEql(this.actual, expected);
            }
            return this.actual.eql(expected);
        };
    })();
