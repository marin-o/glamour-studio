# Instagram lookbook development media

These nine JPEGs are temporary development assets captured from the public
`@glamourrstudiio` profile on 2026-07-16. They are feed-sized images or Reel
cover frames, not production originals.

The repository delivers them through the same responsive quality-100
`next/image` contract used by Gyroid: exact generated dimensions, accurate
responsive `sizes`, and optimizer-selected browser formats without destructive
source recompression. Run `pnpm media:optimize` after replacing any file and
commit the regenerated `src/generated/lookbook-media-manifest.js`.

All current files are only 640px wide. The delivery pipeline prevents further
quality loss but cannot recreate missing source detail. True high-density
crispness requires approved production originals at substantially higher
resolution.

They may be used to develop and evaluate the `/lookbook` composition. Their
presence in the repository does not record final publication approval, client
consent, approved website alt text, or approval to reuse Instagram captions.
Before launch, the owner must confirm website reuse and permissions for every
recognizable person, and replace these files with approved originals when
available.

| Order | File | Instagram source | Media shown |
| --- | --- | --- | --- |
| 1 | `01-DagDplJDeqK.jpg` | <https://www.instagram.com/glamourrstudiio/p/DagDplJDeqK/> | Post image |
| 2 | `02-DaYEE15NSnT.jpg` | <https://www.instagram.com/glamourrstudiio/p/DaYEE15NSnT/> | Post image |
| 3 | `03-DaF8XAotU9l.jpg` | <https://www.instagram.com/glamourrstudiio/p/DaF8XAotU9l/> | Post image |
| 4 | `04-DaF6hPyNjb4.jpg` | <https://www.instagram.com/glamourrstudiio/p/DaF6hPyNjb4/> | Post image |
| 5 | `05-DaFy4dNDV2k.jpg` | <https://www.instagram.com/glamourrstudiio/p/DaFy4dNDV2k/> | Post image |
| 6 | `06-DZnBUnsjT7z.jpg` | <https://www.instagram.com/glamourrstudiio/p/DZnBUnsjT7z/> | Post image |
| 7 | `07-DZm9Cm-tKDQ.jpg` | <https://www.instagram.com/glamourrstudiio/reel/DZm9Cm-tKDQ/> | Reel cover frame |
| 8 | `08-DZlV_EGNS3V.jpg` | <https://www.instagram.com/glamourrstudiio/reel/DZlV_EGNS3V/> | Reel cover frame |
| 9 | `09-DZfmT0WjZ9k.jpg` | <https://www.instagram.com/glamourrstudiio/p/DZfmT0WjZ9k/> | Post image |

The future Instagram API integration is outside the development lookbook task.
Do not automate refreshes by scraping these CDN URLs; they are temporary and
expire.
