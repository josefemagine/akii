import React from "react";
interface util-polyfillProps {}

export function inherits(ctor, superCtor) {
    if (superCtor) {
        ctor.super_ = superCtor;
        Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
    }
}
export default {
    inherits
};
