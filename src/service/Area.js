class AreaLogic {
    static instance = null;

    constructor() {
        if (AreaLogic.instance !== null)
            return AreaLogic.instance;

        AreaLogic.instance = this;

        this.orientations = new Object();
        this.orientations.north = { toString: () => 'north', opposite: 'south' };
        this.orientations.south = { toString: () => 'south', opposite: 'north' };
        this.orientations.east  = { toString: () => 'east',  opposite: 'west'  };
        this.orientations.west  = { toString: () => 'west',  opposite: 'east'  };

        this.dimensions = new Object();
        this.dimensions.slope = new Object();
        this.dimensions.slope.north = [[0,  16], [16, 0], [32,  8], [16, 24]];
        this.dimensions.slope.south = [[0,   8], [16, 8], [32, 16], [16, 16]];
        this.dimensions.slope.east  = [[0,  16], [16, 8], [32,  8], [16, 16]];
        this.dimensions.slope.west  = [[32, 16], [16, 0], [0,   8], [16, 24]];

    }

    getOrientation(from, to) {
        const x = to.x - from.x,
              y = to.y - from.y;
        
        return [ ['north', -y], ['south', +y], ['east', +x], ['west', -x] ].sort((a, b) => b[1] - a[1])[0][0];
    }

    getOrientationToCoords(location, x, y) {
        const unitX = Game.camera.posX + ((location.posX + (location.tw / 2)) * Game.scaling),
              unitY = Game.camera.posY + ((location.posY + (location.td / 2)) * Game.scaling);

        if (unitX - x > 0) {
            if (unitY - y > 0)
                return this.orientations.west.toString();
            return this.orientations.south.toString();
        } else {
            if (unitY - y > 0)
                return this.orientations.north.toString();
            return this.orientations.east.toString();
        }
    }

    getTriangleArea(p1, p2, p3) {
        const a1 = p1[0] * (p2[1] - p3[1]),
              a2 = p2[0] * (p3[1] - p1[1]),
              a3 = p3[0] * (p1[1] - p2[1]);

        return Math.abs(a1 + a2 + a3) / 2;
    }

    getParallelogramArea(p1, p2, p3, p4) {
        return this.getTriangleArea(p1, p2, p3) + this.getTriangleArea(p1, p4, p3);
    }

    getLocationAtMouse(mx, my, area, camera, scaling) {
        const x = mx - camera.posX,
              y = my - camera.posY,
              tw = area.tw * scaling,
              th = area.th * scaling,
              td = area.td * scaling;

        let match = null;

        area.getLocations().filter((location) => {
            const ox = location.posX * scaling,
                  oy = location.posY * scaling,
                  xMatch = (x >= ox) && (x < (ox + tw)),
                  yMatch = (y >= oy) && (y < (oy + td + ((location.z - 1) * th)));

            return xMatch && yMatch;

        }).forEach((location) => {
            const ox = Math.round(x / scaling) - location.posX,
                  oy = Math.round(y / scaling) - location.posY;

            if (location.isSloped) {
                const p  = this.dimensions.slope[location.orientation],
                      sa = this.getParallelogramArea(p[0], p[1], p[2], p[3]),
                      pa = this.getTriangleArea([ox, oy],  p[0], p[1]) +
                           this.getTriangleArea([ox, oy],  p[0], p[3]) +
                           this.getTriangleArea([ox, oy],  p[1], p[2]) +
                           this.getTriangleArea([ox, oy],  p[2], p[3]);
                
                match = (sa == pa) ? location : match;
            } else {
                
                const htw = tw / scaling / 2,
                      htd = td / scaling / 2,
                      tileHit = Math.floor((htw - Math.abs(htw - ox)) / 2) >= Math.abs(htd - oy),
                      wallHit = oy > (Math.floor((htw - Math.abs(htw - ox)) / 2) + htd);

                match = tileHit ? location : wallHit ? null : match;
            }
        });

        return match;
    }
}