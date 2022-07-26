"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = "https://api.tvmaze.com/";
const NULL_IMG_URL =
  "https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  const searchedShowReponses = await axios.get(`${BASE_URL}search/shows/?`, { params: { q: term } });
  console.log(searchedShowReponses);

  let searchResults = [];

  //map
  for (let i = 0; i < searchedShowReponses.data.length; i++) {
    searchResults.push({
      id: searchedShowReponses.data[i].show.id,
      name: searchedShowReponses.data[i].show.name,
      summary: searchedShowReponses.data[i].show.summary,
      // checks for show image, if true returns medium src, if null, returns null img
      image: searchedShowReponses.data[i].show.image
        ? searchedShowReponses.data[i].show.image.medium
        : NULL_IMG_URL,
    });
  }
  return searchResults;
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
              alt="show image" //update
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
      `
    );

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

//https://api.tvmaze.com/shows/1/episodes

async function getEpisodesOfShow(id) {

  const episodesResponses = await axios.get(`${BASE_URL}shows/${id}/episodes`);

  let episodesList = [];

  for (let i = 0; i < episodesResponses.data.length; i++) {
    episodesList.push({
      id: episodesResponses.data[i].id,
      name: episodesResponses.data[i].name,
      season: episodesResponses.data[i].season,
      number: episodesResponses.data[i].number
    });
  }
  return episodesList;
}

/** Receives array of objects from getEpisodesOfShow and iterates thru and appends each object as list item to episodesList */

function populateEpisodes(episodes) {

  for(let episode of episodes){

    const episodeInfo = `Episode: ${episode.name}, Season: ${episode.season}, Number: ${episode.number}`;

    $('#episodesList').append(`<li>${episodeInfo}</li>`);
    $episodesArea.show();
  }
}

// // //conductor for getting and populating episodes
async function getAndPopulateEpisodes(event){
  const showID = $(event.target).closest('.Show').attr('data-show-id');
  const showEpisodes = await getEpisodesOfShow(showID);
  populateEpisodes(showEpisodes);
}

//parent
$('#showsList').on('click','.Show-getEpisodes', getAndPopulateEpisodes);