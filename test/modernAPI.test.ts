import { expect, it, describe } from "vitest";
import Jed from "../src";

describe("Chainable API", function () {
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
      "context\u0004context plural %1$d": [
        "context_plural_1 singular %1$d",
        "context_plural_1 plural %1$d",
      ],
    },
    other_domain: {
      "": {
        domain: "other_domain",
        lang: "en",
        "plural-forms": "nplurals=2; plural=(n != 1);",
      },
      "test other_domain singular": ["other domain test 1"],
      "context\u0004context other plural %1$d": [
        "context_plural_1 singular %1$d",
        "context_plural_1 plural %1$d",
      ],
    },
  };
  const i18n = new Jed({
    locale_data: locale_data_w_context,
    domain: "context_sprintf_test",
  });

  it("should handle a simple gettext passthrough", function () {
    expect(i18n.translate("test singular").fetch()).toEqual("test_1");
  });

  it("should handle changing domains", function () {
    expect(
      i18n
        .translate("test other_domain singular")
        .onDomain("other_domain")
        .fetch(),
    ).toEqual("other domain test 1");
  });

  it("should allow you to add plural information in the chain.", function () {
    expect(
      i18n.translate("test plural %1$d").ifPlural(5, "dont matta").fetch(),
    ).toEqual("test_1_plural %1$d");
  });

  it("should take in a sprintf set of args (as array) on the plural lookup", function () {
    expect(
      i18n.translate("test plural %1$d").ifPlural(5, "dont matta").fetch([5]),
    ).toEqual("test_1_plural 5");
    expect(
      i18n
        .translate("test plural %1$d %2$d")
        .ifPlural(5, "dont matta %1$d %2$d")
        .fetch([5, 6]),
    ).toEqual("dont matta 5 6");
    expect(
      i18n
        .translate("test plural %1$d %2$d")
        .ifPlural(1, "dont matta %1$d %2$d")
        .fetch([1, 6]),
    ).toEqual("test plural 1 6");
  });

  it("should take in a sprintf set of args (as args) on the plural lookup", function () {
    expect(
      i18n
        .translate("test plural %1$d %2$d")
        .ifPlural(5, "dont matta %1$d %2$d")
        .fetch(5, 6),
    ).toEqual("dont matta 5 6");
    expect(
      i18n
        .translate("test plural %1$d %2$d")
        .ifPlural(1, "dont matta %1$d %2$d")
        .fetch(1, 6),
    ).toEqual("test plural 1 6");
  });

  it("should handle context information.", function () {
    expect(
      i18n.translate("test context").withContext("context").fetch(),
    ).toEqual("test_1context");
  });

  it("should be able to do all at the same time.", function () {
    expect(
      i18n
        .translate("context other plural %1$d")
        .withContext("context")
        .onDomain("other_domain")
        .ifPlural(5, "ignored %1$d")
        .fetch(5),
    ).toEqual("context_plural_1 plural 5");
    expect(
      i18n
        .translate("context other plural %1$d")
        .withContext("context")
        .onDomain("other_domain")
        .ifPlural(1, "ignored %1$d")
        .fetch(1),
    ).toEqual("context_plural_1 singular 1");
  });
});
