import loadData from './load-data';

function initializeBestActressBarchart() {
  const toolTipMargin = 10;
  const chartName = '#best_actress_bar_chart';

  let margin = {
    top: 10,
    right: 30,
    bottom: 70,
    left: 60
  },
  width = 1100 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  let svg = d3.select(chartName)
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', `translate(${margin.left}, ${margin.top})`);

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

    let tooltip = d3.select(chartName)
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
               .tickFormat(d3.format('d')))
               .selectAll('text')
               .attr('dx', '-1.5em')
               .attr('dy', '0.7em')
               .attr('transform', 'rotate(-45)');

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

    let filtered = [];

    // Initialize best actress barchart.
    svg.append('g')
       .selectAll('g')
       .data(dataset)
       .enter()
       .append('g')
       .attr('class', 'bar')
       .attr('transform', (d) => {
         // Calculate x position of bar groups by year.
         return `translate(${x(d.year)}, 0)`;
       })
       .selectAll('rect')
       .data((d) => {
         let year = d.year;

         // Calculate number of shower and bathtub scenes for each year.
         return subgroups.map((sceneType) => {
           return {
             year: year,
             sceneType: sceneType,
             scenes: d[sceneType]
           };
         });
       })
       .enter()
       .append('rect')
       .attr('x', (d) => {
         return xSubgroup(d.sceneType);
       })
       .attr('y', (d) => {
         return y(d.scenes.length);
       })
       .attr('width', xSubgroup.bandwidth())
       .attr('height', (d) => {
         return height - y(d.scenes.length);
       })
       .attr('fill', (d) => {
         return color(d.sceneType);
       })
       .on('mouseover', (d, i) => {
         tooltip.style('visibility', 'visible')
                .html(formatTooltip(i));
       })
       .on('mousemove', (d) => {
         tooltip.style('top', calculateToolTipPosition(event.pageY, 'y'))
                .style('left', calculateToolTipPosition(event.pageX, 'x'));
       })
       .on('mouseout', (d) => {
         tooltip.style('visibility', 'hidden');
       })

    // Initialize x-axis label for best actress barchart.
    svg.append('text')
       .attr('class', 'x label')
       .attr('text-anchor', 'middle')
       .attr('x', width / 2)
       .attr('y', height + 60)
       .text('Oscar Year');

    // Initialize y-axis label for best actress barchart.
    svg.append('text')
       .attr('class', 'y label')
       .attr('text-anchor', 'middle')
       .attr('x', -height / 2)
       .attr('y', -60)
       .attr('dy', '.75em')
       .attr('transform', 'rotate(-90)')
       .text('Number of Scenes');

    // Initialize legend for best actress barchart.
    let legend = svg.append('g')
                    .attr('text-anchor', 'end')
                    .selectAll('g')
                    .data(subgroups)
                    .enter()
                    .append('g')
                    .attr('transform', (d, i) => {
                      return `translate(0, ${i * 20})`;
                    });

    // Add color rectangles to legend for best actress barchart.
    legend.append('rect')
          .attr('x', width - 17)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', color)
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .on('click', (d, i) => {
            updateLegend(i);
          });

    // Add group names to legend for best actress barchart.
    legend.append('text')
          .attr('x', width - 24)
          .attr('y', 9.5)
          .attr('dy', '0.32em')
          .text((d) => {
            return d == 'bathTubScenes' ? 'Bathtub' : 'Shower';
          });

    function updateLegend(group) {
      // Add clicked group to groups removed.
      if (filtered.indexOf(group) == -1) {
        filtered.push(group);

        // If all groups are unchecked, then reset.
        if (filtered.length == subgroups.length) {
          filtered = [];
        }
      }
      // Otherwise, display it.
      else {
        filtered.splice(filtered.indexOf(group), 1);
      }

      // Update x-scales for each filtered item.
      let newSubgroups = [];

      subgroups.forEach((g) => {
        if (filtered.indexOf(g) == -1) {
          newSubgroups.push(g);
        }
      });

      xSubgroup.domain(newSubgroups)
               .range([0, x.bandwidth()]);

      // Filter out bars that need to be hidden.
      let bars = svg.selectAll('.bar')
                    .selectAll('rect')
                    .data((d) => {
                      let year = d.year;

                      // Calculate number of shower and bathtub scenes for each year.
                      return subgroups.map((sceneType) => {
                        return {
                          year: year,
                          sceneType: sceneType,
                          scenes: d[sceneType]
                        };
                      });
                    });

      // Filter bars to hide.
      bars.filter((d) => {
        return filtered.indexOf(d.sceneType) > -1;
      })
      .transition()
      .attr('x', (d, i, n) => {
        return +d3.select(n[i]).attr('x') + +d3.select(n[i]).attr('width') / 2;
      })
      .attr('height', 0)
      .attr('width', 0)
      .attr('y', (d) => {
        return height;
      })
      .duration(500);

      // Adjust remaining bars.
      bars.filter((d) => {
        return filtered.indexOf(d.sceneType) == -1;
      })
      .transition()
      .attr('x', (d) => {
        return xSubgroup(d.sceneType);
      })
      .attr('y', (d) => {
        return y(d.scenes.length);
      })
      .attr('width', xSubgroup.bandwidth())
      .attr('height', (d) => {
        return height - y(d.scenes.length);
      })
      .attr('fill', (d) => {
        return color(d.sceneType);
      })
      .duration(500);

      // Update legend.
      legend.selectAll('rect')
            .transition()
            .attr('fill', (d) => {
              if (filtered.length) {
                if (filtered.indexOf(d) == -1) {
                  return color(d);
                }
                else {
                  return 'white';
                }
              }
              else {
                return color(d);
              }
            })
            .duration(100);
    }

    function formatTooltip(scenesObject) {
      let scenes = scenesObject.scenes;
      let year = scenesObject.year;
      let sceneType = scenesObject.sceneType;
      let sceneTypeFormatted = sceneType == 'bathTubScenes' ? 'Bathtub' : 'Shower';
      let html = `<div>${sceneTypeFormatted} Scenes in ${year}</div><ul>`;

      for (let i in scenes) {
        let scene = scenes[i];
        let filmName = scene['film'];
        let filmNameClean = filmName.replace('/', '_');

        html += `<li>${scene['actress']}, <i>${filmName}</i></li>`;
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
  });
}


/* global d3 */
function resize() { }

function init() {
	initializeBestActressBarchart();
}

export default { init, resize };
