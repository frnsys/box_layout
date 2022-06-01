class Quadtree {
  constructor(bounds, max_objects, max_levels, level) {
    this.max_objects    = max_objects || 10;
    this.max_levels     = max_levels || 4;

    this.level  = level || 0;
    this.bounds = bounds;

    this.objects    = [];
    this.nodes      = [];
  }

  split() {
    var nextLevel   = this.level + 1,
        subWidth    = this.bounds.w/2,
        subHeight   = this.bounds.h/2,
        x           = this.bounds.x,
        y           = this.bounds.y;

    //top right node
    this.nodes[0] = new Quadtree({
        x       : x + subWidth,
        y       : y,
        w       : subWidth,
        h       : subHeight
    }, this.max_objects, this.max_levels, nextLevel);

    //top left node
    this.nodes[1] = new Quadtree({
        x       : x,
        y       : y,
        w       : subWidth,
        h       : subHeight
    }, this.max_objects, this.max_levels, nextLevel);

    //bottom left node
    this.nodes[2] = new Quadtree({
        x       : x,
        y       : y + subHeight,
        w       : subWidth,
        h       : subHeight
    }, this.max_objects, this.max_levels, nextLevel);

    //bottom right node
    this.nodes[3] = new Quadtree({
        x       : x + subWidth,
        y       : y + subHeight,
        w       : subWidth,
        h       : subHeight
    }, this.max_objects, this.max_levels, nextLevel);
  }

  getIndex(pRect) {
    var indexes = [],
        verticalMidpoint    = this.bounds.x + (this.bounds.w/2),
        horizontalMidpoint  = this.bounds.y + (this.bounds.h/2);

    var startIsNorth = pRect.y < horizontalMidpoint,
        startIsWest  = pRect.x < verticalMidpoint,
        endIsEast    = pRect.x + pRect.w > verticalMidpoint,
        endIsSouth   = pRect.y + pRect.h > horizontalMidpoint;

    //top-right quad
    if(startIsNorth && endIsEast) {
        indexes.push(0);
    }

    //top-left quad
    if(startIsWest && startIsNorth) {
        indexes.push(1);
    }

    //bottom-left quad
    if(startIsWest && endIsSouth) {
        indexes.push(2);
    }

    //bottom-right quad
    if(endIsEast && endIsSouth) {
        indexes.push(3);
    }

    return indexes;
  }

  insert(pRect) {
    var i = 0,
        indexes;

    //if we have subnodes, call insert on matching subnodes
    if(this.nodes.length) {
        indexes = this.getIndex(pRect);

        for(i=0; i<indexes.length; i++) {
            this.nodes[indexes[i]].insert(pRect);
        }
        return;
    }

    //otherwise, store object here
    this.objects.push(pRect);

    //max_objects reached
    if(this.objects.length > this.max_objects && this.level < this.max_levels) {

        //split if we don't already have subnodes
        if(!this.nodes.length) {
            this.split();
        }

        //add all objects to their corresponding subnode
        for(i=0; i<this.objects.length; i++) {
            indexes = this.getIndex(this.objects[i]);
            for(var k=0; k<indexes.length; k++) {
                this.nodes[indexes[k]].insert(this.objects[i]);
            }
        }

        //clean up this node
        this.objects = [];
    }
  }

  retrieve(pRect) {
    var indexes = this.getIndex(pRect),
        returnObjects = this.objects;

    //if we have subnodes, retrieve their objects
    if(this.nodes.length) {
        for(var i=0; i<indexes.length; i++) {
            returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(pRect));
        }
    }

    //remove duplicates
    returnObjects = returnObjects.filter(function(item, index) {
        return returnObjects.indexOf(item) >= index;
    });

    return returnObjects;
  }

  clear() {
    this.objects = [];

    for(var i=0; i < this.nodes.length; i++) {
        if(this.nodes.length) {
            this.nodes[i].clear();
          }
    }

    this.nodes = [];
  }
}

export default Quadtree;
