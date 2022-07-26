<template>
  <div class="flex flex-col space-y-4 px-8">
    <div class="mx-auto">
      <img alt="Vue logo" src="../assets/logo.png" />
    </div>
    <div>
      <input type="text" name="anki" id="anki" v-model="anki" placeholder="Enter translations..." class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      <p>{{ converted }}</p>
    </div>
    <div>
      <input type="text" name="definition" id="definition" v-model="definition" placeholder="Enter definitions..." class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      <p>{{ convertedDefinition }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      anki: null,
      definition: null,
    }
  },
  computed: {
    converted() {
        if (!this.anki) {
          return 'formatted translations'
        }

        // const string = '(adjective) mahir, ahli, cakap, trampil (noun) ahli'
        const speechPartsRegex = /\[[a-zA-Z]+\]/g
        const meaningsRegex = /\]\s[a-zA-Z,\s\-]+\./g

        let speechParts = []
        let meanings = []
        speechParts = this.anki.match(speechPartsRegex)
        meanings = this.anki.match(meaningsRegex)

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
    convertedDefinition() {
        if (!this.definition) {
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

        speechParts = this.definition.match(speechPartsRegex)
        numbers = this.definition.match(numbersRegex)
        contents = this.definition.match(contentsRegex)
        examples = this.definition.match(examplesRegex)

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
