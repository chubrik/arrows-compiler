import { GameMap } from "./arrows.js";

const top = new GameMap("AAADAAAAAAAGCRIAARAAIAAwAAECAgIDAgQCBQQGBAcDCAEJAQoBCwEMAQ0BDgEPAQwBQQEyAgoNIgIjAiQCJQImAicCKAIpAioCKwIsAi0CLgIvAhMAQgEBADMDEABDAQ4BNAFEBAEAAAABCQ8AAQEBAgEDAQQBBQQGBAcDCAEJAQoBCwEMAQ0BDgEPAQoPIAIhAiICIwIkAiUCJgInAigCKQIqAisCLAItAi4CLwICAAAAAQkJAAEBAQIBAwEEAQUBBgEWACYANgAKBCACIQIiAiMCJAI=");
const bottom = new GameMap("AAAEAAAAAAAMCweAAnECYgJTAlYAKQFKAi0DCQ0UACQANABEAGQBdAN4AHkDegB7AXwDfQN+A38DGBHUAeQB9AHFAdUB5QH1AcYA1gDmAPYAxwPXA+cD9wPYA+gD+AMKD1UDhgCmAFcDZwAoATgAWAFZA0sDLAFMA00DPgFOA08DDAV1AUYAFwB3AxkCOwEGABYCEQMmATYAPAE9AQcAZgABCbYAJwIYA0gCGgMbAxwDHQIeAx8DDgE3AUkDEgFHAzoBDQEIBjkGBAkqAVoBKwFbAVwBXQEuAV4BLwFfAQAAAQAAGAIFAQYABwMBAAAABgEbEAMRAhIDEwMzARQDNAEVAjUBFgMXAzcDGAM4AxkCOQMaAzoDGwM7AxwDPAMdAj0DHgM+Ax8DPwMKDCABQANBA0MDJAFEA0UDRgNHAygBSANJAywBDQEwAUIDBB5QAVEBIgEyAVIBIwFTAVQBVQEmAVYBJwFXAVgBWQEqAUoDWgErAUsDWwFMA1wBTQNdAS4BTgNeAS8BTwNfAQkPcANxA3IDcwN0A3UDdgN3A3gDeQN6A3sDfAN9A34DfwMLAyEDJQMpAy0DEQA2AgIAAAAGAQ4QAzADEQIxAxIDMgNSABMDUwMUA1QDFQIWAxcDGAMKASABJAEECUADUAFRACIBIwEzA0MBNAM1AyYBCQpwA3EDcgNzA3QDZQNWA0cDOAMpAxoACwUhA0QAJQNFAjYCJwIRAEEDBgBCAw==");
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
