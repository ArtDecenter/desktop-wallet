import Model from '@/models/model'
import { I18N, NETWORKS, THEMES } from '@config'

export default class Profile extends Model {
  static get schema () {
    return {
      type: 'object',
      required: ['avatar', 'background', 'currency', 'language', 'name', 'network', 'theme'],
      properties: {
        avatar: {
          type: 'string'
        },
        background: {
          type: 'string'
        },
        currency: {
          type: 'string',
          minLength: 3,
          maxLength: 3
        },
        language: {
          type: 'string',
          enum: I18N.enabledLocales
        },
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 120
        },
        // Network ID
        network: {
          type: 'string',
          enum: NETWORKS.map(network => network.id)
        },
        // Visual theme
        theme: {
          type: 'string',
          enum: THEMES.map(theme => theme.id)
        }
      }
    }
  }

  constructor (data = {}) {
    super(Object.assign({}, data, { modelType: 'profile' }))
  }

  get id () {
    return [this.modelType, this.name].join(Model.modelType.separator)
  }
}