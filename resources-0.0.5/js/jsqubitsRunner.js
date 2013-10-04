//     jsqubits
//     http://jsqubits.org
//     (c) 2012 David Kemp
//     jsqubits may be freely distributed under the MIT license.

/*jshint evil:true, eqnull:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, nonew:true, regexp:true, undef:true, unused:true, trailing:true */
/*global jQuery, jsqubits, prompt, alert  */


(function (global, $) {

    global.ALL = jsqubits.ALL;

    global.log = function (str) {
        jQuery("#console").append(jQuery("<div>").text(str));
    };

    global.promptForFunction  = function (message, example) {
        var input = prompt(message, example);
        var f;
        eval("f = " + input);
        return f;
    };

    function clearConsole() {
        $('#result').text('');
        $('#console').html('');
    }

    function clearAll() {
       $('#code').val('');
       clearConsole();
    }

    $(function() {

        $('#run').click(function() {
            clearConsole();
            var result;
            try {
                result = eval($('#code').get(0).value);
                if ((typeof result === 'object') && result.toString) {
                    result = result.toString();
                } else if (typeof result === 'number') {
                    result = '' + result;
                }
            } catch (e) {
                result = e.message ? e.message : e;
            }
            if (result) {
                $('#result').text(result);
            }
        });

        $('#clear').click(function() {
            clearAll();
            $('#example').attr('value', 'none');
        });

        $('#example').change(function() {
            var selectedExample = $(this).attr('value');
            if (selectedExample === 'none') return;

        $.get("resources-0.0.5/examples/" + selectedExample + ".js.example", function(data) {
                clearAll();
                $('#code').val(data);
              })
              .error(function() { alert("Sorry. Something went wrong."); });
        });
    });

})(this, jQuery);
