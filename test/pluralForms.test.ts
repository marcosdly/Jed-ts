import { expect, it } from "vitest";
import { compile } from "../src/PluralFormParser";

/**
 * This is the method from the original gettext.js that uses new Function
 */
function evalParse(plural_forms: string) {
  const pf_re = new RegExp(
    "^(\\s*nplurals\\s*=\\s*[0-9]+\\s*;\\s*plural\\s*=\\s*(?:\\s|[-\\?\\|&=!<>+*/%:;a-zA-Z0-9_\(\)])+)",
    "m",
  );
  if (pf_re.test(plural_forms)) {
    let pf = plural_forms;
    if (!/;\s*$/.test(pf)) pf = pf.concat(";");

    const code = `
      let plural, nplurals;
      ${pf}
      return { "nplural" : nplurals, "plural" : (plural === true ? 1 : plural ? plural : 0) };
    `;
    return new Function("n", code);
  } else {
    throw new Error("Syntax error in language file. Plural-Forms header is invalid [" + plural_forms + "]");
  }
}

/**
 *  http://translate.sourceforge.net/wiki/l10n/pluralforms
 */
it("should have the same result as doing an eval on the expression for all known plural-forms.", () => {
  const plural_form_strings = [
    "nplurals=2; plural=(n > 1)",
    "nplurals=2; plural=(n != 1)",
    "nplurals=6; plural= n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5;",
    "nplurals=1; plural=0",
    "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)",
    "nplurals=3; plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2",
    "nplurals=3; plural=n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2",
    "nplurals=4; plural= (n==1) ? 0 : (n==2) ? 1 : (n != 8 && n != 11) ? 2 : 3",
    "nplurals=2; plural=n > 1",
    "nplurals=5; plural=n==1 ? 0 : n==2 ? 1 : n<7 ? 2 : n<11 ? 3 : 4",
    "nplurals=4; plural=(n==1 || n==11) ? 0 : (n==2 || n==12) ? 1 : (n > 2 && n < 20) ? 2 : 3",
    "nplurals=2; plural= (n > 1)",
    "nplurals=2; plural=(n%10!=1 || n%100==11)",
    "nplurals=2; plural=n!=0",
    "nplurals=2; plural=(n!=1)",
    "nplurals=2; plural=(n!= 1)",
    "nplurals=4; plural= (n==1) ? 0 : (n==2) ? 1 : (n == 3) ? 2 : 3",
    "nplurals=2; plural=n>1;",
    "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2)",
    "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n != 0 ? 1 : 2)",
    "nplurals=2; plural= n==1 || n%10==1 ? 0 : 1",
    "nplurals=3; plural=(n==0 ? 0 : n==1 ? 1 : 2)",
    "nplurals=4; plural=(n==1 ? 0 : n==0 || ( n%100>1 && n%100<11) ? 1 : (n%100>10 && n%100<20 ) ? 2 : 3)",
    "nplurals=3; plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)",
    "nplurals=2; plural=(n!=1);",
    "nplurals=3; plural=(n==1 ? 0 : (n==0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2);",
    "nplurals=4; plural=(n%100==1 ? 1 : n%100==2 ? 2 : n%100==3 || n%100==4 ? 3 : 0)",
    "nplurals=2; plural=n != 1",
    "nplurals=2; plural=(n>1)",
    "nplurals=1; plural=0;",
  ];
  for (const plural_form of plural_form_strings)
    for (let i = 0; i < 106; i++) {
      const pf_compiled = compile(plural_form)(i);
      const pf_evaluated = evalParse(plural_form)(i).plural;
      expect(pf_compiled).toEqual(pf_evaluated);
    }
});
