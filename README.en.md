# Molehill

A pixel art reflex game: for one minute, moles pop out of nine holes in a vegetable garden. Whack them before they go back in.

*Version française : [README.md](README.md)*

## Controls

- **Click** or **tap** a mole: one mallet hit.
- **Numeric keypad**: each digit is a hole, in the same place (7 8 9 at the top, 1 2 3 at the bottom). Without a keypad: **Q W E / A S D / Z X C** (or the keys in the same place on an AZERTY keyboard), or the number row.
- **P** or **Esc**: pause.

## How it works

- A game lasts **60 seconds**. Animals come out more and more often, sometimes two at a time.
- **Mole**: 10 points.
- **Helmeted mole**: two hits, the first knocks the helmet off. 20 points.
- **Golden mole**: rare and fast. 50 points.
- **Hedgehog**: don't touch it, it costs 30 points and breaks the streak.
- **Streak**: 5 hits in a row double the points, then ×3, ×4, up to ×5. A miss or a mole that escapes resets it.

## Stats

The Records panel keeps your **best score**, the number of **games**, **moles whacked** and **golden moles**.

## Data and sync

Your best score and totals are saved by NeoDex, backed up and synced between your PCs if sync is on.

## Install

In NeoDex: **NeoStore → Discover → Molehill → Install**.

Making a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).

## Full screen

The "FULL SCREEN" button puts the game in full screen. The game also grows with the window, from a small laptop to a big screen.

## The gardener and survival mode

- **The gardener** stands behind the fence at the bottom of the garden. When you hit nothing, a mole gets away or you hit the hedgehog, he turns red, raises his fist and grumbles ("My lettuce!", "Aim better!"…).
- **Survival mode** (Mode menu): no time limit, but three lives. Each mole that gets away costs one. Moles come out faster and faster; the survival record is kept separately.
