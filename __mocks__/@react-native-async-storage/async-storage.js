// Jest manual mock for @react-native-async-storage/async-storage
const mockStorage = {};

module.exports = {
  __esModule: true,
  default: {
    getItem: jest.fn((key) => Promise.resolve(mockStorage[key] ?? null)),
    setItem: jest.fn((key, value) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStorage))),
  },
};
