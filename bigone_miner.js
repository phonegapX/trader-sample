// This is an example algorithm

function exit() {
  G.Console("js exit");
}

var currentPair = "ONE/USDT"

function try_sell_1(cnt, price) {
  var r = E.Trade("SELL", currentPair, price, cnt);
  if (!r) {
    return 0;//交易失败
  }
  var x;
  for (x = 0; x < 5; x++) {
    var os = E.GetOrders(currentPair);
    if (!os) {
      return 0;//交易失败
    }
    if (os.length == 0) {
      return cnt;
    }
    var i;
    for (i = 0; i < os.length; i++) {
        var o = os[i];
        if (r == o.ID) {
          if (o.DealAmount > 0) {
            var da = o.DealAmount;
            E.CancelOrder(o);
            return da;
          } else if (x == 4) {
            E.CancelOrder(o);
            return 0;
          }
        } else {
          E.CancelOrder(o);
        }
    }
    G.Sleep(200);
  }
  return 0;
}

function try_buy_1(cnt, price) {
  return E.Trade("BUY", currentPair, price, cnt);
}

function self_buy() {

  var r = E.GetAccount();
  G.Log(r["ONE"] + "---" + r["USDT"]);

  var last_price = 0;
  var t_total = 1000;
  var side = 1;
  for (;;) {
    if (side == 1) {
      side = 0;
    } else {
      side = 1;
    }
    if (side == 0) {
      var t = E.GetTicker(currentPair);
      var n = t_total;
      var p = parseFloat(t.Mid.toFixed(4));
      var l = try_buy_1(n, p);
      last_price = p;
    } else {
      var n = t_total;
      var p = last_price;
      var l = try_sell_1(n, p);
    }
  }
}

//=========================================================

function try_buy_2(cnt, price) {
  var r = E.Trade("BUY", currentPair, price, cnt);
  if (!r) {
    return 0;//交易失败
  }
  var x;
  for (x = 0; x < 5; x++) {
    var os = E.GetOrders(currentPair);
    if (!os) {
      return 0;//交易失败
    }
    if (os.length == 0) {
      return cnt;
    }
    var i;
    for (i = 0; i < os.length; i++) {
        var o = os[i];
        if (r == o.ID) {
          if (o.DealAmount > 0) {
            var da = o.DealAmount;
            E.CancelOrder(o);
            return da;
          } else if (x == 4) {
            E.CancelOrder(o);
            return 0;
          }
        } else {
          E.CancelOrder(o);
        }
    }
    G.Sleep(200);
  }
  return 0;
}

function try_sell_2(cnt, price) {
  return E.Trade("SELL", currentPair, price, cnt);
}

function self_sell() {

  var r = E.GetAccount();
  G.Log(r["ONE"] + "---" + r["USDT"]);

  var last_price = 0;
  var t_total = 1000;
  var side = 1;
  for (;;) {
    if (side == 1) {
      side = 0;
    } else {
      side = 1;
    }
    if (side == 0) {
      var t = E.GetTicker(currentPair);
      var n = t_total;
      var p = parseFloat(t.Mid.toFixed(4));
      var l = try_sell_2(n, p);
      last_price = p;
    } else {
      var n = t_total;
      var p = last_price;
      var l = try_buy_2(n, p);
    }
  }
}

function main() {

  var side = 1;
  for (;;) {
    if (side == 1) {
      side = 0;
      self_sell();
    } else {
      side = 1;
      self_buy();
    }
  }

}
