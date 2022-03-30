<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="12">
      <v-card>
        <v-system-bar>Exporting something to excel file</v-system-bar>
        <v-toolbar flat>
          <v-spacer></v-spacer>
          <div>
            <v-switch
              v-model="preview"
              label="Preview datas"
              hide-details
            ></v-switch>
          </div>
        </v-toolbar>
        <v-banner single-line :sticky="true"> </v-banner>

        <v-carousel>
          <v-carousel-item>
            <v-card-text class="marged-card">
              <v-jsoneditor
                v-model="value"
                :options="editorOptions('value', value)"
                :plus="false"
                :height="'350px'"
                @error="onError"
              >
              </v-jsoneditor>
              <v-text-field
                label="Sub item of object"
                v-model="key"
                @change="onEdit('subKey', key)"
              ></v-text-field>
            </v-card-text>
          </v-carousel-item>

          <v-carousel-item>
            <v-card-text class="marged-card">
              <h2>Options</h2>
              <v-jsoneditor
                v-model="options"
                :options="editorOptions('options', options)"
                :plus="false"
                :height="'400px'"
                @error="onError"
                @change="onEdit('options', options)"
              >
              </v-jsoneditor>
            </v-card-text>
          </v-carousel-item>
        </v-carousel>

        <v-card-actions>
          <v-btn text color="green accent-4" @click="onExport()">
            Export
          </v-btn>
        </v-card-actions>
      </v-card>

      <div class="v-marge"></div>
      <v-card>
        <v-system-bar>Here is a preview of the generated file</v-system-bar>
        <template v-if="preview">
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th v-for="c in columns" :key="c" class="text-left">
                    {{ c }}
                  </th>
                </tr>
              </thead>
              <tbody let-value="">
                <tr v-for="item in valueToExport.slice(0, 10)" :key="item">
                  <td v-for="c in columns" :key="c">{{ item[c] }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.marged-card {
  margin: 0px 50px;
  width: calc(100% - 100px);
}
.v-marge {
  margin-top: 20px;
}
</style>

<!-- {"map":{"twoi":"name"}}-->

<script>
export default {
  name: 'IndexPage',
  data() {
    let opts = {}
    try {
      opts = JSON.parse(localStorage.options)
    } catch {
      opts = {}
    }
    const dataInObject = localStorage.value
      ? JSON.parse(localStorage.value)
      : []
    const key = localStorage.subKey
      ? JSON.parse(localStorage.subKey)
      : undefined

    let valueToExport = key ? dataInObject[key] : dataInObject

    valueToExport = this.toExport(valueToExport, opts)
    const firstElement = valueToExport ? valueToExport[0] : undefined
    return {
      preview: true,
      value: dataInObject,
      options: opts,
      key,
      columns: firstElement ? Object.keys(firstElement) : [],
      valueToExport,
    }
  },
  methods: {
    editorOptions(item, value) {
      const changeHandler = {
        options: this.onOptionsChanges,
        value: this.onValueChanges,
      }
      return {
        mode: 'code',
        onChange: changeHandler[item],
      }
    },
    toExport(items, options) {
      if (items && options.map) {
        for (const [key, value] of Object.entries(options.map)) {
          items.forEach((i) => {
            i[key] = i[key][value]
          })
        }
      }
      return items ? items : []
    },
    onOptionsChanges() {
      this.onEdit('options', this.$data.options)
    },
    onValueChanges() {
      this.onEdit('value', this.$data.value)
    },
    onEdit(item, value) {
      localStorage.setItem(item, JSON.stringify(value))
    },
    onError(error) {
      console.error(error)
    },
    onExport() {
      const subKey = this.$data.key
      const data = this.$data.value
      let items = this.toExport(
        subKey.length > 0 ? data[subKey] : data,
        this.$data.options
      )
      let columns = []
      if (items.length > 0) {
        columns = Object.keys(items[0]).map((k) => {
          return { name: k, key: k, width: 22, filterButton: true }
        })

        this.$exporter(items, {
          fileName: 'exports',
          columns,
        })
      }
    },
  },
}
</script>
