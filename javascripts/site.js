
site_readme_path = 'README.md';

/**
 * Object to scope markdown retrieval under
 */
function _Retriever()
{
  this.get = function(url, target) {
    $.ajax({
      url: url,
      success: function(data) {
        target.html(markdown.toHTML(data));
      }
    });
  }
}; var Retriever = new _Retriever();


function Scanner()
{
  this.url = window.location.pathname + 'test/';
  this.manifest_name = 'manifest.yml';

  this.url += this.manifest_name;

  this.getManifest = function() {
    $.ajax({
      url: this.url,
      success: function(data) {
        var arr = jsyaml.load(data);
        this.parseManifest(arr, '');
      }.bind(this),
      statusCode: {
        404: function() {
          alert('Manifest Not Found');
        }
      },
      error: function(data) {
      }
    });
  }

  /**
   * Recursively parse through our yaml manifest
   */
  this.parseManifest = function(arr, dir) {

    $.each(arr, function(i, e) {
      if (Object.isObject(e)) {
        $.each(e, function(k, v) {
          if (Array.isArray(v)) {
            this.parseManifest(v, k+'/')
          }
        }.bind(this));

        return 1; // continue
      }
      // do work on array item
      alert(dir + e);
    }.bind(this));
  }
};




/**
 * Dynamic markdown editor
 */
function Editor(input, preview)
{
  this.update = function () {
    preview.innerHTML = markdown.toHTML(input.value);
  }
  input.editor = this;
  this.update();
}
// only works with raw DOM element (.get(0))
new Editor($("#text-input").get(0), $("#preview").get(0));




/**
 * Local config
 */
function _Config() {
  this.map = {
    'readme_filenames' : 'README.md, README.markdown, readme.md, readme.markdown',
    'manifest'  : ''
  }

  this.container = $('body'); // TODO maybe no container?
  this.save_button = this.container.find('.save');
  this.reset_button = this.container.find('.reset');

  /**
   * Populate the form
   */
  this.init = function() {

    $.each(this.map, function(key, def) {
      var input = this.container.find('[name="'+key+'"]');
      var cookie = $.cookie(key);

      if (cookie && cookie.length > 0) {
        input.attr('value', cookie);
      } else {
        input.attr('value', def);
      }
    }.bind(this));

    this.save_button.click(function() {
      this.save();
    }.bind(this));


    this.reset_button.click(function() {
      this.reset_all();
    }.bind(this));

    return this;
  }

  /**
   * Save the form
   */
  this.save = function() {
    $.each(this.map, function(key, def) {

      var input = this.container.find('[name="'+key+'"]');
      $.cookie(key, input.attr('value'), {expires:365})

    }.bind(this));
  }

  /**
   * Reset the form
   */
  this.reset_all = function() {
    if (!confirm('Reset all config fields')) return;

    $.each(this.map, function(key, def) {
      $.removeCookie(key);
      var input = this.container.find('input[name="'+key+'"]');
      input.attr('value', def);

    }.bind(this));
  }

}; var Config = (new _Config()).init();


// On load
$(function(){

  Retriever.get(site_readme_path, $('#readme'));

  $('form').submit(false);
  $('textarea').tabby({tabString:'    '});

  var x = $('#manifest').attr('value');
  //try {
  //  x = jsyaml.load(x);
  //} catch (e) {
  //  alert(e);
  //}

  var scan = new Scanner();
  scan.getManifest();
});

