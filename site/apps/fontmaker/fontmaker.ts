import { Border } from "../../os/containers/border.js"
import { GroupX, GroupY } from "../../os/containers/group.js"
import { PanedYB } from "../../os/containers/paned.js"
import { Scroll } from "../../os/containers/scroll.js"
import { Label } from "../../os/controls/label.js"
import { Slider } from "../../os/controls/slider.js"
import { Bitmap } from "../../os/core/bitmap.js"
import { CHARSET, crt34, Font } from "../../os/core/font.js"
import { sys } from "../../os/core/system.js"
import { View } from "../../os/core/view.js"
import { Panel } from "../../os/desktop/panel.js"
import { fs } from "../../os/fs/fs.js"
import { $ } from "../../os/util/dyn.js"
import { Reactive } from "../../os/util/events.js"
import { CharView } from "./charview.js"

const SAMPLE_TEXT = [
  "how quickly daft jumping zebras vex!",
  "the five boxing wizards jump quickly.",
  "the quick brown fox, jumps over the lazy dog.",
  ` .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^\\`,
].join('\n')

export default async (filename?: string) => {

  const $font = new Reactive(crt34)
  const $width = new Reactive($font.data.width)
  const $height = new Reactive($font.data.height)

  function rebuildWhole() {
    const w = $width.data
    const h = $height.data
    const src = new Bitmap([0x000000ff], 16 * w, Array(96 * w * h).fill(0))

    for (const [i, ch] of CHARSET.entries()) {
      const x = i % 16
      const y = Math.floor(i / 16)
      $font.data.chars[ch].draw(x * w, y * h, 1, src)
    }

    $font.update(new Font((src.toString())))
  }

  rebuildWhole()

  const $zoom = new Reactive(2)
  const $hovered = new Reactive('')

  if (filename) {
    $font.update(new Font(fs.get(filename)!))
    $width.update($font.data.width)
    $height.update($font.data.height)
  }

  const charViews = new Map<string, CharView>()

  for (const char of CHARSET) {
    const view = $(CharView, { char, $font, $width, $height, $zoom })
    charViews.set(char, view)
    view.$watch('hovered', (h) => { if (h) $hovered.update(char) })
  }

  let collView

  const panel = $(Panel, { title: 'fontmaker', },
    $(PanedYB, {},
      $(Scroll, {},
        collView = $(View, {
          background: 0x44444499,
          adjust() {
            const padding = 1 * $zoom.data
            const gap = 1 * $zoom.data
            const child = this.firstChild!
            this.w = padding * 2 + (child.w * 16) + (gap * 15)
            this.h = padding * 2 + (child.h * 6) + (gap * 5)
          },
          layout() {
            const padding = 1 * $zoom.data
            const gap = 1 * $zoom.data

            let i = 0
            for (let y = 0; y < 6; y++) {
              for (let x = 0; x < 16; x++) {
                const child = this.children[i++]
                if (!child) break

                child.x = padding + (x * child.w) + (x * gap)
                child.y = padding + (y * child.h) + (y * gap)
              }
            }
          },
        },
          ...charViews.values()
        )
      ),
      $(Border, { background: 0x000000ff },
        $(GroupY, { gap: 3, align: 'a' },
          $(Label, { text: SAMPLE_TEXT, color: 0x999900ff, $font: $font }),
          $(GroupX, { gap: 10, },
            $(GroupX, { gap: 2 },
              $(Label, { text: 'width:', color: 0xffffff33 }),
              $(Label, { $text: $width.adapt(n => n.toString()) }),
              $(Slider, { min: 1, max: 12, w: 20, knobSize: 3, $val: $width }),
            ),
            $(GroupX, { gap: 2 },
              $(Label, { text: 'height:', color: 0xffffff33 }),
              $(Label, { $text: $height.adapt(n => n.toString()) }),
              $(Slider, { min: 1, max: 12, w: 20, knobSize: 3, $val: $height }),
            ),
            $(GroupX, { gap: 2 },
              $(Label, { text: 'zoom:', color: 0xffffff33 }),
              $(Label, { $text: $zoom.adapt(n => n.toString()) }),
              $(Slider, { min: 1, max: 5, w: 20, knobSize: 3, $val: $zoom }),
            ),
            $(GroupX, { gap: 2 },
              $(Label, { text: 'hover:', color: 0xffffff33 }),
              $(Label, { $text: $hovered }),
            ),
          )
        )
      )
    )
  )

  $zoom.watch(() => { collView.layoutTree() })

  $width.watch(rebuildWhole)
  $height.watch(rebuildWhole)

  panel.onKeyDown = (key) => {
    if (key === 's' && sys.keys['Control']) {

      if (filename) {
        fs.put(filename, $font.data.charsheet.toString())
      }

      return true
    }
    return false
  }

  panel.show()

}
