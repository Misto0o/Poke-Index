window.onload = () => {
  loadPokemonList();
};

function searchPokemon() {
  const name = document.getElementById("search").value.toLowerCase().trim();
  if (!name) return;

  openModal(name);
}

document.getElementById("search").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchPokemon();
  }
});


async function loadPokemonList() {
  const listDiv = document.getElementById("pokemon-list");
  listDiv.innerHTML = "";

  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  const data = await res.json();

  for (const pokemon of data.results) {
    const pokeRes = await fetch(pokemon.url);
    const pokeData = await pokeRes.json();

    listDiv.innerHTML += `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card bg-secondary text-light text-center p-2"
             onclick="openModal('${pokeData.name}')"
             style="cursor:pointer">
          <img src="${pokeData.sprites.front_default}" class="img-fluid">
          <p class="text-capitalize mb-0">${pokeData.name}</p>
        </div>
      </div>
    `;
  }
}

function loadFromList(name) {
  document.getElementById("search").value = name;
  getPokemon();
}

async function openModal(name) {
  const modal = new bootstrap.Modal(
    document.getElementById("pokemonModal")
  );

  const statsDiv = document.getElementById("modalStats");
  const evoDiv = document.getElementById("modalEvolution");

  statsDiv.innerHTML = "";
  evoDiv.innerHTML = "";

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  if (!res.ok) {
    document.getElementById("modalName").textContent = "Not found";
    document.getElementById("modalSprite").src = "";
    document.getElementById("modalTypes").textContent = "";

    document.getElementById("modalStats").innerHTML =
      "<p class='text-danger'>No Pokémon found. Check spelling.</p>";

    document.getElementById("modalEvolution").innerHTML = "";
    return;
  }
  const data = await res.json();

  document.getElementById("modalName").textContent =
    `#${data.id} ${data.name}`;  // Show national Pokédex number
  document.getElementById("modalSprite").src = data.sprites.front_default;
  document.getElementById("modalTypes").textContent =
    `Types: ${data.types.map(t => t.type.name).join(", ")}`;
  new Audio(data.cries.latest).play();


  // Stats
  data.stats.forEach(stat => {
    const value = stat.base_stat;
    statsDiv.innerHTML += `
      <div class="mb-2 text-start">
        <small class="text-capitalize">${stat.stat.name}</small>
        <div class="progress">
          <div class="progress-bar bg-success" style="width:${value / 2}%">
            ${value}
          </div>
        </div>
      </div>
    `;
  });

  // Evolution
  const speciesRes = await fetch(data.species.url);
  const speciesData = await speciesRes.json();
  const evoRes = await fetch(speciesData.evolution_chain.url);
  const evoData = await evoRes.json();

  let evo = evoData.chain;
  while (evo) {
    const evoName = evo.species.name;
    const evoPoke = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoName}`);
    const evoDataPoke = await evoPoke.json();

    evoDiv.innerHTML += `
      <div class="text-center">
        <img src="${evoDataPoke.sprites.front_default}">
        <p class="text-capitalize mb-0">${evoName}</p>
      </div>
    `;
    evo = evo.evolves_to[0];
  }

  modal.show();
}