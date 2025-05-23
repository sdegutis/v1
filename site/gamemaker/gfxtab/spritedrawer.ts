import { crt } from "../../os/core/crt.js"
import { sys } from "../../os/core/system.js"
import { View } from "../../os/core/view.js"
import { dragMove } from "../../os/util/selections.js"
import { palettes, type Color } from "./palettes.js"
import type { Sprite } from "./spritesheet.js"

export class SpriteDrawer extends View {

  sprite: Sprite = null!
  zoom = 1
  color: Color = null!

  override background = 0x00000033
  override cursor = null

  spots: Record<string, Color> = {}

  override init(): void {
    this.$watch('zoom', () => this.adjust())
  }

  override adjust(): void {
    this.w = this.sprite.width * this.zoom
    this.h = this.sprite.height * this.zoom
  }

  override onMouseDown(button: number): void {
    if (button === 0) {
      if (sys.keys[' ']) {
        sys.trackMouse({ move: dragMove(this) })
      }
      else {
        sys.trackMouse({
          move: () => {
            const x = Math.floor(this.mouse.x / this.zoom)
            const y = Math.floor(this.mouse.y / this.zoom)

            const key = `${x},${y}`
            this.spots[key] = this.color
          }
        })
      }
    }
    else if (sys.keys['Control']) {
      const x = Math.floor(this.mouse.x / this.zoom)
      const y = Math.floor(this.mouse.y / this.zoom)

      const key = `${x},${y}`
      const spot = this.spots[key]
      if (spot) {
        this.color = spot
      }
    }
    else {
      sys.trackMouse({
        move: () => {
          const x = Math.floor(this.mouse.x / this.zoom)
          const y = Math.floor(this.mouse.y / this.zoom)

          const key = `${x},${y}`
          delete this.spots[key]
        }
      })
    }
  }

  override draw(): void {
    super.draw()

    for (let y = 0; y < this.sprite.height; y++) {
      for (let x = 0; x < this.sprite.width; x++) {
        const key = `${x},${y}`
        const spot = this.spots[key]
        if (spot) {
          const px = x * this.zoom
          const py = y * this.zoom
          const col = palettes[spot.p][spot.i]
          crt.rectFill(px, py, this.zoom, this.zoom, col)
        }
      }
    }

    if (this.hovered) {
      const px = Math.floor(this.mouse.x / this.zoom) * this.zoom
      const py = Math.floor(this.mouse.y / this.zoom) * this.zoom
      crt.rectLine(px, py, this.zoom, this.zoom, 0x1199ff99)
    }
  }

  resize(width: number, height: number) {
    this.sprite.width = Math.max(1, width)
    this.sprite.height = Math.max(1, height)
    this.adjust()
  }

}
