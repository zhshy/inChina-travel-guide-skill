# Image and source policy

## Cover selection

Search for a landscape or city image that is unmistakably tied to the destination and supports both desktop landscape and mobile portrait crops. Prefer official tourism media, licensed editorial libraries, Wikimedia Commons with clear licensing, reputable destination publications or user-supplied photography. Keep enough negative space for the title.

When no suitable licensable image exists, generate a destination-specific cover from researched visual cues. Label generated imagery honestly. Do not fabricate a named hotel, restaurant or landmark through image generation.

## Place-card selection

Use an image of the exact place. Collect candidates with the bounded source ladder in [image-candidate-sourcing.md](image-candidate-sourcing.md), then confirm the displayed venue/branch and that the subject plausibly shows its storefront, interior, room, food, product or activity. Automatic discovery produces candidates only; it never sets `subject_verified` or `visually_confirmed`.

Every restaurant in Standard mode receives one image. A single batch contact-sheet review is enough for restaurant cards; do not require a separate full-size forensic record for each restaurant. An exact-pin Google Street View fallback uses `source_type: google_street_view`, `visual_subject_type: place_exterior`, and the label **门店街景 · 位置参考**. Reject logos, menu scans, unrelated businesses or people, event photos, map-only imagery, collages, loading states, repeated site-wide social images and generic cuisine stock. If the bounded ladder fails, replace that restaurant rather than omitting the image. Standard mode uses one image per ordinary sight, shop/souvenir, experience and restaurant. Only a deliberately selected `gallery_featured` sight and the selected primary hotel receive a second, genuinely different view. Never repeat one file or borrow another venue's image.

Every named-place image records `visual_subject_type` as `place_exterior`, `place_interior`, `room`, `dish`, `product`, `experience_scene`, or `landscape`. Logos, Open Graph/share cards, posters, maps, text cards and generic brand graphics are not place photos after conversion. Byte-identical files cannot fill multiple gallery positions.

Use generic stock only as an explicitly labeled illustration and never for a named venue card.

Reject watermarked stock previews and search-result composites, including visible Alamy, Getty Images, Shutterstock, Dreamstime or similar marks. Known commercial-stock preview URLs are not acceptable travel assets even when they decode. A legitimately licensed clean original must have a separate source/license record and must not carry a watermark.

## Hotel identity and user attachments

Source hotel images independently from the exact property's official site, a reputable lodging listing, or public map/business material. Cross-check property name, neighborhood or address, and visible room or exterior details before use.

For every named place, `media_class` and `original_media_class` must both be one of `real_photo`, `official_photo` or `licensed_photo`. A restaurant-only Street View capture is classified as `real_photo`, with `source_type: google_street_view`, exact-pin/storefront evidence and the mandatory location-reference label. `generated_editorial` is permitted only for a cover or non-place decorative background. Other `illustration`, `text_card`, `placeholder`, `html_screenshot` and `svg_render` assets never satisfy an exact-place slot. Rasterizing SVG/HTML or converting formats does not change media identity; record `transcoded_from` and preserve the original class.

An exact-place record is incomplete without all of: the identity-bearing source page, direct downloadable image URL, successful `asset-fetch-report.json` record, MIME/dimensions, contact-sheet or focused full-size verification evidence saved under `qa-evidence/`, and a note describing the visible sign/facade/interior/product evidence. One contact sheet may be shared by the full batch when every manifest entry records its asset ID/row. Self-declared booleans without those artifacts do not pass. If no compliant photo is found, leave the slot unresolved and keep the state at `assets_required`.

Do not infer that an uploaded image depicts the hotel merely because it was attached to the same request. Unless the user explicitly says the image is confirmed property photography, treat it as mood, layout or visual-reference material only. Never present it as a hotel image or copy it into the hotel gallery without verification.

Keep source provenance per asset in a compact manifest containing venue, source page, source type, retrieval date and local filename. Prefer the official property source when equivalent images exist.

Each entry also records `place_id`, module, role and `subject_verified`. The `place_id` must match the card and destination profile. Do not mark verification true from filename, HTTP status, color similarity or search-result proximity; open the image and confirm the subject against the exact source page.

## Storage and performance

An identity-bound square official product image may be accepted below the normal canvas floor when both original edges are at least 320 px and the user accepts it for the card. Keep the original pixels at native size and center them on a white canvas of at least 480×320; do not stretch, crop or upscale. Record `padded: true`, `padding_mode: contain_white_no_upscale`, `source_width` and `source_height` in the fetch report and inspect the padded output. This does not admit unrelated social cards, text cards, tiny thumbnails or weak place binding.

- Localize stable images when usage terms permit.
- Resize card images to a roughly 1200–1600 px long edge.
- Prefer WebP/AVIF or optimized progressive JPEG, usually quality 70–82.
- Use `loading="lazy"` for card images, but preload or set high fetch priority for the cover only.
- Add descriptive alt text and reserve width/height or aspect ratio to prevent layout shift.
- Keep attribution visible but visually quiet; do not place a large source badge over the subject.

## Verification

Open or decode every downloaded image and visually confirm the subject. Check that gallery files are not byte-identical and that every card has a unique, relevant image. HTTP 200 proves delivery, not identity. Keep download/decode status separate from visual identity status.

For an unchanged official image, reuse its visual-review cache when the local byte hash, direct URL, source page, place ID and prior contact-sheet row all still match. A changed byte, URL, place binding or crop invalidates that visual cache. Download checks may rerun independently without forcing a new identity review.

Do not rely on a small contact-sheet thumbnail to detect watermarks. Inspect each shortlisted image at readable/full size, including corners and center overlays, before setting `visually_confirmed`.

Keep candidate search bounded: no more than three inspected candidates from one source tier and six total candidates per image slot. Apply cheap rejection first—known watermarked-stock domains, filename/alt clues for logos or banners, implausible aspect ratios, tiny dimensions and non-image responses—then visually inspect only the shortlist. If the shortlist fails, change source tier or venue instead of expanding an unbounded candidate matrix.

For the cover, verify nonzero natural dimensions and the intended crop at approximately 390×844 and 1440×900. For all images, confirm no broken references in the local export.

If an image cannot be verified, omit or replace the venue rather than filling the card with unrelated scenery.

Treat Wikimedia 429 responses as host throttling, not evidence that the file does not exist. Stop concurrent requests to that host, apply low-frequency backoff, reuse already downloaded valid files, and then switch to an allowed stable thumbnail/proxy or another licensed exact-subject source. Do not repeatedly hammer Commons or fall back to an old guide asset.

Do not ship repeated proxy imagery: one restaurant photo cannot stand in for another restaurant, a park photo cannot represent an onsen, and one scenic image cannot be cloned across a three-image gallery. When only one exact-place image is verifiable, use one deliberate image surface or replace the recommendation; never manufacture a gallery by repetition.

For an adapted destination, do not leave canonical reference assets in the candidate, even temporarily. A localized name over a Bali photo is a failed place card. Finish a destination asset manifest first, then wire only its files into the page. The manifest destination and each asset venue must match the current export.

Before release, sample every visual module rather than only the cover. Confirm exact-place imagery in hotels, activities, shopping and sights, and confirm that every restaurant card renders one non-broken image from the bounded restaurant ladder. Restaurant verification may be batch-level in Standard mode, but text-only restaurant cards are not releasable.
