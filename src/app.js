import {ChartDisplayElement} from './chartDisplay.js';
import './scss/styles.scss';

if (window.customElements && 'function' === typeof window.customElements.define) {
  window.customElements.define('chart-display', ChartDisplayElement);
}
