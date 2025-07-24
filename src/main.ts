"use strict";
import { bundledLanguages, bundledThemes, createHighlighter, ShikiTransformer } from "shiki";
import type Hexo from "hexo";
import { HighlightOptions } from "hexo/dist/extend/syntax_highlight";
import { stripIndent, htmlTag } from "hexo-util";
import { readFileSync } from "fs";
import {
  transformerCompactLineOptions,
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerRemoveLineBreak,
  transformerRemoveNotationEscape,
  transformerRenderWhitespace,
} from "@shikijs/transformers";

const supported_transformers = {
  transformerCompactLineOptions,
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerRemoveLineBreak,
  transformerRemoveNotationEscape,
  transformerRenderWhitespace,
};

type SupportedTransformers = keyof typeof supported_transformers;

interface TransformerConfig {
  name: SupportedTransformers;
  option?: Record<string, any> | undefined;
}

interface OriginalLangNameConfig {
  exclude?: boolean;
  langs?: string[];
  change_origin?: Record<string, string>;
}

interface AdditionalConfig {
  themes?: string[];
  langs?: string[];
  lang_alias?: Record<string, string>;
}

interface HighlighterConfig {
  theme?: string | Record<string, string>;
  line_number?: boolean;
  strip_indent?: boolean;
  tab_replace?: string;
  original_lang_name?: boolean | OriginalLangNameConfig;
  pre_style?: boolean;
  default_color?: string;
  css_variable_prefix?: string;
  transformers?: (SupportedTransformers | TransformerConfig)[];
  additional?: AdditionalConfig;
}

export async function init(hexo: Hexo) {
  const config: HighlighterConfig = Object.assign(
    {
      theme: "one-dark-pro",
      line_number: false,
      strip_indent: true,
      tab_replace: "  ",
      original_lang_name: false,
      pre_style: true,
      default_color: "light",
      css_variable_prefix: "--shiki-",
      transformers: [],
      // TODO: 增加 `wrap` 选项，与 Hexo 的 highlight.js 渲染行为一致
      // TODO: 增加 `beautify` 选项以适配更多主题
      additional: {
        themes: [],
        langs: [],
        lang_alias: {},
      },
    },
    hexo.config.shiki || {}
  );

  // 处理自定义语言 json
  let additional_langs = [];
  if (config.additional.langs)
    for (const extra_lang of [].concat(config.additional.langs)) {
      additional_langs.push(JSON.parse(readFileSync(extra_lang, "utf8")));
    }
  const langs = [...Object.keys(bundledLanguages), ...additional_langs];

  // 处理自定义主题 json
  let additional_themes = [];
  if (config.additional.themes)
    for (const extra_theme of [].concat(config.additional.themes)) {
      additional_themes.push(JSON.parse(readFileSync(extra_theme, "utf8")));
    }
  // 处理主题
  const themes = additional_themes.concat(
    (typeof config.theme === "string" ? [config.theme] : Object.values(config.theme)).filter(
      (theme) => theme in bundledThemes
    )
  );

  // 处理 transformers
  const transformers = config.transformers
    .map((transformer) => {
      if (typeof transformer === "string") {
        let tfm = supported_transformers[transformer];
        if (!tfm) return null;
        return tfm();
      }
      let tfm = supported_transformers[transformer["name"]];
      if (!tfm) return null;
      let option = transformer["option"];
      if (!option) return tfm();
      // @ts-ignore
      return tfm(option);
    })
    .filter((tfm) => tfm !== null);

  // 创建 highlighter
  let highlighter_options = {
    langs: langs,
    themes: themes,
  };
  if (config.additional.lang_alias && Object.keys(config.additional.lang_alias).length > 0) {
    highlighter_options["langAlias"] = config.additional.lang_alias;
  }
  const highlighter = await createHighlighter(highlighter_options);
  const supported_languages = highlighter.getLoadedLanguages().reduce(
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

  // 处理语言转换原名
  const useOringinalLangName = (lang: string) => {
    if (lang === "text") return false;
    if (typeof config.original_lang_name === "boolean") return config.original_lang_name;
    const exclude = config.original_lang_name.exclude || false;
    const langs = config.original_lang_name.langs || [];
    return exclude ? !langs.includes(lang) : langs.includes(lang);
  };

  const originalLangName = (lang: string) => {
    const name = highlighter.getLanguage(lang).name;
    if (typeof config.original_lang_name === "boolean") return name;
    const origin = config.original_lang_name.change_origin || {};
    if (name in origin) return origin[name];
    return name;
  };

  const hexoHighlighter = (code: string, options: HighlightOptions) => {
    var code = config.strip_indent ? (stripIndent(code) as string) : code;
    code = config.tab_replace ? code.replace(/\t/g, config.tab_replace) : code;

    // 处理代码语言
    let lang = options.lang;
    if (!lang || !supported_languages[lang]) {
      lang = "text";
    }

    // 处理代码块语法高亮
    let pre = "";
    const transformerMarkedLine = (): ShikiTransformer => {
      return {
        line(node, line) {
          if (options.mark && options.mark.includes(line)) {
            this.addClassToHast(node, "marked");
          }
        },
      };
    };
    try {
      if (typeof config.theme === "string")
        pre = highlighter.codeToHtml(code, {
          lang,
          theme: config.theme,
          transformers: [transformerMarkedLine()].concat(transformers),
        });
      else
        pre = highlighter.codeToHtml(code, {
          lang,
          themes: config.theme,
          transformers: [transformerMarkedLine()].concat(transformers),
          defaultColor: config.default_color,
          cssVariablePrefix: config.css_variable_prefix,
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
      const firstLine = options.firstLine || 1;
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
      {
        class: `highlight ${useOringinalLangName(lang) ? originalLangName(lang) : lang}`,
      },
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
