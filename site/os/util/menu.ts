import { Border } from "../containers/border.js"
import { GroupY } from "../containers/group.js"
import { Button } from "../controls/button.js"
import { Label } from "../controls/label.js"
import { crt } from "../core/crt.js"
import { sys } from "../core/system.js"
import { View } from "../core/view.js"
import { $ } from "./dyn.js"

export type MenuItem = '-' | { text: string, onClick: () => void }

class MenuDivider extends View {

  override onResized(): void { }

  override layout(): void {
    this.w = this.parent?.w ?? 20
  }

  override draw(): void {
    crt.rectFill(0, 2, this.w, 1, 0xffffff11)
  }

}

export function showMenu(items: MenuItem[], adjust?: (menu: View) => void) {
  const menu = $(Border, {
    x: sys.mouse.x,
    y: sys.mouse.y,
    padding: 2,
    background: 0x333333ff,
    passthrough: false,
    onBlur() { menuremove() },
    onKeyDown() { menuremove(); return true },
  },
    $(GroupY, { align: 'a' },
      ...items.map(it => it === '-' ?
        $(MenuDivider, { h: 5, w: 10 }) :
        $(Button, { padding: 2, onClick: () => { it.onClick() } },
          $(Label, { text: it.text })
        )
      )
    )
  )

  if (menu.y + menu.h > sys.root.h) {
    menu.y = sys.mouse.y - menu.h
  }

  function menuremove() {
    setTimeout(() => menu.remove())
  }

  adjust?.(menu)

  sys.root.addChild(menu)
  sys.focus(menu)
}
