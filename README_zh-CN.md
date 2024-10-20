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
  pre_style: true # Preserve the style of the <pre> tag, i.e., the theme's `background-color`.
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

## Bugs
### mathjax
如果你正在使用 [hexo-filter-mathjax](https://github.com/next-theme/hexo-filter-mathjax) 或其他任意在本地使用 mathjax 渲染数学公式的插件，在渲染包含代码块且开启 mathjax 渲染的文章时可能会出现 `Error: Can't find handler for document`。这是 mathjax 的问题，mathjax 的 LiteDOM adaptor 无法解析复杂的 HTML 片段。

#### 解决方法

以 hexo-filter-mathjax 插件为例，修改源代码中的[这一行](https://github.com/next-theme/hexo-filter-mathjax/blob/20dc61352f8cf4d19425ad1833eb72b467c212ef/index.js#L20C3-L20C40):
```js
- data.content = mathjax(data.content);
+ data.content = data.content.replace(/<span\s+class="math\s+[^"]*">\\[\(\[].*?\\[\)\]]<\/span>/gs, mathjax);
```
这可以避免对那些复杂的 HTML 片段进行渲染导致的 `Can't find handler for document` 错误。

#### 相关 Issues
- [Error in applying html the markdown file #26](https://github.com/next-theme/hexo-filter-mathjax/issues/26)
- [ Can't find handler for document #265 ](https://github.com/mathjax/MathJax-src/issues/265)

## 感谢
本插件基于
- [ArcticLampyrid/hexo-shiki-highlighter](https://github.com/ArcticLampyrid/hexo-shiki-highlighter)
- [nova1751/hexo-shiki-plugin](https://github.com/nova1751/hexo-shiki-plugin)

进行开发。