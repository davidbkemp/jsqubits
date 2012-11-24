/**
 *    Copyright 2012 David Kemp

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * For documentation, and the latest version, see http://www.jsqbits.org/
 */

/*jshint evil:true, eqnull:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, nonew:true, regexp:true, undef:true, unused:true, strict:true, trailing:true */
/*global jQuery, jsqbits, prompt, alert  */


(function (global, $) {
    "use strict";

    global.ALL = jsqbits.ALL;

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

        $.get("resources-1.10/examples/" + selectedExample + ".js.example", function(data) {
                clearAll();
                $('#code').val(data);
              })
              .error(function() { alert("Sorry. Something went wrong."); });
        });
    });

})(this, jQuery);
