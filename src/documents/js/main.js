/*global jsforce, hljs*/
$(function() {
  hljs.configure({ languages: ['javascript', 'shell', 'coffeescript', 'html'] });
  $('pre code').each(function(i, elem) {
    if ($(elem).hasClass('lang-javascript')) {
      var codeEl = $(elem);
      var code = codeEl.text();
      if (code.match(/^\/\*\s*@interactive\s*\*\//)) {
        codeEl.text(code.split(/\n/).splice(1).join('\n'));
        $('<div class="code-runner">')
          .append(
            $('<div class="code-controls">')
              .append($('<a>').addClass('btn btn-default edit-code').text('Edit'))
              .append('&nbsp;')
              .append($('<a>').addClass('btn btn-info complete-code').text('Complete').hide())
              .append('&nbsp;')
              .append($('<a>').addClass('btn btn-primary run-code').text('Run'))
          )

          .insertAfter(codeEl.parent('pre'));
      }
    }
    hljs.highlightBlock(elem);
  });

  $(document).on('click', '.edit-code', function() {
    var outEl = $(this).parents('.code-runner').find('.code-result');
    var codeEl = getCodeElement(this);
    codeEl.text(codeEl.text());
    codeEl.addClass('editing');
    codeEl.attr('contenteditable', 'true');
    $(this).hide();
    $(this).siblings().hide();
    $(this).siblings('.complete-code').show();
  });

  $(document).on('click', '.complete-code', function() {
    var codeEl = getCodeElement(this);
    codeEl.attr('contenteditable', 'false');
    codeEl.removeClass('editing');
    var code = codeEl.html();
    codeEl.html(code.replace(/<div>/g, '<br>').replace(/<\/div>/g, ''));
    hljs.highlightBlock(codeEl[0]);
    $(this).siblings().show();
    $(this).hide();
  });

  $(document).on('click', '.run-code', function() {
    if (!jsforce.browser.isLoggedIn()) {
      $('#oauth-dialog').modal('show');
      return;
    }
    var codeEl = getCodeElement(this);
    var code = codeEl.text();
    var context = {
      jsforce: window.jsforce,
      require: function(name){ return window[name]; },
      conn: jsforce.browser.connection,
      handleResult: createResultHandler(this),
      handleError: createErrorHandler(this),
      console: createConsole(this)
    };
    startEvaluate(this);
    try {
      with(context) { eval(code); }
    } catch(e) {
      context.handleError(e);
    }
  });

  $('#oauth-dialog .connect').on('click', function() {
    jsforce.browser.login({ 
      loginUrl: $('#oauth-dialog select[name=loginUrl]').val(),
      popup: { width: 912, height: 600 }
    }, function(err) {
      if (err) { alert(err.message); }
      $('#oauth-dialog').modal('hide');
    });
  });

  function getCodeElement(el) {
    return $(el).parents('.code-runner').prev('pre').children('code');
  }
  function startEvaluate(el) {
    $(el).parents('.code-runner').find('.code-result').remove();
    var resultEl = $('<div class="code-result alert alert-dismissable">')
      .append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>')
      .append('<div><strong class="title">Executing...</strong></div>')
      .append('<div class="output">')
      .appendTo(
        $(el).parents('.code-runner')
      );
  }
  function createResultHandler(el) {
    return function() {
      var args = Array.prototype.slice.apply(arguments);
      var resultEl = $(el).parents('.code-runner').find('.code-result');
      resultEl.addClass('alert-success').find('.title').text('Result :');
      var preEl = resultEl.find('.output pre');
      if (preEl.size()===0) {
        preEl = $('<pre>').appendTo(resultEl.find('.output'));
      } else {
        preEl.append('\n');
      }
      preEl.append(
        args.map(function(a) {
          return typeof a === 'object' ? JSON.stringify(a, null, 4) : a;
        }).join(' ')
      );
    };
  }
  function createErrorHandler(el) {
    return function(err) {
      var resultEl = $(el).parents('.code-runner').find('.code-result');
      resultEl.addClass('alert-danger').find('.title').text('Error :');
      var preEl = resultEl.find('.output pre');
      if (preEl.size()===0) {
        preEl = $('<pre>').appendTo(resultEl.find('.output'));
      } else {
        preEl.append('\n');
      }
      preEl.text(err.stack);
    };
  }
  function createConsole(el) {
    return {
      log: createResultHandler(el),
      error: createErrorHandler(el)
    };
  }
});
