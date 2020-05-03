import * as React from 'react';
import * as ReactDOM from 'react-dom';
import IndexPage from './components/IndexPage';
import './index.css'

const divElem: HTMLElement = document.createElement('div');
document.body.appendChild(divElem);
ReactDOM.render(<IndexPage />, divElem);