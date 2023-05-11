const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");
const TileSize = 1;

const MapSize = 257;
const MapTileCount = MapSize * MapSize;
const Heightmap = new Array(MapTileCount);
Heightmap.fill(0);

const random = () => {
    const amplitude = 1;
    return Math.random() * amplitude;
}

const jitter = () => {
    const jitterAmplitude = 0.3;
    return Math.random() * jitterAmplitude - jitterAmplitude / 2;
}

const midpointIndex = (a, b) => {
    return a + Math.floor((b - a) / 2)
}

const setPoint = (i, value) => {
    if (Heightmap[i] != 0) return;

    Heightmap[i] = value;
}

const pass = (x, y, size, passes) => {
    const tl = x + y * MapSize;
    const tr = tl + size - 1;
    const bl = tl + (size - 1) * MapSize;
    const br = tl + (size - 1) * MapSize + size - 1;

    // Set midpoints:
    const topMidpoint = midpointIndex(tl, tr);
    setPoint(topMidpoint, (Heightmap[tl] + Heightmap[tr]) / 2 + jitter());
    const bottomMidpoint = midpointIndex(bl, br);
    setPoint(bottomMidpoint, (Heightmap[bl] + Heightmap[br]) / 2 + jitter());
    const leftMidpoint = midpointIndex(tl, bl);
    setPoint(leftMidpoint, (Heightmap[tl] + Heightmap[bl]) / 2 + jitter());
    const rightMidpoint = midpointIndex(tr, br);
    setPoint(rightMidpoint, (Heightmap[tr] + Heightmap[br]) / 2 + jitter());

    // Set center:
    const center = midpointIndex(tl, br);
    setPoint(center, (Heightmap[topMidpoint] + Heightmap[bottomMidpoint] + Heightmap[leftMidpoint] + Heightmap[rightMidpoint]) / 4 + jitter());

    // Prepare next passes:
    const nextSize = Math.ceil(size / 2);
    if (nextSize < 3) return;
    const offset = nextSize - 1;

    passes.push({ x, y, size: nextSize });
    passes.push({ x: x + offset, y, size: nextSize });
    passes.push({ x, y: y + offset, size: nextSize });
    passes.push({ x: x + offset, y: y + offset, size: nextSize });
}

// Start by setting corners:
Heightmap[0] = random();
Heightmap[MapSize - 1] = random();
Heightmap[MapTileCount - MapSize] = random();
Heightmap[MapTileCount - 1] = random();

const passes = [{ x: 0, y: 0, size: MapSize }];
while (passes.length > 0) {
    const nextPass = passes.pop();
    pass(nextPass.x, nextPass.y, nextPass.size, passes);
}

for (let y = 0; y < MapSize; y++) {
    for (let x = 0; x < MapSize; x++) {
        const shade = 255 * Heightmap[x + y * MapSize];
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        ctx.fillRect(x * TileSize, y * TileSize, TileSize, TileSize);
    }
}