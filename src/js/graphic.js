import loadData from './load-data';

/* global d3 */
function resize() { }

function init() {
	console.log('Make something!');
  let tubData = {};

	loadData('best-actress-nominees.csv').then(nominees => {
    nominees.forEach((nominee) => {
      let year = nominee.Year;
      let hasBathTub = nominee.Bathtub.length === 0 ? false : true;
      let hasShower = nominee.Shower.length === 0 ? false : true;

      if (!tubData[year]) {
        tubData[year] = {};
        tubData[year]['count'] = 0;
      }

      if (!tubData[year]['bathTubScenes']) {
        tubData[year]['bathTubScenes'] = 0;
      }

      if (!tubData[year]['showerScenes']) {
        tubData[year]['showerScenes'] = 0;
      }

      tubData[year]['count']++;

      if (hasBathTub) {
        tubData[year]['bathTubScenes']++;
      }

      if (hasShower) {
        tubData[year]['showerScenes']++;
      }
    });
	}).catch(console.error);
}

export default { init, resize };
