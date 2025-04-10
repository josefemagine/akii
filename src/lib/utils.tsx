import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
interface utilsProps {}

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
