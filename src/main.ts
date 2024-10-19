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
    let lang = options.lang;
    if (!lang || !supportedLanguages[lang]) {
      lang = "text";
    }
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
      pre = pre.replace(/<pre[^>]*>/, "<pre>");
      pre = pre.replace(/<\/?code>/, "");
    } catch (error) {
      console.warn(error);
      pre = htmlTag("pre", {}, code);
    }

    let numbers = "";
    if (config.line_number) {
      for (let i = 0, len = code.split("\n").length; i < len; i++) {
        numbers += htmlTag("span", { class: "line" }, `${1 + i}`, false) + "<br>";
      }
      numbers = htmlTag("pre", {}, numbers, false);
    }
    const td_code = htmlTag("td", { class: "code" }, pre, false);
    const td_gutter = htmlTag("td", { class: "gutter" }, numbers, false);
    const html = htmlTag(
      "figure",
      { class: `highlight ${lang}` },
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
