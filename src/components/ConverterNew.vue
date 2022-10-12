<template>
  <div class="flex flex-col space-y-4 px-8">
    <div class="mx-auto">
      <img alt="Anki Convert logo" src="../assets/logo.png" class="w-32 h-32" />
    </div>

    <form action="#" method="POST" @submit.prevent="convertAndAddToAnki">
      <div class="space-y-4">
        <textarea id="raw" name="raw" rows="10" v-model="raw" placeholder="Enter raw data..." required
          class="block w-full rounded-md border-gray-300 shadow-sm
          focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"></textarea>

        <button type="submit"
          class="flex w-full items-center justify-center
          rounded-md border border-transparent
          bg-blue-600 hover:bg-blue-700
          px-5 py-3
          text-base font-medium text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Add to Anki
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import AnkiService from '../services/AnkiService'

export default {
  data() {
    return {
      raw: '',
    }
  },
  methods: {
    convertAndAddToAnki() {
      const fieldList = this.raw.split('\n')
      const english = fieldList[0]
      const phonetic = fieldList[1] && fieldList[1] != '-' ? fieldList[1] : ''
      const indonesian = this.formatIndonesian(fieldList[2])
      const definitions = this.formatDefinitions(fieldList[3])
      const extra = fieldList[4] && fieldList[4] != '-' ? fieldList[4] : ''

      if (english != '' && indonesian != '') {
        AnkiService.addNote(english, phonetic, indonesian, definitions, extra)
        .then((response) => {
          if (response.data.error == null) {
            alert('Successfully added to Anki')
          } else {
            alert(response.data.error)
          }
        })
        .catch((error) => {
          alert(error)
        })
      } else {
        alert('Invalid data')
      }
    },
    formatIndonesian(indonesian) {
      if (!indonesian) return ''

      const speechPartsRegex = /\[[a-zA-Z]+\]/g
      const meaningsRegex = /\]\s[a-zA-Z,\s\-]+\./g

      let speechParts = []
      let meanings = []
      speechParts = indonesian.match(speechPartsRegex)
      meanings = indonesian.match(meaningsRegex)

      // No match
      if (!speechParts || speechParts.length <= 0) {
        return ''
      }

      // Extract from '[Speechpart]'
      let newSpeechParts = []
      for (const part of speechParts) {
          let cap = part.charAt(1).toUpperCase() + part.slice(2, part.length - 1)
          newSpeechParts.push(cap)
      }

      // Extract from '] meanings.'
      let newMeanings = []
      for (const meaning of meanings) {
          let newMeaning = meaning.slice(2, meaning.length - 1)
          newMeanings.push(newMeaning)
      }

      let htmlString = ''
      for (let i = 0; i < newSpeechParts.length; i++) {
          htmlString += `<small><font color="#2563EB"><b>
            ${newSpeechParts[i]}</b></font></small><br>
            ${newMeanings[i]}`

          if (i < newSpeechParts.length - 1) {
              htmlString += '<br>'
          }
      }

      return htmlString
    },
    formatDefinitions(definitions) {
      if (!definitions) return ''

      const speechPartsRegex = /\[[A-Za-z]+\]/g
      const numbersRegex = /\[[0-9]+\]/g
      const contentsRegex = /[0-9]+\]\s[^\[\]"]+\./g
      const examplesRegex = /"[^\[\]"]*"/g

      let speechParts = []
      let numbers = []
      let contents = []
      let examples = []

      speechParts = definitions.match(speechPartsRegex)
      numbers = definitions.match(numbersRegex)
      contents = definitions.match(contentsRegex)
      examples = definitions.match(examplesRegex)

      // No match
      if (!speechParts || speechParts.length <= 0) {
        return ''
      }

      // Extract from '[Speechpart]'
      let newSpeechParts = []
      for (const part of speechParts) {
        let newPart = part.charAt(1).toUpperCase() + part.slice(2, part.length - 1)
        newSpeechParts.push(newPart)
      }

      // Extract from '[number]'
      let newNumbers = []
      for (const number of numbers) {
        let newNumber = number.slice(1, number.length - 1)
        newNumbers.push(newNumber)
      }

      // Extract from 'number] content'
      let newContents = []
      for (const content of contents) {
        let newContent = content.slice(3)
        newContents.push(newContent)
      }

      let htmlString = ''
      let speechPartIndex = 0
      for (let i = 0; i < newNumbers.length; i++) {
        if (newNumbers[i] == '1') {
          htmlString += `<small><font color="#2563EB"><b>
            ${newSpeechParts[speechPartIndex]}</b></font></small><br>`
          speechPartIndex++
        }

        htmlString += `<font color="#16A34A">
          ${newNumbers[i]}</font>&nbsp;${newContents[i]}`

        if (examples[i] != '""') {
          htmlString += `<br><small><font color="#4B5563">
            ${examples[i]}</font></small>`
        }

        if (i < newNumbers.length - 1) {
            htmlString += '<br>'
        }
      }

      return htmlString
    },
  }
}
</script>
