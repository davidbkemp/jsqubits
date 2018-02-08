/* jshint evil:true */
/* global jQuery */

(function ($) {
  //    Find code samples and compare the actual output with the stated output.
  $(() => {
    const validateCodeSamples = function () {
      let totalErrors = 0;

      $('.validationMessage').hide();
      $('#codeValidationInProgress').show();
      $('*[data-sampleref]').each(function () {
        try {
          const id = $(this).attr('data-sampleref');
          const jscode = $(`#${id}`).text();
          const result = eval(jscode).toString();
          let expected = $(this).text();
          if ($(this).attr('data-eval') === 'true') expected = eval(expected);
          if ($.trim(expected) !== $.trim(result)) throw 'no match';
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

    const indexItems = [];
    const indexMap = [];
    $('ul.index li, h2.index').map(function () {
      const indexItem = $(this).text().split('(', 1)[0];
      indexItems.push(indexItem);
      indexMap[indexItem] = $(this).closest('.section').attr('id');
    });
    indexItems.sort();
    for (const i in indexItems) {
      if (indexItems.hasOwnProperty(i)) {
        const indexItem = indexItems[i];
        const element = $('<a>').attr('href', `#${indexMap[indexItem]}`).text(`${indexItem} `);
        $('#tableOfContents').append(element);
      }
    }
  });
}(jQuery));
