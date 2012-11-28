### Markdown Project

Readme file

#### Manifest

The manifest tells ``divergence`` what to grab from the public docs directory.

This can be done in 2 ways:

1. Use the config section to manually enter a manifest
2. Place a ``manifest.yml`` file in in the project directory

Here is a sample Manifest

    - readme.md
    - pages
      - home
      - products

This outlines the following directory structure in your project dir

    project_dir/
      readme.md
      pages/
        home.md
        products.md

The manifest must be in JSON format

### Projects Used

- [https://github.com/evilstreak/markdown-js](markdown-js)
- [http://foundation.zurb.com/](foundation)
- [https://github.com/carhartl/jquery-cookie](jquery-cookie)
