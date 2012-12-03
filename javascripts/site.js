serrors = [];

/**
 * Util functions
 */
var Util = {
  /**
   * Combine a hash of defaults -> options -> target
   */
  defs: function(target, options, defaults) {
    if (!target) return;
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
    'extensions' : ['.md', '.markdown'],
    'target'     : null,
    'url'        : '/',
  }

  Util.defs(this, options, defaults);

  var done = false;

  $.each(this.extensions, function(i, extension) {
    if (done) return false;

    $.ajax({
      url: this.url+extension,
      cache: false,

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
    var url = this.url + this.dir + this.manifest_name;

    $.ajax({
      url: url,
      cache: false,

      success: function(data) {
        this.parseYMLString(data);
      }.bind(this),

      statusCode: {
        404: function() {
          $('#files').html('Manifest 404 : ' + url);
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

  /**
   * Get the files parsed by the manifest
   */
  this.getFiles = function() {
    $.each(this.files, function(i, file) {
      this.getFile(i, file);
    }.bind(this));
  }

  /**
   * Retrieve a file where i is the file and file is a file object
   */
  this.getFile =  function(i, file) {

    // represents a kicked off ajax request
    this.fileGets.push(0);
    var index = this.fileGets.length - 1;

    // ex ('/' + '/some_dir/' + readme)
    var url  = this.url + this.dir + file.dir + file.name;
    new Retriever({'url' : url}, function(html) {

      // $('<li/>', {text: item}).appendTo(target);
      // the get has completed
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

    $('#files, #toc').html('');

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


// On load
$(function(){

  new Retriever({
    url:    '/README',
    target: $('#readme')
  });

  $('form').submit(false);
  $('textarea').tabby({tabString:'    '});

  var scan = null;

  var refreshProject = function() {

    var manifest_string = $('#use_manifest').is(':checked')
      ? $('#manifest').attr('value')
      : null;

    var scan = new Scanner({
      'url': Config.get_value('base_path') || '',
      'dir': Config.get_value('project_directory') || '',
      'manifest_string': manifest_string,
    });
  };

  // build the url to link back to this config
  var buildUrl = function()  {
    var base_path = Config.get_value('base_path') || '';
    var project_directory = Config.get_value('project_directory') || '';

    var container = $('#config_container');

    var url = window.location.origin + '/?'
      + 'base_path=' + base_path.escapeURL(true) + "&"
      + 'project_directory=' + project_directory.escapeURL(true);

    $('#linkto').val(url);
  };

  $('.url_build').keyup(buildUrl);
  buildUrl();

  $('#refresh').click(refreshProject);
  refreshProject();

});

