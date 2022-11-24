<template>
  <div class="flex flex-col space-y-4 px-8">
    <div class="mx-auto">
      <img alt="Anki Convert logo" src="../assets/logo.png" class="w-32 h-32" />
    </div>

    <form action="#" method="POST" @submit.prevent="convertAndAddToAnki">
      <div class="space-y-4">
        <div class="relative">
          <textarea id="extractor" name="extractor" rows="2" v-model="extractor" disabled
            class="block w-full rounded-md border-gray-300 shadow-sm
            text-gray-500 font-mono
            focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"></textarea>

          <button @click.prevent="copyExtractor"
            class="m-2 absolute right-0 bottom-0
            rounded-md border border-transparent
            bg-gray-600 hover:bg-gray-700
            px-2 py-1
            text-sm text-white
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            {{ copyText }}
          </button>
        </div>

        <textarea id="htmlString" name="htmlString" rows="4" v-model="htmlString" placeholder="Enter extracted HTML string..."
          class="block w-full rounded-md border-gray-300 shadow-sm font-mono
          focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"></textarea>

        <span v-if="htmlStringError" class="text-red-600">{{ htmlStringError }}</span>

        <textarea id="parsed" name="parsed" rows="8" v-model="parsed" placeholder="Enter parsed string..." required
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
import { capitalize } from '../utils'

export default {
  data() {
    return {
      extractor: "copy(document.body.querySelector('c-wiz.zQTmif.SSPGKf.RvYhPd.BIdYQ.Q5Onnd.EXWswb > div.T4LgNb > div.WFnNle > c-wiz.MOkH4e.BSw7K.iYelWb.twDq5e > div.OlSOob > c-wiz.QsA0jb').innerHTML)",
      htmlString: '',
      htmlStringError: null,
      copyText: 'Copy',
      parsed: '',
    }
  },
  watch: {
    htmlString() {
      this.parseHtml()
    }
  },
  methods: {
    parseHtml() {
      this.htmlStringError = null
      if (this.htmlString == '') {
        this.parsed = ''
        return
      }

      try {
        let template = document.createElement('template')
        template.innerHTML = this.htmlString
        const mainContainer = template.content

        const inputSection = mainContainer.querySelector('div.ccvoYb.EjH7wc > div.AxqVh > div.OPPzxe')
        const bottomSection = mainContainer.querySelector('div.kGmWO > c-wiz.zpzJBc > div.jTj8gd > div.a2Icud')
        const defSection = bottomSection.querySelector('div.Sp3AF > div[jsname="SjRXy"] > div.I87fLc.FnSTic.XzOhkf > div.Dwvecf')

        const transWrapper = bottomSection.querySelector('div.GQpbTd.WZapbb > div[jsname="YVjlBb"]')
        let transSection = null
        if (transWrapper.childElementCount > 0) {
          transSection = transWrapper.querySelector('div.I87fLc.oLovEc.XzOhkf > div.Dwvecf > table.CFNMfb')
        }

        const enText = inputSection.querySelector('c-wiz.rm1UF.UnxENd.dHeVVb > span[jsname="ZdXDJ"] > span[ssk="6:FCIgBe"] > div.QFw9Te > div.A3dMNc > span[jsname="BvKnce"]').innerText
        const enPhon = inputSection.querySelector('c-wiz.rm1UF.UnxENd.dHeVVb > div.UdTY9.BwTYAc > div.kO6q6e').innerText
        const idText = inputSection.querySelector('c-wiz.sciAJc > div.QcsUad.BDJ8fb > div.usGWQd > div.KkbLmb > div.lRu31 > span.HwtZe > span.jCAhz.ChMk0b > span.ryNqvb').innerText

        let firstSpeech = ''
        let delayedFields = ''
        let defString = ''
        let transString = ''

        // Parse definitions
        for (let i = 0; i < defSection.childElementCount; i++) {
          let child = defSection.children[i]

          if (child.className == 'CF8Iy RZhose') {
            // Fields in the beginning
            delayedFields = this.parseFields(child)
          } else if (child.className == 'KWoJId') {
            // Part of speech
            const speech = capitalize(child.querySelector('div.eIKIse').innerText)
            defString += `[${speech}] `

            // First part of speech for translation with no transSection
            if (firstSpeech == '') {
              firstSpeech = speech
            }

            // Fields after part of speech
            const speechFieldWrapper = child.querySelector('div.CF8Iy.rJnFff')
            if (speechFieldWrapper != null) {
              delayedFields = this.parseFields(speechFieldWrapper)
            }
          } else if (child.className == 'eqNifb' || child.className == 'trQcMc') {
            // Number
            const number = child.querySelector('div.luGxAd > div.RSggmb').innerText
            defString += `[${number}] `

            // Delayed fields from the beginning or after part of speech
            if (delayedFields != '') {
              defString += `${delayedFields}`
              delayedFields = ''
            }

            // Fields after number
            const fieldsWrapper = child.querySelector('div.CF8Iy.CLHVBf')
            if (fieldsWrapper != null) {
              let fieldsString = ''
              fieldsString = this.parseFields(fieldsWrapper)
              defString += `${fieldsString}`
            }

            // Definition
            const definition = child.querySelector('div.JAk00.OvhKBb > div.fw3eif').innerText
            defString += `${definition} `

            // Example
            const exampleEl = child.querySelector('div.JAk00.OvhKBb > div.MZgjEb')
            if (exampleEl != null) {
              defString += `"${exampleEl.innerText}" `
            } else {
              defString += '"" '
            }
          }
        }

        // Parse translation
        if (transSection == null) {
          transString = `[${firstSpeech}] ${idText}.`
        } else {
          // Translations groups by part of speech
          const transGroups = transSection.querySelectorAll('tbody.U87jab')

          for (let i = 0; i < transGroups.length; i++) {
            // One translations group
            const transGroup = transGroups[i]

            for (let j = 0; j < transGroup.childElementCount; j++) {
              // One translation within a group
              const child = transGroup.children[j]

              if (j == 0) {
                // Part of speech
                transString += `[${capitalize(child.querySelector('th.yYp8Hb > div.G8Go6b > div.eIKIse.Nv4rrc').innerText)}] `
                const firstTrans = child.querySelector('th.rsNpAc.S18kfe > div.KnIHac > span.kgnlhe').innerText

                if (i == 0 && firstTrans != idText) {
                  transString += `${idText}, ${firstTrans}`
                } else {
                  transString += `${firstTrans}`
                }

                if (transGroup.childElementCount == 1) {
                  transString += '. '
                } else {
                  transString += ', '
                }
              } else if (j >= transGroup.childElementCount - 1) {
                // Last translation of a group
                transString += `${child.querySelector('th.rsNpAc.S18kfe > div.KnIHac > span.kgnlhe').innerText}. `
              } else {
                transString += `${child.querySelector('th.rsNpAc.S18kfe > div.KnIHac > span.kgnlhe').innerText}, `
              }
            }
          }
        }

        this.parsed = `${enText}\n${enPhon}\n${transString}\n${defString}\n-`
      } catch (error) {
        this.htmlStringError = 'Invalid HTML string: ' + error
        this.parsed = ''
      }
    },
    copyExtractor() {
      navigator.clipboard.writeText(this.extractor)
      this.copyText = 'Copied!'

      setTimeout(() => {
        this.copyText = 'Copy'
      }, 2000);
    },
    parseFields(fieldsWrapper) {
      const fieldEls = fieldsWrapper.querySelectorAll('div.PG9puc')
      let fieldsString = ''

      for (const fieldEl of fieldEls) {
        fieldsString += `(${fieldEl.innerText.toUpperCase()}) `
      }

      return fieldsString
    },
    convertAndAddToAnki() {
      const fieldList = this.parsed.split('\n')
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
