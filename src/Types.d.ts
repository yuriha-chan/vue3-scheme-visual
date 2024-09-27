type NodeValue = HeadedNode | HeadlessNode;
type HeadedNode = {
  slots : SlotEntry[] | null | undefined;
  type : string;
  label : string | null | undefined;
  value : any;
}

type HeadlessNode = {
  type : null;
  slots : SlotEntry[];
}

type NodeInstance = HeadedNodeInstance | HeadlessNodeInstance;
type HeadedNodeInstance = {
  slots: SlotInstance[] | null;
  type : string;
  label : string | null;
  value : any;
}
type HeadlessNodeInstance = {
  type : null;
  slots : SlotInstance[];
}

type AssignableSlotInstance = ClauseSlotInstance | SymbolSlotInstance | LiteralSlotInstance | ValueSlotInstance;
type SlotInstance =  AssignableSlotInstance | EllipsisSlotInstance;

type ClauseSlotInstance = {
  type: ClauseSlotEntry["type"];
  template: ClauseSlotEntry;
  assignment: HeadlessNodeInstance;
  expanded: boolean;
  index: string;
}

type SymbolSlotInstance = {
  type: SymbolSlotEntry["type"];
  template: SymbolSlotEntry;
  assignment: string | null;
  expanded: boolean;
  index: string;
}

type LiteralSlotInstance = {
  type: LiteralSlotEntry["type"];
  template: LiteralSlotEntry;
  assignment: number | string | HeadlessNodeInstance;
  expanded: boolean;
  index: string;
}

type ValueSlotInstance = {
  type: ValueSlotEntry["type"];
  template: ValueSlotEntry;
  assignment: number | string | NodeInstance | null;
  expanded: boolean;
  index: string;
}

type EllipsisSlotInstance = {
  type: EllipsisSlotEntry["type"];
  template: SlotEntry;  
  expanded: boolean;
  index: string;
}

type SlotEntry = ClauseSlotEntry | SymbolSlotEntry | LiteralSlotEntry | ValueSlotEntry | EllipsisSlotEntry;

type ClauseSlotEntry = {
  type: "clause";
  value: NodeValue;
}

type SymbolSlotEntry = {
  type: "symbol";
  placeholder : string | null;
}

type LiteralSlotEntry = {
  type: "literal";
  placeholder : string | null;
}

type ValueSlotEntry = {
  type: "value";
  placeholder : string | null;
}

type EllipsisSlotEntry = {
  type: "ellipsis";
}
export type {NodeValue, HeadedNode, HeadlessNode, SlotEntry, SlotInstance, ClauseSlotInstance, EllipsisSlotInstance};