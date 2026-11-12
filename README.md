# Taupinière

Un jeu de réflexe en pixel art : pendant une minute, des taupes sortent de neuf trous dans un potager. Tape-les avant qu'elles ne rentrent.

*English version: [README.en.md](README.en.md)*

## Commandes

- **Clic** ou **doigt** sur une taupe : un coup de maillet.
- **Pavé numérique** : chaque chiffre est un trou, à la même place (7 8 9 en haut, 1 2 3 en bas). Sans pavé : **A Z E / Q S D / W X C** (ou les touches à la même place sur un clavier QWERTY), ou les chiffres du haut du clavier.
- **P** ou **Échap** : pause.

## Comment ça marche

- Une partie dure **60 secondes**. Les bêtes sortent de plus en plus souvent, et parfois deux à la fois.
- **Taupe** : 10 points.
- **Taupe casquée** : deux coups, le premier fait tomber le casque. 20 points.
- **Taupe dorée** : rare et rapide. 50 points.
- **Hérisson** : ne le touche pas, il fait perdre 30 points et casse la série.
- **Série** : 5 coups réussis d'affilée doublent les points, puis ×3, ×4 et jusqu'à ×5. Un coup dans le vide ou une taupe qui s'échappe la remet à zéro.

## Statistiques

Le panneau Records garde ton **meilleur score**, le nombre de **parties**, de **taupes tapées** et de **taupes dorées**.

## Données et synchronisation

Ton record et tes totaux sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Taupinière → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
