import { expect, describe, it } from "vitest";
import Jed from "../src";

export type DeclarativeTestArray = Array<{
  with_jed_instance?: Jed;
  with_arguments: (string | number)[];
  expect_result: string;
}>;

export interface ClassicAPITestSuite {
  fn_name: keyof Jed;
  jed_instance?: Jed;
  tests: {
    [description: string]: DeclarativeTestArray | (() => void);
  };
}

export function classic_api_test_suite(object_or_callback: ClassicAPITestSuite | (() => ClassicAPITestSuite)) {
  const { fn_name, jed_instance, tests } =
    typeof object_or_callback === "function" ? object_or_callback() : object_or_callback;

  if (!fn_name) throw new Error(`Invalid function name '${fn_name}'`);

  function test_jed_instance(jed_instance?: Jed): Jed {
    expect(jed_instance).toBeDefined();
    expect(jed_instance).toBeInstanceOf(Jed);
    expect(jed_instance?.[fn_name]).toBeTypeOf("function");
    return jed_instance!;
  }

  describe(`#${fn_name}`, () => {
    it(`should have a ${fn_name} function`, () => void test_jed_instance(jed_instance));

    for (const [description, test_list_or_callback] of Object.entries(tests)) {
      if (typeof test_list_or_callback === "function") {
        it(description, test_list_or_callback);
        continue;
      }

      it(description, () => {
        for (const { with_arguments, expect_result, with_jed_instance } of test_list_or_callback) {
          const _jed = with_jed_instance !== undefined ? test_jed_instance(with_jed_instance) : jed_instance;
          const fn = _jed![fn_name] as Function;
          const result = fn(...with_arguments);
          expect(result).toBeDefined();
          expect(result).toEqual(expect_result);
        }
      });
    }
  });
}
