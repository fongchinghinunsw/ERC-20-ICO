const KoalaToken = artifacts.require("KoalaToken");
const KoalaTokenSale = artifacts.require("./KoalaTokenSale.sol");

module.exports = async function (deployer, network, accounts) {
  var tokenPrice = 10000000000;
  await deployer.deploy(KoalaToken, 100000000);
  koalaTokenInstance = await KoalaToken.deployed();
  koalaTokenSaleInstance = await deployer.deploy(
    KoalaTokenSale,
    KoalaToken.address,
    tokenPrice
  );
  await koalaTokenInstance.transfer(KoalaTokenSale.address, 75000, {
    from: accounts[0],
  });
};
