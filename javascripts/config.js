/**
 * Local config
 */
function _Config() {
  this.map = {
    'markdown_extensions' : '.md, .markdown',
    'manifest'  : '- README',
    'project_directory'  : '',
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

  /**
   * Get a config value
   * Check for url params
   */
  this.get_value = function(name) {
    var input = this.container.find('input[name="'+name+'"]');
    var from_input = input.attr('value');
    var from_url = this.getURLParameter(name);

    var val = from_url || from_input || null;
    return val;
  }

  this.getURLParameter = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
  }

}; var Config = (new _Config()).init();
