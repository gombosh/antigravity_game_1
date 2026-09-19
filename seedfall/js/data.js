/* SEEDFALL content data. Pure data — no logic here. */

const ITEMS = {
  reed_pod: {
    name: 'Binding Reed Pod',
    icon: '🌾',
    type: 'object',
    desc: 'A dormant seed pod from a tide-pool plant. It filters toxins from water as it grows. Unremarkable to look at — easy to miss.'
  },
  damaged_scroll: {
    name: 'Water-Damaged Scroll',
    icon: '📜',
    type: 'scroll',
    desc: 'Salvaged from a drowned archive. Most of the text has dissolved. One fragment survives: "...the Binding Reed kept it clean, before it was lost..."'
  },
  idol: {
    name: 'Sea-Spirit Idol',
    icon: '🗿',
    type: 'object',
    desc: 'A small buried idol telling settlers that spirits — not the reed itself — protect their water. Someone placed this deliberately, long before you arrived. It bears a faint mark you do not recognize.'
  }
};

const PLANETS = {
  ondine: {
    name: 'ONDINE',
    eraOrder: ['genesis', 'rise', 'present', 'ruin'],
    eras: {

      genesis: {
        label: 'GENESIS',
        hotspots: [
          {
            id: 'tidepool',
            x: 50, y: 55, icon: '💧', label: 'Tide Pool',
            glow: (s) => !s.flags.reedPodTaken,
            onTap: (s, api) => {
              if (!s.flags.reedPodTaken) {
                api.giveItem('reed_pod');
                api.setFlag('reedPodTaken', true);
                api.unlockEra('rise');
                api.addCodex('The First Seed', 'A living Binding Reed pod, found in a barren tide pool. It could take root somewhere else, in some other time.');
                api.showItemCard('reed_pod');
              } else {
                api.examine('An empty tide pool. Whatever grew here, you already took it.');
              }
            }
          },
          {
            id: 'rocks', x: 22, y: 70, icon: '🪨', label: 'Bare Rock',
            onTap: (s, api) => api.examine('Bare volcanic rock. Nothing lives here yet, except in the pools.')
          },
          {
            id: 'mats', x: 76, y: 68, icon: '🦠', label: 'Microbial Mat',
            onTap: (s, api) => api.examine('A film of ancient microbes clings to a wet ledge. The first life on Ondine, indifferent to you.')
          }
        ]
      },

      rise: {
        label: 'RISE',
        hotspots: [
          {
            id: 'settler', x: 28, y: 62, icon: '🧍', label: 'Settler', type: 'npc',
            onTap: (s, api) => {
              if (!s.flags.reedPlanted) {
                api.dialogue('Settler', 'The water here is thin and bitter. We build anyway — there is nowhere else.');
              } else if (!s.flags.idolTaken) {
                api.dialogue('Settler', 'Strange — the marsh grew thick and green almost overnight. The elders say the spirits are pleased with us.');
              } else {
                api.dialogue('Settler', 'We have started tending the reed ourselves, cutting and drying it. It is ours to understand now, not just a gift.');
              }
            }
          },
          {
            id: 'plantsite', x: 55, y: 75, icon: '🌊', label: 'Marsh Edge',
            glow: (s) => s.armedItem === 'reed_pod' && !s.flags.reedPlanted,
            armedTarget: (s) => s.armedItem === 'reed_pod' && !s.flags.reedPlanted,
            onTap: (s, api) => {
              if (s.armedItem === 'reed_pod' && !s.flags.reedPlanted) {
                api.confirm('Plant the Binding Reed here? It will take root over generations, and you will not be able to take it back.', () => {
                  api.consumeArmedItem();
                  api.setFlag('reedPlanted', true);
                  api.addCodex('A Seed Takes Root', 'You planted the Binding Reed at Ondine’s Rise era. Its effects will ripple forward through every later era on this world.');
                  api.toast('The reed takes root in the marsh.');
                });
              } else if (!s.flags.reedPlanted) {
                api.examine('A shallow marsh edge. Something planted here might spread through the whole wetland, given enough time.');
              } else {
                api.examine('Thick reed colonies now line the water here, generations after you planted the first pod.');
              }
            }
          },
          {
            id: 'idol', x: 70, y: 68, icon: '🗿', label: 'Buried Idol',
            visible: (s) => s.flags.reedPlanted && !s.flags.idolTaken,
            glow: (s) => s.flags.reedPlanted && !s.flags.idolTaken,
            onTap: (s, api) => {
              api.itemInfo('idol', 'Exposed by the reed’s roots, half-buried in the mud: an idol telling settlers that spirits protect their water. Someone placed this here on purpose, long before you arrived.', [
                { label: 'Unseed It', action: () => {
                  api.confirm('Remove this idol from the timeline? Whatever the settlers believed because of it may unravel.', () => {
                    api.setFlag('idolTaken', true);
                    api.giveItem('idol');
                    api.addCodex('A False Story, Removed', 'You unseeded the Sea-Spirit Idol. It bears a mark you don’t recognize — someone else has been seeding this timeline before you ever arrived.');
                    api.toast('The idol comes free of the mud.');
                  });
                }},
                { label: 'Leave It', action: () => {} }
              ]);
            }
          }
        ]
      },

      present: {
        label: 'PRESENT',
        hotspots: [
          {
            id: 'elder', x: 30, y: 60, icon: '🧓', label: 'Elder', type: 'npc',
            onTap: (s, api) => {
              if (!s.flags.reedPlanted) {
                api.dialogue('Elder', 'The water has turned red and our people are sick. Please — if there is anything in the old records, find it. I fear we have little time.');
                if (!s.flags.metElder) { api.setFlag('metElder', true); api.unlockEra('ruin'); api.addCodex('A Town in Crisis', 'Ondine’s harbor town is dying from a red-tide toxin. The elder has pointed you toward the flooded archive in Ondine’s far future — Ruin.'); }
              } else if (!s.flags.idolTaken) {
                api.dialogue('Elder', 'The water cleared, almost overnight, generations ago it seems, though I could not tell you why. We are grateful, whatever the cause.');
              } else {
                api.dialogue('Elder', 'Our healers understand the reed now — truly understand it, not just benefit from it. Whatever you did, thank you.');
              }
            }
          },
          {
            id: 'healer', x: 68, y: 58, icon: '🩺', label: 'Healer', type: 'npc',
            visible: (s) => s.flags.reedPlanted,
            onTap: (s, api) => {
              if (!s.flags.idolTaken) {
                api.dialogue('Healer', 'It troubles me — the water cleared, but we never learned why, or how. If a real sickness came, one the reed can’t simply filter away, we would have nothing. No knowledge, only luck.');
              } else {
                api.dialogue('Healer', 'We keep records now, cultivate the reed deliberately, understand what it does and why. There’s a mark on the old idol we dug up — not one of ours. Something else has been shaping this place.');
                if (!s.flags.endingSeen) {
                  api.setFlag('endingSeen', true);
                  api.addCodex('Someone Was Here First', 'Every world you’ll visit may carry the same mark. Ondine was tended — and quietly steered — long before you arrived. Planet Two awaits on the System Map.');
                  api.toast('Ondine’s story is complete. New destinations may be waiting.');
                }
              }
            }
          },
          {
            id: 'water', x: 50, y: 78, icon: '🌊', label: 'Harbor Water',
            onTap: (s, api) => {
              if (!s.flags.reedPlanted) api.examine('The water has turned a sickly rust-red. The smell alone keeps most people indoors.');
              else api.examine('Clear water, thick with reed growth along the shore. Hard to imagine it any other way now.');
            }
          }
        ]
      },

      ruin: {
        label: 'RUIN',
        hotspots: [
          {
            id: 'archive', x: 45, y: 55, icon: '🏛️', label: 'Flooded Archive',
            glow: (s) => !s.flags.reedPlanted && !s.flags.scrollTaken,
            onTap: (s, api) => {
              if (!s.flags.reedPlanted) {
                if (!s.flags.scrollTaken) {
                  api.setFlag('scrollTaken', true);
                  api.giveItem('damaged_scroll');
                  api.unlockEra('genesis');
                  api.addCodex('An Echo From a Future You Haven’t Made', 'A scroll fragment, written after a crisis you haven’t solved yet, mentioning a "Binding Reed" you’ve never seen. Its own past is still unwritten.');
                  api.showItemCard('damaged_scroll');
                } else {
                  api.examine('The archive is picked clean. Water drips somewhere in the dark.');
                }
              } else {
                api.examine('An intact, undisturbed library — this future never happened. The shelves hold records of a town that simply kept going.');
              }
            }
          },
          {
            id: 'wreck', x: 70, y: 70, icon: '⚓', label: 'Sunken Harbor',
            onTap: (s, api) => {
              if (!s.flags.reedPlanted) api.examine('The harbor town, fully submerged. Whatever happened here, it happened generations after the crisis you just witnessed in the present.');
              else api.examine('The harbor never drowned. Reed-woven breakwaters, generations old, still hold back the tide.');
            }
          }
        ]
      }
    }
  },

  // Placeholder for future content — referenced by the System Map.
  __planetTwoLocked: true
};
