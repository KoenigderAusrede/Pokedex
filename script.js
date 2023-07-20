let currentPokemon;
let offset = 0;
const limit = 20;

async function loadPokemon(pokemonName = 'bulbasaur') { 
    let url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
    let response = await fetch(url);  
    currentPokemon = await response.json();

    console.log(currentPokemon)

    renderPokemonInfo(currentPokemon);
}

function renderPokemonInfo(pokemon) {
    currentPokemon = pokemon;
    updateBackgroundColor();
    getPokemonName();
    getPokemonType();
    getPokemonId();
    getPokemonAbouts();
    getPokemonMoves();
    document.getElementById('image').src = currentPokemon.sprites.other['official-artwork'].front_default;
}


function getPokemonName() {
    let name = currentPokemon['name'];
    let capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    document.getElementById('pokemonName').innerHTML = capitalized
}

function getPokemonId() {
    const formatedNumber = currentPokemon['id'].toString().padStart(3, '0');
    document.getElementById('number').innerHTML = '#'+formatedNumber;
}

function getPokemonType() {
    let typeContainer = document.getElementById('type');
    typeContainer.innerHTML = '';

    for(let i = 0; i < currentPokemon.types.length; i++) {
        let typeName = currentPokemon.types[i].type.name;
        let capitalized = typeName.charAt(0).toUpperCase() + typeName.slice(1);

        // create a new div for each type
        let typeDiv = document.createElement('div');
        typeDiv.textContent = capitalized;
        
        // add the .type-bubble class
        typeDiv.classList.add('type-bubble');

        // append the new div to the container
        typeContainer.appendChild(typeDiv);
    }
}


function getPokemonAbouts() {
    let height = currentPokemon.height;
    let weight = currentPokemon.weight;
    let bExp = currentPokemon['base_experience'];
    document.getElementById('height').innerHTML = height;
    document.getElementById('weight').innerHTML = weight;
    document.getElementById('bExp').innerHTML = bExp;
}


function getPokemonMoves() {
    let move1 = currentPokemon.moves[0].move.name
    let capitalized1 = move1.charAt(0).toUpperCase() + move1.slice(1);
    document.getElementById('move1').innerHTML = capitalized1;
    
    let move2 = currentPokemon.moves[1].move.name
    let capitalized2 = move2.charAt(0).toUpperCase() + move2.slice(1);
    document.getElementById('move2').innerHTML = capitalized2;

    let move3 = currentPokemon.moves[2].move.name
    let capitalized3 = move3.charAt(0).toUpperCase() + move3.slice(1);
    document.getElementById('move3').innerHTML = capitalized3;
}

function showbstats() {
    document.getElementById('itabBS').classList.remove('dNone')
    document.getElementById('itabM').classList.add('dNone')
    document.getElementById('moves').classList.remove('isClicked')
    document.getElementById('bstats').classList.add('isClicked')
}

function showmoves() {
    document.getElementById('itabBS').classList.add('dNone')
    document.getElementById('itabM').classList.remove('dNone')
    document.getElementById('moves').classList.add('isClicked')
    document.getElementById('bstats').classList.remove('isClicked')
}

async function findPokemon() {
    let inputField = document.getElementById('namefield');
    let newPokemon = inputField.value.toLowerCase();
    let url = `https://pokeapi.co/api/v2/pokemon/${newPokemon}`
    let response = await fetch(url);
    currentPokemon = await response.json();
    renderPokemonInfo();
    inputField.value = '';
}


function updateBackgroundColor() {
    let typeName = currentPokemon.types[0].type.name;
    let pokedex = document.querySelector('#pokedex');

    switch (typeName) {
        case 'normal':
            pokedex.style.backgroundColor = '#a8a899ff';
            break;
        case 'fighting':
            pokedex.style.backgroundColor = '#a94d3dff';
            break;
        case 'flying':
            pokedex.style.backgroundColor = '#864ab8';
            break;
        case 'poison':
            pokedex.style.backgroundColor = '#864ab8ff';
            break;
        case 'ground':
            pokedex.style.backgroundColor = '#956833';
            break;
        case 'rock':
            pokedex.style.backgroundColor = '#a9995b';
            break;
        case 'bug':
            pokedex.style.backgroundColor = '#83ad25';
            break;
        case 'ghost':
            pokedex.style.backgroundColor = '#643c64';
            break;            
        case 'steel':
            pokedex.style.backgroundColor = '#9999a9';
            break; 
        case 'fire':
            pokedex.style.backgroundColor = '#e53b19';
            break;
        case 'water':
            pokedex.style.backgroundColor = '#278bcc';
            break;
        case 'grass':
            pokedex.style.backgroundColor = '#58a951';
            break;    
        case 'electric':
            pokedex.style.backgroundColor = '#e5c600';
            break;    
        case 'psychic':
            pokedex.style.backgroundColor = '#e55974';
            break; 
        case 'ice':
            pokedex.style.backgroundColor = '#68baac';
            break; 
        case 'dragon':
            pokedex.style.backgroundColor = '#4d64ab';
            break; 
        case 'dark':
            pokedex.style.backgroundColor = '#463e3e';
            break; 
        case 'fairy':
            pokedex.style.backgroundColor = '#d481d0';
            break;     
            default:
            pokedex.style.backgroundColor = 'rgba(0,0,0,0.5)'; // default color
            break;
    }
}


async function createOverview() {
    let content = document.getElementById('overview');
    let pokemonList = await fetchPokemonList(offset, limit);
    for(let pokemon of pokemonList) {
        let pokemonDetails = await fetchPokemonDetails(pokemon.url);
        let pokeDiv = createPokemonDiv(pokemonDetails);
        content.appendChild(pokeDiv);
    }
    // Erhöhe den Offset für die nächste Abfrage
    offset += limit;
}

document.getElementById('loadMoreButton').addEventListener('click', createOverview);

async function fetchPokemonList(offset, limit) {
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    let data = await response.json();
    return data.results;
}

async function fetchPokemonDetails(url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

function createPokemonDiv(pokemon) {
    let pokeDiv = document.createElement('div');
    pokeDiv.classList.add('overviewelement');
    pokeDiv.addEventListener('click', function() {
        loadPokemon(pokemon.name);
        document.getElementById('fullscreen').classList.add('dNone'); // hide overview
    });
    // Set the background color based on the first type of the Pokemon
    if (pokemon.types && pokemon.types.length > 0) {
        let firstType = pokemon.types[0].type.name;
        let backgroundColor = getBackgroundColorForType(firstType);
        pokeDiv.style.backgroundColor = backgroundColor;
    }

    let pokeName = createPokemonName(pokemon.name);
    pokeDiv.appendChild(pokeName);

    let pokeImg = createPokemonImage(pokemon.sprites.other['official-artwork'].front_default);
    pokeDiv.appendChild(pokeImg);

    let pokeTypes = createPokemonTypes(pokemon.types);
    pokeDiv.appendChild(pokeTypes);

    return pokeDiv;
}

function createPokemonName(name) {
    let pokeName = document.createElement('h4');
    pokeName.textContent = capitalizeFirstLetter(name);
    pokeName.classList.add('overviewHL');
    return pokeName;
}

function createPokemonImage(url) {
    let pokeImg = document.createElement('img');
    pokeImg.classList.add('icon')
    pokeImg.src = url;
    return pokeImg;
}

function createPokemonTypes(types) {
    let pokeTypeContainer = document.createElement('div');
    pokeTypeContainer.classList.add('type-container');
    for(let type of types) {
        let typeName = type.type.name;
        let capitalizedTypeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
        let typeDiv = document.createElement('div');
        typeDiv.textContent = capitalizedTypeName;
        typeDiv.classList.add('type-bubble');
        pokeTypeContainer.appendChild(typeDiv);
    }
    return pokeTypeContainer;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

createOverview();




function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function getBackgroundColorForType(typeName) {
    switch (typeName) {
        case 'normal':
            return '#a8a899ff';
        case 'fighting':
            return '#a94d3dff';
        case 'flying':
            return '#864ab8';
        case 'poison':
            return '#864ab8ff';
        case 'ground':
            return '#956833';
        case 'rock':
            return '#a9995b';
        case 'bug':
            return '#83ad25';
        case 'ghost':
            return '#643c64';            
        case 'steel':
            return '#9999a9';
        case 'fire':
            return '#e53b19';
        case 'water':
            return '#278bcc';
        case 'grass':
            return '#58a951';    
        case 'electric':
            return '#e5c600';    
        case 'psychic':
            return '#e55974';
        case 'ice':
            return '#68baac';
        case 'dragon':
            return '#4d64ab';
        case 'dark':
            return '#463e3e';
        case 'fairy':
            return '#d481d0';
        default:
            return 'rgba(0,0,0,0.5)'; // default color
    }
}


function closeOverview() {
    document.getElementById('fullscreen').classList.remove('dNone')
}