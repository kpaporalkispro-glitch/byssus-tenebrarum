# Byssus Tenebrarum — site statique GitHub Pages

Ce dossier contient une version prête à publier sur GitHub Pages : accueil, boutique, collections, fiche produit, configurateur, panier, checkout de démonstration, à propos, FAQ, contact, journal et mentions.

## Mise en ligne sur GitHub Pages

1. Créez un dépôt GitHub, par exemple `byssus-tenebrarum`.
2. Décompressez le ZIP puis envoyez **tout le contenu du dossier** à la racine du dépôt.
3. Sur GitHub : **Settings → Pages**.
4. Dans **Build and deployment**, choisissez **Deploy from a branch**.
5. Branche : `main`, dossier : `/ (root)` puis **Save**.
6. Après 1 à 3 minutes, GitHub affichera l’URL publique.

## Test local

Ouvrir directement `index.html` fonctionne, mais pour un comportement plus fidèle utilisez un petit serveur local :

```bash
python -m http.server 8000
```

Puis ouvrez `http://localhost:8000`.

## Produits

Les produits sont dans `assets/js/products.js`. Modifiez les noms, prix, descriptions et images ici.

## Images

Les images fournies dans ce prototype sont des recadrages des maquettes envoyées dans la conversation. Remplacez-les progressivement par de vraies photos de prototypes avant la mise en ligne commerciale.

## Paiement

GitHub Pages est un hébergement **statique**. Il ne doit pas contenir de clé secrète Stripe/PayPal. Le panier fonctionne via `localStorage`, mais le bouton de paiement est volontairement en mode démonstration. Voir `PAYMENT_SETUP.md`.

## Formulaire de contact

Le formulaire est aussi en mode démonstration. Vous pouvez le connecter à Formspree, Netlify Forms, Cloudflare Workers ou un backend propre.
