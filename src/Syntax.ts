import type { SlotEntry, SlotInstance, EllipsisLotInstance, ClauseSlotInstance, HeadedNode } from './Types.d.ts'
function isClause(arg: SlotInstance): arg is ClauseSlotInstance {
  return arg.type === "clause";
}
function isEllipsis(arg: SlotInstance): arg is EllipsisLotInstance {
  return arg.type === "ellipsis";
}
export default {
  generate(template: SlotEntry, counter) {
    let ret: SlotInstance = {
      type: template.type,
      template: template,
      assignment: null,
      expanded: false,
      index: "" + counter.next(),
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
          index: "" + counter.next(),
        };
        if (isClause(child)) {
          child = this.generate(slot, counter)
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
  generateAll(node: HeadedNode, counter) {
    let s = node.slots.map((x) => this.generate(x, counter));
    s.forEach((v, n) => {
      if (isEllipsis(v)) {
        v.template = s[n-1].template;
      }
    });
    return s;
  }
}
