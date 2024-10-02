import type { SlotEntry, SlotInstance, EllipsisLotInstance, ClauseSlotInstance, HeadedNode } from './Types.d.ts'
function isClause(arg: SlotInstance): arg is ClauseSlotInstance {
  return arg.type === "clause";
}
function isEllipsis(arg: SlotInstance): arg is EllipsisLotInstance {
  return arg.type === "ellipsis";
}
export default {
  counter: 0,
  generate(template: SlotEntry) {    
    let ret: SlotInstance = {
      type: template.type,
      template: template,
      assignment: null,
      expanded: false,
      index: "" + this.counter++,
    };
    let slots: SlotInstance[] = [];
    if (isClause(ret)) {
      let last = null;
      for (let slot of ret.template.value.slots) {
        let child: SlotInstance = {
          type: slot.type,
          template: slot,
          assignment: null,
          expanded: false,
          index: "" + this.counter++,
        };
        if (isClause(child)) {
          child = this.generate(slot)
        } else if (isEllipsis(child)) {
          child.template = last;
        }
        slots.push(child);
        last = slot;
      }
      ret.assignment = { type: null, slots, rotate: template.rotate };
    }
    return ret;
  },
  generateAll(node: HeadedNode) {
    let s = node.slots.map((x) => this.generate(x));
    s.forEach((v, n) => {
      if (isEllipsis(v)) {
        v.template = s[n-1].template;
      }
    });
    return s;
  }
}
