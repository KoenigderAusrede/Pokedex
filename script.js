// script.js (Finale Komplettversion)

const state = {
    currentPokemon: null,
    currentIndex: 0,
    offset: 0,
    limit: 20,
    allPokemon: [],
    allNames: [],
    selectedSuggestionIndex: -1,
    detailOpen: false,
    activeTypes: new Set()
};

const POKEMON_TYPES = [
    'normal', 'fighting', 'flying', 'poison', 'ground', 'rock',
    'bug', 'ghost', 'steel', 'fire', 'water', 'grass',
    'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'
];

const TYPE_COLORS = {
    normal: '#a8a899', fighting: '#a94d3d', flying: '#864ab8',
    poison: '#864ab8', ground: '#956833', rock: '#a9995b',
    bug: '#83ad25', ghost: '#643c64', steel: '#9999a9',
    fire: '#e53b19', water: '#278bcc', grass: '#58a951',
    electric: '#e5c600', psychic: '#e55974', ice: '#68baac',
    dragon: '#4d64ab', dark: '#463e3e', fairy: '#d481d0'
};

document.addEventListener('DOMContentLoaded', async () => {
    renderTypeFilters();
    document.getElementById('loadMoreButton').addEventListener('click', createOverview);
    await createOverview();
    setupSearch();
});

// --- Suche & Autocomplete ---
function setupSearch() {
    const input = document.getElementById('namefield');
    const suggestions = document.getElementById('suggestions');

    input.addEventListener('input', () => {
        state.selectedSuggestionIndex = -1;
        showSuggestions(input.value);
    });

    input.addEventListener('keydown', (e) => {
        const items = suggestions.querySelectorAll('li');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (state.selectedSuggestionIndex < items.length - 1) {
                state.selectedSuggestionIndex++;
                updateSuggestionHighlight(items);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (state.selectedSuggestionIndex > 0) {
                state.selectedSuggestionIndex--;
                updateSuggestionHighlight(items);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (state.selectedSuggestionIndex >= 0 && items[state.selectedSuggestionIndex]) {
                items[state.selectedSuggestionIndex].click();
            } else {
                findPokemon(input.value);
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#namefield') && !e.target.closest('#suggestions')) {
            suggestions.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.detailOpen) {
            showOverview();
        }
    });

    fetch('https://pokeapi.co/api/v2/pokemon?limit=2000')
        .then(res => res.json())
        .then(json => state.allNames = json.results.map(p => p.name));
}

function showSuggestions(value) {
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';
    if (value.length < 3) return suggestions.style.display = 'none';
    const matches = state.allNames.filter(name => name.includes(value.toLowerCase())).slice(0, 10);
    matches.forEach(name => {
        const li = document.createElement('li');
        li.textContent = capitalize(name);
        li.classList.add('suggestion-item');
        li.addEventListener('mouseenter', () => {
            suggestions.querySelectorAll('li').forEach(el => el.classList.remove('highlight'));
            li.classList.add('highlight');
        });
        li.addEventListener('mouseleave', () => li.classList.remove('highlight'));
        li.addEventListener('click', () => {
            loadPokemon(name);
            suggestions.style.display = 'none';
            document.getElementById('namefield').value = '';
        });
        suggestions.appendChild(li);
    });
    suggestions.style.display = matches.length ? 'block' : 'none';
    state.selectedSuggestionIndex = -1;
}

function updateSuggestionHighlight(items) {
    items.forEach(item => item.classList.remove('highlight'));
    if (items[state.selectedSuggestionIndex]) {
        items[state.selectedSuggestionIndex].classList.add('highlight');
    }
}

// --- Typenfilter ---
function renderTypeFilters() {
    const container = document.getElementById('typeFilters');
    POKEMON_TYPES.forEach(type => {
        const btn = document.createElement('button');
        btn.textContent = capitalize(type);
        btn.className = 'type-filter-button';
        btn.style.backgroundColor = TYPE_COLORS[type];
        btn.dataset.type = type;
        btn.addEventListener('click', () => {
            toggleTypeFilter(type);
            btn.classList.toggle('active');
            reRenderOverview();
        });
        container.appendChild(btn);
    });
    const reset = document.createElement('button');
    reset.textContent = 'Alle anzeigen';
    reset.className = 'type-filter-reset';
    reset.addEventListener('click', () => {
        state.activeTypes.clear();
        document.querySelectorAll('.type-filter-button').forEach(b => b.classList.remove('active'));
        reRenderOverview();
    });
    container.appendChild(reset);
}

function toggleTypeFilter(type) {
    if (state.activeTypes.has(type)) state.activeTypes.delete(type);
    else state.activeTypes.add(type);
}

function reRenderOverview() {
    const container = document.getElementById('overview');
    container.innerHTML = '';
    const requiredTypes = Array.from(state.activeTypes);
    const relevantPokemon = state.allPokemon.filter(p => {
        const typeList = Array.isArray(p.types)
            ? p.types.map(t => t.type.name.toLowerCase())
            : [];
        return requiredTypes.every(type => typeList.includes(type));
    });
    for (const p of relevantPokemon) {
        container.appendChild(createOverviewCard(p));
    }
    if (relevantPokemon.length === 0) {
        container.innerHTML = '<p style="text-align:center;margin-top:1rem;">Keine passenden Pokémon gefunden.</p>';
    }
}

// --- Datenabruf & Kartenaufbau ---
async function createOverview() {
    const container = document.getElementById('overview');
    const list = await fetchPokemonList(state.offset, state.limit);
    for (const item of list) {
        const details = await fetchPokemonDetails(item.url);
        state.allPokemon.push(details);
        if (state.activeTypes.size === 0 || details.types.some(t => state.activeTypes.has(t.type.name.toLowerCase()))) {
            container.appendChild(createOverviewCard(details));
        }
    }
    state.offset += state.limit;
}

async function fetchPokemonList(offset, limit) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const json = await res.json();
    return json.results;
}

async function fetchPokemonDetails(url) {
    const res = await fetch(url);
    return await res.json();
}

function createOverviewCard(pokemon) {
    const div = document.createElement('div');
    div.className = 'overviewelement';
    div.onclick = () => {
        loadPokemon(pokemon.name);
        state.currentIndex = state.allPokemon.findIndex(p => p.name === pokemon.name);
        document.getElementById('overlay').style.display = 'block';
    };
    if (pokemon.types?.length) {
        div.style.backgroundColor = getBackgroundColorForType(pokemon.types[0].type.name);
    }
    div.appendChild(createElement('h4', capitalize(pokemon.name), 'overviewHL'));
    div.appendChild(createImage(pokemon.sprites.other['official-artwork'].front_default));
    div.appendChild(createTypeContainer(pokemon.types));
    return div;
}

// --- Detailansicht ---
async function loadPokemon(name = 'bulbasaur') {
    try {
        showLoader(true);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!response.ok) throw new Error('Pokémon nicht gefunden.');
        const data = await response.json();
        state.currentPokemon = data;
        state.currentIndex = state.allPokemon.findIndex(p => p.name === data.name);
        renderPokemonInfo(data);
        document.getElementById('center').classList.remove('dNone');
        document.getElementById('overlay').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        state.detailOpen = true;
    } catch (err) {
        alert(err.message);
    } finally {
        showLoader(false);
    }
}

function renderPokemonInfo(pokemon) {
    updateBackgroundColor(pokemon.types[0].type.name);
    setText('pokemonName', capitalize(pokemon.name));
    setText('number', `#${String(pokemon.id).padStart(3, '0')}`);
    document.getElementById('image').src = pokemon.sprites.other['official-artwork'].front_default;
    renderTypes(pokemon.types);
    renderAbouts(pokemon);
    renderMoves(pokemon.moves);
}

function renderTypes(types) {
    const typeContainer = document.getElementById('type');
    typeContainer.innerHTML = '';
    types.forEach(({ type }) => {
        const div = document.createElement('div');
        div.className = 'type-bubble';
        div.textContent = capitalize(type.name);
        typeContainer.appendChild(div);
    });
}

function renderAbouts(pokemon) {
    setText('height', pokemon.height);
    setText('weight', pokemon.weight);
    setText('bExp', pokemon.base_experience);
}

function renderMoves(moves) {
    for (let i = 0; i < 3; i++) {
        const move = moves[i]?.move?.name;
        setText(`move${i + 1}`, move ? capitalize(move) : '—');
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function showOverview() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('center').classList.add('dNone');
    state.detailOpen = false;
}

function showLoader(show) {
    const overlay = document.getElementById('overlay');
    overlay.innerHTML = show ? '<div style="color:white;text-align:center;margin-top:25vh;font-size:2rem;">Lade...</div>' : '';
    if (!state.detailOpen) overlay.style.display = show ? 'block' : 'none';
}

// --- Tools ---
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getBackgroundColorForType(typeName) {
    return TYPE_COLORS[typeName] || 'rgba(0,0,0,0.5)';
}

function updateBackgroundColor(typeName) {
    document.getElementById('pokedex').style.backgroundColor = getBackgroundColorForType(typeName);
}

function createImage(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Pokemon';
    img.className = 'icon';
    return img;
}

function createElement(tag, text, className = '') {
    const el = document.createElement(tag);
    el.textContent = text;
    if (className) el.className = className;
    return el;
}

function createTypeContainer(types) {
    const container = document.createElement('div');
    container.className = 'type-container';
    types.forEach(({ type }) => {
        const div = createElement('div', capitalize(type.name), 'type-bubble');
        container.appendChild(div);
    });
    return container;
}

function loadNextPokemon() {
    if (state.currentIndex < state.allPokemon.length - 1) {
        loadPokemon(state.allPokemon[++state.currentIndex].name);
    }
}

function loadPreviousPokemon() {
    if (state.currentIndex > 0) {
        loadPokemon(state.allPokemon[--state.currentIndex].name);
    }
}