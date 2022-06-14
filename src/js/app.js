App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading: false,
  tokenPrice: 0,
  tokesnSold: 0,
  tokensAvailable: 750000,
  koalaTokenInstance: null,
  koalaTokenSaleInstance: null,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);
    return App.initContracts();
  },

  initContracts: async function () {
    // we are able to reference the file directly because we configured
    // the baseDir in bs-config.json
    await $.getJSON("KoalaTokenSale.json", function (koalaTokenSale) {
      App.contracts.KoalaTokenSale = TruffleContract(koalaTokenSale);
      App.contracts.KoalaTokenSale.setProvider(App.web3Provider);
      App.contracts.KoalaTokenSale.deployed().then(function (koalaTokenSale) {
        App.koalaTokenSaleInstance = koalaTokenSale;
        console.log("Koala Token Sale Address: ", koalaTokenSale.address);
      });
    }).done(function () {
      $.getJSON("KoalaToken.json", function (koalaToken) {
        App.contracts.KoalaToken = TruffleContract(koalaToken);
        App.contracts.KoalaToken.setProvider(App.web3Provider);
        App.contracts.KoalaToken.deployed().then(function (koalaToken) {
          App.koalaTokenInstance = koalaToken;
          console.log("Koala Token Address: ", koalaToken.address);
          App.listenForEvents();
          return App.render();
        });
      });
    });
  },

  // listen for events emitted from the contract
  listenForEvents: function () {
    App.koalaTokenSaleInstance
      .Sell(
        {},
        {
          fromBlock: 0,
          toBlock: "latest",
        }
      )
      .watch(function (err, event) {
        console.log("event triggered", event);
        App.render();
      });
  },

  render: async function () {
    if (App.loading) return;
    App.loading = true;

    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // get the primary account
    await web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    App.koalaTokenSaleInstance
      .tokenPrice()
      .then(function (tokenPrice) {
        App.tokenPrice = tokenPrice;
        $(".token-price").html(
          web3.fromWei(App.tokenPrice, "ether").toNumber()
        );
        return App.koalaTokenSaleInstance.tokensSold();
      })
      .then(function (tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $(".tokens-sold").html(App.tokensSold);
        return App.koalaTokenInstance.balanceOf(
          App.koalaTokenSaleInstance.address
        );
      })
      .then(function (tokensAvailable) {
        App.tokensAvailable = tokensAvailable.toNumber();
        App.tokensAvailable = 75000;
        $(".tokens-available").html(App.tokensAvailable);

        var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
        $("#progress").css("width", progressPercent + "%");

        return App.koalaTokenInstance.balanceOf(App.account);
      })
      .then(function (balance) {
        $(".token-balance").html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      });
  },

  buyTokens: function () {
    $("#content").hide();
    $("#loader").show();
    var numberOfTokens = $("#numberOfTokens").val();
    App.koalaTokenSaleInstance
      .buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000,
      })
      .then(function (result) {
        console.log("Tokens brought...");
        $("form").trigger("reset");
        // wait for Sell event
      });
  },
};
// 15-16, 3-7pm - btcc
// 15 2pm forms

$(function () {
  $(window).on("load", function () {
    App.init();
  });
});
