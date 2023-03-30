/* eslint-disable @typescript-eslint/no-explicit-any */

enum DiffTypes {
  VALUE_CREATED = 'created',
  VALUE_UPDATED = 'updated',
  VALUE_DELETED = 'deleted',
  VALUE_UNCHANGED = '---',
}

export class ObjectDiff {
  static diff(original: any, updated: any): unknown {
    if (this.isFunction(original) || this.isFunction(updated)) {
      throw 'Invalid argument. Function given, object expected.';
    }
    if (this.isValue(original) || this.isValue(updated)) {
      const returnObj = {
        type: this.compareValues(original, updated),
        original: original,
        updated: updated,
      };
      if (returnObj.type != DiffTypes.VALUE_UNCHANGED) {
        return returnObj;
      }
      return undefined;
    }

    const diff: any = {};
    const foundKeys: Record<string, boolean> = {};
    for (const key in original) {
      if (this.isFunction(original[key])) {
        continue;
      }

      const mapValue: unknown = this.diff(original[key], updated[key]);
      foundKeys[key] = true;
      if (mapValue) {
        diff[key] = mapValue;
      }
    }

    for (const key in updated) {
      if (this.isFunction(updated[key]) || foundKeys[key] !== undefined) {
        continue;
      }

      const mapValue = this.diff(undefined, updated[key]);
      if (mapValue) {
        diff[key] = mapValue;
      }
    }

    if (Object.keys(diff).length > 0) {
      return diff;
    }
    return undefined;
  }

  private static compareValues(value1: any, value2: any): DiffTypes {
    if (value1 === value2) {
      return DiffTypes.VALUE_UNCHANGED;
    }
    if (
      this.isDate(value1) &&
      this.isDate(value2) &&
      value1.getTime() === value2.getTime()
    ) {
      return DiffTypes.VALUE_UNCHANGED;
    }
    if (value1 === undefined) {
      return DiffTypes.VALUE_CREATED;
    }
    if (value2 === undefined) {
      return DiffTypes.VALUE_DELETED;
    }
    return DiffTypes.VALUE_UPDATED;
  }

  private static isFunction(x: unknown): boolean {
    return Object.prototype.toString.call(x) === '[object Function]';
  }

  private static isArray(x: unknown): boolean {
    return Object.prototype.toString.call(x) === '[object Array]';
  }

  private static isDate(x: unknown): boolean {
    return Object.prototype.toString.call(x) === '[object Date]';
  }

  private static isObject(x: unknown): boolean {
    return Object.prototype.toString.call(x) === '[object Object]';
  }

  private static isValue(x: unknown): boolean {
    return !this.isObject(x) && !this.isArray(x);
  }
}
