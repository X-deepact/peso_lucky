import { trim } from 'lodash';
export const omitEmpty = <T extends Record<string, any>>(obj: T): T => {
  const newObj = {} as T;
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      value !== undefined &&
      value !== null &&
      value !== '' &&
      trim(value) !== ''
    ) {
      newObj[key as keyof T] = value;
    }
  });
  return newObj;
};

export const objValTrim = <T extends Record<string, any>>(obj: T): T => {
  const newObj = {} as T;
  Object.keys(obj).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] instanceof String) {
        newObj[key as keyof T] = obj[key].trim();
      } else {
        newObj[key as keyof T] = obj[key];
      }
    }
  });
  return newObj;
};
