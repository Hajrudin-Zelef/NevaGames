# NevaGames

Launcher de jeux tout-en-un pour Android (Capacitor) — accueil, menu, options, records.

## Jeux inclus

| Jeu | Fichier | Description |
| --- | --- | --- |
| Blackjack | `games/blackjack.html` | 6 sabots, 3:2, croupier à 16, double, split, assurance |
| Dames | `games/dames.html` | 8×8, prise obligatoire, rafle majoritaire, dames volantes, IA 3 niveaux |
| Puzzle | `games/puzzle.html` | Casse-tête à tuiles glissantes : 3 images, tailles 3×3 à 5×5, chronomètre |
| Tetris | `games/tetris.html` | 7 formes, fantôme d'atterrissage, niveaux progressifs, pavé tactile |

## Architecture

```
index.html        launcher : accueil, menu, records, options, hôte iframe
games/*.html      chaque jeu est un fichier autonome chargé dans une iframe
shared/ng.js      couche commune : réglages + records (localStorage partagé)
assets/           icônes de l'application
```

- **Navigation** : SPA en `pushState`, retour matériel Android géré par `@capacitor/app`.
- **Records** : chaque jeu appelle `NG.bump / NG.max / NG.set`, le launcher lit les mêmes valeurs.

## Ajouter un jeu

1. Déposer le fichier dans `games/monjeu.html`
2. Ajouter une entrée dans le tableau `GAMES` de `index.html` :

```js
{ id: "monjeu", file: "games/monjeu.html", title: "Mon jeu", icon: "🎮",
  desc: "Description courte.", highlight: "score",
  stats: [{ k: "score", label: "Meilleur score", fmt: "int" }], status: "ready" }
```

3. Dans le jeu, inclure la couche commune puis remonter les stats :

```html
<script src="../shared/ng.js"></script>
<script>window.NG=window.NG||{bump:function(){},max:function(){},set:function(){},get:function(){return{}},settings:function(){return{sound:true,level:"4"}},setSetting:function(){}};</script>
```

```js
NG.max("monjeu", "score", 1200);   // conserve le meilleur
NG.bump("monjeu", "parties", 1);   // incrémente
```

Le CI copie automatiquement `games/*.html` et `shared/*.js` dans l'APK — aucune modification du workflow n'est nécessaire.

## Build

```bash
npm install
npx cap add android
npx --yes @capacitor/assets generate --android --iconBackgroundColor '#0f3d2a'
npx cap sync android
cd android && ./gradlew assembleDebug
```

L'APK se trouve dans `android/app/build/outputs/apk/debug/`. Le build est aussi produit par GitHub Actions à chaque push sur `main`.
