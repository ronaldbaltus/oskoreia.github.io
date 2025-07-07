function getShipComponentCategoryIcon(category) {
    switch (category)
    {
        case "missiles": return "icon-missile";
        case "turrets": return "icon-turret";
        case "utility_items": return "icon-utility";
        case "weapons": return "icon-weapon";
        case "coolers": return "icon-cooler";
        case "power_plants": return "icon-powerplant";
        case "shield_generators": return "icon-shieldgenerator";
        default: return "icon-unknown";
    } 
}

function getShipComponentNameIcon(name) {
    return "icon-" + name.toLowerCase().replace(/ /g, '');
}

function formatCategoryName(name) {
    return name.replace(/_/g, ' ')
               .replace(/\b\w/g, char => char.toUpperCase())
               .replace(/(\w+)\s+(\w+)/g, (match, p1, p2) => `${p1} ${p2}`);
}

function toggleComponentCategory(element) {
    element.classList.toggle('collapsed');
}