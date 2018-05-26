// This is an example algorithm

function exit() {
  G.Console("js exit");
}

function get_ticker_okex() {
  return Es[0].GetTicker("QTUM/USDT");  //okex
}

function get_ticker_binance() {
  return Es[1].GetTicker("QTUM/USDT");  //币安
}

function trader_okex(price, amount) { //okex
  amount = parseFloat(amount.toFixed(3));
  G.Console("op:sell price:"+price+" amount:"+amount);
  return Es[0].Trade("SELL", "QTUM/USDT", price, amount); //卖操作
}

function trader_binance(price, amount) {  //币安
  amount = parseFloat(amount.toFixed(3));
  G.Console("op:buy price:"+price+" amount:"+amount);
  return Es[1].Trade("BUY", "QTUM/USDT", price, amount);  //买操作
}

/*
这里进行一次搬砖套利的演示，从okex->binance，所谓“搬砖套利”其实指的就是低买高卖，比如这里就是在okex上高价卖出一定数量的QTUM，
同时在binance上低价买入一定数量的QTUM，这个操作完成后，用户在两个平台所拥有的QTUM总数保持不变，但是USDT总数变多了，完成了套利。
*/
function main() {

  //分别获取两个交易所的账户信息
  var balance_okex = Es[0].GetAccount();
  var balance_binance = Es[1].GetAccount();

  if (!balance_okex || !balance_binance) {
    G.Console("GetAccount error");
    return;
  }

  G.Console(balance_okex);
  G.Console(balance_binance);

  //添加并发任务

  //用于同时获取两个交易所的交易深度信息
  G.AddTask("get_ticker_group", "get_ticker_okex");
  G.AddTask("get_ticker_group", "get_ticker_binance");

  //用于两边同时下单买卖
  G.AddTask("trader_group", "trader_okex");
  G.AddTask("trader_group", "trader_binance");

  var weight = 0.7; //权重

  for(;;) {
    //获取交易深度
    var results = G.ExecTasks("get_ticker_group");
    if (!results[0] || !results[1]) {
        G.Console("ExecTasks error");
        G.Sleep(3000);
        continue;
    }

    //okex的买一价和数量，对方买，我就卖
    var sell_price =  results[0].Bids[0].Price;
    var sell_amount = results[0].Bids[0].Amount;

    //币安的卖一价和数量，对方卖，我就买
    var buy_price = results[1].Asks[0].Price;
    var buy_amount = results[1].Asks[0].Amount;

    G.Console("sell price:"+sell_price+" amount:"+sell_amount);
    G.Console("buy price:"+buy_price+" amount:"+buy_amount);

    if (sell_price > buy_price) { //高卖低买，所以卖价要大于买价
   
      var diffPrice = sell_price - buy_price; //算出差价
   
      var minAmount = sell_amount < buy_amount ? sell_amount : buy_amount;  //取最小买卖数量

      G.Console("diffPrice:"+diffPrice+" minAmount:"+minAmount);

      var lastAmount = minAmount*weight;  //为了提高成功率，数量再算上一个权重值，得到最终要买卖的数量

      var fee = sell_price*lastAmount*0.002 + buy_price*lastAmount*0.002;  //手续费，okex千分之2，币安千分之2

      var profit = diffPrice*lastAmount;  //能赚到的毛利

      G.Console("profit:"+profit+" fee:"+fee+" lastAmount:"+lastAmount);

      if (profit > fee) { //毛利大于手续费，意味着出现了套利机会
        //判断两边帐号是否都有足够的余额能操作

        var cost = buy_price*lastAmount;

        G.Console("okex: "+balance_okex["QTUM"]+"--"+lastAmount+", binance "+balance_binance["USDT"]+"--"+cost);

        if (balance_okex["QTUM"] > lastAmount && balance_binance["USDT"] > cost)
        { //两边余额都足够

          //然后判断是否满足交易所下单条件，因为有些交易所有最小下单数量和金额的要求
          if (cost > 10)  //为了演示这里假设是10个USDT 
          {
            var pureProfit = profit - fee;  //毛利-手续费=纯利
            G.Console("###########pureProfit:"+pureProfit);
            //绑定参数，然后两边同时下单操作
            G.BindTaskParam("trader_group", "trader_okex", sell_price, lastAmount);
            G.BindTaskParam("trader_group", "trader_binance", buy_price, lastAmount);
            var results = G.ExecTasks("trader_group");
            result_okex = results[0];
            result_binance = results[1];

            G.Console(result_okex);
            G.Console(result_binance);

            //实际接下来还需要判断如果下单失败了，或者两边买卖数量不匹配等异常情况的处理等等，这里就不演示了
            return;
          }
        }
      }
    }

    G.Sleep(500);
  }

  //var r = E.GetAccount();
  //G.Log(r["USDT"] + "---" + r["QTUM"]);
  //var t = E.GetTicker("QTUM/USDT");
  //G.Log(t.Bids[0].Price + "---" + t.Bids[1].Price);
  //G.Log(t.Asks[0].Price + "---" + t.Asks[1].Price);
  //var os = E.GetOrders("QTUM/USDT");
  //G.Log(os);
  //var o = E.GetOrder("QTUM/USDT", "6151573");
  //G.Log(o);
  //E.CancelOrder(o);
  //G.Log(E.Trade("SELL", "QTUM/USDT", 5000, 0.1));
  //G.Log(E.Trade("BUY", "QTUM/USDT", 5, 10));
  //G.Sleep(10 * 1000);
}

