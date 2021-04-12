import HighCharts from 'highcharts/es-modules/masters/highcharts.src.js';
import loadData from './data.js';
import {formTpl} from './formTpl.js';
import {seriesDefaults} from './seriesDefaults.js';

let data, processedData;

export class ChartDisplayElement extends HTMLElement {

  invalidFormSubmit = false;

  constructor() {
    super();
    this.init();
  }

  async init() {
    data = await loadData();
    this.processData();
    this.buildChart();
    this.buildForm();
  }

  processData() {
    // create a key -> value list to store unique data for each day
    processedData = data.categorized_domain_requests.reduce((c, v) => {
      let t = Date.parse(v.summary_date);
      if (isNaN(t)) return c;
      v.summary_time = t;
      c[v.summary_date] = v;
      return c;
    }, {});
  }

  buildForm() {
    this.formContainer = document.createElement('div');
    this.formContainer.className = 'form-container';
    this.formElement = document.createElement('form');
    this.formElement.innerHTML = formTpl;
    this.formElement.addEventListener('submit', this.onFormSubmit.bind(this));
    this.formContainer.appendChild(this.formElement);
    this.appendChild(this.formContainer);
    this.addFormListeners();
  }

  addFormListeners() {
    const {summaryDate, dataValue, selectedSeries} = this.formElement.elements;

    // we need to listen for input to validate on the date field since
    // safari does have native support for the type="date" input
    // we also check to see if we have an invalid 'submit' event
    // to prevent adding date validation message prematurely
    summaryDate.addEventListener('input', (e) => {
      if (!this.invalidFormSubmit) return;
      this.isValidDate(summaryDate.value)
        ? this.removeDateValidationError(summaryDate) : this.addDateValidationError(summaryDate);
    });
  }

  onFormSubmit(e) {
    const {summaryDate, dataValue, selectedSeries} = this.formElement.elements;

    // validate the date and add series point unless invalid
    if (this.isValidDate(summaryDate.value)) {
      this.addSeriesDataPoint(selectedSeries.value, summaryDate.value, dataValue.value);
      this.invalidFormSubmit = false;
    } else {
      this.invalidFormSubmit = true;
      this.addDateValidationError(summaryDate);
    }

    e.preventDefault();
  }

  resetForm() {
    const {pointFormSubmit} = this.formElement.elements;
    this.formElement.reset();
    pointFormSubmit.innerText = 'Add New Data Point';
  }

  onPointClick(e) {
    const {point} = e;
    const {summaryDate, dataValue, selectedSeries, pointFormSubmit} = this.formElement.elements;

    // the selected property is set after this event
    // and so if it's selected that means it was unselected
    if (point.selected) {
      this.resetForm();
      return;
    }

    summaryDate.value = point.name;
    dataValue.value = point.y;
    selectedSeries.value = point.series.userOptions.key;
    pointFormSubmit.innerText = 'Update Data Point';
  }

  isValidDate(date) {
    return !isNaN(Date.parse(date));
  }

  addDateValidationError(dateElement) {
    dateElement.setCustomValidity('A valid date is required');
    dateElement.reportValidity();
  }

  removeDateValidationError(summaryDate) {
    summaryDate.setCustomValidity('');
  }

  addSeriesDataPoint(seriesName, summaryDate, value) {
    this.resetForm();

    value = parseInt(value);

    // find our series based on key we stored
    for (var series of this.chart.series) {
      if (series.userOptions.key === seriesName)
        break;
    }

    // if we have this date stored in our map and the series has a point, then we update
    if (summaryDate in processedData && seriesName in processedData[summaryDate]) {
      for (var point of series.points) {
        if (point.name === summaryDate) {
          point.update({
            name: summaryDate,
            y: value
          });
          point.selected && point.select();
        }
      }
    } else {
      series.addPoint({
        name: summaryDate,
        y: value,
        events: {
          click: this.onPointClick.bind(this)
        }
      });
    }

    // update or add new summary date point to our map
    processedData[summaryDate] = {
      ...(processedData[summaryDate] || {}),
      ...{
        summary_date: summaryDate,
        [seriesName]: value
      }
    };
  }

  buildChart() {
    this.chartContainer = document.createElement('div');
    this.chartContainer.className = 'chart-container';
    this.appendChild(this.chartContainer);
    this.chart = HighCharts.chart(this.chartContainer, {
      title: {
        text: 'Requests Totals'
      },
      plotOptions: {
        series: {
          allowPointSelect: true
        }
      },
      series: this.getChartSeries(),
      yAxis: {
        title: {
          text: '# of requests'
        }
      },
      xAxis: {
        title: {
          text: 'Summary Date'
        },
        labels: {
          formatter: (conf) => this.getSummaryDateLabel(conf.value)
        },
      },
    });
  }

  getSummaryDateLabel(pos) {
    return this.series.human_total.data[pos].name;
  }

  getDataPoints() {
    return Object.values(processedData).sort((a, b) => {
      if (a.summary_time > b.summary_time)
        return 1;
      else if (a.summary_time < b.summary_time)
        return -1;
      return 0;
    });
  }

  getChartSeries() {
    // we deep clone our known defaults and build
    // our series data based on the data points
    this.series = JSON.parse(JSON.stringify(seriesDefaults));
    for (let dp of this.getDataPoints()) {
      for (let k in this.series) {
        this.series[k].data.push({
          name: dp.summary_date,
          y: dp[k],
          events: {
            click: this.onPointClick.bind(this)
          }
        });
      }
    }
    return Object.values(this.series);
  }
}
