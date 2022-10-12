import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8765',
})

export default {
  addNote(english, phonetic, indonesian, definitions, extra) {
    return apiClient.post('', {
      action: 'addNote',
      version: 6,
      params: {
        note: {
          deckName: 'Translate',
          modelName: 'Translate',
          fields: {
            English: english,
            Phonetic: phonetic,
            Indonesian: indonesian,
            Definitions: definitions,
            Extra: extra,
          },
          options: {
            allowDuplicate: false,
            duplicateScope: 'deck',
            duplicateScopeOptions: {
              deckName: 'Translate',
            }
          },
        },
      },
    })
  }
}
