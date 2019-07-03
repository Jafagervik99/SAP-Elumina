sap.ui.define([], function(){ 
  
  var orderId = 0;
  
  var car = mobx.observable({
    newOrder: {
      productName: 'my product',
      quantity: 1
    },
    orders: [],
    get summary() {
      var summaryMap = {};
      this.orders.forEach(function(order){
        var productName = order.productName;
        if (typeof summaryMap[productName] === 'number') {
          summaryMap[productName]+= parseInt(order.quantity);
        } else {
          summaryMap[productName] = parseInt(order.quantity);
        }
      });
      var summary = Object.keys(summaryMap).map(function(productName) {
        return {productName: productName, quantity: summaryMap[productName]};
      });
      return summary;
    },
    get total(){
      return this.orders.reduce(function(accumulator, order){ return accumulator + parseInt(order.quantity);}, 0);
    },
    get headerText() {
      var orderCount = this.orders.length;
        if (orderCount === 0) {
        return 'There are no orders';
      } else if (orderCount === 1) {
        return "There is 1 order";
      } else {
        return 'There are ' + orderCount + ' orders';
      }
    },
  });
  
  state.addOrder = function() {
      this.orders.push({id: ++orderId, productName: this.newOrder.productName, quantity: this.newOrder.quantity});
  };
  
  state.removeLastOrder = function(){
      this.orders.pop();
  };
  
  return state;
});