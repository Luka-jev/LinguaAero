# Prompt pour agent IA — Site d'apprentissage de langues

Crée un site web complet d'apprentissage de langues en **HTML, CSS et JavaScript pur** (un seul fichier `index.html` ou plusieurs fichiers séparés proprement organisés). Voici toutes les spécifications :

---

## 🎨 Style visuel — Frutiger Aero

Le design doit s'inspirer du style **Frutiger Aero** (popularisé au milieu des années 2000) :
- Fonds avec **dégradés bleu ciel / cyan / blanc** lumineux et propres
- Effets de **verre givré** (glassmorphism) : éléments semi-transparents avec `backdrop-filter: blur()` et bordures claires légèrement brillantes
- **Reflets subtils** sur les boutons et les cartes (pseudo-élément `::after` avec dégradé blanc semi-transparent en haut)
- Éléments naturels suggérés : nuages floutés ou bulles en arrière-plan (CSS pur)
- Couleurs dominantes : `#5bc8e8`, `#a8e6f0`, `#d6f5ff`, `#ffffff`, avec accents verts doux (`#7dd87d`)
- Typographie : **Segoe UI** ou **Nunito** (Google Fonts), ronde et lisible
- Ombres portées douces et lumineuses, pas sombres
- Boutons avec effet de brillance au hover, coins très arrondis (`border-radius: 20px` minimum)
- Ambiance globale : propre, optimiste, technologie douce

---

## 🌍 Langues disponibles

Le site doit proposer les langues suivantes, sélectionnables depuis la page d'accueil :
- 🇮🇹 Italien
- 🇵🇹 Portugais
- 🇹🇷 Turc

Chaque langue a sa propre banque de questions séparée dans le JSON de données.

---

## 📚 Niveaux de langue

Les niveaux disponibles sont : **A1, A2, B1, B2, C1**

- La progression entre les niveaux est **manuelle** : l'utilisateur choisit lui-même son niveau via un sélecteur visible en permanence dans l'interface
- Chaque niveau a ses propres questions adaptées à la difficulté (vocabulaire simple en A1, expressions complexes en C1)
- Le niveau sélectionné est sauvegardé dans le JSON local

---

## ❓ Système de questions (QCM)

- On affiche **un mot ou une expression** dans la langue choisie (ex : "Buongiorno" en italien)
- L'utilisateur doit choisir la **bonne traduction en français** parmi **4 propositions**
- Les 3 mauvaises réponses sont des distracteurs plausibles tirés de la même banque de mots
- Après avoir cliqué sur une réponse :
  - Si **bonne réponse** : la carte devient verte avec un ✅, affichage d'un message de félicitation court
  - Si **mauvaise réponse** : la carte devient rouge avec un ❌, et la **bonne réponse est mise en surbrillance en vert** immédiatement
  - Un bouton "Question suivante" apparaît après chaque réponse
- On ne repose **jamais deux fois la même question** dans une session, et les questions déjà répondues (dans l'historique persistant) passent en dernier

---

## 💾 Sauvegarde des données (JSON local)

Toutes les données sont sauvegardées dans le **localStorage** du navigateur sous forme de JSON structuré, persistant entre les sessions. Structure suggérée :

```json
{
  "langue_active": "italien",
  "niveau_actif": "A1",
  "historique": [
    {
      "date": "2025-05-08",
      "langue": "italien",
      "niveau": "A1",
      "mot_original": "Arrivederci",
      "traduction_correcte": "Au revoir",
      "reponse_utilisateur": "À bientôt",
      "correct": false
    }
  ],
  "statistiques": {
    "italien": { "A1": { "total": 20, "bonnes": 15 }, "A2": { "total": 5, "bonnes": 3 } },
    "portugais": {},
    "turc": {}
  }
}
```

---

## 📜 Page Historique

Accessible via un bouton **"Historique"** toujours visible dans la navigation.

- Affichage en **tableau à 2 colonnes** :
  - Colonne gauche : mot dans la langue apprise (ex : "Arrivederci" — Italien)
  - Colonne droite : traduction française correcte (ex : "Au revoir")
- Chaque ligne indique aussi : la date, le niveau, et si la réponse donnée était ✅ correcte ou ❌ incorrecte
- Filtre par langue et par niveau (dropdowns)
- Filtre par date (aujourd'hui / 7 derniers jours / tout)
- Bouton **"Effacer l'historique"** avec confirmation

---

## 📊 Statistiques

Un onglet ou section **"Mes stats"** affichant :
- **% de bonnes réponses** globales, par langue et par niveau
- Nombre total de questions répondues
- Série actuelle de bonnes réponses consécutives (streak)
- Jauge visuelle (barre de progression en style Frutiger Aero) pour chaque langue/niveau

---

## 🔀 Navigation principale

La barre de navigation (toujours visible, style glassmorphism) contient :
1. **Logo / Nom du site** (ex : "LinguaAero" ou similaire)
2. Sélecteur de **langue** (icône drapeau + nom)
3. Sélecteur de **niveau** (A1 à C1)
4. Bouton **"Historique"**
5. Bouton **"Mes stats"**

---

## 🗂️ Banque de questions intégrée

Intègre directement dans le fichier JS une banque de **minimum 30 mots/expressions par langue par niveau A1** (soit au moins 90 entrées pour l'italien A1, portugais A1 et turc A1) avec leurs traductions françaises correctes. Exemple de structure :

```javascript
const banqueQuestions = {
  italien: {
    A1: [
      { mot: "Buongiorno", traduction: "Bonjour" },
      { mot: "Arrivederci", traduction: "Au revoir" },
      { mot: "Grazie", traduction: "Merci" },
      // ... 27 autres
    ],
    A2: [ /* ... */ ]
  },
  portugais: { A1: [ /* ... */ ] },
  turc: { A1: [ /* ... */ ] }
};
```

---

## ✅ Résumé des contraintes techniques

- **Aucun framework** : HTML, CSS, JS vanilla uniquement
- **Aucune dépendance externe** sauf Google Fonts (via CDN)
- Tout fonctionne **sans serveur** (ouverture directe du fichier dans le navigateur)
- Responsive : fonctionne sur **mobile et desktop**
- Données persistantes via `localStorage`
- Code **commenté et lisible**
