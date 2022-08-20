import loadData from './load-data';

const dataPointRadius = 4;
const toolTipMargin = 10;

function formatTooltip(i, sceneType) {
  let entries = i[sceneType];
  let sceneTypeFormatted = sceneType == 'bathTubScenes' ? 'Bathtub' : 'Shower'
  let html = `<div>${sceneTypeFormatted} Scenes in ${i['year']}</div><ul>`;

  for (let i in entries) {
    let entry = entries[i];
    let filmName = entry['film'];
    let filmNameClean = filmName.replace('/', '_');

    html += `<li>${entry['actress']}, <i>${filmName}</i></li>`;
    html += `<img src="assets/images/bathtub-images/${filmNameClean}.jpeg">`
  }

  html += '</ul>';

  return html;
}

/* global d3 */
function resize() { }

function init() {
  let margin = {
    top: 10,
    right: 30,
    bottom: 50,
    left: 60
  },
  width = 900 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  let svg = d3.select('#line_graph')
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  let dataObject = {};

	loadData('best-actress-nominees.csv').then(nominees => {
    nominees.forEach((nominee) => {
      let year = nominee['Oscar Year'];
      let hasBathTub = nominee['Bathtub'].length === 0 ? false : true;
      let hasShower = nominee['Shower'].length === 0 ? false : true;
      let film = nominee['Film'];
      let actress = nominee['Actress'];

      if (!dataObject[year]) {
        dataObject[year] = {};
        dataObject[year]['count'] = 0;
      }

      if (!dataObject[year]['bathTubScenes']) {
        dataObject[year]['bathTubScenes'] = [];
      }

      if (!dataObject[year]['showerScenes']) {
        dataObject[year]['showerScenes'] = [];
      }

      dataObject[year]['count']++;

      if (hasBathTub) {
        dataObject[year]['bathTubScenes'].push({
          film: film,
          actress: actress
        });
      }

      if (hasShower) {
        dataObject[year]['showerScenes'].push({
          film: film,
          actress: actress
        });
      }
    });

    let dataset = [];

    for (let year in dataObject) {
      dataset.push({
        'year': year,
        'bathTubScenes': dataObject[year]['bathTubScenes'],
        'showerScenes': dataObject[year]['showerScenes']
      });
    }

    let tooltip = d3.select('#line_graph')
                      .append('div')
                      .attr('class', 'tooltip')
                      .style('visibility', 'hidden')
                      .style('position', 'absolute');

    let x = d3.scaleLinear()
              .domain(d3.extent(dataset.map((year) => {
                return year.year;
              })))
              .range([0, width]);

    svg.append('g')
       .attr('transform', 'translate(0,' + height + ')')
       .call(d3.axisBottom(x)
               .tickFormat(d3.format('d')));

    let y = d3.scaleLinear()
              .domain(d3.extent(dataset.map((year) => {
                return Math.max(year.bathTubScenes.length, year.showerScenes.length);
              })))
              .range([height, 0]);
              svg.append('g')
              .call(d3.axisLeft(y)
                      .ticks(4)
                      .tickFormat(d3.format('d')));

    svg.append('path')
       .datum(dataset)
       .attr('fill', 'none')
       .attr('stroke', 'steelblue')
       .attr('stroke-width', 1.5)
       .attr('d', d3.line()
       .x((d) => {
         return x(d.year)
       })
       .y((d) => {
         return y(d.bathTubScenes.length)
       }));

    svg.selectAll('points')
       .data(dataset)
       .enter()
       .append('circle')
       .attr('cx', (d) => {
         return x(d.year);
       })
       .attr('cy', (d) => {
         return y(d.bathTubScenes.length);
       })
       .attr('r', dataPointRadius)
       .attr('class', 'point')
       .style('opacity', 1)
       .on('mouseover', (d, i) => {
         tooltip.style('visibility', 'visible')
                .html(formatTooltip(i, 'bathTubScenes'));
       })
       .on('mousemove', (d) => {
         tooltip.style('top', toolTipMargin + (event.pageY) + 'px')
                .style('left', toolTipMargin +(event.pageX) + 'px');
       })
       .on('mouseout', (d) => {
         tooltip.style('visibility', 'hidden');
       });

    svg.append('path')
       .datum(dataset)
       .attr('fill', 'none')
       .attr('stroke', 'red')
       .attr('stroke-width', 1.5)
       .attr('d', d3.line()
       .x((d) => {
         return x(d.year)
       })
       .y((d) => {
         return y(d.showerScenes.length)
       }));

    svg.selectAll('points')
       .data(dataset)
       .enter()
       .append('circle')
       .attr('cx', (d) => {
         return x(d.year);
       })
       .attr('cy', (d) => {
         return y(d.showerScenes.length);
       })
       .attr('r', dataPointRadius)
       .attr('class', 'point')
       .style('opacity', 1)
       .on('mouseover', (d, i) => {
         tooltip.style('visibility', 'visible')
                .html(formatTooltip(i, 'showerScenes'));
       })
       .on('mousemove', (d) => {
         tooltip.style('top', toolTipMargin + (event.pageY) + 'px')
                .style('left', toolTipMargin + (event.pageX) + 'px');
       })
       .on('mouseout', (d) => {
         tooltip.style('visibility', 'hidden');
       });

    svg.append('text')
       .attr('class', 'x label')
       .attr('text-anchor', 'middle')
       .attr('x', width)
       .attr('y', height + 40)
       .text('Year');

    svg.append('text')
       .attr('class', 'y label')
       .attr('text-anchor', 'middle')
       .attr('y', 6)
       .attr('dy', '.75em')
       .attr('transform', 'rotate(-90)')
       .text('Bathtub Scenes');
	}).catch(console.error);
  }

export default { init, resize };
