<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="12">
      <v-card>
        <v-system-bar></v-system-bar>
        <v-toolbar flat>
          <v-toolbar-title>Exporting something to excel file</v-toolbar-title>
          <v-spacer></v-spacer>
          <div>
            <v-switch
              v-model="sticky"
              label="Sticky Banner"
              hide-details
            ></v-switch>
          </div>
        </v-toolbar>
        <v-banner single-line :sticky="sticky"> </v-banner>

        <v-carousel>
          <v-carousel-item>
            <v-card-text class="marged-card">
              <v-textarea
                name="input-7-1"
                label="Your JSON here"
                v-model="value"
                max-width="100%"
                rows="10"
                class="mx-auto"
                hint="Hint text"
                @change="onEdit('value', value)"
              ></v-textarea>
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
                :options="editorOptions"
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
    </v-col>
  </v-row>
</template>

<style scoped>
.marged-card {
  margin: 00px 50px;
  width: calc(100% - 100px);
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
    return {
      sticky: true,
      value: localStorage.value,
      options: opts,
      key: localStorage.subKey,
      editorOptions: {
        mode: 'code',
        onChange: this.onOptionsChanges,
      },
    }
  },
  methods: {
    onOptionsChanges() {
      this.onEdit('options', this.$data.options)
    },
    onEdit(item, value) {
      // console.log("edit", item, value);
      localStorage.setItem(item, JSON.stringify(value))
    },
    onError(error) {
      console.error(error)
    },
    onExport() {
      const subKey = this.$data.key
      const data = JSON.parse(this.$data.value)
      let items = subKey.length > 0 ? data[subKey] : data
      if (this.$data.options) {
        const options = this.$data.options
        if (options.map) {
          for (const [key, value] of Object.entries(options.map)) {
            console.log(`${key}: ${value}`)
            items.forEach((i) => {
              i[key] = i[key][value]
            })
          }
        }
      }
      const columns = Object.keys(items[0]).map((k) => {
        return { name: k, key: k, width: 22, filterButton: true }
      })
      this.$exporter(items, {
        fileName: 'exports',
        columns,
      })
    },
  },

  /*async asyncData({ app: { $exporter } }) {
    return {
      sticky: true,
      value: localStorage.value,
      options: localStorage.options,
      key: localStorage.subKey,
      editorOptions: {
        onChange: onEdit
      }
    }
  },*/
}
</script>
