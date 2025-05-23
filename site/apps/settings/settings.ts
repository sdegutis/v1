import { Border } from "../../os/containers/border.js"
import { GroupX, GroupY } from "../../os/containers/group.js"
import { Button } from "../../os/controls/button.js"
import { Label } from "../../os/controls/label.js"
import { sys } from "../../os/core/system.js"
import { View } from "../../os/core/view.js"
import { Panel } from "../../os/desktop/panel.js"
import { $ } from "../../os/util/dyn.js"
import { Reactive } from "../../os/util/events.js"
import { centerLayout } from "../../os/util/layouts.js"

export default () => {
  const thesize = new Reactive('320x180')

  thesize.watch(s => {
    const [w, h] = s.split('x')
    sys.resize(+w, +h)
  })

  const size1 = makeSizeButton('320x180')
  const size2 = makeSizeButton('640x360')

  function makeSizeButton(size: string) {
    return $(Button, { onClick() { thesize.update(size) } },
      $(GroupX, { gap: 2, },
        $(Border, { borderColor: 0xffffff33, padding: 1, },
          $(Border, { padding: 1 },
            $(View, {
              passthrough: true, background: 0xffffffff, w: 2, h: 2,
              $visible: thesize.adapt(s => s === size)
            })
          )
        ),
        $(Label, { text: size }),
      )
    )
  }

  const panel = $(Panel, { title: 'settings', w: 100, h: 60 },
    $(View, { layout: centerLayout, background: 0xffffff11 },

      $(Border, { padding: 2 },
        $(GroupX, { gap: 2, align: 'a' },
          $(Border, { padding: 1 }, $(Label, { text: 'size' })),
          $(GroupY, { gap: 2 },
            size1,
            size2,
          ),
        )
      )

    )
  )

  panel.show()

}
