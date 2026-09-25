# Mise en place du paiement réel

## Important
GitHub Pages héberge seulement des fichiers statiques. Ne placez jamais une clé secrète Stripe, PayPal ou autre dans JavaScript public.

## Option recommandée pour démarrer : Stripe Payment Links
1. Créez votre compte Stripe.
2. Créez un Payment Link par produit ou par offre.
3. Dans `products.js`, ajoutez un champ `paymentUrl` à chaque produit.
4. Modifiez `checkout.html` / `app.js` pour rediriger vers ce lien au moment de payer.

Avantage : pas de backend à maintenir. Limite : panier multi-produits moins flexible.

## Option plus complète : Stripe Checkout + fonction serverless
- Gardez le site sur GitHub Pages.
- Utilisez Cloudflare Workers, Netlify Functions, Vercel Functions ou votre propre serveur pour créer la session Stripe Checkout.
- La fonction reçoit les IDs/quantités, recalcule les montants côté serveur, puis renvoie l’URL Stripe Checkout.
- Les clés secrètes restent dans les variables d’environnement du service serverless.

## PayPal
Même logique : les identifiants privés restent côté serveur. Pour un bouton PayPal public, utilisez uniquement les identifiants publics prévus à cet effet et validez le montant côté serveur pour la production.

## Avant ouverture commerciale
À compléter :
- informations EI / SIREN / adresse / contact
- CGV et politique de confidentialité
- règles de livraison et retours
- TVA / facturation selon votre régime
- bannière cookies si des traceurs non nécessaires sont utilisés
- politique de sécurité et conformité produit
