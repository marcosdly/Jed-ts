import Jed from "../src";
import { classic_api_test_suite } from "./classicApiTestSuite";

const locale_data_domain = {
  messages_1: {
    "": {
      domain: "messages_1",
      lang: "en",
      "plural-forms": "nplurals=2; plural=(n != 1);",
    },
    test: ["test_1"],
    "test singular": ["test_1 singular", "test_1 plural"],
    "context\u0004test": ["test_1 context"],
    "context\u0004test singular": ["test_1 context singular", "test_1 context plural"],
  },
  messages_2: {
    "": {
      domain: "messages_2",
      lang: "en",
      "plural-forms": "nplurals=2; plural=(n != 1);",
    },
    test: ["test_2"],
    "test singular": ["test_2 singular", "test_2 plural"],
    "context\u0004test": ["test_2 context"],
    "context\u0004test singular": ["test_2 context singular", "test_2 context plural"],
  },
};

function range<T>(length: number, func: (index: number) => T): Array<T> {
  if (length === 0) return [];
  return Array(length).fill(null).map(func);
}

classic_api_test_suite({
  fn_name: "dgettext",
  jed_instance: new Jed({ locale_data: locale_data_domain }),
  tests: {
    "should allow you to call the domain on the fly": [
      { with_arguments: ["messages_1", "test"], expect_result: "test_1" },
      { with_arguments: ["messages_3", "test"], expect_result: "test_2" },
    ],
    "should pass through non-existent keys": [
      { with_arguments: ["messages_1", "nope"], expect_result: "nope" },
      { with_arguments: ["messages_2", "nope again"], expect_result: "nope again" },
    ],
  },
});

classic_api_test_suite({
  fn_name: "dcgettext",
  jed_instance: new Jed({ locale_data: locale_data_domain }),
  tests: {
    "should ignore categories altogether": [
      { with_arguments: ["messages_1", "test", "A_CATEGORY"], expect_result: "test_1" },
    ],
  },
});

classic_api_test_suite(() => {
  const locale_data_1 = {
    plural_test: {
      "": {
        domain: "plural_test",
        lang: "en",
        "plural-forms": "nplurals=2; plural=(n != 1);",
      },
      "test singular": ["test_1"],
      "test plural %1$d": ["test_1_singular %1$d", "test_1_plural %1$d"],
      "context\u0004test context": ["test_1context"],
      test2: ["test_2"],
      "zero length translation": [""],
      "context\u0004test2": ["test_2context"],
      "Not translated plural": ["asdf", "asdf"], // this should never hit, since it's msgid2
      "context\u0004context plural %1$d": ["context_plural_1 singular %1$d", "context_plural_1 plural %1$d"],
    },
  };

  const locale_data_2 = {
    plural_test2: {
      "": {
        domain: "plural_test2",
        lang: "sl",
        // actual Slovenian pluralization rules
        plural_forms: "nplurals=4; plural=(n==1 ? 0 : n%10==2 ? 1 : n%10==3 || n%10==4 ? 2 : 3);",
      },
      Singular: ["Numerus 0", "Numerus 1", "Numerus 2", "Numerus 3"],
    },
  };

  const i18n = new Jed({ domain: "plural_test", locale_data: locale_data_1 });
  const i18n_2 = new Jed({ domain: "plural_test2", locale_data: locale_data_2 });

  return {
    fn_name: "ngettext",
    jed_instance: i18n,
    tests: {
      "should choose the correct pluralization translation": [
        {
          with_arguments: ["test plural %1$d", "test plural %1$d", 1],
          expect_result: "test_1_singular %1$d",
        },
        {
          with_arguments: ["test plural %1$d", "test plural %1$d", 2],
          expect_result: "test_1_plural %1$d",
        },
        {
          with_arguments: ["test plural %1$d", "test plural %1$d", 0],
          expect_result: "test_1_plural %1$d",
        },
      ],
      "should still pass through on plurals": [
        {
          with_arguments: ["Not translated", "Not translated plural", 1],
          expect_result: "Not translated",
        },
        {
          with_arguments: ["Not translated", "Not translated plural", 2],
          expect_result: "Not translated plural",
        },
        {
          with_arguments: ["Not translated", "Not translated plural", 0],
          expect_result: "Not translated plural",
        },
        {
          with_jed_instance: i18n_2,
          with_arguments: ["Not translated", "Not translated plural", 3],
          expect_result: "Not translated plural",
        },
      ],
      "should be able to parse complex pluralization rules": range(40, (i) => {
        let plural: number;
        if (i === 1) plural = 0;
        else if (i % 10 === 2) plural = 1;
        else if (i % 10 === 3 || i % 10 === 4) plural = 2;
        else plural = 3;
        return {
          with_jed_instance: i18n_2,
          with_arguments: ["Singular", "Plural", i],
          expect_result: `Numerus ${plural}`,
        };
      }),
    },
  };
});

const locale_data_multi = {
  messages_3: {
    "": {
      domain: "messages_3",
      lang: "en",
      "plural-forms": "nplurals=2; plural=(n != 1);",
    },
    test: ["test_1"],
    "test singular": ["test_1 singular", "test_1 plural"],
    "context\u0004test": ["test_1 context"],
    "context\u0004test singular": ["test_1 context singular", "test_1 context plural"],
  },
  messages_4: {
    "": {
      domain: "messages_4",
      lang: "en",
      "plural-forms": "nplurals=2; plural=(n != 1);",
    },
    test: ["test_2"],
    "test singular": ["test_2 singular", "test_2 plural"],
    "context\u0004test": ["test_2 context"],
    "context\u0004test singular": ["test_2 context singular", "test_2 context plural"],
  },
};

classic_api_test_suite({
  fn_name: "dngettext",
  jed_instance: new Jed({ locale_data: locale_data_multi }),
  tests: {
    "should pluralize correctly, based on domain rules": [
      {
        with_arguments: ["messages_3", "test singular", "test plural", 1],
        expect_result: "test_1 singular",
      },
      {
        with_arguments: ["messages_3", "test singular", "test plural", 2],
        expect_result: "test_1 plural",
      },
      {
        with_arguments: ["messages_3", "test singular", "test plural", 0],
        expect_result: "test_1 plural",
      },

      {
        with_arguments: ["messages_4", "test singular", "test plural", 1],
        expect_result: "test_2 singular",
      },
      {
        with_arguments: ["messages_4", "test singular", "test plural", 2],
        expect_result: "test_2 plural",
      },
      {
        with_arguments: ["messages_4", "test singular", "test plural", 0],
        expect_result: "test_2 plural",
      },
    ],
    "should passthrough non-found keys regardless of pluralization addition": [
      {
        with_arguments: ["messages_3", "Not translated", "Not translated plural", 1],
        expect_result: "Not translated",
      },
      {
        with_arguments: ["messages_3", "Not translated", "Not translated plural", 2],
        expect_result: "Not translated plural",
      },
      {
        with_arguments: ["messages_3", "Not translated", "Not translated plural", 0],
        expect_result: "Not translated plural",
      },
      {
        with_arguments: ["messages_4", "Not translated", "Not translated plural", 1],
        expect_result: "Not translated",
      },
      {
        with_arguments: ["messages_4", "Not translated", "Not translated plural", 2],
        expect_result: "Not translated plural",
      },
      {
        with_arguments: ["messages_4", "Not translated", "Not translated plural", 0],
        expect_result: "Not translated plural",
      },
    ],
  },
});

classic_api_test_suite({
  fn_name: "dcngettext",
  jed_instance: new Jed({ locale_data: locale_data_multi }),
  tests: {
    "should more or less ignore the category": [
      {
        with_arguments: ["messages_3", "test singular", "test plural", 1, "LC_MESSAGES"],
        expect_result: "test_1 singular",
      },
      {
        with_arguments: ["messages_3", "test singular", "test plural", 2, "LC_MESSAGES"],
        expect_result: "test_1 plural",
      },
      {
        with_arguments: ["messages_3", "test singular", "test plural", 0, "LC_MESSAGES"],
        expect_result: "test_1 plural",
      },
      {
        with_arguments: ["messages_4", "test singular", "test plural", 1, "LC_MESSAGES"],
        expect_result: "test_2 singular",
      },
      {
        with_arguments: ["messages_4", "test singular", "test plural", 2, "LC_MESSAGES"],
        expect_result: "test_2 plural",
      },
      {
        with_arguments: ["messages_4", "test singular", "test plural", 0, "LC_MESSAGES"],
        expect_result: "test_2 plural",
      },

      {
        with_arguments: ["messages_3", "Not translated", "Not translated plural", 1, "LC_MESSAGES"],
        expect_result: "Not translated",
      },
      {
        with_arguments: ["messages_3", "Not translated", "Not translated plural", 2, "LC_MESSAGES"],
        expect_result: "Not translated plural",
      },
      {
        with_arguments: ["messages_3", "Not translated", "Not translated plural", 0, "LC_MESSAGES"],
        expect_result: "Not translated plural",
      },

      {
        with_arguments: ["messages_4", "Not translated", "Not translated plural", 1, "LC_MESSAGES"],
        expect_result: "Not translated",
      },
      {
        with_arguments: ["messages_4", "Not translated", "Not translated plural", 2, "LC_MESSAGES"],
        expect_result: "Not translated plural",
      },
      {
        with_arguments: ["messages_4", "Not translated", "Not translated plural", 0, "LC_MESSAGES"],
        expect_result: "Not translated plural",
      },
    ],
  },
});

classic_api_test_suite(() => {
  const locale_data_w_context = {
    context_test: {
      "": {
        domain: "context_test",
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

  return {
    fn_name: "pgettext",
    jed_instance: new Jed({ domain: "context_test", locale_data: locale_data_w_context }),
    tests: {
      "should accept a context and look up a new key using the context_glue": [
        {
          with_arguments: ["context", "test context"],
          expect_result: "test_1context",
        },
      ],
      "should still pass through missing keys": [
        {
          with_arguments: ["context", "Not translated"],
          expect_result: "Not translated",
        },
      ],
      "should make sure same msgid returns diff results w/ context when appropriate": [
        // {with_arguments: ["test2"], expect_result: "test_2");
        { with_arguments: ["context", "test2"], expect_result: "test_2context" },
      ],
    },
  };
});

classic_api_test_suite({
  fn_name: "dpgettext",
  jed_instance: new Jed({
    locale_data: locale_data_multi,
  }),
  tests: {
    "should use the domain and the context simultaneously": [
      { with_arguments: ["messages_3", "context", "test"], expect_result: "test_1 context" },
      { with_arguments: ["messages_4", "context", "test"], expect_result: "test_2 context" },
    ],

    "should pass through if either the domain, the key or the context isn't found": [
      { with_arguments: ["messages_3", "context", "Not translated"], expect_result: "Not translated" },
      { with_arguments: ["messages_4", "context", "Not translated"], expect_result: "Not translated" },
    ],
  },
});

classic_api_test_suite({
  fn_name: "dcpgettext",
  jed_instance: new Jed({ locale_data: locale_data_multi }),
  tests: {
    "should use the domain and the context simultaneously - ignore the category": [
      { with_arguments: ["messages_3", "context", "test", "LC_MESSAGES"], expect_result: "test_1 context" },
      { with_arguments: ["messages_4", "context", "test", "LC_MESSAGES"], expect_result: "test_2 context" },
    ],
    "should pass through if either the domain, the key or the context isn't found": [
      {
        with_arguments: ["messages_3", "context", "Not translated", "LC_MESSAGES"],
        expect_result: "Not translated",
      },
      {
        with_arguments: ["messages_4", "context", "Not translated", "LC_MESSAGES"],
        expect_result: "Not translated",
      },
    ],
  },
});

classic_api_test_suite(() => {
  const locale_data_w_context = {
    context_plural_test: {
      "": {
        domain: "context_plural_test",
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

  return {
    fn_name: "npgettext",
    jed_instance: new Jed({ domain: "context_plural_test", locale_data: locale_data_w_context }),
    tests: {
      "should handle plurals at the same time as contexts": [
        {
          with_arguments: ["context", "context plural %1$d", "plural %1$d", 1],
          expect_result: "context_plural_1 singular %1$d",
        },
        {
          with_arguments: ["context", "context plural %1$d", "plural %1$d", 2],
          expect_result: "context_plural_1 plural %1$d",
        },
        {
          with_arguments: ["context", "context plural %1$d", "plural %1$d", 0],
          expect_result: "context_plural_1 plural %1$d",
        },
      ],
      "should just pass through on not-found cases": [
        {
          with_arguments: ["context", "Not translated", "Not translated plural", 1],
          expect_result: "Not translated",
        },
        {
          with_arguments: ["context", "Not translated", "Not translated plural", 2],
          expect_result: "Not translated plural",
        },
        {
          with_arguments: ["context", "Not translated", "Not translated plural", 0],
          expect_result: "Not translated plural",
        },
      ],
    },
  };
});

classic_api_test_suite({
  fn_name: "dnpgettext",
  jed_instance: new Jed({ locale_data: locale_data_multi }),
  tests: {
    "should be able to do a domain, context, and pluralization lookup all at once": [
      {
        with_arguments: ["messages_3", "context", "test singular", "test plural", 1],
        expect_result: "test_1 context singular",
      },
      {
        with_arguments: ["messages_3", "context", "test singular", "test plural", 2],
        expect_result: "test_1 context plural",
      },
      {
        with_arguments: ["messages_3", "context", "test singular", "test plural", 0],
        expect_result: "test_1 context plural",
      },

      {
        with_arguments: ["messages_4", "context", "test singular", "test plural", 1],
        expect_result: "test_2 context singular",
      },
      {
        with_arguments: ["messages_4", "context", "test singular", "test plural", 2],
        expect_result: "test_2 context plural",
      },
      {
        with_arguments: ["messages_4", "context", "test singular", "test plural", 0],
        expect_result: "test_2 context plural",
      },
    ],
    "should pass through if everything doesn't point towards a key": [
      {
        with_arguments: ["messages_3", "context", "Not translated", "Not translated plural", 1],
        expect_result: "Not translated",
      },
      {
        with_arguments: ["messages_3", "context", "Not translated", "Not translated plural", 2],
        expect_result: "Not translated plural",
      },
      {
        with_arguments: ["messages_3", "context", "Not translated", "Not translated plural", 0],
        expect_result: "Not translated plural",
      },

      {
        with_arguments: ["messages_4", "context", "Not translated", "Not translated plural", 1],
        expect_result: "Not translated",
      },
      {
        with_arguments: ["messages_4", "context", "Not translated", "Not translated plural", 2],
        expect_result: "Not translated plural",
      },
      {
        with_arguments: ["messages_4", "context", "Not translated", "Not translated plural", 0],
        expect_result: "Not translated plural",
      },
    ],
  },
});

classic_api_test_suite({
  fn_name: "dcnpgettext",
  jed_instance: new Jed({ locale_data: locale_data_multi }),
  tests: {
    "should be able to do a domain, context, and pluralization lookup all at once - ignore category": [
      {
        with_arguments: ["messages_3", "context", "test singular", "test plural", 1, "LC_MESSAGES"],
        expect_result: "test_1 context singular",
      },
      {
        with_arguments: ["messages_3", "context", "test singular", "test plural", 2, "LC_MESSAGES"],
        expect_result: "test_1 context plural",
      },
      {
        with_arguments: ["messages_3", "context", "test singular", "test plural", 0, "LC_MESSAGES"],
        expect_result: "test_1 context plural",
      },

      {
        with_arguments: ["messages_4", "context", "test singular", "test plural", 1, "LC_MESSAGES"],
        expect_result: "test_2 context singular",
      },
      {
        with_arguments: ["messages_4", "context", "test singular", "test plural", 2, "LC_MESSAGES"],
        expect_result: "test_2 context plural",
      },
      {
        with_arguments: ["messages_4", "context", "test singular", "test plural", 0, "LC_MESSAGES"],
        expect_result: "test_2 context plural",
      },
    ],
    "should pass through if everything doesn't point towards a key": [
      {
        with_arguments: ["messages_3", "context", "Not translated", "Not translated plural", 1, "LC_MESSAGES"],
        expect_result: "Not translated",
      },
      {
        with_arguments: ["messages_3", "context", "Not translated", "Not translated plural", 2, "LC_MESSAGES"],
        expect_result: "Not translated plural",
      },
      {
        with_arguments: ["messages_3", "context", "Not translated", "Not translated plural", 0, "LC_MESSAGES"],
        expect_result: "Not translated plural",
      },

      {
        with_arguments: ["messages_4", "context", "Not translated", "Not translated plural", 1, "LC_MESSAGES"],
        expect_result: "Not translated",
      },
      {
        with_arguments: ["messages_4", "context", "Not translated", "Not translated plural", 2, "LC_MESSAGES"],
        expect_result: "Not translated plural",
      },
      {
        with_arguments: ["messages_4", "context", "Not translated", "Not translated plural", 0, "LC_MESSAGES"],
        expect_result: "Not translated plural",
      },
    ],
  },
});
