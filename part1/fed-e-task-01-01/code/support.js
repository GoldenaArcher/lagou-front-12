class Container {
  static of(val) {
    return new Container(val);
  }
  constructor(val) {
    this._val = val;
  }
  map(fn) {
    return Container.of(fn(this._val));
  }
}

class Maybe extends Container {
  static of(val) {
    return new Maybe(val);
  }
  map(fn) {
    return this.isNothing() ? Maybe.of(this._val) : Maybe.of(fn(this._val));
  }
  isNothing() {
    return this._val === null || this._val === undefined;
  }
}

module.exports = {
  Container: Container,
  Maybe: Maybe,
};
