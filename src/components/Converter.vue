<template>
  <div class="flex flex-col space-y-4 px-8">
    <div class="mx-auto">
      <img alt="Anki Convert logo" src="../assets/logo.png" class="w-32 h-32" />
    </div>
    <div>
      <input type="text" name="anki" id="anki" v-model="translations" placeholder="Enter translations..." class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      <span class="font-mono">{{ convertedTranslations }}</span>
    </div>

    <div>
      <input type="text" name="definition" id="definition" v-model="definitions" placeholder="Enter definitions..." class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      <span class="font-mono">{{ convertedDefinitions }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      translations: null,
      definitions: null,
    }
  },
  computed: {
    convertedTranslations() {
        if (!this.translations) {
          return 'formatted translations'
        }

        // const string = '(adjective) mahir, ahli, cakap, trampil (noun) ahli'
        const speechPartsRegex = /\[[a-zA-Z]+\]/g
        const meaningsRegex = /\]\s[a-zA-Z,\s\-]+\./g

        let speechParts = []
        let meanings = []
        speechParts = this.translations.match(speechPartsRegex)
        meanings = this.translations.match(meaningsRegex)

        if (!speechParts || speechParts.length <= 0) {
          return 'no match'
        }

        let capSpeechParts = []
        for (const part of speechParts) {
            let cap = part.charAt(1).toUpperCase() + part.slice(2, part.length - 1)
            capSpeechParts.push(cap)
        }

        let newMeanings = []
        for (const meaning of meanings) {
            let newMeaning = meaning.slice(2, meaning.length - 1)
            newMeanings.push(newMeaning)
        }

        let htmlString = ''
        for (let i = 0; i < capSpeechParts.length; i++) {
            htmlString += `<small><font color="#2563EB"><b>${capSpeechParts[i]}</b></font></small><br>${newMeanings[i]}`

            if (i < capSpeechParts.length - 1) {
                htmlString += '<br>'
            }
        }

        return htmlString
    },
    convertedDefinitions() {
        if (!this.definitions) {
          return 'formatted definitions'
        }

        const speechPartsRegex = /\[[A-Za-z]+\]/g
        const numbersRegex = /\[[0-9]+\]/g
        const contentsRegex = /[0-9]+\]\s[^\[\]"]+\./g
        const examplesRegex = /"[^\[\]"]*"/g

        let speechParts = []
        let numbers = []
        let contents = []
        let examples = []

        speechParts = this.definitions.match(speechPartsRegex)
        numbers = this.definitions.match(numbersRegex)
        contents = this.definitions.match(contentsRegex)
        examples = this.definitions.match(examplesRegex)

        if (!speechParts || speechParts.length <= 0) {
          return 'no match'
        }

        let newSpeechParts = []
        for (const part of speechParts) {
          let newPart = part.charAt(1).toUpperCase() + part.slice(2, part.length - 1)
          newSpeechParts.push(newPart)
        }

        let newNumbers = []
        for (const number of numbers) {
          let newNumber = number.slice(1, number.length - 1)
          newNumbers.push(newNumber)
        }

        let newContents = []
        for (const content of contents) {
          let newContent = content.slice(3)
          newContents.push(newContent)
        }

        let newExamples = examples

        let htmlString = ''
        let speechPartIndex = 0
        for (let i = 0; i < newNumbers.length; i++) {
          // htmlString += `<small><font color="#2563EB"><b>${newSpeechParts[i]}</b></font></small><br>${newMeanings[i]}`

          if (newNumbers[i] == '1') {
            htmlString += `<small><font color="#2563EB"><b>${newSpeechParts[speechPartIndex]}</b></font></small><br>`
            speechPartIndex++
          }

          htmlString += `<font color="#16A34A">${newNumbers[i]}</font>&nbsp;${newContents[i]}`

          if (newExamples[i] != '""') {
            htmlString += `<br><small><font color="#4B5563">${newExamples[i]}</font></small>`
          }

          if (i < newNumbers.length - 1) {
              htmlString += '<br>'
          }
        }

        return htmlString
    }
  }
}
</script>
