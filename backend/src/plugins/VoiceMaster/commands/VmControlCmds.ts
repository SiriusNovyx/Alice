import { voiceMasterCmd } from "../types.js";
import {
  actualClaimCmd,
  actualHideCmd,
  actualLimitCmd,
  actualLockCmd,
  actualRenameCmd,
  actualTransferCmd,
  actualUnhideCmd,
  actualUnlockCmd,
} from "./actualControlCmds.js";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";

export const VmLockCmd = voiceMasterCmd({
  trigger: ["vm-lock", "vmlock"],
  usage: "!vm-lock",
  permission: "can_control",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualLockCmd(pluginData, msg, msg.author.id);
  },
});

export const VmUnlockCmd = voiceMasterCmd({
  trigger: ["vm-unlock", "vmunlock"],
  usage: "!vm-unlock",
  permission: "can_control",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualUnlockCmd(pluginData, msg, msg.author.id);
  },
});

export const VmHideCmd = voiceMasterCmd({
  trigger: ["vm-hide", "vmhide"],
  usage: "!vm-hide",
  permission: "can_control",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualHideCmd(pluginData, msg, msg.author.id);
  },
});

export const VmUnhideCmd = voiceMasterCmd({
  trigger: ["vm-unhide", "vmunhide"],
  usage: "!vm-unhide",
  permission: "can_control",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualUnhideCmd(pluginData, msg, msg.author.id);
  },
});

export const VmRenameCmd = voiceMasterCmd({
  trigger: ["vm-rename", "vmrename"],
  usage: "!vm-rename <name>",
  permission: "can_control",
  signature: {
    name: ct.string({ catchAll: true }),
  },
  async run({ message: msg, args, pluginData }) {
    await actualRenameCmd(pluginData, msg, msg.author.id, args.name);
  },
});

export const VmLimitCmd = voiceMasterCmd({
  trigger: ["vm-limit", "vmlimit"],
  usage: "!vm-limit <0-99>",
  permission: "can_control",
  signature: {
    limit: ct.number(),
  },
  async run({ message: msg, args, pluginData }) {
    await actualLimitCmd(pluginData, msg, msg.author.id, args.limit);
  },
});

export const VmClaimCmd = voiceMasterCmd({
  trigger: ["vm-claim", "vmclaim"],
  usage: "!vm-claim",
  permission: "can_control",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualClaimCmd(pluginData, msg, msg.author.id);
  },
});

export const VmTransferCmd = voiceMasterCmd({
  trigger: ["vm-transfer", "vmtransfer"],
  usage: "!vm-transfer <user>",
  permission: "can_control",
  signature: {
    user: ct.resolvedUser(),
  },
  async run({ message: msg, args, pluginData }) {
    await actualTransferCmd(pluginData, msg, msg.author.id, args.user.id);
  },
});
