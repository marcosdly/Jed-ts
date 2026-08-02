import { expect, it } from "vitest";
import Jed from "../src";

const locale_data_w_context = {
  context_sprintf_test: {
    "": {
      domain: "context_sprintf_test",
      lang: "en",
      "plural-forms": "nplurals=2; plural=(n != 1);",
    },
    "test singular": ["test_1"],
    "test plural %1$d": ["test_1_singular %1$d", "test_1_plural %1$d"],
    "context\u0004test context": ["test_1context"],
    test2: ["test_2"],
    "zero length translation": [""],
    "context\u0004test2": ["test_2context"],
    "context\u0004context plural %1$d": ["context_plural_1 singular %1$d", "context_plural_1 plural %1$d"],
  },
};

const _static = Jed;
const _instance = new Jed({
  domain: "context_sprintf_test",
  locale_data: locale_data_w_context,
});

it("should take multiple types of arrays as input", function () {
  const strings: Record<string, string> = {
    blah: "blah",
    "thing%1$sbob": "thing[one]bob",
    "thing%1$s%2$sbob": "thing[one][two]bob",
    "thing%1$sasdf%2$sasdf": "thing[one]asdf[two]asdf",
    "%1$s%2$s%3$s": "[one][two]",
    "tom%1$saDick": "tom[one]aDick",
  };
  const args = ["[one]", "[two]"];

  for (const [key, value] of Object.entries(strings)) {
    // test using new Array
    expect(_static.sprintf(key, "[one]", "[two]")).toEqual(value);
    expect(_instance.sprintf(key, "[one]", "[two]")).toEqual(value);
    // test using predefined array
    expect(_static.sprintf(key, args)).toEqual(value);
    expect(_instance.sprintf(key, args)).toEqual(value);
  }
});

it("should accept a single string instead of an array", () => {
  // test using scalar rather than array
  const strings: Record<string, string> = {
    blah: "blah",
    "": "",
    "%%": "%",
    "tom%%dick": "tom%dick",
    "thing%1$sbob": "thing[one]bob",
    "thing%1$s%2$sbob": "thing[one]bob",
    "thing%1$sasdf%2$sasdf": "thing[one]asdfasdf",
    "%1$s%2$s%3$s": "[one]",
  };
  const arg = "[one]";

  for (const [key, value] of Object.entries(strings)) {
    expect(_static.sprintf(key, arg)).toEqual(value);
    expect(_instance.sprintf(key, arg)).toEqual(value);
  }
});
