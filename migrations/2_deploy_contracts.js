const KoalaToken = artifacts.require("KoalaToken");
const KoalaTokenSale = artifacts.require("./KoalaTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(KoalaToken, 100000000).then(function () {
    var tokenPrice = 10000000000;
    return deployer.deploy(KoalaTokenSale, KoalaToken.address, tokenPrice);
  });
};
