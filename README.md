# Hexo-Highlight-Shiki
[![NPM Version](https://img.shields.io/npm/v/hexo-highlighter-shiki?style=flat)](https://www.npmjs.com/package/hexo-highlighter-shiki)

English丨[简体中文](README_zh-CN.md)

A hexo plugin to use [Shiki](https://github.com/shikijs/shiki) as code block highlighter.

[Hexo](https://github.com/hexojs/hexo) v7.0.0+ is required.

## Features
- Use [Shiki](https://github.com/shikijs/shiki) to render code blocks, and the format is similar to Hexo's default code highlighting (so you don't need to make significant changes to the theme you are currently using).
- Support switching between multiple themes (you need to write the corresponding styles and scripts yourself).
- Support custom language.
- Support custom theme.
- Support transformers in [@shikijs/transformers](https://shiki.style/packages/transformers).

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
and use
```shell
hexo clean && hexo generate
```
to enjoy code highlighting powered by Shiki.

## Configuration Options
The complete configuration is as follows:
```yaml
shiki:
  theme: one-dark-pro # Please refer to https://shiki.style/themes for supported themes.
  line_number: false # default: false
  strip_indent: true # default: true
  tab_replace: "  " # default: "  "
  # Use the original language name in the figure tag
  # For example, when the language of code block is 'js':
  # original_lang_name: false => <figure class="highlighter js">
  # original_lang_name: true => <figure class="highlighter javascript">
  original_lang_name: false
  pre_style: true # Preserve the style of the <pre> tag. default: true
  default_color: light # Only take effect when using multiple themes. default: light
  css_variable_prefix: --shiki- # Only take effect when using multiple themes. default: --shiki-
  # List of transformers to be enabled.
  # Please refer to https://shiki.style/packages/transformers for the list of supported transformers.
  transformers:
    # You can omit `name` and `option` when no options are required, directly using the string.
    - "example1"
    # When additional option are required, please explicitly set name and option.
    - name: example2
      # Options for the transformer.
      # Please check the @shikijs/transformer's source code to get the list of supported options
      # Source code of @shikijs/transformer:
      # https://github.com/shikijs/shiki/tree/main/packages/transformers/src/transformers
      option:
        exampleOption1: exampleValue1
        exampleOption2: exampleValue2
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

You can also specify some languages individually in `original_lang_name` to not convert or only convert them:
```yaml
original_lang_name:
  # Set to true to exclude the languages listed in `langs`,
  # otherwise only convert the languages in `langs`.
  exclude: true
  # Must be an array
  langs:
    - shell
    - bash
    - zsh
  # Change the original language name
  change_origin:
    fortran-free-form: fortran
```
Refer to [Languages | Shiki](https://shiki.style/languages) to view the original names (IDs) of languages.

### Example of Using Transformers
if you want to mark some lines, you can use Hexo's code block tag plugin (which has been adapted by this plugin):
```markdown
{% codeblock lang:rust mark:2 %}
fn main() {
    println!("Hello, world!");
}
{% endcodeblock %}
```

But if you want to mark some lines in backtick code blocks, you can use transformer:
```yaml
transformers:
  - name: transformerNotationHighlight
    option:
      classActiveLine: marked # same to Hexo's code block tag, default: highlighted
      classActivePre: "" # default: has-highlighted
```
and add some comment to your code block:
````markdown
```rust
fn main() {
    println!("Hello, world!"); // [!code highlight]
}
```
````
The result is the same as the Hexo code block tag plugin.

## Bugs
### mathjax
If you are using [hexo-filter-mathjax](https://github.com/next-theme/hexo-filter-mathjax) or any other plugin that uses mathjax to render mathematical formulas locally, you may encounter an `Error: Can't find handler for document` when rendering articles that include code blocks and have mathjax rendering enabled. This is a problem with mathjax, as its LiteDOM adaptor cannot parse complex HTML fragments.

#### Solution
For example, if you are using the hexo-filter-mathjax plugin, modify the [this line](https://github.com/next-theme/hexo-filter-mathjax/blob/20dc61352f8cf4d19425ad1833eb72b467c212ef/index.js#L20C3-L20C40) in the source code:
```diff
- data.content = mathjax(data.content);
+ data.content = data.content.replace(
+   /<span\s+class="math\s+[^"]*">\\[\(\[].*?\\[\)\]]<\/span>/gs,
+   mathjax);
```
This will prevent rendering errors for complex HTML fragments that result in `Can't find handler for document`.

#### Related Issues:
- [Error in applying html the markdown file #26](https://github.com/next-theme/hexo-filter-mathjax/issues/26)
- [Can't find handler for document #265](https://github.com/mathjax/MathJax-src/issues/265)


## Acknowledgments
This plugin is developed based on
- [ArcticLampyrid/hexo-shiki-highlighter](https://github.com/ArcticLampyrid/hexo-shiki-highlighter)
- [nova1751/hexo-shiki-plugin](https://github.com/nova1751/hexo-shiki-plugin)
