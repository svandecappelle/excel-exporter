import { Workbook } from 'exceljs'
import lodash from 'lodash'
import fs from 'file-saver'

import { TableColumnProperties } from 'exceljs'

/*import Vue from 'vue'
import VueLodash from 'vue-lodash'
import lodash from 'lodash'*/

// Vue.use(VueLodash, { name: '$_', lodash })

export interface Options {
  fileName?: string
  skipHeader?: boolean
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export interface ExcelColumnProperties extends TableColumnProperties {
  width?: number
  key: string
}

// bookType is omitted because it is actually overriden by our API.
export interface ExcelOptions extends Options {
  columns: ExcelColumnProperties[]
}

export interface Exporter<T extends Options> {
  export(rows: Array<any>, options: T): void
}

export class XlsxExporterService implements Exporter<ExcelOptions> {
  constructor() {}

  export(rows: any[], options: ExcelOptions) {
    let workbook = new Workbook()
    let worksheet = workbook.addWorksheet('ProductSheet')
    const arrayRows = lodash.map(rows, (d: any) =>
      lodash.map(options.columns, (col: any) => d[col.key])
    )
    worksheet.addTable({
      name: 'MyTable',
      ref: 'A1',
      headerRow: true,
      style: {
        theme: 'TableStyleMedium2',
        showRowStripes: true,
      },
      columns: options.columns,
      rows: arrayRows,
    })
    worksheet.columns = lodash.map(options.columns, (c: any) => {
      return {
        key: c.key,
        name: c.name,
        width: c.width,
      }
    })

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      fs.saveAs(blob, `${options.fileName}.xlsx`)
    })
  }
}

export default (
  context: any,
  inject: (
    arg0: string,
    arg1: (items: Array<any>, opts: ExcelOptions) => void
  ) => void
) => {
  inject('exporter', (items, opts) => {
    new XlsxExporterService().export(items, opts)
  })
}
