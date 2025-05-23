import { Border } from "../containers/border.js"
import { GroupX } from "../containers/group.js"
import { PanedYB } from "../containers/paned.js"
import { Spaced } from "../containers/spaced.js"
import { Button } from "../controls/button.js"
import { Label } from "../controls/label.js"
import { sys } from "../core/system.js"
import { View } from "../core/view.js"
import { $ } from "../util/dyn.js"
import { showMenu, type MenuItem } from "../util/menu.js"
import { Clock } from "./clock.js"
import { Panel } from "./panel.js"

class Workspace {

  private progbuttons !: GroupX
  private runButton !: Button

  private clock !: Border
  private taskbar !: Spaced

  private desktop !: View
  private root !: PanedYB

  private progs = new Map<Panel, Button>()

  showDesktop() {
    this.progbuttons = $(GroupX, { gap: 1 })
    this.runButton = $(Button, {
      padding: 2,
      background: 0x222222ff,
      onClick: () => this.showProgMenu(),
    }, $(Label, { text: 'run' }))

    this.clock = $(Border, { padding: 2 }, $(Clock))
    this.taskbar = $(Spaced, { background: 0x000000ff },
      $(GroupX, { gap: 1 }, this.runButton, this.progbuttons),
      this.clock)

    this.desktop = $(View, { background: 0x222222ff })
    this.root = $(PanedYB, {}, this.desktop, this.taskbar)

    this.desktop.$watch('children', (current, old) => {

      for (const view of current) {
        const panel = view as Panel
        if (!old.includes(panel)) {
          const button = $(Button, {
            padding: 2, $background: panel.$ref('panelFocused').adapt<number>(is => is ? 0x770000ff : 0x330000ff),
            onClick: () => { panel.show(); sys.focus(panel) }
          }, $(Label, { $text: panel.$ref('title') }))

          this.progbuttons.addChild(button)
          this.progs.set(panel, button)
        }
      }

      for (const view of old) {
        const panel = view as Panel
        if (!current.includes(panel)) {
          this.progs.get(panel)?.remove()
          this.progs.delete(panel)
        }
      }

    })

    this.desktop.$watch('children', () => {
      const lastPanel = this.desktop.children.at(-1)
      lastPanel && sys.focus(lastPanel)
    })

    this.root.w = sys.root.w
    this.root.h = sys.root.h
    sys.root.addChild(this.root)
  }

  addPanel(panel: Panel) {
    if (this.desktop.children.includes(panel)) return

    const topPanel = this.desktop.children.at(-1)
    panel.x = (topPanel?.x ?? 0) + 12
    panel.y = (topPanel?.y ?? 0) + 12
    this.desktop.addChild(panel)
  }

  async addProgram(name: string, path: string) {
    const mod = await import(path + path.split('/').at(-2) + '.js')
    const launch: () => void = mod.default
    this.programs.set(name, launch)
  }

  launch(name: string, path?: string) {
    this.programs.get(name)?.(path)
  }

  showProgMenu() {
    const progs = this.programs.entries().filter(p => p[0] !== 'settings')
    const settings = this.programs.get('settings')!

    showMenu([
      ...progs.map(([name, launch]) => {
        return { text: name, onClick: () => launch() } as MenuItem
      }).toArray(),
      '-',
      { text: 'settings', onClick: () => settings() },
      { text: 'hide', onClick: () => this.root.remove() },
    ], menu => {
      menu.x = 0
      menu.y = this.taskbar.y - menu.h
    })
  }

  openFile(path: string) {
    const progs: Record<string, string> = {
      bitmap: 'painter',
      font: 'fontmaker',
    }
    const ext = path.split('.').at(-1) as keyof typeof progs
    const prog = ext in progs ? progs[ext] : 'writer'
    this.launch(prog, path)
  }

  private programs = new Map<string, (filename?: string) => void>()

}

export const ws = new Workspace()
