
site_readme_path = 'README.md';
markdown_extenstions = ['.md', '.markdown'];

/**
 * Util functions
 */
var Util = {
  /**
   * Combine a hash of defaults -> options -> target
   */
  defs: function(target, options, defaults) {
    if (!target) return;
    var options  = options || {};
    var defaults = defaults || {};
    $.extend(target, $.extend(defaults, options));
  }
};

/**
 * Trys to grab different extensions from an extension agnostic path
 *
 * new Retriever({url: '/readme'}, function(html) { alert(html) })
 *
 * Requests:
 *
 *   GET  '/readme.md'
 *   GET  '/readme.markdown'
 *
 * On the first success a callback is run with the first param being the html
 */
function Retriever(options, callback)
{
  var defaults = {
    'extensions' : markdown_extenstions,
    'target'     : null,
    'url'        : '/',
  }

  Util.defs(this, options, defaults);

  var done = false;

  $.each(this.extensions, function(i, extension) {
    if (done) return false;

    $.ajax({
      url: this.url+extension,

      success: function(data) {
        done = true;
        var html = markdown.toHTML(data);

        if (this.target) this.target.html(html);
        if (callback) callback(html);
      }.bind(this)

    });

  }.bind(this));

};


/**
 * Scans a url/dir
 *
 * 1. Attempt to retrieve manifest
 */
function Scanner(options)
{
  var defaults = {
    dir : '',
    url : window.location.pathname,
    manifest_string : null,
    manifest_name  : 'manifest.yml'
  };

  Util.defs(this, options, defaults);

  this.files = [];
  this.fileGets = [];

  this.init = function() {
    // keep constructor like code near the top
    if (this.manifest_string) {
      this.parseYMLString(this.manifest_string);
    } else {
      this.getManifest();
    }
  };


  /**
   * Performs a get on the url/directory/manifest_name
   * If it exists, pass it to parseYMLString
   */
  this.getManifest = function() {
    $.ajax({
      url: this.url + this.dir + this.manifest_name,

      success: function(data) {
        this.parseYMLString(data);
      }.bind(this),

      statusCode: {
        404: function() {
          alert('Manifest Not Found');
        }
      },

      error: function(data) {
      }

    });

  };


  /**
   * Loads manifest into array using `jsyaml
   */
  this.parseYMLString = function(string) {
    // TODO some validation here
    var arr = jsyaml.load(string);

    this.parseManifest(arr, '', 0);
    this.getFiles();
  };


  /**
   * Recursively parse through our yaml manifest
   *
   * arr - An array of strings and objects representing the file/directory structure
   *       of the manifest
   *
   * dir - the directory to recurse into, this is built up as the recursion continues
   */
  this.parseManifest = function(arr, dir, depth) {

    $.each(arr, function(i, item) {
      // item is an object (aka directory)
      if (Object.isObject(item)) {

        $.each(item, function(k, v) {

          if (Array.isArray(v)) {

            var newDir = dir+k+'/';

            // recurse down tree
            this.parseManifest(v, newDir, depth + 1)
          }
        }.bind(this));

        return 1; // continue, do not perform getFile on a directory
      }

      this.files.push({
        'dir' : dir,
        'name' : item,
        'depth' : depth,
      });

      // get the file and do something
      //this.getFile(dir, item);

    }.bind(this));

  }

  this.getFiles = function() {
    $.each(this.files, function(i, file) {
      this.getFile(i, file);
    }.bind(this));
  }

  /**
   *
   */
  this.getFile =  function(i, file) {

    this.fileGets.push(0);
    var index = this.fileGets.length - 1;

    // ex ('/' + '/some_dir/' + readme)
    var url  = this.url + this.dir + file.dir + file.name;
    new Retriever({'url' : url}, function(html) {

      // $('<li/>', {text: item}).appendTo(target);
      this.fileGets[index] = 1;
      this.files[i]['html'] = html;

      if (this.filesDone()) this.afterFetch()
    }.bind(this));

  }

  this.filesDone = function() {
    return this.fileGets.sum() == this.files.length;
  }

  /**
   * After the fetch is complete
   */
  this.afterFetch = function() {

    $.each(this.files, function(i, file) {
      var fileId = 'file_'+i;

      var div = $('<div/>', {id : fileId, 'class' : 'file'});
      div.html(file.html);
      div.hide()
      div.appendTo('#files');

      var path = file.dir+file.name;

      var margin = file.depth * 10;
      var li = $('<li/>');
      li.css('margin-left', margin);

      var toc_link = $('<a/>', {
        href: '#',
        text: path,
        'data-file-id' : fileId
      });

      toc_link.appendTo(li);
      li.appendTo('#toc');

      toc_link.click(function() {
        var id = $(this).attr('data-file-id');
        $('#files .file').hide();
        $('#'+id).show();
      });

    }.bind(this));

    $('#files > div').first().show();
  }


  this.init();
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

  new Retriever({
    url:    '/README',
    target: $('#readme')
  });

  $('form').submit(false);
  $('textarea').tabby({tabString:'    '});

  var x = $('#manifest').attr('value');
  //try {
  //  x = jsyaml.load(x);
  //} catch (e) {
  //  alert(e);
  //}

  var scan = new Scanner({dir: 'test/'});
});

