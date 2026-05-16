export const TRIP_PURPOSES = [
  { value: "business", label: "商务出差" },
  { value: "family", label: "亲子度假" },
  { value: "couple", label: "情侣出游" },
  { value: "friends", label: "朋友结伴" },
  { value: "solo", label: "独自旅行" },
  { value: "incentive", label: "团队奖励" },
] as const;

export const GROUP_TYPES = [
  { value: "adults_only", label: "纯成人" },
  { value: "with_children", label: "有儿童" },
  { value: "with_elderly", label: "有老人" },
  { value: "large_group", label: "团队" },
] as const;
