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

const unauthorizedError = {
  status: 401,
  code: 'errors.unauthorized',
  title: 'Unauthorized',
  detail: 'Provided token is not valid',
}

const handleResponse = response => {
  const { status, statusText } = response
  if (status >= 500) throw fiveHundredError(status, statusText)
  if (status === 401) throw unauthorizedError
  if (statusText === 'NO CONTENT' || status === 204) {
    return true
  }
  if (status === 202) {
    try {
      return response.body
    } catch (err) {
      throw new requestException('Response could not be parsed', response, err)
    }
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

class RecurrenceApi {
  constructor(url) {
    this.baseUrl = url
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

      if (token) headers.Authorization = `Bearer ${token}`
      let options = {
        method: method,
        headers: headers,
      }
      if (data) options.body = JSON.stringify(data)
      fetch(`${this.baseUrl}${endpoint}`, options)
        .then(handleResponse)
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

  postRecurrence(data, bearerToken) {
    return this.request(
      `/recurring/${data.id}`,
      'POST',
      { recurrence : data },
      null,
      bearerToken,
    )
  }

  postOrder(data, bearerToken) {
    return this.request(
      '/recurring/cart/',
      'POST',
      data,
      null,
      bearerToken,
    )
  }

  editOrder(orderId, data, bearerToken) {
    return this.request(
      `/recurring/cart/${orderId}`,
      'POST',
      data,
      null,
      bearerToken,
    )
  }

  deleteOrder(orderId, bearerToken) {
    return this.request(
      `/orders/${orderId}`,
      'DELETE',
      null,
      null,
      bearerToken,
    )
  }

  async getRecurrences(bearerToken) {
    const recurrences = await this.request(
      '/recurring/',
      'GET',
      null,
      null,
      bearerToken,
    )
    return recurrences.recurrences
      ? Object.values(recurrences.recurrences)
      : recurrences
  }

  deleteRecurrence(recurrenceId, bearerToken) {
    return this.request(
      `/recurring/${recurrenceId}`,
      'DELETE',
      null,
      null,
      bearerToken,
    )
  }
}

export default RecurrenceApi
