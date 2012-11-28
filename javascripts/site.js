
readme_path = 'README.md';

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
}

var Retriever = new _Retriever();
Retriever.get(readme_path, $('#readme'));

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
 *
 */
function _Config() {
  this.init = function() {
  }
}

var Config = new _Config();
Config.init();
