### Markdown Browser

Markdown Browser is front-end method of display markdown files in a publicly accessible directory.

*Use Case:*

Say you are working on a branch of code and you have some markdown documentation for a feature.

Without a really nice source control tool like github that will display a readme or wiki,
it is difficult to share the docs with colleagues in a nice HTML format.

With this tool, you can setup where the docs are located, and distribute 1 URL that outlines the entire project.

##### Features

* Completely javascript based, all you have to do is drop it into a folder and go.
* Link sharing. Javascript can parse url params which allows for the sharing of projects.
* Configuration saving in cookies

### Installation

Grab a copy of the repo and drop a folder. That's it.

### Usage

Further down the main index page there is a section to configure the various path options:

For example say we want to point the md-browser at ``http://server.com/public_html/projects/feature1``

``base path``: The base of the url, in the example: ``http://server.com/``

``project directoy``: The directory tacked onto the host: ``/public_html/projects/feature1``

#### Manifest

The manifest describes which files to render in the directory. This is required to tell the JS where to look for the files.

This can be done in 2 ways:

1. Use the config section to manually enter a manifest
2. Place a ``manifest.yml`` file in in the project directory

The manifest must be in this YML format:

    - readme
    - pages:
      - home
      - products


This outlines the following directory structure in your project dir

    project_dir/
      readme.md
      pages/
        home.md
        products.md


### Projects Used

- [https://github.com/evilstreak/markdown-js](markdown-js)
- [http://foundation.zurb.com/](foundation)
- [https://github.com/carhartl/jquery-cookie](jquery-cookie)
- [https://github.com/andrewplummer/Sugar](sugar.js)
- [https://github.com/nodeca/js-yaml](js-yaml)
