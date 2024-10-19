# Hexo-Highlight-Shiki
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
npm install hexo-highlight-shiki --save
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
  theme: one-dark-pro # see https://shiki.style/themes for supported themes.
  line_number: false
  strip_indent: true
  tab_replace: "  "
  additional:
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

## Acknowledgments
This plugin is developed based on
- [ArcticLampyrid/hexo-shiki-highlighter](https://github.com/ArcticLampyrid/hexo-shiki-highlighter)
- [nova1751/hexo-shiki-plugin](https://github.com/nova1751/hexo-shiki-plugin)
