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

function calculateToolTipPosition(mousePosition, dimension) {
  let screenWidth = window.innerWidth;
  let margin = toolTipMargin;
  let toolTipWidth = d3.select('.tooltip')
                       .style('width');

  if (dimension == 'x' && mousePosition > screenWidth / 2) {
    margin -= +toolTipWidth.replace('px', '');
  }

  return margin + mousePosition + 'px';
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

    // Create list of years.
    let years = dataset.map((year) => {
      return year.year;
    });

    // Define x-axis for best actress visualization.
    let x = d3.scaleBand()
              .domain(years)
              .range([0, width])
              .padding([0.2]);

    // Initialize x-axis.
    svg.append('g')
       .attr('transform', `translate(0, ${height})`)
       .call(d3.axisBottom(x)
               .tickFormat(d3.format('d')));

    // Define y-axis for best actress visualization.
    let y = d3.scaleLinear()
              .domain(d3.extent(dataset.map((year) => {
                return Math.max(year.bathTubScenes.length, year.showerScenes.length);
              })))
              .range([height, 0]);

    // Initialize y-axis.
    svg.append('g')
    .call(d3.axisLeft(y)
            .ticks(4)
            .tickFormat(d3.format('d')));

    // Initialize x-axis subgroup.
    let subgroups = ['showerScenes', 'bathTubScenes'];

    let xSubgroup = d3.scaleBand()
                      .domain(subgroups)
                      .range([0, x.bandwidth()])
                      .padding([0.05]);

    // Initialize color palette for subgroups.
    let color = d3.scaleOrdinal()
                         .domain(subgroups)
                         .range(['#e41a1c','#377eb8']);

    // Initialize best actress barchart.
    svg.append('g')
       .selectAll('g')
       .data(dataset)
       .enter()
       .append('g')
       .attr('transform', (d) => {
         // Calculate x position of bar groups by year.
         return `translate(${x(d.year)}, 0)`;
       })
       .selectAll('rect')
       .data((d) => {
         // Calculate number of shower and bathtub scenes for each year.
         return subgroups.map((key) => {
           return {
             key: key,
             value: d[key].length
           };
         });
       })
       .enter()
       .append('rect')
       .attr('x', (d) => {
         return xSubgroup(d.key);
       })
       .attr('y', (d) => {
         return y(d.value);
       })
       .attr('width', xSubgroup.bandwidth())
       .attr('height', (d) => {
         return height - y(d.value);
       })
       .attr('fill', (d) => {
         return color(d.key);
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
