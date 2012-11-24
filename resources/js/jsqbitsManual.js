/*jshint evil:true, eqnull:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, nonew:true, regexp:true, undef:true, unused:true, strict:true, trailing:true */
/*global jQuery */

(function($) {
    "use strict";

//    Find code samples and compare the actual output with the stated output.
    $(function() {

        var validateCodeSamples = function() {
            var totalErrors = 0;

            $('.validationMessage').hide();
            $('#codeValidationInProgress').show();
            $('*[data-sampleref]').each(function() {
                try {
                    var id = $(this).attr('data-sampleref');
                    var jscode = $('#' + id).text();
                    var result = eval(jscode).toString();
                    var expected = $(this).text();
                    if ($.trim(expected) !== $.trim(result)) throw "no match";
                } catch (e) {
                    $(this).addClass('error');
                    totalErrors++;
                }
            });

            $('#codeValidationInProgress').hide();
            if (totalErrors > 0) {
                $('#codeValidationFailure').show();
            } else {
                $('#codeValidationSuccess').show();
            }
        };

        $('#validateCodeSamplesButton').on('click', validateCodeSamples);

        var indexItems = [];
        var indexMap = [];
        $('ul.index li, h2.index').map(function() {
            var indexItem = $(this).text().split('(', 1)[0];
            indexItems.push(indexItem);
            indexMap[indexItem] = $(this).closest('.section').attr('id');
        });
        indexItems.sort();
        for (var i in indexItems) {
            if (indexItems.hasOwnProperty(i)) {
                var indexItem = indexItems[i];
                var element = $('<a>').attr('href', '#' + indexMap[indexItem]).text(indexItem + ' ');
                $('#tableOfContents').append(element);
            }
        }


    });
})(jQuery);