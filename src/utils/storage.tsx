import AsyncStorage from '@react-native-async-storage/async-storage';

const AsyncStorageUtils = {
  /**
   * Save data to AsyncStorage
   * @param {string} key - The key to store the data under
   * @param {any} value - The value to store (will be stringified)
   */
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting item in AsyncStorage for key "${key}":`, error);
    }
  },

  /**
   * Retrieve data from AsyncStorage
   * @param {string} key - The key to retrieve the data for
   * @returns {Promise<any>} - The parsed value or null if not found
   */
  getItem: async (key: string): Promise<any> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error getting item from AsyncStorage for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Remove an item from AsyncStorage
   * @param {string} key - The key to remove the data for
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from AsyncStorage for key "${key}":`, error);
    }
  },

  /**
   * Clear all data from AsyncStorage
   */
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  },

  /**
   * Get all keys in AsyncStorage
   * @returns {Promise<string[]>} - Array of keys
   */
  getAllKeys: async (): Promise<string[]> => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys from AsyncStorage:', error);
      return [];
    }
  },
};

export default AsyncStorageUtils;
