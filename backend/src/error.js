// Input error definition
export class InputError extends Error {
  constructor (message) {
    super(message);
    this.name = 'InputError';
  }
}

// Defining the access error
export class AccessError extends Error {
  constructor (message) {
    super(message);
    this.name = 'AccessError';
  }
}
