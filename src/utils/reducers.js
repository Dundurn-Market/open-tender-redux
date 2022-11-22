const initState = {
  entities: [],
  lookup: {},
  loading: 'idle',
  error: null,
}

export const entitiesReducer = (state = initState, action, name, entity) => {
  switch (action.type) {
    case `${name}/reset${entity}`:
      return { ...initState }
    case `${name}/reset${entity}Error`:
      return { ...state, loading: 'idle', error: null }
    case `${name}/set${entity}`:
      return { ...state, entities: action.payload, error: null }
    case `${name}/set${entity}Lookup`:
      return { ...state, lookup: action.payload, error: null }
    case `${name}/fetch${entity}/pending`:
      return { ...state, loading: 'pending' }
    case `${name}/fetch${entity}/fulfilled`:
      return {
        ...state,
        entities: action.payload,
        last_updated: new Date(),
        loading: 'idle',
        error: null,
      }
    case `${name}/fetch${entity}/rejected`:
      return { ...state, loading: 'idle', error: action.payload }
    case `${name}/update${entity}/pending`:
      return { ...state, loading: 'pending' }
    case `${name}/update${entity}/fulfilled`:
      return {
        ...state,
        entities: action.payload,
        loading: 'idle',
        error: null,
      }
    case `${name}/update${entity}/rejected`:
      return { ...state, loading: 'idle', error: action.payload }
    case `${name}/remove${entity}/pending`:
      return { ...state, loading: 'pending' }
    case `${name}/remove${entity}/fulfilled`:
      return {
        ...state,
        entities: action.payload,
        loading: 'idle',
        error: null,
      }
    case `${name}/remove${entity}/rejected`:
      return { ...state, loading: 'idle', error: action.payload }
    case `${name}/add${entity}/pending`:
      return { ...state, loading: 'pending' }
    case `${name}/add${entity}/fulfilled`:
      return {
        ...state,
        entities: action.payload,
        loading: 'idle',
        error: null,
      }
    case `${name}/add${entity}/rejected`:
      return { ...state, loading: 'idle', error: action.payload }
    default:
      return state
  }
}
