const fs = require('fs')
const skillTree = JSON.parse(fs.readFileSync('./data/SkillTree.json'))
const drawnNodes = {}
const drawnGroups = {}

const loadSkillTree = () =>{
    Object.keys(skillTree.groups).forEach((groupId) => {
        const group = skillTree.groups[groupId]
        group.nodes.forEach((nodeId) => {
            const node = skillTree.nodes[nodeId];
            if (node.isProxy || node.expansionJewel || node.classStartIndex || node.isBlighted || node.ascendancyName || node.isMastery || node.isKeystone) return
            
            drawnGroups[groupId] = group
            drawnNodes[nodeId] = node
        })
    })
}

const toCanvasCoords = (x, y, offsetX, offsetY, scaling) => ({
    x: (Math.abs(skillTree.min_x) + x + offsetX) / scaling,
    y: (Math.abs(skillTree.min_y) + y + offsetY) / scaling
});

const rotateAroundPoint = (center, target, angle) =>{
    const radians = (Math.PI / 180) * angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = cos * (target.x - center.x) + sin * (target.y - center.y) + center.x;
    const ny = cos * (target.y - center.y) - sin * (target.x - center.x) + center.y;
    return {
        x: nx,
        y: ny
    };
}
const orbit16Angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
const orbit40Angles = [0, 10, 20, 30, 40, 45, 50, 60, 70, 80, 90, 100, 110, 120, 130, 135, 140, 150, 160, 170, 180, 190, 200, 210, 220, 225, 230, 240, 250, 260, 270, 280, 290, 300, 310, 315, 320, 330, 340, 350];
const orbitAngleAt = (orbit, index) => {
    const nodesInOrbit = skillTree.constants.skillsPerOrbit[orbit];
    if (nodesInOrbit == 16) {
      return orbit16Angles[orbit16Angles.length - index] || 0;
    } else if (nodesInOrbit == 40) {
      return orbit40Angles[orbit40Angles.length - index] || 0;
    } else {
      return 360 - (360 / nodesInOrbit) * index;
    }
};

const calculateNodePos = (node, offsetX, offsetY, scaling) => {
    if (node.group === undefined || node.orbit === undefined || node.orbitIndex === undefined) {
      return { x: 0, y: 0 };
    }
  
    const targetGroup = skillTree.groups[node.group];
    const targetAngle = orbitAngleAt(node.orbit, node.orbitIndex);
  
    const targetGroupPos = toCanvasCoords(targetGroup.x, targetGroup.y, offsetX, offsetY, scaling);
    const targetNodePos = toCanvasCoords(
      targetGroup.x,
      targetGroup.y - skillTree.constants.orbitRadii[node.orbit],
      offsetX,
      offsetY,
      scaling
    );
    return rotateAroundPoint(targetGroupPos, targetNodePos, targetAngle);
};
const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
const baseJewelRadius = 1800;
const getAffectedNodes = (socket) => {
    loadSkillTree()
    const result = [];
  
    const socketPos = calculateNodePos(socket, 0, 0, 1);
    for (const node of Object.values(drawnNodes)) {
      const nodePos = calculateNodePos(node, 0, 0, 1);
  
      if (distance(nodePos, socketPos) < baseJewelRadius) {
        result.push(node);
      }
    }
  
    return result;
};

module.exports.getAffectedNodes = getAffectedNodes