import { FetchError } from './error';

import { createLogger } from './logger';

const Logger = createLogger('fetch');

/**
 * Query String and FormData
 */

// export function toQueryString(data) {
//   return Object.keys(data)
//     .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
//     .join('&');
// }

export function encode(result, name, value, mode = 'querystring') {
  if (typeof value === 'object' && value) {
    if (value instanceof File) {
      if (mode === 'formdata') {
        result[name] = value;
      } else if (mode === 'querystring') {
        // result[name] = new FileReader().readAsDataURL(value);
      }
    } else if (value instanceof Date) {
      result[name] = value.toJSON();
    } else if (typeof value.toJSON === 'function') {
      encode(result, name, JSON.parse(value.toJSON()), mode);
    } else if (Array.isArray(value)) {
      value.forEach((val, index) => encode(result, `${name}[${index}]`, val, mode));
    } else {
      Object.keys(value).forEach((key) => encode(result, `${name}[${encodeURIComponent(key)}]`, value[key], mode));
    }
  } else {
    result[name] = String(value);
  }
}

export function toQueryString(data) {
  const result = {};
  Object.keys(data).forEach((key) => encode(result, encodeURIComponent(key), data[key], 'querystring'));
  const outcome = Object.keys(result)
    .map((key) => `${key}=${encodeURIComponent(result[key])}`)
    .join('&');
  return outcome;
}

export function toFormData(data) {
  const result = {};
  Object.keys(data).forEach((key) => encode(result, encodeURIComponent(key), data[key], 'formdata'));
  const outcome = new FormData();
  Object.keys(result).map((key) => outcome.append(key, result[key]));
  return outcome;
}

/**
 * Response Listeners
 */

const SUCCESS_LISTENERS = [];

export function registerSuccessListener(listener) {
  SUCCESS_LISTENERS.push(listener);
}

export function unregisterSuccessListener(listener) {
  const index = SUCCESS_LISTENERS.indexOf(listener);
  if (index !== -1) {
    SUCCESS_LISTENERS.splice(index, 1);
  }
}

export function clearSuccessListeners() {
  SUCCESS_LISTENERS.length = 0;
}

const FAILURE_LISTENERS = [];

export function registerFailureListener(listener) {
  FAILURE_LISTENERS.push(listener);
}

export function unregisterFailureListener(listener) {
  const index = FAILURE_LISTENERS.indexOf(listener);
  if (index !== -1) {
    FAILURE_LISTENERS.splice(index, 1);
  }
}

export function clearFailureListeners() {
  FAILURE_LISTENERS.length = 0;
}

/**
 * Response Handler
 * Converts JSON to Object and throws error for non-success statuses
 */

export function processResponse(
  response,
  successModifier = (payload, response) => payload,
  failureModifier = (error, response) => error,
) {
  let content;

  const contentType = response.headers.get('Content-Type', '');

  if (contentType === null) {
    content = Promise.resolve(null);
  } else if (contentType.startsWith('application/json')) {
    content = response.json();
  } else {
    content = response.text().then((text) => ({ text }));
  }

  if (response.ok || response.status === 304) {
    return content.then((payload) => {
      payload = successModifier(payload, response);
      SUCCESS_LISTENERS.forEach((listener) => listener(payload, response));
      return payload;
    });
  }

  return content.then(
    (payload = {}) => {
      let code = payload.code;
      let message = payload.message || payload.error;

      if (response.status === 400) {
        code = code || 'Invalid';
        message = message || 'Invalid Request';
      } else if (response.status === 401) {
        code = code || 'Unauthenticated';
        message = message || 'Unauthenticated';
      } else if (response.status === 403) {
        code = code || 'Unauthorized';
        message = message || 'Unauthorized';
      } else if (response.status === 404) {
        code = code || 'NotFound';
        message = message || 'Not Found';
      } else {
        code = code || 'Unknown';
        message = message || 'Unknown error';
      }

      let error = new FetchError(code, message, payload);

      error = failureModifier(error, response);

      FAILURE_LISTENERS.forEach((listener) => listener(error, response));

      throw error;
    },
    (err) => {
      Logger.error(err);
      throw new FetchError('Unknown error');
    },
  );
}

export function processError(_error, failureModifier = (error, response) => error) {
  let code = _error.code;
  let message = _error.message || _error.error;

  code = code || 'Unknown';
  message = message || 'Unknown error';

  let error = new FetchError(code, message, _error);

  error = failureModifier(error, {});

  FAILURE_LISTENERS.forEach((listener) => listener(error, {}));

  return error;
}