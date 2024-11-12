import { defineComponent } from "vue";
import { initUniver } from "@/utils/univer";
import { Univer, UniverInstanceType } from "@univerjs/core";
import { FUniver } from "@univerjs-pro/facade";
import { UniverUIPlugin } from "@univerjs/ui";
import { SetWorksheetActiveOperation } from "@univerjs/sheets";
import { createNewSheet } from "@/api/editor";

export default defineComponent({
  name: "univerEditor",
  setup() {
    return {
      // univer api
      univer: null as null | Univer,
      univerApi: null as null | FUniver,
      curUrl: new URL(window.location.href),
      unitId: "",
    };
  },
  data() {
    return {
      editor: null,
      editorContent: "",
    };
  },
  mounted() {
    this.unitId = this.curUrl.searchParams.get("unit") ?? "";
    // if (this.unitId) {
    //   this.initCollaborate();
    // } else {
    this.initSheet();
    // }
  },
  methods: {
    async initSheet() {
      if (this.unitId) {
        this.univer = initUniver(this.$refs.univerContainer as HTMLElement);
        this.univerApi = FUniver.newAPI(this.univer);
        const activeWorkbook = this.univerApi.getActiveWorkbook();
        console.log(activeWorkbook);
        // 创建一个名为 'Sheet2' 的工作表，包含 10 行和 10 列
        if (activeWorkbook) {
          const sheet2 = activeWorkbook!.create("Sheet2", 10, 10);
          this.univerApi.executeCommand(SetWorksheetActiveOperation.id, {
            unitId: activeWorkbook.getId(),
            subUnitId: sheet2.getSheetId(),
          });
        }
      } else {
        const res = await createNewSheet({
          type: UniverInstanceType.UNIVER_SHEET,
          sheet_name: "test_sheet",
          user_id: this.curUrl.searchParams.get("user") ?? "",
        });
        const unitId = res.data.unitID;
        if (!unitId) {
          console.log("创建失败");
          return;
        }
        // 重新加载页面合文档
        this.curUrl.searchParams.set("unit", unitId);
        this.curUrl.searchParams.set(
          "type",
          String(UniverInstanceType.UNIVER_SHEET)
        );
        window.location.href = this.curUrl.toString();
      }
      // this.univer.createUnit(UniverInstanceType.UNIVER_SHEET, {});
      // // facade 封装
      // this.univerApi = FUniver.newAPI(this.univer);
      // const activeWorkbook = this.univerApi.getActiveWorkbook();
      // console.log(activeWorkbook);
      // // 创建一个名为 'Sheet2' 的工作表，包含 10 行和 10 列
      // if (activeWorkbook) {
      //   const sheet2 = activeWorkbook!.create("Sheet2", 10, 10);
      //   this.univerApi.executeCommand(SetWorksheetActiveOperation.id, {
      //     unitId: activeWorkbook.getId(),
      //     subUnitId: sheet2.getSheetId(),
      //   });
      // }
    },
    initCollaborate() {
      // 加载协作、打印、交换的国际化资源
      // Promise.all([
      //   fetch(
      //     "https://unpkg.com/@univerjs-pro/collaboration-client/lib/locale/zh-CN.json"
      //   ).then((res) => res.json()),
      //   fetch(
      //     "https://unpkg.com/@univerjs-pro/sheets-print/lib/locale/zh-CN.json"
      //   ).then((res) => res.json()),
      //   fetch(
      //     "https://unpkg.com/@univerjs-pro/exchange-client/lib/locale/zh-CN.json"
      //   ).then((res) => res.json()),
      //   fetch(
      //     "https://unpkg.com/@univerjs-pro/edit-history-viewer/lib/locale/zh-CN.json"
      //   ).then((res) => res.json()),
      //   fetch(
      //     "https://unpkg.com/@univerjs-pro/sheets-pivot/lib/locale/zh-CN.json"
      //   ).then((res) => res.json()),
      //   fetch(
      //     "https://unpkg.com/@univerjs-pro/sheets-pivot-ui/lib/locale/zh-CN.json"
      //   ).then((res) => res.json()),
      // ]).then((locales) => {
      // console.log("完成资源", locales);
      this.univer = initUniver(this.$refs.univerContainer as HTMLElement);
      this.univerApi = FUniver.newAPI(this.univer);
      const activeWorkbook = this.univerApi.getActiveWorkbook();
      console.log(activeWorkbook);
      // 创建一个名为 'Sheet2' 的工作表，包含 10 行和 10 列
      if (activeWorkbook) {
        const sheet2 = activeWorkbook!.create("Sheet2", 10, 10);
        this.univerApi.executeCommand(SetWorksheetActiveOperation.id, {
          unitId: activeWorkbook.getId(),
          subUnitId: sheet2.getSheetId(),
        });
      }
      // });
    },
  },
});
