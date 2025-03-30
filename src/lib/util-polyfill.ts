export function inherits(ctor: any, superCtor: any) {
  if (superCtor) {
    ctor.super_ = superCtor;
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  }
}

export default {
  inherits
}; 