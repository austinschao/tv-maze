"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $('#episodesList');
const $searchForm = $("#searchForm");
const $searchFormTerm = $("#searchForm-term");
const TVMAZE_BASE_URL = "http://api.tvmaze.com";
const MISSING_IMG_URL = 'https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300';



/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  $searchFormTerm.val("");


  const response = await axios.get(
    `${TVMAZE_BASE_URL}/search/shows`,
    { params: { q: term } }
  );

  const shows = [];

  //map!!!
  for (let i = 0; i < response.data.length; i++) {
    let show = {};
    show.id = response.data[i].show.id;
    show.name = response.data[i].show.name;
    //ternary operator CLEAN IT UP!!!
    if (response.data[i].show.summary !== null) {
      show.summary = response.data[i].show.summary;
    } else {
      show.summary = 'No Summary';
    }
    if (response.data[i].show.image !== null) {
      show.image = response.data[i].show.image.original;
    } else {
      show.image = MISSING_IMG_URL;
    }
    shows.push(show);
  }
  return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
             Episodes
             </button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Make the episode list visible */

// Add event listener on the parent showList to listen for
// a click on the button
// find the specific button of the episodes or it will work on all other buttons too
// Give the anon function a name! (its a conductor fx)

$showsList.on('click', 'button', function(e) {
  const $episode = $(e.target.closest('.Show'));
  const episodeId = $episode.data().showId;
  $episodesList.empty();


  getEpisodesOfShow(episodeId);

  $episodesArea.show();

});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const episodes = await axios.get(`${TVMAZE_BASE_URL}/shows/${id}/episodes`);

  //follow the directions!!!
}

/** Given an array of episodes, append them to the #episodesList DOM*/

function populateEpisodes(episodes) {
  for (let episode of episodes) {
    const $li = $('<li>');

    $li.text(`${episode.name} (season ${episode.season}, number ${episode.number})`);
    $episodesList.append($li);
  }

}
