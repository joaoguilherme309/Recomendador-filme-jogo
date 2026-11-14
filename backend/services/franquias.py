import re
import unicodedata

# ==========================================
# 1. NORMALIZAÇÃO DOS NOMES
# ==========================================

def normalizar_nome(nome):
    if not isinstance(nome, str):
        return ""

    nome = unicodedata.normalize("NFKD", nome)
    nome = "".join(
        caractere
        for caractere in nome
        if not unicodedata.combining(caractere)
    )

    nome = nome.casefold()
    nome = nome.replace("™", "").replace("®", "")
    nome = re.sub(r"[^a-z0-9]+", " ", nome)

    return " ".join(nome.split())


# ==========================================
# 2. CATÁLOGO DE FRANQUIAS
# ==========================================

# As correspondências são explícitas.
# Isso evita considerar automaticamente
# qualquer jogo com temática semelhante
# como parte da mesma franquia.

FRANQUIAS = {

    "batman": {
        "nome": "Batman",

        "filmes": [
            "Batman",
            "Batman Returns",
            "Batman Forever",
            "Batman & Robin",
            "Batman Begins",
            "The Dark Knight",
            "The Dark Knight Rises",
            "The Batman",
            "The Lego Batman Movie"
        ],

        "jogos": [
            "Batman",
            "LEGO Batman",
            "Gotham Knights"
        ]
    },

    "harry_potter": {
        "nome": "Harry Potter",

        "filmes": [
            "Harry Potter and the Philosopher's Stone",
            "Harry Potter and the Sorcerer's Stone",
            "Harry Potter and the Chamber of Secrets",
            "Harry Potter and the Prisoner of Azkaban",
            "Harry Potter and the Goblet of Fire",
            "Harry Potter and the Order of the Phoenix",
            "Harry Potter and the Half-Blood Prince",
            "Harry Potter and the Deathly Hallows: Part 1",
            "Harry Potter and the Deathly Hallows: Part 2",
            "Fantastic Beasts and Where to Find Them",
            "Fantastic Beasts: The Crimes of Grindelwald",
            "Fantastic Beasts: The Secrets of Dumbledore"
        ],

        "jogos": [
            "Harry Potter",
            "LEGO Harry Potter",
            "Hogwarts Legacy",
            "Harry Potter: Quidditch Champions",
            "Fantastic Beasts"
        ]
    },

    "star_wars": {
        "nome": "Star Wars",

        "filmes": [
            "Star Wars",
            "Star Wars: Episode I - The Phantom Menace",
            "Star Wars: Episode II - Attack of the Clones",
            "Star Wars: Episode III - Revenge of the Sith",
            "Star Wars: Episode IV - A New Hope",
            "Star Wars: Episode V - The Empire Strikes Back",
            "Star Wars: Episode VI - Return of the Jedi",
            "Star Wars: The Force Awakens",
            "Star Wars: The Last Jedi",
            "Star Wars: The Rise of Skywalker",
            "Rogue One: A Star Wars Story",
            "Solo: A Star Wars Story",
            "Star Wars: The Clone Wars"
        ],

        "jogos": [
            "Star Wars",
            "LEGO Star Wars"
        ]
    },

    "spider_man": {
        "nome": "Spider-Man",

        "filmes": [
            "Spider-Man",
            "Spider-Man 2",
            "Spider-Man 3",
            "The Amazing Spider-Man",
            "The Amazing Spider-Man 2",
            "Spider-Man: Homecoming",
            "Spider-Man: Far From Home",
            "Spider-Man: No Way Home",
            "Spider-Man: Into the Spider-Verse",
            "Spider-Man: Across the Spider-Verse"
        ],

        "jogos": [
            "Spider-Man",
            "Marvel's Spider-Man",
            "Marvels Spider-Man",
            "The Amazing Spider-Man"
        ]
    },

    "jurassic": {
        "nome": "Jurassic Park / Jurassic World",

        "filmes": [
            "Jurassic Park",
            "The Lost World: Jurassic Park",
            "Jurassic Park III",
            "Jurassic World",
            "Jurassic World: Fallen Kingdom",
            "Jurassic World Dominion",
            "Jurassic World Rebirth"
        ],

        "jogos": [
            "Jurassic Park",
            "Jurassic World",
            "LEGO Jurassic World"
        ]
    },

    "sonic": {
        "nome": "Sonic",

        "filmes": [
            "Sonic the Hedgehog",
            "Sonic the Hedgehog 2",
            "Sonic the Hedgehog 3"
        ],

        "jogos": [
            "Sonic",
            "Sonic &"
        ]
    },

    "senhor_dos_aneis": {
        "nome": "O Senhor dos Anéis",

        "filmes": [
            "The Lord of the Rings: The Fellowship of the Ring",
            "The Lord of the Rings: The Two Towers",
            "The Lord of the Rings: The Return of the King",
            "The Hobbit: An Unexpected Journey",
            "The Hobbit: The Desolation of Smaug",
            "The Hobbit: The Battle of the Five Armies",
            "The Lord of the Rings: The War of the Rohirrim"
        ],

        "jogos": [
            "The Lord of the Rings",
            "LEGO The Lord of the Rings",
            "Middle-earth",
            "The Hobbit",
            "LEGO The Hobbit"
        ]
    },

    "resident_evil": {
        "nome": "Resident Evil",

        "filmes": [
            "Resident Evil",
            "Resident Evil: Apocalypse",
            "Resident Evil: Extinction",
            "Resident Evil: Afterlife",
            "Resident Evil: Retribution",
            "Resident Evil: The Final Chapter",
            "Resident Evil: Welcome to Raccoon City"
        ],

        "jogos": [
            "Resident Evil"
        ]
    }
}


# ==========================================
# 3. IDENTIFICAR FRANQUIA DO FILME
# ==========================================

def identificar_franquia(nome_filme):

    nome_normalizado = normalizar_nome(nome_filme)

    for identificador, dados in FRANQUIAS.items():

        for filme in dados["filmes"]:

            if normalizar_nome(filme) == nome_normalizado:
                return identificador

    return None


# ==========================================
# 4. VERIFICAR SE UM JOGO É DA FRANQUIA
# ==========================================

def jogo_pertence_franquia(nome_jogo, franquia):

    if franquia not in FRANQUIAS:
        return False

    nome_normalizado = normalizar_nome(nome_jogo)

    for prefixo in FRANQUIAS[franquia]["jogos"]:

        prefixo_normalizado = normalizar_nome(prefixo)

        if (
            nome_normalizado == prefixo_normalizado
            or nome_normalizado.startswith(
                prefixo_normalizado + " "
            )
        ):
            return True

    return False


# ==========================================
# 5. OBTER NOME DA FRANQUIA
# ==========================================

def obter_nome_franquia(franquia):

    if franquia not in FRANQUIAS:
        return None

    return FRANQUIAS[franquia]["nome"]


# ==========================================
# 6. TESTES
# ==========================================

if __name__ == "__main__":

    filmes_teste = [
        "The Dark Knight",
        "Harry Potter and the Goblet of Fire",
        "Star Wars: The Force Awakens",
        "Interstellar",
        "The Conjuring"
    ]

    jogos_teste = [
        "Batman™: Arkham Knight",
        "Gotham Knights",
        "Hogwarts Legacy",
        "LEGO® Star Wars™: The Skywalker Saga",
        "Sleeping Dogs"
    ]

    print("=== TESTE DE IDENTIFICAÇÃO DE FRANQUIAS ===")

    for filme in filmes_teste:

        franquia = identificar_franquia(filme)

        print(f"\nFilme: {filme}")
        print(
            f"Franquia: "
            f"{obter_nome_franquia(franquia) or 'Nenhuma'}"
        )

        if franquia:

            for jogo in jogos_teste:

                if jogo_pertence_franquia(jogo, franquia):
                    print(f"  Jogo relacionado: {jogo}")
