import Jed from "../src";
import { classic_api_test_suite } from "./classicApiTestSuite";

const locale_data = {
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

const i18n_1 = new Jed({ domain: "messages_2", locale_data });

const i18n_2 = new Jed({ domain: "messages_2", locale_data });

// No default domain
const i18n_3 = new Jed({ locale_data });

classic_api_test_suite({
  fn_name: "gettext",
  jed_instance: i18n_1,
  tests: {
    "should use the correct domain when there are multiple": [
      { with_arguments: ["test"], expect_result: "test_1" },
      { with_jed_instance: i18n_2, with_arguments: ["test"], expect_result: "test_2" },
    ],
    "should still pass through non-existent keys": [
      { with_arguments: ["nope"], expect_result: "nope" },
      { with_jed_instance: i18n_2, with_arguments: ["nope again"], expect_result: "nope again" },
    ],
    "should allow on the fly domain switching": [
      { with_arguments: ["test"], expect_result: "test_2" },
      { with_jed_instance: i18n_2, with_arguments: ["test"], expect_result: "test_1" },
    ],
  },
});

classic_api_test_suite({
  fn_name: "textdomain",
  jed_instance: i18n_1,
  tests: {
    "should reveal the current domain on any instance": [
      { with_arguments: [], expect_result: "messages_1" },
      { with_jed_instance: i18n_2, with_arguments: [], expect_result: "messages_2" },
    ],
    "should use `messages` as the default domain if none given": [
      { with_jed_instance: i18n_3, with_arguments: [], expect_result: "messages" },
    ],
    "should allow on the fly domain switching": [
      function beforeAll() {
        // Switch these up
        i18n_1.textdomain("messages_2");
        i18n_2.textdomain("messages_1");
      },
      { with_arguments: [], expect_result: "messages_2" },
      { with_jed_instance: i18n_2, with_arguments: [], expect_result: "messages_1" },
    ],
  },
});
