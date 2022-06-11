var KoalaToken = artifacts.require("./KoalaToken.sol");

contract("KoalaToken", function (accounts) {
  var tokenInstance;

  it("initializes the contract with the correct values", function () {
    return KoalaToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then(function (name) {
        assert.equal(name, "Koala", "has the correct name");
        return tokenInstance.symbol();
      })
      .then(function (symbol) {
        assert.equal(symbol, "KOA", "has the correct symbol");
      });
  });

  it("allocates the initial supply upon deployment", function () {
    return KoalaToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then(function (totalSupply) {
        assert.equal(
          totalSupply.toNumber(),
          100000000,
          "sets the total supply to 100000000"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          100000000,
          "it allocates the initial supply to the contract owner"
        );
      });
  });

  it("transfers token ownership", function () {
    return KoalaToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        // the call() function doesn't trigger a transaction
        return tokenInstance.transfer.call(accounts[1], 999999999);
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
        return tokenInstance.transfer.call(accounts[1], 25000000, {
          from: accounts[0],
        });
      })
      .then(function (success) {
        assert.equal(success, true, "it returns true");
        return tokenInstance.transfer(accounts[1], 25000000, {
          from: accounts[0],
        });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          'should be the "Transfer" event'
        );
        assert.equal(
          receipt.logs[0].args._from,
          accounts[0],
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          accounts[1],
          "logs the account the token are transferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          25000000,
          "logs the transfer amount"
        );
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          25000000,
          "adds the amount to the receiving account"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          75000000,
          "deducts the amount from the sending account"
        );
      });
  });
});
