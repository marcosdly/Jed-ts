/**
 * This is a full plural form expression parser. It is used to avoid
 * running 'eval' or 'new Function' directly against the plural
 * forms.
 *
 * This can be important if you get translations done through a 3rd
 * party vendor. I encourage you to use this instead, however, I
 * also will provide a 'precompiler' that you can use at build time
 * to output valid/safe function representations of the plural form
 * expressions. This means you can build this code out for the most
 * part.
 */

import "../generated/lib_plurals_parser.js";
import isCallable from "is-callable";

declare var lib_plurals_parser: {
  parse(input: string): any;
};

const { freeze } = Object;

const regexps = freeze({
  TRIM_BEG: /^\s\s*/,
  TRIM_END: /\s\s*$/,
  HAS_SEMICOLON: /;\s*$/,
  NPLURALS: /nplurals\=(\d+);/,
  PLURAL: /plural\=(.*);/,
});

/**
 * Return `1` if `value` is `true`, `0` if `false` or falsy, otherwise the `value` itself (truthy).
 */
function __imply__<T>(value: T): T | 0 | 1 {
  return value === true ? 1 : value || 0;
}

export function parse(plural: string) {
  return lib_plurals_parser.parse(extractPluralExpr(plural));
}

export function compile(plural: string) {
  return function (n: number) {
    const ast = parse(plural);
    return __imply__(__interpret__(ast, n));
  };
}

type InterpreterResult =
  boolean | string | number | ((n: number) => InterpreterResult);

interface AST {
  type: string;
  val: number;
  expr: AST;
  truthy: AST;
  falsey: AST;
  left: AST;
  right: AST;
}

function __interpret__(ast: AST, n: number): InterpreterResult {
  const fn = interpreter(ast);
  if (isCallable(fn)) return fn(n);
  throw new Error(
    `Interpreted value ${ast} returns a non callable value '${fn}'`,
  );
}

function interpreter(ast: AST): InterpreterResult {
  return (n: number): InterpreterResult => {
    const t = ast.type;

    if (t === "VAR") return n;
    if (t === "NUM") return ast.val;

    const expr = __interpret__(ast.expr, n);

    if (t === "GROUP") return expr;

    const falsey = __interpret__(ast.falsey, n);
    const truthy = __interpret__(ast.truthy, n);

    if (t === "TERNARY") return expr ? truthy : falsey;

    const left = __interpret__(ast.left, n) as number;
    const right = __interpret__(ast.right, n) as number;

    switch (t) {
      case "OR":
        return left || right;
      case "AND":
        return left && right;
      case "LT":
        return left < right;
      case "GT":
        return left > right;
      case "LTE":
        return left <= right;
      case "GTE":
        return left >= right;
      case "EQ":
        return left == right;
      case "NEQ":
        return left != right;
      case "MOD":
        return left % right;
      default:
        throw new Error("Invalid Token found.");
    }
  };
}

function extractPluralExpr(plural_expr: string) {
  // trim first
  let p = plural_expr
    .replace(regexps.TRIM_BEG, "")
    .replace(regexps.TRIM_END, "");

  if (!regexps.HAS_SEMICOLON.test(p)) p = p.concat(";");

  // Find the nplurals number
  const nplurals: string | undefined = p.match(regexps.NPLURALS)?.[1];
  if (nplurals === undefined)
    throw new Error("nplurals not found in plural_forms string: " + p);

  p = p.replace(regexps.NPLURALS, ""); // remove that data to get to the formula

  const plural = p.match(regexps.PLURAL)?.[1];
  if (!plural) throw new Error(`\`plural\` expression not found: ${p}`);

  return plural;
}

export function getPluralFormFunc(plural_form_string?: string) {
  return compile(plural_form_string || "nplurals=2; plural=(n != 1);");
}
