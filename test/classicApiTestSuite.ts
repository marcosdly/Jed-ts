import { expect, describe, it } from "vitest";
import Jed from "../src";
import { ClassificationType } from "typescript";

export interface DeclarativeTest {
  with_jed_instance?: Jed;
  with_arguments: (string | number)[];
  expect_result: string;
}

type SomeCallback = () => void;

export interface ClassicAPITestSuite {
  fn_name: keyof Jed;
  jed_instance?: Jed;
  tests: {
    [description: string]: Array<DeclarativeTest | SomeCallback> | SomeCallback;
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
        // test data is a literal function for an arbitrary procedure
        it(description, test_list_or_callback);
        continue;
      }

      const meta_callbacks: Record<string, Function> = {};
      const test_data: DeclarativeTest[] = [];
      for (const test_data_or_callback of test_list_or_callback) {
        if (typeof test_data_or_callback === "function") {
          if (["beforeAll", "afterAll", "beforeEach", "afterEach"].includes(test_data_or_callback.name)) {
            meta_callbacks[test_data_or_callback.name] = test_data_or_callback;
          } else {
            throw new Error(`Unknown callback named '${test_data_or_callback.name} amongst defined tests`);
          }
        } else {
          test_data.push(test_data_or_callback);
        }
      }

      it(description, () => {
        meta_callbacks?.beforeAll?.();
        for (const { with_arguments, expect_result, with_jed_instance } of test_data) {
          const jed_this = with_jed_instance !== undefined ? test_jed_instance(with_jed_instance) : jed_instance;
          const fn = jed_this![fn_name] as Function;
          meta_callbacks?.beforeEach?.();
          const result = fn.call(jed_this, ...with_arguments);
          expect(result).toBeDefined();
          expect(result).toEqual(expect_result);
          meta_callbacks?.afterEach?.();
        }
        meta_callbacks?.afterAll?.();
      });
    }
  });
}
