import loadData from './load-data';

/* global d3 */
function resize() { }

function init() {
  let margin = {
    top: 10,
    right: 30,
    bottom: 30,
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

  let tubObject = {};

	loadData('best-actress-nominees.csv').then(nominees => {
    nominees.forEach((nominee) => {
      let year = nominee['Oscar Year'];
      let hasBathTub = nominee['Bathtub'].length === 0 ? false : true;
      let hasShower = nominee['Shower'].length === 0 ? false : true;

      if (!tubObject[year]) {
        tubObject[year] = {};
        tubObject[year]['count'] = 0;
      }

      if (!tubObject[year]['bathTubScenes']) {
        tubObject[year]['bathTubScenes'] = 0;
      }

      if (!tubObject[year]['showerScenes']) {
        tubObject[year]['showerScenes'] = 0;
      }

      tubObject[year]['count']++;

      if (hasBathTub) {
        tubObject[year]['bathTubScenes']++;
      }

      if (hasShower) {
        tubObject[year]['showerScenes']++;
      }
    });

    let tubList = [];

    for (let year in tubObject) {
      tubList.push({
        'year': year,
        'bathTubScenes': tubObject[year]['bathTubScenes'],
        'showerScenes': tubObject[year]['showerScenes']
      });
    }

    let tooltip = d3.select('#line_graph')
                      .append('div')
                      .attr('class', 'tooltip')
                      .style('visibility', 'hidden')
                      .style('position', 'absolute');

    let x = d3.scaleTime()
              .domain(d3.extent(tubList.map((year) => {
                return year.year;
              })))
              .range([0, width]);

    svg.append('g')
       .attr('transform', 'translate(0,' + height + ')')
       .call(d3.axisBottom(x));

    let y = d3.scaleLinear()
              .domain(d3.extent(tubList.map((year) => {
                return Math.max(year.bathTubScenes, year.showerScenes);
              })))
              .range([height, 0]);
              svg.append('g')
              .call(d3.axisLeft(y));

    svg.append('path')
       .datum(tubList)
       .attr('fill', 'none')
       .attr('stroke', 'steelblue')
       .attr('stroke-width', 1.5)
       .attr('d', d3.line()
       .x((d) => {
         return x(d.year)
       })
       .y((d) => {
         return y(d.bathTubScenes)
       }))
       }));

    svg.selectAll('points')
       .data(tubList)
       .enter()
       .append('circle')
       .attr('cx', (d) => {
         return x(d.year);
       })
       .attr('cy', (d) => {
         return y(d.bathTubScenes);
       })
       .attr('r', 4)
       .attr('class', 'point')
       .style('opacity', 1)
       .on('mouseover', (d, i, n) => {
         tooltip.style('visibility', 'visible');
       })
       .on('mousemove', (d) => {
         tooltip.style('top', (event.pageY) + 'px')
                .style('left', (event.pageX) + 'px');
       })
       .on('mouseout', (d) => {
         tooltip.style('visibility', 'hidden');
       });

    svg.append('path')
       .datum(tubList)
       .attr('fill', 'none')
       .attr('stroke', 'red')
       .attr('stroke-width', 1.5)
       .attr('d', d3.line()
       .x((d) => {
         return x(d.year)
       })
       .y((d) => {
         return y(d.showerScenes)
       }))
    svg.selectAll('points')
       .data(tubList)
       .enter()
       .append('circle')
       .attr('cx', (d) => {
         return x(d.year);
       })
       .attr('cy', (d) => {
         return y(d.showerScenes);
       })
       .attr('r', 4)
       .attr('class', 'point')
       .style('opacity', 1)
       .on('mouseover', (d, i, n) => {
         tooltip.style('visibility', 'visible');
       })
       .on('mousemove', (d) => {
         tooltip.style('top', (event.pageY) + 'px')
                .style('left', (event.pageX) + 'px');
       })
       .on('mouseout', (d) => {
         tooltip.style('visibility', 'hidden');
       });
	}).catch(console.error);
}

export default { init, resize };
