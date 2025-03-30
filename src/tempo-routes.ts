import { RouteObject } from "react-router-dom";
import React from "react";

// This file defines routes that are only used in the Tempo environment
const routes: RouteObject[] = [
  {
    path: "/tempobook/*",
    element: React.createElement("div", null, "Tempo Storybook"),
  },
];

export default routes;
