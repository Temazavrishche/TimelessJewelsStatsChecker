const sort = (jewels) => {
    Object.keys(jewels).forEach(key => {
        const locations = jewels[key].locations;
        
        const sortedLocations = Object.entries(locations)
          .sort((a, b) => b[1].weight - a[1].weight)
          .map(([id, location]) => {
            
            const sortedNodes = Object.entries(location.nodes)
              .sort((a, b) => b[1] - a[1])
              .reduce((acc, [nodeName, value]) => {
                acc[nodeName] = value
                return acc
              }, {})
            
            return {
              ...location,
              nodes: sortedNodes
            }
          })
        
        // Обновляем локации в объекте
        jewels[key].locations = sortedLocations.reduce((acc, location, index) => {
          acc[Object.keys(locations)[index]] = location
          return acc
        }, {})
      })
}
module.exports.sort = sort