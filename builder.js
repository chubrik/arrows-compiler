import { GameMap } from "./arrows.js";

const top = new GameMap("AAADAAAAAAAGCREQACAAMAABAAICAwIEAgUEBgQHAwgBCQEKAQsBDAENAQ4BDwEMAUEBMgIKDSICIwIkAiUCJgInAigCKQIqAisCLAItAi4CLwITAEIBAQAzAxAAQwEOATQBRAQBAAAAAQkPAAEBAQIBAwEEAQUEBgQHAwgBCQEKAQsBDAENAQ4BDwEKDyACIQIiAiMCJAIlAiYCJwIoAikCKgIrAiwCLQIuAi8CAgAAAAEJCAABAQECAQMBBAEFABYAJgA2AAoEIAIhAiICIwIkAg==");
const bottom = new GameMap("AAAEAAAAAAALChKQA5IDlANWAHYChgCWA6YAKAE4AFgBWQNLAywBTANNAz4BTgNPAwkIFAAkA3gAegB7AXwDfQN+A38DDAg0AkQCVABmABcAdwEZAnkDOwEOBGQBdQQmAUcFSQMYEdQB5AH0AcUB1QHlAfUBxgDWAOYA9gDHA9cD5wP3A9gD6AP4AwYAFgISATYAOgEBCUYAtgAYA0gCGgMbAxwDHQIeAx8DEQQnAjcCVwI8AT0BCwNnAikBSgItAw0BCAY5BgQJKgFaASsBWwFcAV0BLgFeAS8BXwEAAAEAABgCBQEGAAcDAQAAAAYBGxADEQISAxMDMwEUAzQBFQI1ARYDFwM3AxgDOAMZAjkDGgM6AxsDOwMcAzwDHQI9Ax4DPgMfAz8DCgwgAUADQQNDAyQBRANFA0YDRwMoAUgDSQMsAQ0BMAFCAwQeUAFRASIBMgFSASMBUwFUAVUBJgFWAScBVwFYAVkBKgFKA1oBKwFLA1sBTANcAU0DXQEuAU4DXgEvAU8DXwEJD3ADcQNyA3MDdAN1A3YDdwN4A3kDegN7A3wDfQN+A38DCwMhAyUDKQMtAxEANgICAAAABgEOEAMwAxECMQMSAzIDUgATA1MDFANUAxUCFgMXAxgDCgEgASQBBAlAA1ABUQAiASMBMwNDATQDNQMmAQkKcANxA3IDcwN0A2UDVgNHAzgDKQMaAAsFIQNEACUDRQI2AicCEQBBAwYAQgM=");
const line = new GameMap("AAADAAAAAAAGCQEAABAABgACABMAEgEMAAMAEAATAQoLBAMFAgYCBwIIAgkCCgILAgwCDQIOAg8CBwAUAQEAAAAACg8AAgECAgIDAgQCBQIGAgcCCAIJAgoCCwIMAg0CDgIPAgIAAAABCgQAAgECAgIDAgQCCQEGABYA");

export function buildDisk(bytes) {
    const gameMap = new GameMap();

    let byteCount = bytes.length;

    if (byteCount < 16)
        bytes.push(...Array(16 - byteCount).fill(0));
    else if (byteCount % 8 != 0)
        bytes.push(...Array(8 - byteCount % 8).fill(0));

    byteCount = bytes.length;

    for (let row = 0; row < byteCount / 8; ++row) {
        let bytes_row = bytes.splice(0, 8);
        let y = row * 2 + 3;

        if (row > 0)
            gameMap.paste(line, 4, y - 1);

        for (let i = 0; i < 8; ++i) {
            let byte = bytes_row.at(i);
            let x = i * 4 + 9;

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
    gameMap.paste(top, 4, 0);
    gameMap.paste(bottom, 0, byteCount / 4 + 1);

    return gameMap.save();
}
