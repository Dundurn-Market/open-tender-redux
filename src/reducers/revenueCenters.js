const initState = {
  revenueCenters: [],
  loading: 'idle',
  error: null,
}

const NAME = 'revenueCenters'

export const RESET_REVENUE_CENTERS = `${NAME}/resetRevenueCenters`
export const SET_REVENUE_CENTERS = `${NAME}/setRevenueCenters`
export const FETCH_REVENUE_CENTERS = `${NAME}/fetchRevenueCenters`
export const FETCH_LOCATIONS = `${NAME}/fetchLocations`

export default (state = initState, action) => {
  switch (action.type) {
    case RESET_REVENUE_CENTERS:
      return { ...initState }
    case SET_REVENUE_CENTERS:
      return { ...state, revenueCenters: action.payload }

    // FETCH_REVENUE_CENTERS
    case `${FETCH_REVENUE_CENTERS}/pending`:
      return { ...state, loading: 'pending' }
    case `${FETCH_REVENUE_CENTERS}/fulfilled`:
      return {
        ...state,
        revenueCenters: action.payload,
        loading: 'idle',
        error: null,
      }
    case `${FETCH_REVENUE_CENTERS}/rejected`:
      return { ...state, loading: 'idle', error: action.payload }

    // FETCH_LOCATIONS
    case `${FETCH_LOCATIONS}/pending`:
      return { ...state, loading: 'pending' }
    case `${FETCH_LOCATIONS}/fulfilled`:
      return {
        ...state,
        revenueCenters: action.payload,
        last_updated: new Date(),
        loading: 'idle',
        error: null,
      }
    case `${FETCH_LOCATIONS}/rejected`:
      return { ...state, loading: 'idle', error: action.payload }

    default:
      return state
  }
}
