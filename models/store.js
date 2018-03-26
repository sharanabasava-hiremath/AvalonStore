module.exports = function Cart(storedCart) {
    this.items = storedCart.items || {}; //If the storedCart is undefined(in case of first login for example) , pass an empty object
    this.tQty = storedCart.tQty || 0;
    this.totalPrice = storedCart.totalPrice || 0;

    //Function to add items to the cart
    this.add = function (item, id) {
        //This is to ensure that the same item will not be pushed to the cart multiple times, but the quantity will be increased
        var item = this.items[id];
        //Check if the item is already stored else add it to the cart
        if (!item) {
            item = this.items[id] = {item: item, qty: 0, price: 0};
        }
        for (var i = 0; i < this.items.length && !found; i++) {
            var item = this.items[i];
            item.quantity = this.toNumber(item.qty + quantity);
            if (item.quantity <= 0) {
                this.items.splice(i, 1);
            }
        }
    }
};


this.removeItem = function (id) {
    this.tQty -= this.items[id].qty;
    this.totalPrice -= this.items[id].price;
    delete this.items[id];
};


