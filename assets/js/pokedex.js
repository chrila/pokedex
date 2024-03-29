/******************************************************************************
 * pokedex.js                                                                 *
 * Consumption of pokeapi (https://pokeapi.co) using Javascript Fetch.        *
 * (c)2021 Christian Lampl                                                    *
 *****************************************************************************/

let pokemon_per_page = 20;
let url_base = 'https://pokeapi.co/api/v2/pokemon/';
let url_next;
let url_prev;

// elements
let pokemonGrid = document.getElementById('pokemonGrid');
let buttonPrev = document.getElementById('buttonPrevious');
let buttonNext = document.getElementById('buttonNext');
let loadingInformation = document.getElementById('loadingInformation');
let numberLoadingAct = document.getElementById('numberLoadingAct');
let numberLoadingTotal = document.getElementById('numberLoadingTotal');
let modalTitle = document.getElementById('modalTitle');
let modalBody = document.getElementById('modalBody');

// store current page of pokemons
let pokemon_list = [];

// extract a pokemons abilities
function getAbilities(_pokemon) {
  return _pokemon.abilities.map(x => x.ability.name).join(', ');
}

// extract a pokemons types
function getTypes(_pokemon) {
  return _pokemon.types.map(x => x.type.name).join(', ');
}

// add grid item for one pokemon
function addGridItem(_pokemon) {
  let item =
    `<div class="col">
        <div class="card pokemon-card-overlay">
          <img src="${_pokemon.sprites['front_default']}" class="card-img-top pokemon-card-pic" alt="${_pokemon.name}" data-id="${_pokemon.id}">
          <div class="card-body">
            <h5 class="card-title"># ${_pokemon.id} ${_pokemon.name}</h5>
          </div>
        </div>
      </div>`;

  pokemonGrid.innerHTML += item;
}

// add grid items for all pokemon
function addGridItems() {
  pokemon_list.sort(function (a, b) {
    if (a.id < b.id) {
      return -1;
    }
    if (a.id > b.id) {
      return 1;
    }
    return 0;
  }).forEach(function (p) {
    addGridItem(p);
  })
}

// check if all pokemon have been fetched and execute callback
function checkAllFetched(_afterFetch) {
  if (pokemon_list.length == pokemon_per_page) {
    // hide loading animation
    loadingInformation.style.display = 'none';
    _afterFetch();
  } else {
    // update loading information
    numberLoadingAct.innerText = pokemon_list.length;
  }
}

// fetch info about given pokemon
function fetchPokemon(_pokemon, _afterFetch) {
  fetch(_pokemon.url)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      pokemon_list.push(response);
    })
    .then(function () {
      checkAllFetched(_afterFetch);
    });
}

// show pokemon list in grid
function fetchAllPokemon(_pokemons) {
  // empty cache
  pokemon_list.length = 0;
  // display loading animation
  loadingInformation.style.display = 'block';

  _pokemons.forEach(function (poke) {
    fetchPokemon(poke, addGridItems);
  });
}

// enable/disable previous/next button
function checkButtons() {
  buttonNext.classList.toggle('disabled', !url_next);
  buttonPrev.classList.toggle('disabled', !url_prev);
}

// fetch pokemon list
function fetchPokemonList(_url) {
  // clear list
  pokemonGrid.innerHTML = '';

  fetch(_url)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      url_next = response.next;
      url_prev = response.previous;

      checkButtons();
      fetchAllPokemon(response.results);
    });
}

// show modal with detailed info about pokemon
function showPokemonModal(_id) {
  let poke = pokemon_list[(_id-1) % pokemon_per_page];
  let abilities = getAbilities(poke);
  let types = getTypes(poke);
  let details = `
  <img src="${poke.sprites['front_default']}" class="pokemon-modal-pic center" alt="${poke.name}">
  <p>
    <strong>Types:</strong><br />
    ${types}
  </p>
  <p>
    <strong>Abilities:</strong><br />
    ${abilities}
  </p>`

  modalTitle.innerText = poke.name;
  modalBody.innerHTML = details;

  let modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
  modal.show();
}

document.addEventListener('DOMContentLoaded', function() {
  numberLoadingTotal.innerText = pokemon_per_page;
  fetchPokemonList(url_base);

  /** add event listeners **/

  buttonNext.addEventListener('click', function () {
    fetchPokemonList(url_next);
  });

  buttonPrev.addEventListener('click', function () {
    fetchPokemonList(url_prev);
  });

  document.addEventListener('click', function (e) {
    // pokemon picture clicked
    if (e.target.classList.contains('pokemon-card-pic')) {
      showPokemonModal(e.target.getAttribute('data-id'));
    }
  });
});
