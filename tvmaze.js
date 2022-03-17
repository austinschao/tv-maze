"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $('#episodesList');
const $searchForm = $("#searchForm");
const $searchFormTerm = $("#searchForm-term");
const TVMAZE_BASE_URL = "http://api.tvmaze.com";
const MISSING_IMG_URL = 'https://tinyurl.com/tv-missing';



/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  $searchFormTerm.val("");

  const response = await axios.get(
    `${TVMAZE_BASE_URL}/search/shows`,
    { params: { q: term } }
  );

  const shows = [];

  response.data.map(show => {
    const showInfo = {};

    showInfo.id = show.show.id;
    showInfo.name = show.show.name;

    (show.show.summary !== null) ?
    showInfo.summary = show.show.summary : showInfo.summary = 'No Summary';
    (show.show.image !== null) ?
    showInfo.image = show.show.image.original : showInfo.image = 'MISSING_IMG_URL';
    shows.push(showInfo);
  });

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

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const episodes = await axios.get(`${TVMAZE_BASE_URL}/shows/${id}/episodes`);
  const episodeList= [];

  episodes.data.map(episode => {
    const episodeInfo = {};

    episodeInfo.id = id;
    episodeInfo.name = episode.name;
    episodeInfo.season = episode.season;
    episodeInfo.number = episode.number;

    episodeList.push(episodeInfo);
  });
  return episodeList;
}

/** Given an array of episodes, append them to the #episodesList DOM*/

function populateEpisodes(episodes) {
  for (let episode of episodes) {
    const $li = $('<li>');

    $li.text(`${episode.name} (season ${episode.season}, number ${episode.number})`);
    $episodesList.append($li);
  }
}

/** Search for episode id and make the episode area visible */

async function searchForEpisodeAndDisplay(evt) {
  const $episode = $(evt.target.closest('.Show'));
  const episodeId = $episode.data().showId;
  const showOfEpisodes = await getEpisodesOfShow(episodeId);

  $episodesList.empty();
  populateEpisodes(showOfEpisodes);
  $episodesArea.show();
}

// Add event listener on the parent showList to listen for
// a click on the button

$showsList.on('click', '.Show-getEpisodes', (e) => {
  searchForEpisodeAndDisplay(e);
});