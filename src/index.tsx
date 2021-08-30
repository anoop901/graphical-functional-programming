import * as React from "react";
import * as ReactDOM from "react-dom";
import IndexPage from "./components/IndexPage";
import "./index.css";
import { store } from "./store";
import { Provider } from "react-redux";

const divElem: HTMLElement = document.createElement("div");
document.body.appendChild(divElem);
ReactDOM.render(
  <Provider store={store}>
    <IndexPage />
  </Provider>,
  divElem
);
