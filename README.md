# Hexo-Highlight-Shiki
![NPM Version](https://img.shields.io/npm/v/hexo-highlighter-shiki?style=flat)

English丨[简体中文](README_zh-CN.md)

A hexo plugin to use [Shiki](https://github.com/shikijs/shiki) as code block highlighter.

Hexo v7.0.0+ is required.

## Features
- Render code block with Shiki like Hexo default highlighter.
- Support dual or more themes.
- Support custom language.

## Installation and Configuration
First, install the plugin:
```shell
npm install hexo-highlighter-shiki --save
```

Then switch the code highlighting engine in your `config.yml`:
```yaml
syntax_highlighter: shiki
```

Finally, configure `shiki`:
```yaml
shiki:
  theme: github-dark # default: one-dark-pro
  line_number: true # default: false
```

## Configuration Options
The complete configuration is as follows:
```yaml
shiki:
  theme: one-dark-pro # Please refer to https://shiki.style/themes for supported themes.
  line_number: false # default: false
  strip_indent: true # default: true
  tab_replace: "  " # default: "  "
  pre_style: true # Preserve the style of the <pre> tag, i.e., the theme's `background-color`. default: true
  default_color: light # Only take effect when using multiple themes. default: light
  css_variable_prefix: --shiki- # Only take effect when using multiple themes. default: --shiki-
  transformers: # List of transformers to be enabled. Please refer to https://shiki.style/packages/transformers for the list of supported transformers.
    - "transformerNotationDiff" # You can omit name and option when no settings are required, directly using the string.
    - name: transformerNotationFocus # When settings are required, please explicitly set name and option.
      option: # Options for the transformer, please check the transformer's source code to get the list of supported options
      # Source code of transformers: https://github.com/shikijs/shiki/tree/main/packages/transformers/src/transformers
        classActiveLine: focused
        classActivePre: has-focused
  additional:
    themes: # List of the TextMate theme json to be added.
      - path/to/theme.json
    langs: # List of the TextMate grammar json of languages to be added.
      - path/to/lang_grammar.json
    lang_alias: # List of the alias of languages.
      your_alias1: lang_name1
      your_alias2: lang_name2
```

Additionally, you can specify multiple themes in the `theme` option:
```yaml
shiki:
  theme:
    light: one-light
    dark: one-dark-pro
    # ...
```
See [Dual Themes](https://shiki.style/guide/dual-themes) for how to switch between multiple themes.

## Bugs
### mathjax
If you are using [hexo-filter-mathjax](https://github.com/next-theme/hexo-filter-mathjax) or any other plugin that uses mathjax to render mathematical formulas locally, you may encounter an `Error: Can't find handler for document` when rendering articles that include code blocks and have mathjax rendering enabled. This is a problem with mathjax, as its LiteDOM adaptor cannot parse complex HTML fragments.

#### Solution

For example, if you are using the hexo-filter-mathjax plugin, modify the [this line](https://github.com/next-theme/hexo-filter-mathjax/blob/20dc61352f8cf4d19425ad1833eb72b467c212ef/index.js#L20C3-L20C40) in the source code:
```js
- data.content = mathjax(data.content);
+ data.content = data.content.replace(/<span\s+class="math\s+[^"]*">\\[\(\[].*?\\[\)\]]<\/span>/gs, mathjax);
```
This will prevent rendering errors for complex HTML fragments that result in `Can't find handler for document`.

#### Related Issues:
- [Error in applying html the markdown file #26](https://github.com/next-theme/hexo-filter-mathjax/issues/26)
- [Can't find handler for document #265](https://github.com/mathjax/MathJax-src/issues/265)


## Acknowledgments
This plugin is developed based on
- [ArcticLampyrid/hexo-shiki-highlighter](https://github.com/ArcticLampyrid/hexo-shiki-highlighter)
- [nova1751/hexo-shiki-plugin](https://github.com/nova1751/hexo-shiki-plugin)
