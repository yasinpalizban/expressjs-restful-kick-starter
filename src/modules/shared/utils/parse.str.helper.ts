import { SignType } from "../enum/sign.enum";
import { SearchFunctionType } from "../enum/search.function";
import { AggregatePipeLine } from "@/modules/shared/interfaces/url.query.param.interface";

export function convertSignType(sign: string | string[]): string {
  switch (sign) {

    case"!=":
      return SignType.NotEqual;
    case">":
      return SignType.Greater;
    case"=>":
      return SignType.GreaterThen;
    case"<":
      return SignType.Lower;
    case"=<":
      return SignType.LowerThen;
    default:

      return SignType.Equal;
  }
}


export function convertFunctionType(name: string): string {
  switch (name) {
    case"wheres":
      return SearchFunctionType.elemMatch;
    case"whereNotIn":
      return SearchFunctionType.nin;
    case"whereIn":
      return SearchFunctionType.in;
    case"like":
      return SearchFunctionType.regex;
    default:
      return SearchFunctionType.match;
  }
}


export function parseString(str: string): string {

// %
  while (true) {
    str = decodeURIComponent(str);
    if (str.indexOf("%") == -1) {
      break;
    }
  }


  return str;
}

export function changeKeyObject(obj: object, oldKey: string, newKey: string): object {
  return JSON.parse(JSON.stringify(obj).split(oldKey).join(newKey));
}

export function comparePipeLine(key: string, pipeline: AggregatePipeLine [], defaultPipeLine: AggregatePipeLine[]) {

  pipeline.forEach(p => {
    if (p[key]) {
      defaultPipeLine.forEach(dp => {
        if (dp[key]) {

        }
      });
    }


  });
}
