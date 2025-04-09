import React from "react";
// This file defines routes that are only used in the Tempo environment
const routes = [
    {
        path: "/tempobook/*",
        element: React.createElement("div", null, "Tempo Storybook"),
    },
];
export default routes;
