const canvas = document.getElementsByTagName('canvas')[0]
const _ = canvas.getContext('2d')

const width = canvas.width = window.innerWidth
const height = canvas.height = window.innerHeight

function hashPoint({ x, y }) {
  return `${x}_${y}`
}

function unhashPoint(hash) {
  const [x, y] = hash.split('_')

  return {
    x: parseInt(x),
    y: parseInt(y),
  }
}

function hashEdge(h1, h2) {
  return [h1, h2].sort().reduce((a, b) => `${a}_${b}`)
}

function unhashEdge(hash) {
  const [x, y, p, q] = hash.split('_')

  return [
    {
      x: parseInt(x),
      y: parseInt(y),
    },
    {
      x: parseInt(p),
      y: parseInt(q),
    },
  ]
}


const centers = []
const queue = [hashPoint({ x: width / 2, y: height / 2 })]
const passed = []

// Hexagon parameters
const radius = 400

// BFS
do {
  const h = queue.shift()

  if (passed.includes(h)) {
    continue
  }

  passed.push(h)

  const p = unhashPoint(h)

  centers.push(p)

  ;[
    0,
    Math.PI / 3,
    2 * Math.PI / 3,
    Math.PI,
    4 * Math.PI / 3,
    5 * Math.PI / 3,
  ]
  .map(angle => ({
    x: Math.round(p.x + radius * Math.cos(angle)),
    y: Math.round(p.y + radius * Math.sin(angle)),
  }))
  .filter(p => p.x >= 0 - radius && p.x <= width + radius && p.y >= 0 - radius && p.y <= height + radius)
  .map(p => hashPoint(p))
  .forEach(h => queue.push(h))

} while (queue.length)

const verticesHashes = new Set()
const edgesHashes = new Set()

centers.forEach(p => {
  ;[
    1 * Math.PI / 6,
    3 * Math.PI / 6,
    5 * Math.PI / 6,
    7 * Math.PI / 6,
    9 * Math.PI / 6,
    11 * Math.PI / 6,
  ]
  .map(angle => ({
    x: Math.round(p.x + radius / Math.cos(Math.PI / 6) / 2 * Math.cos(angle)),
    y: Math.round(p.y + radius / Math.cos(Math.PI / 6) / 2 * Math.sin(angle)),
  }))
  .filter(p => p.x >= 0 - radius && p.x <= width + radius && p.y >= 0 - radius && p.y <= height + radius)
  .map(p => hashPoint(p))
  .forEach((h, i, a) => {
    verticesHashes.add(h)

    const nextPointIndex = i === a.length - 1 ? 0 : i + 1

    edgesHashes.add(hashEdge(h, a[nextPointIndex]))
  })
})

const edges = [...edgesHashes]
.map(h => unhashEdge(h))
.map(([p1, p2]) => {
  const p3 = {
    x: Math.round(width * Math.random()),
    y: Math.round(height * Math.random()),
  }
  const angle = 2 * Math.PI * Math.random()
  const r = radius / Math.cos(Math.PI / 6) / 2
  const p4 = {
    x: p3.x + Math.round(r * Math.cos(angle)),
    y: p3.y + Math.round(r * Math.sin(angle)),
  }

  return [
    p3,
    p4,
    p1,
    p2,
    p3,
    p4,
  ]
})

console.log('edges', edges)

function draw() {
  console.log('edges', edges.length)

  _.clearRect(0, 0, width, height)

  _.fillStyle = '#112856'
  _.fillRect(0, 0, width, height)

  _.fillStyle = 'white'
  _.strokeStyle = 'white'

  edges.forEach(([p0, p1, p2, p3, p4, p5]) => {
    _.beginPath()
    _.moveTo(p4.x, p4.y)
    _.lineTo(p5.x, p5.y)
    _.closePath()
    _.stroke()
  })
}

function distance(p1, p2) {
  return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y))
}

function update() {
  edges.forEach(e => {
    if (distance(e[2], e[4]) > 1) {
      e[4] = {
        x: e[4].x + (e[2].x - e[0].x) * 0.01,
        y: e[4].y + (e[2].y - e[0].y) * 0.01,
      };
    }
    if (distance(e[3], e[5]) > 1) {
      e[5] = {
        x: e[5].x + (e[3].x - e[1].x) * 0.01,
        y: e[5].y + (e[3].y - e[1].y) * 0.01,
      }
    }
  })
}

window.addEventListener('load', draw)

function step() {
  update()
  draw()
  requestAnimationFrame(step)
}

requestAnimationFrame(step)
