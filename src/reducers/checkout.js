const initState = {
  check: null,
  form: {
    details: {},
    customer: {},
    address: {},
    surcharges: [],
    discounts: [],
    promoCodes: [],
    qrCodes: [],
    points: [],
    tenders: [],
    tip: null,
  },
  submitting: false,
  isGuest: false,
  completedOrder: null,
  errors: {},
  loading: 'idle',
}

const NAME = 'checkout'

export const RESET_CHECKOUT = `${NAME}/resetCheckout`
export const RESET_ERRORS = `${NAME}/resetErrors`
export const RESET_CHECK = `${NAME}/resetCheck`
export const RESET_TIP = `${NAME}/resetTip`
export const RESET_COMPLETED_ORDER = `${NAME}/resetCompletedOrder`
export const SET_COMPLETED_ORDER = `${NAME}/setCompletedOrder`
export const SET_SUBMITTING = `${NAME}/setSubmitting`
export const SET_GUEST = `${NAME}/setGuest`
export const UPDATE_FORM = `${NAME}/updateForm`
export const UPDATE_CUSTOMER = `${NAME}/updateCustomer`
export const VALIDATE_ORDER = `${NAME}/validateOrder`
export const SUBMIT_ORDER = `${NAME}/submitOrder`

export default (state = initState, action) => {
  switch (action.type) {
    case RESET_CHECKOUT:
      return { ...initState }
    case RESET_CHECK:
      return { ...state, check: null }
    case RESET_TIP:
      return { ...state, form: { ...state.form, tip: null } }
    case RESET_ERRORS:
      return { ...state, errors: {} }
    case RESET_COMPLETED_ORDER:
      return { ...state, completedOrder: null }
    case SET_COMPLETED_ORDER:
      return { ...initState, completedOrder: action.payload }
    case SET_SUBMITTING:
      return { ...state, submitting: action.payload }
    case SET_GUEST:
      return { ...state, isGuest: action.payload }
    case UPDATE_FORM: {
      let errors = { ...state.errors }
      const { tenders } = action.payload
      if (tenders) delete errors.tenders
      return { ...state, form: { ...state.form, ...action.payload }, errors }
    }
    case UPDATE_CUSTOMER: {
      const account = action.payload
      const customer = { ...state.form.customer }
      const customerId = customer ? customer.customer_id : null
      let form = { ...state.form }
      if (!account) {
        if (customerId) {
          form = {
            ...form,
            customer: {},
            promoCodes: [],
            discounts: [],
            tenders: [],
          }
        } else {
          form = { ...form, customer: {}, promoCodes: [] }
        }
      } else if (customerId && account.customer_id !== customerId) {
        form = { ...form, customer, discounts: [], tenders: [] }
      } else if (account && !customerId) {
        form = { ...form, customer: account, discounts: [], tenders: [] }
      }
      return { ...state, form }
    }
    case `${VALIDATE_ORDER}/pending`:
      return { ...state, loading: 'pending' }
    case `${VALIDATE_ORDER}/fulfilled`:
      return {
        ...state,
        ...action.payload,
        loading: 'idle',
        error: null,
      }
    case `${VALIDATE_ORDER}/rejected`:
      return { ...state, loading: 'idle', errors: { form: action.payload } }
    case `${SUBMIT_ORDER}/pending`:
      return { ...state, loading: 'pending' }
    case `${SUBMIT_ORDER}/fulfilled`:
      return { ...initState, completedOrder: action.payload }
    case `${SUBMIT_ORDER}/rejected`: {
      return {
        ...state,
        loading: 'idle',
        submitting: false,
        errors: action.payload,
      }
    }
    default:
      return state
  }
}
