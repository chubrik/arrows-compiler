import { GameMap } from "./arrows.js";

export function buildDisk(bytes, config) {
    const { top, bottom, line, rowBytes, minBytes, dataX, topX, lineX, lineDy, bottomDy } = config;
    const gameMap = new GameMap();

    let byteCount = bytes.length;

    if (byteCount < minBytes)
        bytes.push(...Array(minBytes - byteCount).fill(0));
    else if (byteCount % rowBytes != 0)
        bytes.push(...Array(rowBytes - byteCount % rowBytes).fill(0));

    byteCount = bytes.length;

    for (let row = 0; row < byteCount / rowBytes; ++row) {
        let bytes_row = bytes.splice(0, rowBytes);
        let y = row * 2 + 3;

        if (row > 0)
            gameMap.paste(line, lineX, y + lineDy);

        for (let i = 0; i < rowBytes; ++i) {
            let byte = bytes_row.at(i);
            let x = i * 4 + dataX;

            for (let j = 0; j < 4; ++j) {
                switch (byte & 0b11) {
                    case 0:
                        gameMap.setArrow(x + j, y, 1, 1);
                        break;
                    case 1:
                        gameMap.setArrow(x + j, y, 7, 1);
                        break;
                    case 2:
                        gameMap.setArrow(x + j, y, 7, 1, true);
                        break;
                    default:
                        gameMap.setArrow(x + j, y, 8, 1);
                }

                byte >>= 2;
            }
        }
    }
    gameMap.paste(top, topX, 0);
    gameMap.paste(bottom, 0, byteCount / rowBytes * 2 + bottomDy);

    return gameMap.save();
}
