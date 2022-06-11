const KoalaToken = artifacts.require("KoalaToken");

module.exports = function (deployer) {
  deployer.deploy(KoalaToken, 100000000);
};
