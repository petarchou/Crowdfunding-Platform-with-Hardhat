const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("CrowdfundingProject", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTestProjectFixture(_duration) {
    const name = "TestName";
    const description = "TestDescription";
    const fundingGoal = 10; //ethers
    const duration = _duration || 1000;
    const [owner, firstUser] = await ethers.getSigners();

    const totalSupply = BigInt(fundingGoal * 10 ** 18);


    const CrowdfundingPorject = await ethers.getContractFactory("CrowdfundingProject");
    const crowdfundingProject = await CrowdfundingPorject.deploy();
    await crowdfundingProject.initialize(name, description, fundingGoal, duration, owner.address);

    return { crowdfundingProject, name, description, fundingGoal, duration, owner, firstUser, totalSupply };
  }


  describe("Contributing", function () {

    it("Should revert if crowdfunding is over", async function () {
      const PROJECT_DURATION_IN_SECONDS = 1;
      const { crowdfundingProject } = await loadFixture(deployTestProjectFixture.bind(null, PROJECT_DURATION_IN_SECONDS));
      await new Promise((resolve) => {
        setTimeout(() => { resolve() }, PROJECT_DURATION_IN_SECONDS * 1000);
      })

      await expect(crowdfundingProject.contribute({ value: 1 })).to.be.reverted;
    });

    it("Should revert if contribution is 0", async function () {
      const { crowdfundingProject } = await loadFixture(deployTestProjectFixture);

      await expect(crowdfundingProject.contribute()).to.be.reverted;
    });

    it("Should revert if contribution is more than remaining supply", async function () {
      const { crowdfundingProject, totalSupply } = await loadFixture(deployTestProjectFixture);

      //contribute half the supply
      await expect(crowdfundingProject.contribute({ value: totalSupply / 2n })).to.not.be.reverted;

      //contribute the other half + 1
      await expect(crowdfundingProject.contribute({ value: totalSupply / 2n + 1n })).to.be.reverted;
    });

    it("Should transfer token amount equal to msg.value", async function () {
      const CONTRIBUTION_VALUE = 10;
      const { crowdfundingProject, owner } = await loadFixture(deployTestProjectFixture);

      await crowdfundingProject.contribute({ value: CONTRIBUTION_VALUE });

      expect(await crowdfundingProject.balanceOf(owner.address)).to.equal(CONTRIBUTION_VALUE);
    });

    it("Should transfer token amount equal to msg.value", async function () {
      const CONTRIBUTION_VALUE = 10;
      const { crowdfundingProject, owner } = await loadFixture(deployTestProjectFixture);

      await crowdfundingProject.contribute({ value: CONTRIBUTION_VALUE });

      expect(await crowdfundingProject.balanceOf(owner.address)).to.equal(CONTRIBUTION_VALUE);
    });

    it("Should set goalReached=true when goal is reached", async function () {
      const { crowdfundingProject, totalSupply } = await loadFixture(deployTestProjectFixture);
      await crowdfundingProject.contribute({ value: totalSupply });

      expect(await crowdfundingProject.goalReached()).to.equal(true);
    });

  });


  describe("Refunding", function () {

    it("Should revert if project is ongoing", async function () {
      const { crowdfundingProject } = await loadFixture(deployTestProjectFixture);

      await expect(crowdfundingProject.refund()).to.be.reverted;
    })

    it("Should revert if project was successful", async function () {
      const { crowdfundingProject, totalSupply } = await loadFixture(deployTestProjectFixture);

      await crowdfundingProject.contribute({ value: totalSupply });

      await expect(crowdfundingProject.refund()).to.be.reverted;
    })

    it("Should revert if user hasn't contributed", async function () {
      const PROJECT_DURATION_IN_SECONDS = 1;
      const { crowdfundingProject } = await loadFixture(deployTestProjectFixture.bind(null, PROJECT_DURATION_IN_SECONDS));

      //Wait for project to end
      await new Promise((resolve) => {
        setTimeout(() => resolve(), PROJECT_DURATION_IN_SECONDS * 1000)
      });

      await expect(crowdfundingProject.refund()).to.be.reverted;
    })

    it("Should set the user's shares to 0", async function () {
      const PROJECT_DURATION_IN_SECONDS = 2;
      const { crowdfundingProject, owner } = await loadFixture(deployTestProjectFixture.bind(null, PROJECT_DURATION_IN_SECONDS));
      await crowdfundingProject.contribute({ value: 1000 });
      //Wait for project to end
      await new Promise((resolve) => {
        setTimeout(() => resolve(), PROJECT_DURATION_IN_SECONDS * 1000)
      });

      await crowdfundingProject.refund();
      expect(await crowdfundingProject.balanceOf(owner.address)).to.equal(0);
    })

    //Couldn't make this one work
    // it("Should refund amount equal to user's shares", async function () {
      
    //   const PROJECT_DURATION_IN_SECONDS = 2;
    //   const CONTRIBUTED_AMOUNT = 1000;

    //   const { crowdfundingProject, owner } = await loadFixture(deployTestProjectFixture.bind(null, PROJECT_DURATION_IN_SECONDS));
    //   await crowdfundingProject.contribute({ value: CONTRIBUTED_AMOUNT });

    //   //wait for project end
    //   await new Promise((resolve) => {
    //     setTimeout(() => resolve(), PROJECT_DURATION_IN_SECONDS * 1000)
    //   });

    //   const balanceBeforeRefund = await owner.getBalance();

    //   const refund = await crowdfundingProject.refund();
    //   const refundRcp = await refund.wait();
    //   const gasPrice = ethers.BigNumber.from(refundRcp.gasUsed).mul(refundRcp.effectiveGasPrice);
    //   console.log(gasPrice)
    //   const balanceAfterRefund = await owner.getBalance();

    //   expect(balanceAfterRefund).to.equal(balanceBeforeRefund.add(CONTRIBUTED_AMOUNT).add(gasPrice))
    // })
  })

  describe('Add rewards', function () {

    it("Should revert if not owner", async function () {
      const { crowdfundingProject, firstUser, totalSupply } = await loadFixture(deployTestProjectFixture);
      const projectWithNonOwner = await crowdfundingProject.connect(firstUser);
      await projectWithNonOwner.contribute({ value: totalSupply });

      await expect(projectWithNonOwner.addRoyalties({value:10000000})).to.be.reverted;
    })

    it("Should revert if project is ongoing", async function () {
      const { crowdfundingProject } = await loadFixture(deployTestProjectFixture);

      await expect(crowdfundingProject.addRoyalties({value: 10000})).to.be.reverted;
    })
    
    it("Should revert if project was unsuccessful", async function () {
      const { crowdfundingProject } = await loadFixture(deployTestProjectFixture.bind(null, 1));

      await expect(crowdfundingProject.addRoyalties({value: 10000})).to.be.reverted;
    })

    
    it("Should award royalties to backers", async function () {
      const { crowdfundingProject, owner, firstUser, totalSupply  } = await loadFixture(deployTestProjectFixture);
      await crowdfundingProject.contribute({value: totalSupply/2n});

      //Get two users who contribtue 50:50 to the funding goal
      const projectWithNonOwner = crowdfundingProject.connect(firstUser);
      await projectWithNonOwner.contribute({value: totalSupply/2n});

      //Distribute royalties of totalSupply between the two users
      await crowdfundingProject.addRoyalties({value: totalSupply});

      //Expect each user to get 50% of the royalties
      expect(await crowdfundingProject.royalties(owner.address)).to.equal(totalSupply/2n);
      expect(await crowdfundingProject.royalties(firstUser.address)).to.equal(totalSupply/2n);
    })

  })

});
