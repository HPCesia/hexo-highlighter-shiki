# Hexo-Highlight-Shiki
[English](README.md)丨简体中文

一个使用 [Shiki](https://github.com/shikijs/shiki) 作为代码块高亮器的 Hexo 插件。

需要 Hexo v7.0.0+。

## 功能
- 使用 Shiki 渲染代码块，类似于 Hexo 默认的高亮器。
- 支持双主题或更多主题。
- 支持自定义语言。

## 安装与配置
首先，安装本插件：
```shell
npm install hexo-highlighter-shiki --save
```

然后在 `config.yml` 中切换代码高亮引擎：
```yaml
syntax_highlighter: shiki
```

最后配置 `shiki`：
```yaml
shiki:
  theme: one-dark-pro
```

## 配置项
完整配置如下：
```yaml
shiki:
  theme: "one-dark-pro" # Theme, see https://shiki.style/themes for supported themes.
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

额外地，你可以在 `theme` 选项中指定多个主题：
```yaml
shiki:
  theme:
    light: one-light
    dark: one-dark-pro
    # ...
```
在 [Dual Themes](https://shiki.style/guide/dual-themes)     中查看如何切换多个主题。

## 感谢
本插件基于
- [ArcticLampyrid/hexo-shiki-highlighter](https://github.com/ArcticLampyrid/hexo-shiki-highlighter)
- [nova1751/hexo-shiki-plugin](https://github.com/nova1751/hexo-shiki-plugin)

进行开发。