import { serialize } from '@open-tender/js'

const requestException = (message, response, exception, extracted) => {
  this.message = `${message || 'An unknown exception was triggered.'}`
  this.stack = new Error().stack
  this.response = response
  this.exception = exception
  this.extracted = extracted
}

const fiveHundredError = (status = 500, statusText = 'Unknown 500 error') => ({
  status: status,
  code: 'errors.server.internal',
  title: 'Internal Server Error',
  detail: statusText,
})

const handleReponse = response => {
  const { status, statusText } = response
  if (status >= 500) {
    throw fiveHundredError(status, statusText)
  }
  if (statusText === 'NO CONTENT' || status === 204) {
    return true
  }
  const requestWasSuccessful = status >= 200 && status < 300
  try {
    return response.json().then(parsed => {
      if (requestWasSuccessful) return parsed
      throw parsed
    })
  } catch (err) {
    throw new requestException('Response could not be parsed', response, err)
  }
}

class OpenTenderAPI {
  constructor(config) {
    this.brandId = config.brandId
    this.clientId = config.clientId
    this.baseUrl = config.baseUrl
    this.authUrl = config.authUrl
  }

  request(endpoint, method = 'GET', data = null, timeout = null, token = null) {
    let didTimeOut = false
    return new Promise((resolve, reject) => {
      let timer
      if (timeout) {
        timer = setTimeout(() => {
          didTimeOut = true
          reject(new Error('Request timed out'))
        }, timeout)
      }
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
      if (this.clientId) headers['client-id'] = `${this.clientId}`
      if (this.brandId) headers['brand-id'] = `${this.brandId}`
      if (token) headers.Authorization = `Bearer ${token}`
      let options = {
        method: method,
        headers: headers,
      }
      if (data) options.body = JSON.stringify(data)
      fetch(`${this.baseUrl}${endpoint}`, options)
        .then(handleReponse)
        .then(json => {
          if (didTimeOut) return
          resolve(json)
        })
        .catch(err => {
          if (didTimeOut) return
          err.code ? reject(err) : reject(fiveHundredError())
        })
        .finally(() => {
          if (timeout) clearTimeout(timer)
        })
    })
  }

  authRequest(endpoint, data) {
    return new Promise((resolve, reject) => {
      data.client_id = this.clientId
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: serialize(data),
      }
      fetch(`${this.authUrl}/oauth2${endpoint}`, options)
        .then(res => res.json())
        .then(json => {
          if (json.error) throw new Error(json.error_description)
          resolve(json)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  post(endpoint, data) {
    return this.request(`/${endpoint}`, 'POST', data)
  }

  getHttpResponse(code) {
    return this.request(`/${code}/cors`)
  }

  getConfig() {
    return this.request(`/config`)
  }

  getSurcharges() {
    return this.request(`/surcharges`)
  }

  getDiscounts(serviceType) {
    const params = serviceType ? `?service_type=${serviceType}` : ''
    return this.request(`/discounts${params}`)
  }

  getTaxes(serviceType, orderType) {
    let params = []
    if (serviceType) params.push(`service_type=${serviceType}`)
    if (orderType) params.push(`order_type=${orderType}`)
    params = params.length ? `?${params.join('&')}` : ''
    return this.request(`/taxes${params}`)
  }

  getItemTypes() {
    return this.request(`/item-types`)
  }

  postTicketPrint(orderUuid, ticketNo, data) {
    const endpoint = `/orders/${orderUuid}/tickets/${ticketNo}/print`
    return this.request(endpoint, 'POST', data)
  }

  postTicketStatus(orderUuid, ticketNo, status) {
    const endpoint = `/orders/${orderUuid}/tickets/${ticketNo}/${status}`
    return this.request(endpoint, 'POST', {})
  }

  postTicketsPrint(orderUuid, data) {
    const endpoint = `/orders/${orderUuid}/tickets/print`
    return this.request(endpoint, 'POST', data)
  }

  postTicketsReset(orderUuid) {
    const endpoint = `/orders/${orderUuid}/tickets/reset`
    return this.request(endpoint, 'POST', {})
  }

  patchOrder(orderUuid, data) {
    return this.request(`/orders/${orderUuid}`, 'PATCH', data)
  }

  postReceipt(orderUuid) {
    const endpoint = `/orders/${orderUuid}/print`
    return this.request(endpoint, 'POST', {})
  }

  getStore() {
    return this.request(`/store`)
  }

  getRevenueCenters(revenue_center_type, is_outpost, lat, lng) {
    let params = ''
    if (revenue_center_type)
      params += `revenue_center_type=${revenue_center_type}`
    if (is_outpost) params += '&is_outpost=true'
    if (lat && lng) params += `&lat=${lat}&lng=${lng}`
    return this.request(`/revenue-centers?${params}`)
  }

  getRevenueCenter(revenue_center_id) {
    return this.request(`/revenue-centers/${revenue_center_id}`)
  }

  getValidTimes(revenueCenterType) {
    const params = `revenue_center_type=${revenueCenterType}`
    return this.request(`/valid-times?${params}`)
  }

  getAllergens() {
    return this.request(`/allergens`)
  }

  getMenu(revenueCenterId, serviceType, requestedAt) {
    const params = `revenue_center_id=${revenueCenterId}&service_type=${serviceType}&requested_at=${requestedAt}`
    return this.request(`/menus?${params}`)
  }

  getMenuItems(revenueCenterId, serviceType) {
    const params = `revenue_center_id=${revenueCenterId}&service_type=${serviceType}`
    return this.request(`/menu-items?${params}`)
  }

  getMenuPages() {
    return this.request(`/menu-pages`)
  }

  postTender(orderId, tender) {
    return this.request(`/orders/${orderId}/tenders`, 'POST', tender)
  }

  postOrderValidate(order) {
    return this.request(`/orders/validate`, 'POST', order)
  }

  postOrder(order) {
    return this.request(`/orders`, 'POST', order)
  }

  getOrders(args) {
    let params = []
    if (!args) {
      params = [
        `prep_status=TODO,IN_PROGRESS,DONE`,
        `sort_by=fire_at`,
        `sort_direction=ASC`,
      ]
    } else {
      const {
        business_date,
        channel_type,
        prep_status,
        search,
        sort_by,
        sort_direction,
      } = args
      if (business_date) params.push(`business_date=${business_date}`)
      if (channel_type) params.push(`channel_type=${channel_type}`)
      if (prep_status) params.push(`prep_status=${prep_status}`)
      if (search) params.push(`search=${search}`)
      if (sort_by) params.push(`sort_by=${sort_by}`)
      if (sort_direction) params.push(`sort_direction=${sort_direction}`)
    }

    params = params.length ? `?${params.join('&')}` : ''
    return this.request(`/orders${params}`)
  }

  postCart(data) {
    return this.request(`/carts`, 'POST', data)
  }

  getCart(cartId) {
    return this.request(`/carts/${cartId}`)
  }

  putCart(cartId, data) {
    return this.request(`/carts/${cartId}`, 'PUT', data)
  }

  deleteCart(cartId) {
    return this.request(`/carts/${cartId}`, 'DELETE')
  }

  postCartGuest(data) {
    return this.request(`/cart-guests`, 'POST', data)
  }

  postSignUp(data) {
    return this.request(`/customer`, 'POST', data)
  }

  postLevelUp(data) {
    return this.request(`/levelup`, 'POST', data)
  }

  postLogin(email, password) {
    // let auth
    const data = {
      grant_type: 'password',
      username: email,
      password: password,
    }
    return this.authRequest('/token', data)
    // .then((resp) {
    //   auth = resp
    //   return this.getCustomer(auth.access_token)
    // })
    // .then((customer) => ({ auth, customer }))
  }

  postLogout(token) {
    return this.authRequest('/revoke', { token })
  }

  postSendPasswordResetEmail(email, link_url) {
    const data = { email, link_url }
    return this.request(`/customer/password/send-email`, 'POST', data)
  }

  postResetPassword(new_password, token) {
    const data = { new_password, token }
    return this.request(`/customer/password/set-new-password`, 'POST', data)
  }

  getCustomer(token) {
    return this.request(`/customer?with_related=true`, 'GET', null, null, token)
  }

  putCustomer(token, data) {
    return this.request(`/customer`, 'PUT', data, null, token)
  }

  getCustomerOrders(token, limit, timing) {
    let params = []
    if (limit) params.push(`limit=${limit}`)
    if (timing) params.push(`requested_type=${timing}`)
    params = params.length ? `?${params.join('&')}` : ''
    return this.request(`/customer/orders${params}`, 'GET', null, null, token)
  }

  getCustomerOrder(token, orderId) {
    return this.request(`/customer/orders/${orderId}`, 'GET', null, null, token)
  }

  postCustomerGroupOrder(token, data) {
    return this.request(`/customer/carts`, 'POST', data, null, token)
  }

  getCustomerGroupOrders(token) {
    return this.request(`/customer/carts?expand=true`, 'GET', null, null, token)
  }

  getCustomerGroupOrder(token, cartId) {
    return this.request(
      `/customer/carts/${cartId}?expand=customer&with_related=true`,
      'GET',
      null,
      null,
      token
    )
  }

  putCustomerGroupOrder(token, cartId, data) {
    return this.request(`/customer/carts/${cartId}`, 'PUT', data, null, token)
  }

  putCustomerGroupOrderStatus(token, cartId, data) {
    return this.request(
      `/customer/carts/${cartId}/status`,
      'PUT',
      data,
      null,
      token
    )
  }

  deleteCustomerGroupOrder(token, cartId) {
    return this.request(
      `/customer/carts/${cartId}`,
      'DELETE',
      null,
      null,
      token
    )
  }

  getCustomerAllergens(token) {
    return this.request(`/customer/allergens`, 'GET', null, null, token)
  }

  // replace all existing allergens with a new list of allergens
  putCustomerAllergens(token, data) {
    return this.request(`/customer/allergens`, 'PUT', data, null, token)
  }

  // add new allergens incrementally without affecting existing allergens
  postCustomerAllergens(token, data) {
    return this.request(`/customer/allergens`, 'POST', data, null, token)
  }

  getCustomerAddresses(token, limit = 10) {
    const params = limit ? `?limit=${limit}` : ''
    return this.request(
      `/customer/addresses${params}`,
      'GET',
      null,
      null,
      token
    )
  }

  putCustomerAddress(token, addressId, data) {
    return this.request(
      `/customer/addresses/${addressId}`,
      'PUT',
      data,
      null,
      token
    )
  }

  deleteCustomerAddress(token, addressId) {
    return this.request(
      `/customer/addresses/${addressId}`,
      'DELETE',
      null,
      null,
      token
    )
  }

  getCustomerCreditCards(token) {
    return this.request(`/customer/credit-cards`, 'GET', null, null, token)
  }

  postCustomerCreditCard(token, data) {
    return this.request(`/customer/credit-cards`, 'POST', data, null, token)
  }

  putCustomerCreditCard(token, cardId, data) {
    return this.request(
      `/customer/credit-cards/${cardId}`,
      'PUT',
      data,
      null,
      token
    )
  }

  deleteCustomerCreditCard(token, cardId) {
    return this.request(
      `/customer/credit-cards/${cardId}`,
      'DELETE',
      null,
      null,
      token
    )
  }

  getCustomerGiftCards(token) {
    return this.request(`/customer/gift-cards`, 'GET', null, null, token)
  }

  postCustomerGiftCard(token, data) {
    return this.request(`/customer/gift-cards`, 'POST', data, null, token)
  }

  putCustomerGiftCard(token, giftCardId, data) {
    return this.request(
      `/customer/gift-cards/${giftCardId}`,
      'PUT',
      data,
      null,
      token
    )
  }

  getCustomerFavorites(token, limit) {
    const params = limit ? `?limit=${limit}` : ''
    return this.request(
      `/customer/favorites${params}`,
      'GET',
      null,
      null,
      token
    )
  }

  postCustomerFavorite(token, data) {
    return this.request(`/customer/favorites`, 'POST', data, null, token)
  }

  deleteCustomerFavorite(token, favoriteId) {
    return this.request(
      `/customer/favorites/${favoriteId}`,
      'DELETE',
      null,
      null,
      token
    )
  }

  getCustomerLoyalty(token) {
    return this.request(`/customer/loyalty`, 'GET', null, null, token)
  }

  getCustomerLevelUp(token) {
    return this.request(`/customer/levelup`, 'GET', null, null, token)
  }

  postCustomerLevelUp(token, data) {
    return this.request(`/customer/levelup`, 'POST', data, null, token)
  }

  deleteCustomerLevelUp(token, levelupConnectId) {
    return this.request(
      `/customer/levelup/${levelupConnectId}`,
      'DELETE',
      null,
      null,
      token
    )
  }

  getCustomerHouseAccounts(token) {
    return this.request(`/customer/house-accounts`, 'GET', null, null, token)
  }

  putCustomerOrderRating(token, orderId, data) {
    return this.request(
      `/customer/orders/${orderId}/rating`,
      'PUT',
      data,
      null,
      token
    )
  }
}

export default OpenTenderAPI
