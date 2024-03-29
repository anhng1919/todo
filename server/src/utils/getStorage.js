import { LocalStorage } from 'node-localstorage';

let storage = null;

class Storage {
  constructor(driver)
  {
    this.driver = driver;
  }

  set(key, value) {
    this.driver.setItem(key, JSON.stringify(value))
  }

  get(key) {
    const value = this.driver.getItem(key)
    if(value === null)
    {
      return null
    }

    return JSON.parse(value)
  }
}

export default () => {
  if(storage === null)
  {
    storage = new Storage(new LocalStorage('./data'));

    // init empty task  collection
    if(storage.get('tasks') === null)
    {
      storage.set('tasks', []);
    }
  }

  return storage;
}
