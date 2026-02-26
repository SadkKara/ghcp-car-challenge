# Application Météo Ski - Région de Genève

Application météo en direct pour 3 stations de ski proches de Genève (Chamonix, Verbier, Zermatt).

## Fonctionnalités

- Interface responsive en grille de cartes
- Récupération des données en direct via l’API Open-Meteo
- Icône météo et état des conditions pour chaque station
- Température, vent, chute de neige du jour, hauteur de neige actuelle
- Design compatible mobile
- Bonnes pratiques de sécurité web (CSP, mise à jour DOM sécurisée, timeout des requêtes)

## Technologies

- HTML5
- CSS3
- JavaScript Vanilla (ES6+)
- API Open-Meteo

## Lancer le projet

Ce projet est composé de fichiers statiques. En raison de la CSP, il est recommandé d’utiliser un serveur HTTP local plutôt que d’ouvrir le fichier directement.

### Option 1 : avec Python

```bash
python3 -m http.server 5500
```

Puis ouvrir dans le navigateur :

```text
http://localhost:5500
```

### Option 2 : avec VS Code Live Server

Ouvrez le fichier `index.html`, puis lancez **Open with Live Server**.

## Structure du projet

```text
.
├── index.html   # Structure de l’application et métadonnées de sécurité
├── styles.css   # Styles responsive (cartes et grille)
└── script.js    # Appels API, traitement des données et rendu des cartes
```

## Source des données

L’application utilise l’endpoint suivant :

- `https://api.open-meteo.com/v1/forecast`

Champs demandés :

- `current`: `temperature_2m`, `weather_code`, `wind_speed_10m`
- `daily`: `snowfall_sum`
- `hourly`: `snow_depth`

## Notes de sécurité

- `Content-Security-Policy` limite les ressources aux scripts/styles same-origin et à la connexion Open-Meteo
- Le contenu dynamique est rendu via `textContent` (réduction du risque XSS)
- Les requêtes `fetch` utilisent `AbortController` pour gérer les timeouts
- Les erreurs API sont gérées proprement, station par station

## Note de développement

La réponse API et les codes météo peuvent évoluer. Si nécessaire, mettez à jour `weatherMap` dans `script.js`.