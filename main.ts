//% color="#2D8CFF" weight=100 icon="\uf108" block="MSP2807"
namespace MSP2807 {

    let LCD_CS = DigitalPin.P16
    let LCD_DC = DigitalPin.P8
    let LCD_RST = DigitalPin.P12

    export enum Color {
        //% block="black"
        Black = 0x0000,
        //% block="white"
        White = 0xFFFF,
        //% block="red"
        Red = 0xF800,
        //% block="green"
        Green = 0x07E0,
        //% block="blue"
        Blue = 0x001F,
        //% block="yellow"
        Yellow = 0xFFE0,
        //% block="cyan"
        Cyan = 0x07FF,
        //% block="magenta"
        Magenta = 0xF81F
    }

    /**
     * RGB（各 0〜255）から色を作ります。
     */
    //% blockId=msp2807_rgb
    //% block="RGB 赤 %r 緑 %g 青 %b"
    //% r.min=0 r.max=255 r.defl=255
    //% g.min=0 g.max=255 g.defl=255
    //% b.min=0 b.max=255 b.defl=255
    //% weight=85
    export function rgb(r: number, g: number, b: number): Color {
        return (((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)) as Color
    }

    function writeCommand(cmd: number): void {
        pins.digitalWritePin(LCD_DC, 0)
        pins.digitalWritePin(LCD_CS, 0)
        pins.spiWrite(cmd)
        pins.digitalWritePin(LCD_CS, 1)
    }

    function writeData(data: number): void {
        pins.digitalWritePin(LCD_DC, 1)
        pins.digitalWritePin(LCD_CS, 0)
        pins.spiWrite(data)
        pins.digitalWritePin(LCD_CS, 1)
    }

    function resetLCD(): void {
        pins.digitalWritePin(LCD_RST, 0)
        basic.pause(20)
        pins.digitalWritePin(LCD_RST, 1)
        basic.pause(150)
    }

    //% block="initialize MSP2807 LCD"
    //% weight=100
    export function init(): void {
        pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
        pins.spiFormat(8, 0)
        pins.spiFrequency(4000000)

        pins.digitalWritePin(LCD_CS, 1)
        pins.digitalWritePin(LCD_DC, 1)
        pins.digitalWritePin(LCD_RST, 1)

        resetLCD()

        writeCommand(0x01)
        basic.pause(150)

        writeCommand(0x11)
        basic.pause(120)

        writeCommand(0x3A)
        writeData(0x55)

        writeCommand(0x36)
        writeData(0x48)

        writeCommand(0x29)
        basic.pause(20)
    }

    function setWindow(x0: number, y0: number, x1: number, y1: number): void {
        writeCommand(0x2A)
        writeData(x0 >> 8)
        writeData(x0 & 0xff)
        writeData(x1 >> 8)
        writeData(x1 & 0xff)

        writeCommand(0x2B)
        writeData(y0 >> 8)
        writeData(y0 & 0xff)
        writeData(y1 >> 8)
        writeData(y1 & 0xff)

        writeCommand(0x2C)
    }

    //% block="clear screen color %color"
    //% weight=90
    export function fillScreen(color: Color): void {
        fillRect(0, 0, 240, 320, color)
    }

    //% block="draw pixel x %x y %y color %color"
    //% x.min=0 x.max=239 y.min=0 y.max=319
    //% weight=80
    export function drawPixel(x: number, y: number, color: Color): void {
        if (x < 0 || x >= 240 || y < 0 || y >= 320) return

        setWindow(x, y, x, y)

        pins.digitalWritePin(LCD_DC, 1)
        pins.digitalWritePin(LCD_CS, 0)
        pins.spiWrite(color >> 8)
        pins.spiWrite(color & 0xff)
        pins.digitalWritePin(LCD_CS, 1)
    }

    //% block="fill rectangle x %x y %y width %w height %h color %color"
    //% x.min=0 x.max=239 y.min=0 y.max=319
    //% w.min=1 w.max=240 h.min=1 h.max=320
    //% weight=70
    export function fillRect(x: number, y: number, w: number, h: number, color: Color): void {
        if (x < 0) {
            w += x
            x = 0
        }
        if (y < 0) {
            h += y
            y = 0
        }
        if (x + w > 240) w = 240 - x
        if (y + h > 320) h = 320 - y
        if (w <= 0 || h <= 0) return

        setWindow(x, y, x + w - 1, y + h - 1)

        pins.digitalWritePin(LCD_DC, 1)
        pins.digitalWritePin(LCD_CS, 0)

        for (let i = 0; i < w * h; i++) {
            pins.spiWrite(color >> 8)
            pins.spiWrite(color & 0xff)
        }

        pins.digitalWritePin(LCD_CS, 1)
    }

	/**
	 * 5×7フォントデータを取得します。
	 * 1要素が縦1列、下位7ビットが各ピクセルです。
	 */
	function getFontData(character: string): number[] {
		let code = character.charCodeAt(0)

		// 小文字を大文字に変換
		if (code >= 97 && code <= 122) {
			code -= 32
		}

		switch (code) {
			// 数字
			case 48: return [0x3E, 0x51, 0x49, 0x45, 0x3E] // 0
			case 49: return [0x00, 0x42, 0x7F, 0x40, 0x00] // 1
			case 50: return [0x42, 0x61, 0x51, 0x49, 0x46] // 2
			case 51: return [0x21, 0x41, 0x45, 0x4B, 0x31] // 3
			case 52: return [0x18, 0x14, 0x12, 0x7F, 0x10] // 4
			case 53: return [0x27, 0x45, 0x45, 0x45, 0x39] // 5
			case 54: return [0x3C, 0x4A, 0x49, 0x49, 0x30] // 6
			case 55: return [0x01, 0x71, 0x09, 0x05, 0x03] // 7
			case 56: return [0x36, 0x49, 0x49, 0x49, 0x36] // 8
			case 57: return [0x06, 0x49, 0x49, 0x29, 0x1E] // 9

			// 英字
			case 65: return [0x7E, 0x11, 0x11, 0x11, 0x7E] // A
			case 66: return [0x7F, 0x49, 0x49, 0x49, 0x36] // B
			case 67: return [0x3E, 0x41, 0x41, 0x41, 0x22] // C
			case 68: return [0x7F, 0x41, 0x41, 0x22, 0x1C] // D
			case 69: return [0x7F, 0x49, 0x49, 0x49, 0x41] // E
			case 70: return [0x7F, 0x09, 0x09, 0x09, 0x01] // F
			case 71: return [0x3E, 0x41, 0x49, 0x49, 0x7A] // G
			case 72: return [0x7F, 0x08, 0x08, 0x08, 0x7F] // H
			case 73: return [0x00, 0x41, 0x7F, 0x41, 0x00] // I
			case 74: return [0x20, 0x40, 0x41, 0x3F, 0x01] // J
			case 75: return [0x7F, 0x08, 0x14, 0x22, 0x41] // K
			case 76: return [0x7F, 0x40, 0x40, 0x40, 0x40] // L
			case 77: return [0x7F, 0x02, 0x0C, 0x02, 0x7F] // M
			case 78: return [0x7F, 0x04, 0x08, 0x10, 0x7F] // N
			case 79: return [0x3E, 0x41, 0x41, 0x41, 0x3E] // O
			case 80: return [0x7F, 0x09, 0x09, 0x09, 0x06] // P
			case 81: return [0x3E, 0x41, 0x51, 0x21, 0x5E] // Q
			case 82: return [0x7F, 0x09, 0x19, 0x29, 0x46] // R
			case 83: return [0x46, 0x49, 0x49, 0x49, 0x31] // S
			case 84: return [0x01, 0x01, 0x7F, 0x01, 0x01] // T
			case 85: return [0x3F, 0x40, 0x40, 0x40, 0x3F] // U
			case 86: return [0x1F, 0x20, 0x40, 0x20, 0x1F] // V
			case 87: return [0x3F, 0x40, 0x38, 0x40, 0x3F] // W
			case 88: return [0x63, 0x14, 0x08, 0x14, 0x63] // X
			case 89: return [0x07, 0x08, 0x70, 0x08, 0x07] // Y
			case 90: return [0x61, 0x51, 0x49, 0x45, 0x43] // Z

			// 記号
			case 32: return [0x00, 0x00, 0x00, 0x00, 0x00] // 空白
			case 33: return [0x00, 0x00, 0x5F, 0x00, 0x00] // !
			case 43: return [0x08, 0x08, 0x3E, 0x08, 0x08] // +
			case 45: return [0x08, 0x08, 0x08, 0x08, 0x08] // -
			case 46: return [0x00, 0x60, 0x60, 0x00, 0x00] // .
			case 47: return [0x20, 0x10, 0x08, 0x04, 0x02] // /
			case 58: return [0x00, 0x36, 0x36, 0x00, 0x00] // :
			case 63: return [0x02, 0x01, 0x51, 0x09, 0x06] // ?

			// カタカナ（5×7・手描きビットマップ）
			case 12540: return [0x08, 0x08, 0x08, 0x08, 0x08] // ー
			case 12495: return [0x78, 0x07, 0x00, 0x07, 0x78] // ハ
			case 12522: return [0x40, 0x47, 0x40, 0x00, 0x3F] // リ
			case 12469: return [0x24, 0x47, 0x44, 0x3F, 0x04] // サ
			case 12461: return [0x08, 0x4A, 0x3F, 0x0A, 0x08] // キ
			case 12520: return [0x41, 0x41, 0x49, 0x49, 0x7F] // ヨ
			case 12519: return [0x41, 0x41, 0x49, 0x49, 0x7F] // ョ（小）→ ヨ
			case 12454: return [0x06, 0x42, 0x23, 0x12, 0x0E] // ウ
			case 12490: return [0x24, 0x44, 0x7F, 0x04, 0x04] // ナ
			case 12471: return [0x35, 0x40, 0x40, 0x22, 0x18] // シ
			case 12516: return [0x04, 0x44, 0x3D, 0x04, 0x06] // ヤ
			case 12515: return [0x04, 0x44, 0x3D, 0x04, 0x06] // ャ（小）→ ヤ
			case 12452: return [0x08, 0x04, 0x02, 0x7D, 0x00] // イ
			case 12510: return [0x11, 0x09, 0x49, 0x3D, 0x03] // マ
			case 12521: return [0x04, 0x45, 0x25, 0x15, 0x0D] // ラ
			case 12465: return [0x44, 0x3F, 0x04, 0x0A, 0x00] // ケ
			case 12523: return [0x3F, 0x40, 0x20, 0x3F, 0x40] // ル
			case 12486: return [0x01, 0x49, 0x3D, 0x09, 0x01] // テ

			// 濁音（濁点は右上に2ドットで表現・7ドット幅）
			case 12496: return [0x78, 0x07, 0x00, 0x07, 0x78, 0x01, 0x02] // バ
			case 12462: return [0x08, 0x4A, 0x3F, 0x0A, 0x08, 0x01, 0x02] // ギ
			case 12487: return [0x01, 0x49, 0x3D, 0x09, 0x01, 0x01, 0x02] // デ

			default:
				return [0x02, 0x01, 0x51, 0x09, 0x06] // 未対応文字は ?
		}
	}

	/**
	 * 1文字を表示します。
	 */
	//% block="文字 %character を x %x y %y 大きさ %size 色 %color で表示"
	//% character.defl="A"
	//% x.min=0 x.max=239
	//% y.min=0 y.max=319
	//% size.min=1 size.max=8 size.defl=2
	//% weight=60
	export function drawChar(
		character: string,
		x: number,
		y: number,
		size: number,
		color: Color
	): void {
		if (character.length == 0) {
			return
		}

		if (size < 1) {
			size = 1
		}

		let font = getFontData(character)

		for (let column = 0; column < font.length; column++) {
			let pixels = font[column]

			for (let row = 0; row < 7; row++) {
				if ((pixels & (1 << row)) != 0) {
					fillRect(
						x + column * size,
						y + row * size,
						size,
						size,
						color
					)
				}
			}
		}
	}

	/**
	 * 文字列を表示します。
	 */
	//% block="文字列 %text を x %x y %y 大きさ %size 色 %color で表示"
	//% text.defl="HELLO"
	//% x.min=0 x.max=239
	//% y.min=0 y.max=319
	//% size.min=1 size.max=8 size.defl=2
	//% weight=50
	export function drawText(
		text: string,
		x: number,
		y: number,
		size: number,
		color: Color
	): void {
		let drawX = x

		for (let i = 0; i < text.length; i++) {
			drawChar(text.charAt(i), drawX, y, size, color)

			// 文字幅（グリフ列数）＋文字間1ドット
			let width = getFontData(text.charAt(i)).length
			drawX += (width + 1) * size

			if (drawX >= 240) {
				return
			}
		}
	}

	/**
	 * 切り替えて表示できるメッセージ。
	 */
	export enum Message {
		//% block="バリバリ作業なう"
		Baribari,
		//% block="しゃーなし"
		Shaanashi,
		//% block="今ならいけるで"
		Ikeru
	}

	/**
	 * 選んだメッセージを表示します。
	 */
	//% block="メッセージ %message を x %x y %y 大きさ %size 色 %color で表示"
	//% x.min=0 x.max=239
	//% y.min=0 y.max=319
	//% size.min=1 size.max=8 size.defl=2
	//% weight=45
	export function showMessage(
		message: Message,
		x: number,
		y: number,
		size: number,
		color: Color
	): void {
		let text = ""

		switch (message) {
			case Message.Baribari:
				text = "バリバリサギョウナウ"
				break
			case Message.Shaanashi:
				text = "シャーナシ"
				break
			case Message.Ikeru:
				text = "イマナライケルデ"
				break
		}

		drawText(text, x, y, size, color)
	}

}