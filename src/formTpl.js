import {seriesDefaults} from './seriesDefaults.js';

const seriesRadiosTpl = Object.keys(seriesDefaults).reduce((c, k) => {
  return c += `<div class="form-check d-block">
    <input class="form-check-input" required type="radio" name="selectedSeries" value="${k}" id="selectedSeries_${k}">
    <label class="form-check-label" for="selectedSeries_${k}">${seriesDefaults[k].name}</label>
  </div>`;
}, '');

export const formTpl = `
  <div class="form-floating mb-3">
    <input class="form-control" required type="date" name="summaryDate">
    <label for="summaryDate">Summary Date</label>
  </div>
  <div class="form-floating mb-3">
    <input class="form-control" required type="number" name="dataValue" id="dataValue">
    <label for="dataValue"># requests</label>
  </div>
  <div class="mb-3">
    <label>Select Request Series</label>
    ${seriesRadiosTpl}
  </div>
  <div class="form-actions">
    <button class="btn btn-primary" name="pointFormSubmit">Add New Data Point</button>
  </div>
`;
