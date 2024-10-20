"use strict";
import { bundledLanguages, createHighlighter, ShikiTransformer } from "shiki";
import type Hexo from "hexo";
import { HighlightOptions } from "hexo/dist/extend/syntax_highlight";
import { stripIndent, htmlTag } from "hexo-util";
import { readFileSync } from "fs";

export async function init(hexo: Hexo) {
  const config = Object.assign(
    {
      theme: "one-dark-pro",
      line_number: false,
      strip_indent: true,
      tab_replace: "  ",
      pre_style: true,
      additional: {
        langs: [],
        lang_alias: {},
      },
    },
    hexo.config.shiki || {}
  );
  let additional_langs = [];
  if (config.additional.langs)
    for (const extra_lang of [].concat(config.additional.langs)) {
      additional_langs.push(JSON.parse(readFileSync(extra_lang, "utf8")));
    }
  const langs = [...Object.keys(bundledLanguages), ...additional_langs];
  let highlighter_options = {
    langs: langs,
    themes: typeof config.theme === "string" ? [config.theme] : Object.values(config.theme),
  };
  if (config.additional.lang_alias && Object.keys(config.additional.lang_alias).length > 0) {
    highlighter_options["langAliases"] = config.additional.lang_alias;
  }
  const highlighter = await createHighlighter(highlighter_options);
  const supportedLanguages = highlighter.getLoadedLanguages().reduce(
    (acc, lang) => {
      acc[lang] = true;
      return acc;
    },
    {
      text: true,
      plain: true,
      ansi: true,
    }
  );
  const hexoHighlighter = (code: string, options: HighlightOptions) => {
    var code = config.strip_indent ? (stripIndent(code) as string) : code;
    code = config.tab_replace ? code.replace(/\t/g, config.tab_replace) : code;

    // 处理代码语言
    let lang = options.lang;
    if (!lang || !supportedLanguages[lang]) {
      lang = "text";
    }

    // 处理代码块语法高亮
    let pre = "";
    const transformer = (): ShikiTransformer => {
      return {
        line(node, line) {
          if (options.mark && options.mark.includes(line)) {
            this.addClassToHast(node, "marked");
          }
        },
      };
    };
    try {
      if (config.theme === "string")
        pre = highlighter.codeToHtml(code, {
          lang,
          theme: config.theme,
          transformers: [transformer()],
        });
      else
        pre = highlighter.codeToHtml(code, {
          lang,
          themes: config.theme,
          transformers: [transformer()],
        });
      // 删除多余内容
      pre = pre.replace(/<pre[^>]*>/, (match) => {
        if (config.pre_style) return match.replace(/\s*tabindex="0"/, "");
        return match.replace(/\s*style\s*=\s*"[^"]*"\s*tabindex="0"/, "");
      });
      pre = pre.replace(/<\/?code>/, "");
    } catch (error) {
      console.warn(error);
      pre = htmlTag("pre", {}, code);
    }

    // 处理行号
    let numbers = "";
    const show_line_number =
      config.line_number && // 设置中显示行号
      (options.line_number || true) && // 代码块中未设置不显示行号
      (options.line_threshold || 0) < options.lines_length; // 代码行数超过阈值
    if (show_line_number) {
      const firstLine = options.firstLine || 1
      for (let i = firstLine, len = code.split("\n").length + firstLine; i < len; i++) {
        numbers += htmlTag("span", { class: "line" }, `${i}`, false) + "<br>";
      }
      numbers = htmlTag("pre", {}, numbers, false);
    }

    // 处理标题与链接
    const caption = options.caption ? htmlTag("figcaption", {}, options.caption, false) : "";

    // 处理包裹标签
    const td_code = htmlTag("td", { class: "code" }, pre, false);
    const td_gutter = numbers.length > 0 ? htmlTag("td", { class: "gutter" }, numbers, false) : "";

    // 合并标签
    const html = htmlTag(
      "figure",
      { class: `highlight ${lang}` },
      caption +
        htmlTag(
          "table",
          {},
          htmlTag("tbody", {}, htmlTag("tr", {}, td_gutter + td_code, false), false),
          false
        ),
      false
    );
    return html;
  };
  hexo.extend.highlight.register("shiki", hexoHighlighter);
}
