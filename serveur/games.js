function game(name, theme, index) {
    this.index = index;
    this.name = name;
    this.lstUser = [];
    this.theme = theme;
}

game.prototype.addUser = function (name, key) {
    this.lstUser.push({'name' : name, 'key' : key});
}

module.exports = game;
