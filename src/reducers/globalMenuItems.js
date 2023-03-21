const initState = {
  entities: [],
  loading: 'idle',
  error: null,
}

const NAME = 'globalMenuItems'

export const FETCH_GLOBAL_MENU_ITEMS = `${NAME}/fetchGlobalMenuItems`

export default (state = initState, action) => {
  switch (action.type) {
    case `${FETCH_GLOBAL_MENU_ITEMS}/pending`:
      return { ...state, loading: 'pending' }
    case `${FETCH_GLOBAL_MENU_ITEMS}/fulfilled`:
      return {
        ...state,
        entities: action.payload,
        last_updated: new Date(),
        loading: 'idle',
        error: null,
      }
    case `${FETCH_GLOBAL_MENU_ITEMS}/rejected`:
      return { ...state, loading: 'idle', error: action.payload }
    default:
      return state
  }
}
