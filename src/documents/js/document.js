$(function() {
  // create link to api document
  $('p > code').each(function() { 
    var codeEl = $(this);
    var m = codeEl.text().match(/^([\w\-]+)(#[\w\-]+)\([\s\S]*\)$/);
    if (m) {
      codeEl.wrap($('<a>').attr('href', '/jsforce/doc/' + m[1] + '.html' + m[2]));
    }
  });
});