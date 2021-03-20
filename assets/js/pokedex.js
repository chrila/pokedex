/******************************************************************************
 * pokedex.js                                                                 *
 * Consumption of pokeapi (http://pokeapi.co) using Javascript and Fetch API  *
 * (c)2021 Christian Lampl                                                    *
 *****************************************************************************/

let pokemon_per_page = 20;
let url_base = 'https://pokeapi.co/api/v2/pokemon/';
let url_next;
let url_prev;

// elements
let pokemonGrid = $('#pokemonGrid');
let buttonPrev = $('#buttonPrevious');
let buttonNext = $('#buttonNext');

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
  let abilities = getAbilities(_pokemon);
  let types = getTypes(_pokemon);

  let item =
    `<div class="col">
        <div class="card pokemon-card-overlay">
          <img src="${_pokemon.sprites['front_default']}" class="card-img-top pokemon-pic" alt="${_pokemon.name}">
          <div class="card-body">
            <h5 class="card-title"># ${_pokemon.id} ${_pokemon.name}</h5>
            <p>
              <strong>Types:</strong><br />
              ${types}
              </p>
              <p>
              <strong>Abilities:</strong><br />
              ${abilities}
            </p>
          </div>
        </div>
      </div>`;

  pokemonGrid.append(item);
}

// add grid items for all pokemon
function addGridItems() {
  pokemon_list.sort(function(a, b) {
    if (a.id < b.id) {
      return -1;
    }
    if (a.id > b.id) {
      return 1;
    }
    return 0;
  }).forEach(function(p) {
    addGridItem(p);
  })
}

// check if all pokemon have been fetched and execute callback
function checkAllFetched(_afterFetch) {
  if (pokemon_list.length == pokemon_per_page) {
    _afterFetch();
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
    .then(function (response) {
      checkAllFetched(_afterFetch);
    });
}

// show pokemon list in grid
function fetchAllPokemon(_pokemons) {
  // empty current page
  pokemon_list.length = 0;
  _pokemons.forEach(function (poke) {
    fetchPokemon(poke, addGridItems);
  });
}

// enable/disable previous/next button
function checkButtons() {
  if (!url_next) {
    buttonNext.addClass('disabled');
  } else {
    buttonNext.removeClass('disabled');
  }

  if (!url_prev) {
    buttonPrev.addClass('disabled');
  } else {
    buttonPrev.removeClass('disabled');
  }
}

// fetch pokemon list
function fetchPokemonList(_url) {
  // clear list
  pokemonGrid.html('');

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

$(document).ready(function () {
  fetchPokemonList(url_base);

  /** add event listeners **/

  buttonNext.on('click', function () {
    fetchPokemonList(url_next);
  });

  buttonPrev.on('click', function () {
    fetchPokemonList(url_prev);
  });

  $(document).on('click', function (e) {
    // pokemon picture clicked
    if ($(e.target).hasClass('pokemon-pic')) {
      let modal = new bootstrap.Modal(document.getElementById('pokemon-modal'));
      modal.show();
    }
  });
});
