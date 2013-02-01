var GET = function(key) {
  var l = window.location;
  //alert(l.href);
  var params = {};
  var url = l.href;

  var paramString = url.split('?')[1];
  if (!paramString) return;

  var pairs = paramString.split('&');
  if (!pairs) return;

  for (var i in pairs){
    var pair = pairs[i].split('=');
    params[pair[0]] = pair[1];
  }
  return params[key];
};

/**
 * Local config
 */
function _Config() {
  this.map = {
    'markdown_extensions' : '.md, .markdown',
    'manifest'  : '- README',
    'base_path'  : ''
  }

  this.container = $('#config_container'); // TODO maybe no container?
  this.save_button = this.container.find('.save');
  this.reset_button = this.container.find('.reset');

  /**
   * Populate the form
   */
  this.init = function() {

    $.each(this.map, function(key, def) {
      var input = this.container.find('[name="'+key+'"]');
      var fromUrl = GET(key);
      if (fromUrl) {
        fromUrl = (new String(fromUrl)).unescapeURL();
      }

      input.attr('value', (fromUrl ? fromUrl : def));
    }.bind(this));

    this.reset_button.click(function() {
      this.reset_all();
    }.bind(this));

    return this;
  }

  /**
   * Reset the form
   */
  this.reset_all = function() {
    if (!confirm('Reset all config fields')) return;

    $.each(this.map, function(key, def) {
      var input = this.container.find('input[name="'+key+'"]');
      input.attr('value', def);

    }.bind(this));
  }

  /**
   * Get a config value
   * Check for url params
   */
  this.get_value = function(name) {
    var input = this.container.find('input[name="'+name+'"]');
    var from_input = input.attr('value');

    return from_input || null;
  }
};
