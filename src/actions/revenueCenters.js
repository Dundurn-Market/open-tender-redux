import { addDistance } from '@open-tender/js'
import { pending, fulfill, reject } from '../utils'
import {
  RESET_REVENUE_CENTERS,
  SET_REVENUE_CENTERS,
  FETCH_REVENUE_CENTERS,
  FETCH_LOCATIONS,
} from '../reducers/revenueCenters'

// action creators

export const resetRevenueCenters = () => ({ type: RESET_REVENUE_CENTERS })
export const setRevenueCenters = revenueCenters => ({
  type: SET_REVENUE_CENTERS,
  payload: revenueCenters,
})

// async action creators

//TODO THIS IS NEVER USED .. Use fetchLocations
export const fetchRevenueCenters =
  ({ type, is_outpost, lat, lng, requestedAt }) =>
  async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    dispatch(pending(FETCH_REVENUE_CENTERS))
    try {
      if (lat) lat = parseFloat(lat).toFixed(7)
      if (lng) lng = parseFloat(lng).toFixed(7)
      const { data } = await api.getRevenueCenters(
        type,
        is_outpost,
        lat,
        lng,
        requestedAt
      )
      const revenueCenters = lat && lng ? addDistance(data, { lat, lng }) : data
      dispatch(fulfill(FETCH_REVENUE_CENTERS, revenueCenters))
    } catch (err) {
      dispatch(reject(FETCH_REVENUE_CENTERS, err))
    }
  }

export const fetchLocations =
  ({ type, is_outpost, lat, lng, requestedAt }) =>
  async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    dispatch(pending(FETCH_LOCATIONS))
    try {
      if (lat) lat = parseFloat(lat).toFixed(7)
      if (lng) lng = parseFloat(lng).toFixed(7)
      const { data } = await api.getLocations(
        type,
        is_outpost,
        lat,
        lng,
        requestedAt
      )
      const revenueCenters = lat && lng ? addDistance(data, { lat, lng }) : data
      dispatch(fulfill(FETCH_LOCATIONS, revenueCenters))
    } catch (err) {
      dispatch(reject(FETCH_LOCATIONS, err))
    }
  }
