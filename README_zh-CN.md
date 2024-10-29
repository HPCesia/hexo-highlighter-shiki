# Hexo-Highlight-Shiki
[![NPM Version](https://img.shields.io/npm/v/hexo-highlighter-shiki?style=flat)](https://www.npmjs.com/package/hexo-highlighter-shiki)

[English](README.md)丨简体中文

一个使用 [Shiki](https://github.com/shikijs/shiki) 作为代码块高亮器的 Hexo 插件。

需要 Hexo v7.0.0+。

## 功能
- 使用 [Shiki](https://github.com/shikijs/shiki) 渲染代码块，且与 Hexo 默认的代码高亮渲染的格式相似（因此你不需要对你现在使用的主题做很大的修改）。
- 支持多主题切换（需要自行编写对应的样式与脚本）。
- 支持自定义语言。
- 支持自定义主题。
- 支持 [@shikijs/transformers](https://shiki.style/packages/transformers) 中的转换器。

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
并使用
```shell
hexo clean && hexo generate
```
来享受由 Shiki 提供的代码高亮功能。

## 配置项
完整配置如下：
```yaml
shiki:
  theme: "one-dark-pro" # 主题，请参阅 https://shiki.style/themes 以获取支持的主题列表。
  line_number: false
  strip_indent: true
  tab_replace: "  "
  # 在 figure 标签中类名使用语言原名
  # 例如代码块语言为 'js' 时：
  # original_lang_name: false => <figure class="highlighter js">
  # original_lang_name: true => <figure class="highlighter javascript">
  original_lang_name: false
  pre_style: true # 保留 <pre> 标签的样式，即主题的 `background-color`。
  default_color: light # 仅在同时使用多个主题时生效。默认值：light
  css_variable_prefix: --shiki- # 仅在同时使用多个主题时生效。默认值：--shiki-
  # 需要启用的转换器列表。请参阅 https://shiki.style/packages/transformers 以获取支持的转换器列表。
  transformers:
    # 不需要设置选项时，可省略 `name` 与 `option`，直接使用字符串。
    - "example1"
    # 需要设置选项时，请显式设置 name 与 option。
    - name: example2
      # 转换器的选项，请查看转换器的源码以获取支持的选项列表
      # 转换器源码：https://github.com/shikijs/shiki/tree/main/packages/transformers/src/transformers
      option:
        exampleOption1: exampleValue1
        exampleOption2: exampleValue2
  additional:
    themes: # 要添加的主题的 TextMate 主题 json 列表。
      - path/to/theme.json
    langs: # 要添加的语言的 TextMate 语法 json 列表。
      - path/to/lang_grammar.json
    lang_alias: # 语言的别名列表。
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
在 [Dual Themes](https://shiki.style/guide/dual-themes) 中查看如何切换多个主题。

同时你还可以在 `original_lang_name` 中单独指定一些语言进行或不进行转换：
```yaml
original_lang_name:
  # 为真时将不转换 langs 内的语言，反之则只转换 langs 内的语言
  exclude: true
  # 必须为数组
  langs:
    - shell
    - bash
    - zsh
  # 改变语言原名
  change_origin:
    fortran-free-form: fortran
```
参阅 [Languages | Shiki](https://shiki.style/languages) 查看语言的原名（ID）。

### 转换器使用示例
如果你想标记某些行，你可以使用 Hexo 的代码块标签插件（本插件对其做了适配）：
```markdown
{% codeblock lang:rust mark:2 %}
fn main() {
    println!("Hello, world!");
}
{% endcodeblock %}
```

但是，如果你想在反引号代码块中标记某些行，你可以使用转换器：
```yaml
transformers:
  - name: transformerNotationHighlight
    option:
      classActiveLine: marked # 与 Hexo 的代码块标签标记行的类相同，默认值：highlighted
      classActivePre: "" # 默认值：has-highlighted
```
并在你的代码块中添加一些注释：
````markdown
```rust
fn main() {
    println!("Hello, world!"); // [!code highlight]
}
```
````
结果与 Hexo 的代码块标签插件相同。

## Bugs
### mathjax
如果你正在使用 [hexo-filter-mathjax](https://github.com/next-theme/hexo-filter-mathjax) 或其他任意在本地使用 mathjax 渲染数学公式的插件，在渲染包含代码块且开启 mathjax 渲染的文章时可能会出现 `Error: Can't find handler for document`。这是 mathjax 的问题，mathjax 的 LiteDOM adaptor 无法解析复杂的 HTML 片段。

#### 解决方法
以 hexo-filter-mathjax 插件为例，修改源代码中的[这一行](https://github.com/next-theme/hexo-filter-mathjax/blob/20dc61352f8cf4d19425ad1833eb72b467c212ef/index.js#L20C3-L20C40):
```diff
- data.content = mathjax(data.content);
+ data.content = data.content.replace(
+   /<span\s+class="math\s+[^"]*">\\[\(\[].*?\\[\)\]]<\/span>/gs,
+   mathjax);
```
这可以避免对那些复杂的 HTML 片段进行渲染导致的 `Can't find handler for document` 错误。

#### 相关 Issues
- [Error in applying html the markdown file #26](https://github.com/next-theme/hexo-filter-mathjax/issues/26)
- [Can't find handler for document #265](https://github.com/mathjax/MathJax-src/issues/265)

## 感谢
本插件基于
- [ArcticLampyrid/hexo-shiki-highlighter](https://github.com/ArcticLampyrid/hexo-shiki-highlighter)
- [nova1751/hexo-shiki-plugin](https://github.com/nova1751/hexo-shiki-plugin)

进行开发。