//     jsqubits
//     http://jsqubits.org
//     (c) 2012 David Kemp
//     jsqubits may be freely distributed under the MIT license.

/* jshint evil:true */
/* global jQuery, jsqubits, prompt, alert  */


(function (global, $) {
  global.ALL = jsqubits.ALL;

  global.log = function (str) {
    jQuery('#console').append(jQuery('<div>').text(str));
  };

  global.promptForFunction = function (message, example) {
    const input = prompt(message, example);
    let f;
    eval(`f = ${input}`);
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

  $(() => {
    $('#run').click(() => {
      clearConsole();
      let result;
      try {
        result = eval($('#code').get(0).value);
        if ((typeof result === 'object') && result.toString) {
          result = result.toString();
        } else if (typeof result === 'number') {
          result = `${result}`;
        }
      } catch (e) {
        result = e.message ? e.message : e;
      }
      if (result) {
        $('#result').text(result);
      }
    });

    $('#clear').click(() => {
      clearAll();
      $('#example').attr('value', 'none');
    });

    $('#example').change(function () {
      const selectedExample = $(this).attr('value');
      if (selectedExample === 'none') return;

      $.get(`examples/${selectedExample}.js.example`, (data) => {
        clearAll();
        $('#code').val(data);
      })
        .error(() => { alert('Sorry. Something went wrong.'); });
    });
  });
}(this, jQuery));
