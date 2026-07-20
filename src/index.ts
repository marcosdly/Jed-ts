/*
-----------
A gettext compatible i18n library for modern JavaScript Applications

by Alex Sexton - AlexSexton [at] gmail - @SlexAxton

MIT License

A jQuery Foundation project - requires CLA to contribute -
https://contribute.jquery.org/CLA/



Jed offers the entire applicable GNU gettext spec'd set of
functions, but also offers some nicer wrappers around them.
The api for gettext was written for a language with no function
overloading, so Jed allows a little more of that.

Many thanks to Joshua I. Miller - unrtst@cpan.org - who wrote
gettext.js back in 2008. I was able to vet a lot of my ideas
against his. I also made sure Jed passed against his tests
in order to offer easy upgrades -- jsgettext.berlios.de
*/

import { sprintf, vsprintf } from "sprintf-js";
import { mergeDeep } from "./util";
import { getPluralFormFunc } from "./PluralFormParser";

/**
 * @preserve jed.js https://github.com/SlexAxton/Jed
 */

class Chain {
  public constructor(
    private readonly _key: string,
    private readonly _i18n: Jed,
  ) {}

  private _domain?: string;
  private _context?: string;
  private _val?: number;
  private _pkey?: string;

  public onDomain(domain: string): this {
    this._domain = domain;
    return this;
  }

  public withContext(context: string): this {
    this._context = context;
    return this;
  }

  public ifPlural(num: number, pkey: string): this {
    this._val = num;
    this._pkey = pkey;
    return this;
  }

  public fetch(...arr: string[]): string {
    const gettextResult = this._i18n.dcnpgettext(
      this._domain!,
      this._context!,
      this._key!,
      this._pkey!,
      this._val!,
    );
    return arr.length ? sprintf(gettextResult, ...arr) : gettextResult;
  }
}

export interface JedOptions {
  locale_data: Record<
    string,
    {
      [key: string]: {
        domain: string;
        lang: string;
        plural_forms: string;
      };
    }
  >;
  domain: string;
  debug: boolean;
  missing_key_callback?: (key: string, domain: string) => void;
}

export default class Jed {
  public static readonly defaults: JedOptions = {
    locale_data: {
      messages: {
        "": {
          domain: "messages",
          lang: "en",
          plural_forms: "nplurals=2; plural=(n != 1);",
        },
        // There are no default keys, though
      },
    },
    // The default domain if one is missing
    domain: "messages",
    // enable debug mode to log untranslated strings to the console
    debug: false,

    missing_key_callback: undefined,
  } as const;

  public readonly defaults: JedOptions = Jed.defaults;

  /**
   * The gettext spec sets this character as the default delimiter for context lookups.
   * e.g.: context\u0004key
   * If your translation company uses something different,
   * just change this at any time and it will use that instead.
   */
  public static readonly context_delimiter = String.fromCharCode(4);
  public readonly context_delimiter = Jed.context_delimiter;

  public readonly options?: JedOptions;
  public constructor(options?: JedOptions) {
    this.options = mergeDeep<JedOptions>(
      {} as JedOptions,
      this.defaults,
      options ?? ({} as JedOptions),
    ) as JedOptions;
    this.textdomain(this.options?.domain);
    if (options?.domain && !this.options?.locale_data[this.options!.domain!]) {
      throw new Error(
        `Text domain set to non-existent domain: \`${options.domain}\``,
      );
    }
  }

  public static sprintf(fmt: string, ...args: string[]): string {
    return vsprintf(fmt, args);
  }

  public sprintf(fmt: string, ...args: string[]): string {
    return vsprintf(fmt, args);
  }

  /**
   * The sexier api start point
   */
  public translate(key: string): Chain {
    return new Chain(key, this);
  }

  private _textdomain?: string;
  public textdomain(domain?: string): string | undefined {
    if (!domain) {
      return this._textdomain;
    }
    this._textdomain = domain;
  }

  public gettext(key: string): string {
    return this._dcnpgettext(undefined, undefined, key);
  }

  public dgettext(domain: string, key: string): string {
    return this._dcnpgettext(domain, undefined, key);
  }

  public dcgettext(domain: string, key: string /*, category */): string {
    // Ignores the category anyways
    return this._dcnpgettext(domain, undefined, key);
  }

  public ngettext(skey: string, pkey: string, val: number): string {
    return this._dcnpgettext(undefined, undefined, skey, pkey, val);
  }

  public dngettext(
    domain: string,
    skey: string,
    pkey: string,
    val: number,
  ): string {
    return this._dcnpgettext(domain, undefined, skey, pkey, val);
  }

  public dcngettext(
    domain: string,
    skey: string,
    pkey: string,
    val: number /*, category */,
  ): string {
    return this._dcnpgettext(domain, undefined, skey, pkey, val);
  }

  public pgettext(context: string, key: string): string {
    return this._dcnpgettext(undefined, context, key);
  }

  public dpgettext(domain: string, context: string, key: string): string {
    return this._dcnpgettext(domain, context, key);
  }

  public dcpgettext(
    domain: string,
    context: string,
    key: string /*, category */,
  ) {
    return this._dcnpgettext(domain, context, key);
  }

  public npgettext(context: string, skey: string, pkey: string, val: number) {
    return this._dcnpgettext(undefined, context, skey, pkey, val);
  }

  public dnpgettext(
    domain: string,
    context: string,
    skey: string,
    pkey: string,
    val: number,
  ): string {
    return this._dcnpgettext(domain, context, skey, pkey, val);
  }

  public dcnpgettext(
    domain: string,
    context: string,
    singular_key: string,
    plural_key: string,
    val: number,
  ): string {
    return this._dcnpgettext(domain, context, singular_key, plural_key, val);
  }

  /**
   * The most fully qualified gettext function. It has every option.
   * Since it has every option, we can use it from every other method.
   * This is the bread and butter.
   * Technically there should be one more argument in this function for 'Category',
   * but since we never use it, we might as well not waste the bytes to define it.
   */
  private _dcnpgettext(
    domain?: string,
    context?: string,
    singular_key?: string,
    plural_key?: string,
    val?: number,
  ): string {
    // Make sure we have a truthy key. Otherwise we might start looking
    // into the empty string key, which is the options for the locale
    // data.
    if (!singular_key) throw new Error("No translation key found.");

    // Set some defaults
    plural_key = plural_key || singular_key;

    // Use the global domain default if one
    // isn't explicitly passed in
    domain = domain || this._textdomain!;

    // No options found
    if (!this.options) {
      // There's likely something wrong, but we'll return the correct key for english
      // We do this by instantiating a brand new Jed instance with the default set
      // for everything that could be broken.
      return this._dcnpgettext.call(
        new Jed(),
        undefined,
        undefined,
        singular_key,
        plural_key,
        val,
      );
    }

    const locale_data = this.options.locale_data;

    // No translation data provided
    if (!locale_data) throw new Error("No locale data provided.");

    if (!locale_data[domain])
      throw new Error(`Domain \`${domain}\` was not found.`);

    if (!locale_data[domain][""])
      throw new Error("No locale meta information provided.");

    const dict = locale_data[domain][""];
    const defaultConf = (locale_data || this.defaults.locale_data).messages[""];
    const pluralForms = dict.plural_forms || defaultConf.plural_forms;
    const key: string = context
      ? context + this.context_delimiter + singular_key
      : singular_key;

    let val_idx: number = 0;
    if (val !== undefined) {
      // Value has been passed in; use plural-forms calculations.

      // Handle invalid numbers, but try casting strings for good measure
      if (typeof val !== "number") val = parseInt(val, 10);
      if (isNaN(val))
        throw new Error("The number that was passed in is not a number.");

      val_idx = getPluralFormFunc(pluralForms)(val) as number;
    }

    // If there is no match, then revert back to
    // english style singular/plural with the keys passed in.
    if (val_idx > (dict?.[key as keyof typeof dict]?.length ?? Infinity)) {
      this.options.missing_key_callback?.(key, domain || "");

      const res_tuple = [singular_key, plural_key];

      // collect untranslated strings
      if (this.options.debug) {
        const index = getPluralFormFunc(pluralForms)(val!) as number;
        console.log(res_tuple[index]);
      }

      const index = getPluralFormFunc()(val!) as number;
      return res_tuple[index];
    }

    const res_value = dict?.[key as keyof typeof dict]?.[val_idx];

    // This includes empty strings on purpose
    if (!res_value) {
      const res_tuple = [singular_key, plural_key] as const;
      const index = getPluralFormFunc()(val!) as number;
      return res_tuple[index]!;
    }
    return res_value;
  }
}

/**
 * TODO how to even implement this in a modern way?? overrides?

 * Jed.sprintf = function (fmt, args) {
 *   if ({}.toString.call(args) == "[object Array]") {
 *     return vsprintf(fmt, [].slice.call(args));
 *   }
 *   return sprintf.apply(this, [].slice.call(arguments));
 * };

 * Jed.prototype.sprintf = function () {
 *   return Jed.sprintf.apply(this, arguments);
 * };

 * Leak a global regardless of module system
 * this["Jed"] = Jed;

 */
