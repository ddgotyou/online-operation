import "@univerjs/design/lib/index.css";
import "@univerjs/ui/lib/index.css";
import "@univerjs/docs-ui/lib/index.css";
import "@univerjs/sheets-ui/lib/index.css";
import "@univerjs/sheets-formula-ui/lib/index.css";

import {
  IAuthzIoService,
  IUndoRedoService,
  LocaleType,
  Tools,
  Univer,
  UniverInstanceType,
} from "@univerjs/core";
import { defaultTheme } from "@univerjs/design";

import { UniverFormulaEnginePlugin } from "@univerjs/engine-formula";
import { UniverRenderEnginePlugin } from "@univerjs/engine-render";
import { UniverUIPlugin } from "@univerjs/ui";
import { UniverDocsPlugin } from "@univerjs/docs";
import { UniverDocsUIPlugin } from "@univerjs/docs-ui";

import { UniverSheetsPlugin } from "@univerjs/sheets";
import { UniverSheetsFormulaPlugin } from "@univerjs/sheets-formula";
import { UniverSheetsFormulaUIPlugin } from "@univerjs/sheets-formula-ui";
import { UniverSheetsUIPlugin } from "@univerjs/sheets-ui";

import { UniverCollaborationPlugin } from "@univerjs-pro/collaboration";
import { UniverCollaborationClientPlugin } from "@univerjs-pro/collaboration-client";

import { zhCN, enUS } from "univer:locales";

// 协同编辑url
export const collaborationUrl = {
  authzUrl: "http://localhost:8000/universer-api/authz",
  snapshotServerUrl: "http://localhost:8000/universer-api/snapshot",
  collabSubmitChangesetUrl: "http://localhost:8000/universer-api/comb",
  collabWebSocketUrl: "ws://localhost:8000/universer-api/comb/connect",
};

// 初始化univer实例
export const initUniver = (container: string | HTMLElement): Univer => {
  const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: zhCN,
      [LocaleType.EN_US]: enUS,
    },
    // 通过将 override 选项设置为 [[IAuthzIoService, null]]，可以告诉 Univer 不要注册内置的 IAuthzIoService。
    // 通过将 override 选项设置为 [[IUndoRedoService, null]]，可以告诉 Univer 不要注册内置的 IUndoRedoService
    override: [
      [IAuthzIoService, null],
      [IUndoRedoService, null],
    ],
  });

  univer.registerPlugin(UniverRenderEnginePlugin);
  univer.registerPlugin(UniverFormulaEnginePlugin);
  // 可以是【dom的id字符串】/直接【用ref取dom实例】进行挂载
  univer.registerPlugin(UniverUIPlugin, {
    container: container,
  });

  univer.registerPlugin(UniverDocsPlugin);
  univer.registerPlugin(UniverDocsUIPlugin);

  univer.registerPlugin(UniverSheetsPlugin);
  univer.registerPlugin(UniverSheetsUIPlugin);
  univer.registerPlugin(UniverSheetsFormulaPlugin);
  univer.registerPlugin(UniverSheetsFormulaUIPlugin);

  // 协同编辑
  univer.registerPlugin(UniverCollaborationPlugin);
  univer.registerPlugin(UniverCollaborationClientPlugin, collaborationUrl);

  return univer;
};
