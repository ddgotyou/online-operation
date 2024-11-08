import { defineComponent } from "vue";
import { initUniver } from "@/utils/univer";
import { Univer, UniverInstanceType } from "@univerjs/core";
import { FUniver } from "@univerjs-pro/facade";
import { UniverUIPlugin } from "@univerjs/ui";
import { SetWorksheetActiveOperation } from "@univerjs/sheets";

export default defineComponent({
  name: "univerEditor",
  setup() {
    return {
      // univer api
      univer: null as null | Univer,
      univerApi: null as null | FUniver,
    };
  },
  data() {
    return {
      editor: null,
      editorContent: "",
    };
  },
  mounted() {
    // univer.registerPlugin(UniverRenderEnginePlugin);
    // univer.registerPlugin(UniverFormulaEnginePlugin);
    // // 创建univer表单,挂载container位置
    // univer.registerPlugin(UniverUIPlugin, {
    //   container: this.$refs.univerContainer as HTMLElement,
    // });

    // univer.registerPlugin(UniverDocsPlugin);
    // univer.registerPlugin(UniverDocsUIPlugin);

    // univer.registerPlugin(UniverSheetsPlugin);
    // univer.registerPlugin(UniverSheetsUIPlugin);
    // univer.registerPlugin(UniverSheetsFormulaPlugin);
    // univer.registerPlugin(UniverSheetsFormulaUIPlugin);
    this.univer = initUniver(this.$refs.univerContainer as HTMLElement);
    this.univer.createUnit(UniverInstanceType.UNIVER_SHEET, {});
    // facade 封装
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
  },
});
